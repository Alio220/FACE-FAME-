export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

export enum AppMode {
  VIDEO_STAR = 'VIDEO_STAR',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VOICE_CHAT = 'VOICE_CHAT',
  VIDEO_ANALYZE = 'VIDEO_ANALYZE'
}

export interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  thumbnailUrl: string;
  aspectRatio: '16:9' | '9:16';
}

export interface GeneratedVideo {
  uri: string;
  mimeType: string;
}

export type ImageAspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageSize = '1K' | '2K' | '4K';