export interface SongData {
  title: string;
  artist: string;
  dedication?: string;
  audioBlob?: Blob;
  audioUrl: string;
  fileName: string;
  coverUrl: string;
  duration: number;
}
