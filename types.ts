// FIX: Removed self-import of `FileReference` which was causing a conflict with its local declaration.
export interface Persona {
  id: string;
  name: string;
  avatar: string; // Can be a color class or an icon component name
  description: string;
  systemInstruction: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean | number;
  avatar: string; // For simplicity, can be a color class or initials
  pinned: boolean;
  starred: boolean;
  labels?: string[];
  archived?: boolean;
  muted?: boolean;
  cost?: {
    total: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  deletedTimestamp?: number;
  // New properties for persona/group chats
  type: 'personal' | 'group' | 'persona_1_on_1';
  participants?: Persona[];
}

export interface Attachment {
    name: string;
    size: number; // in bytes
    type: string; // MIME type
    url?: string; // for preview or download
}

export interface Message {
  id:string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  pinned?: boolean;
  replyTo?: string; // ID of the message this is a reply to
  quotedMessage?: { // A snapshot of the message being replied to
      role: 'user' | 'model';
      content: string;
  }
  sender?: { // For group chats, to identify which persona is speaking
    name: string;
    avatar: string;
  };
}

export interface FileReference {
    name: string;
    size: number;
    type: string;
    url?: string; // For existing files, can be data URL or remote URL
    file?: File;  // For local files from input
}

export interface DateSeparator {
    id: string;
    type: 'date-separator';
    content: string; // "Today", "Yesterday", "June 20, 2024"
}

export type ChatItem = Message | DateSeparator;

// Moved from InputBar.tsx to be shared with ChatView.tsx
export interface LocalAttachment {
    file: File;
    previewUrl?: string; // For images/videos
}

// For the new Undo toast notification system
export interface Notification {
  id: number;
  message: string;
  duration?: number;
  onUndo?: () => void;
}

// For advanced search functionality in the list view
export interface AdvancedSearchOptions {
  searchIn: 'everywhere' | 'title' | 'messages';
  dateFrom: string;
  dateTo: string;
  hasAttachment: boolean;
  attachmentTypes: Set<'image' | 'video' | 'file'>;
  sortBy: 'timestamp' | 'title';
  sortOrder: 'desc' | 'asc';
}

// For advanced theme customization
export interface ThemeSettings {
    accentColor: string;
    userBubbleColor: string;
    modelBubbleColor: string;
}

// Moved from ManageLabelsView.tsx to make it globally accessible
export interface Label {
    id: string;
    name: string;
    color: string; // hex color
    apiKey?: string;
}