
export type ElementType = 'text' | 'image' | 'shape';
export type StickerMode = 'round' | 'square' | 'rect' | 'special';
export type EditorStep = 'edit' | 'preview';

export interface StickerElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // Text specific
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  isSocial?: 'instagram' | 'whatsapp';
  useOfficialColor?: boolean;
  socialColor?: string;
  // Image specific
  src?: string;
  isBaseImage?: boolean;
}

export interface WarningConfig {
  x: number;
  y: number;
  width: number;
}

export interface EditorState {
  elements: StickerElement[];
  selectedId: string | null;
  canvasSize: number;
  stickerMode: StickerMode;
  borderColor: string;
  borderWidth: number;
  cornerRadius: number;
  step: EditorStep;
  showPinkCutLine: boolean;
  warningConfig: WarningConfig;
}
