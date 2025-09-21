class TTSService {
    private synth: SpeechSynthesis;

    constructor() {
        // Check for window to avoid SSR errors
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis;
        } else {
            // Provide a mock for non-browser environments
            this.synth = {
                speak: () => {},
                cancel: () => {},
            } as any;
        }
    }

    speak(text: string) {
        if (!this.synth) return;

        if (this.synth.speaking) {
            // Optionally, cancel previous speech to start new one immediately
            this.synth.cancel();
        }
        
        if (text.trim() !== '') {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                // console.log('SpeechSynthesisUtterance.onend');
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
            };
            this.synth.speak(utterance);
        }
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}

export const ttsService = new TTSService();
