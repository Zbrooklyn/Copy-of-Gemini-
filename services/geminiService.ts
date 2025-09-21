import { GoogleGenAI, GenerateContentResponse, Content, Part, Operation } from "@google/genai";
import { Message, LocalAttachment, Attachment } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // maybe showing an error message in the UI.
  // For this context, throwing an error is fine.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper to convert File to a Gemini Part
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            // remove the `data:mime/type;base64,` prefix
            resolve(reader.result.split(',')[1]);
        } else {
            reject('Failed to read file as data URL.');
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}


// Converts our app's Message history to the format Gemini API expects.
// This is a simplified version; a real app would need to handle historical attachments.
const buildHistory = (messages: Message[]): Content[] => {
    return messages.map(message => ({
        role: message.role,
        parts: [{ text: message.content }] // Simplified: assumes only text content in history
    }));
};

export const streamResponse = async (
  history: Message[],
  attachments: LocalAttachment[],
  prompt: string
) => {
    // We only handle image attachments for now, as they can be sent inline.
    const imageParts = await Promise.all(
        attachments.filter(att => att.file.type.startsWith('image/')).map(att => fileToGenerativePart(att.file))
    );

    const contents: Content[] = [
        ...buildHistory(history),
        {
            role: 'user',
            parts: [{ text: prompt }, ...imageParts],
        },
    ];

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
    });

    return response;
};

const VIDEO_GENERATION_POLL_INTERVAL = 10000; // 10 seconds

export const generateVideo = async (
  prompt: string,
  attachment: LocalAttachment | undefined,
): Promise<Attachment> => {
    // FIX: Replaced incomplete generic type 'Operation' with a fully inferred type from the `generateVideos` method.
    // This resolves the error "Generic type 'Operation<T>' requires 1 type argument(s)".
    let operation: Awaited<ReturnType<typeof ai.models.generateVideos>>;
    if (attachment && attachment.file.type.startsWith('image/')) {
        const imagePart = await fileToGenerativePart(attachment.file);
        operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt,
            image: {
                imageBytes: imagePart.inlineData!.data,
                mimeType: imagePart.inlineData!.mimeType,
            },
            config: {
                numberOfVideos: 1,
            },
        });
    } else {
        operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt,
            config: {
                numberOfVideos: 1,
            },
        });
    }

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, VIDEO_GENERATION_POLL_INTERVAL));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error('Video generation failed or returned no URI.');
    }

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return {
        name: `generated-video-${Date.now()}.mp4`,
        size: blob.size,
        type: 'video/mp4',
        url: url,
    };
};