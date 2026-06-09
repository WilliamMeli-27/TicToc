export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text' | 'sticker';
  startTime: number;
  duration: number;
  data: any;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface Sticker {
  id: string;
  icon: string;
  x: number;
  y: number;
}