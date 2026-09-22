/**
 * Audio metadata and duration detector:
 * 1. Accurately decodes exact duration in seconds using AudioContext.
 * 2. Parses ID3v2 tags to auto-detect embedded album cover images (APIC), title, and artist.
 */

export interface ExtractedMetadata {
  duration: number; // exact seconds
  formattedDuration: string; // e.g. "03:45"
  title?: string;
  artist?: string;
  coverBlob?: Blob;
  coverUrl?: string;
}

export async function parseAudioFile(file: File): Promise<ExtractedMetadata> {
  const arrayBuffer = await file.arrayBuffer();

  // 1. Calculate 100% exact duration using AudioContext
  let duration = 0;
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      const ctx = new AudioCtxClass();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      duration = audioBuffer.duration;
      await ctx.close();
    }
  } catch (err) {
    console.warn('AudioContext decode failed, falling back to HTMLAudioElement duration:', err);
  }

  // Fallback if AudioContext couldn't decode
  if (!duration || duration <= 0) {
    duration = await getAudioElementDuration(file);
  }

  // 2. Extract ID3 tags (embedded album cover image, title, artist)
  const id3 = parseID3Tags(new DataView(arrayBuffer));

  // Derive default title and artist from file name if not present in ID3 tags
  const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ').trim();
  let title = id3.title?.trim();
  let artist = id3.artist?.trim();

  if (!title && !artist) {
    if (cleanFileName.includes(' - ')) {
      const parts = cleanFileName.split(' - ');
      artist = parts[0]?.trim() || 'Ahmx';
      title = parts.slice(1).join(' - ')?.trim() || 'Bir Ömür Sen';
    } else {
      title = cleanFileName || 'Bir Ömür Sen';
      artist = 'Ahmx';
    }
  } else if (!title) {
    title = cleanFileName || 'Bir Ömür Sen';
  } else if (!artist) {
    artist = 'Ahmx';
  }

  let coverUrl: string | undefined = undefined;
  if (id3.coverBlob) {
    coverUrl = URL.createObjectURL(id3.coverBlob);
  }

  return {
    duration,
    formattedDuration: formatDuration(duration),
    title,
    artist,
    coverBlob: id3.coverBlob,
    coverUrl,
  };
}

function getAudioElementDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const tempAudio = new Audio();
    const tempUrl = URL.createObjectURL(file);
    tempAudio.src = tempUrl;

    const cleanup = () => {
      tempAudio.removeEventListener('loadedmetadata', onLoaded);
      tempAudio.removeEventListener('error', onError);
      URL.revokeObjectURL(tempUrl);
    };

    const onLoaded = () => {
      const dur = tempAudio.duration;
      cleanup();
      resolve(isFinite(dur) && !isNaN(dur) ? dur : 0);
    };

    const onError = () => {
      cleanup();
      resolve(0);
    };

    tempAudio.addEventListener('loadedmetadata', onLoaded);
    tempAudio.addEventListener('error', onError);
  });
}

export function formatDuration(secs: number): string {
  if (isNaN(secs) || secs <= 0) return '00:00';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}

/**
 * Lightweight pure-JS parser for ID3v2 (v2.2, v2.3, v2.4) frames:
 * - APIC / PIC (Attached Picture)
 * - TIT2 / TT2 (Title)
 * - TPE1 / TP1 (Artist)
 */
function parseID3Tags(view: DataView): {
  title?: string;
  artist?: string;
  coverBlob?: Blob;
} {
  const result: { title?: string; artist?: string; coverBlob?: Blob } = {};

  try {
    if (view.byteLength < 10) return result;

    // Check for ID3 header
    if (
      view.getUint8(0) !== 0x49 || // 'I'
      view.getUint8(1) !== 0x44 || // 'D'
      view.getUint8(2) !== 0x33 // '3'
    ) {
      return result;
    }

    const versionMajor = view.getUint8(3); // 2, 3, or 4
    const tagSize =
      ((view.getUint8(6) & 0x7f) << 21) |
      ((view.getUint8(7) & 0x7f) << 14) |
      ((view.getUint8(8) & 0x7f) << 7) |
      (view.getUint8(9) & 0x7f);

    let offset = 10;
    const maxOffset = Math.min(view.byteLength, tagSize + 10);

    while (offset < maxOffset - 10) {
      // End of frames padding
      if (view.getUint8(offset) === 0x00) break;

      let frameId = '';
      let frameSize = 0;
      let headerSize = 0;

      if (versionMajor === 2) {
        // ID3v2.2 (3 bytes ID, 3 bytes size)
        frameId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2)
        );
        frameSize =
          (view.getUint8(offset + 3) << 16) |
          (view.getUint8(offset + 4) << 8) |
          view.getUint8(offset + 5);
        headerSize = 6;
      } else {
        // ID3v2.3 / ID3v2.4 (4 bytes ID, 4 bytes size, 2 bytes flags)
        frameId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        );

        if (versionMajor === 4) {
          // Syncsafe size
          frameSize =
            ((view.getUint8(offset + 4) & 0x7f) << 21) |
            ((view.getUint8(offset + 5) & 0x7f) << 14) |
            ((view.getUint8(offset + 6) & 0x7f) << 7) |
            (view.getUint8(offset + 7) & 0x7f);
        } else {
          frameSize = view.getUint32(offset + 4);
        }
        headerSize = 10;
      }

      if (frameSize <= 0 || offset + headerSize + frameSize > view.byteLength) {
        break;
      }

      const frameDataOffset = offset + headerSize;

      // Extract APIC / PIC (Album Art)
      if ((frameId === 'APIC' || frameId === 'PIC') && !result.coverBlob) {
        try {
          const cover = extractPictureFromFrame(view, frameDataOffset, frameSize, versionMajor);
          if (cover) result.coverBlob = cover;
        } catch (e) {
          console.warn('Could not parse APIC frame:', e);
        }
      }

      // Extract Title (TIT2 or TT2)
      if ((frameId === 'TIT2' || frameId === 'TT2') && !result.title) {
        result.title = decodeTextFrame(view, frameDataOffset, frameSize);
      }

      // Extract Artist (TPE1 or TP1)
      if ((frameId === 'TPE1' || frameId === 'TP1') && !result.artist) {
        result.artist = decodeTextFrame(view, frameDataOffset, frameSize);
      }

      offset += headerSize + frameSize;
    }
  } catch (err) {
    console.warn('ID3 parse error:', err);
  }

  return result;
}

function extractPictureFromFrame(
  view: DataView,
  offset: number,
  size: number,
  version: number
): Blob | null {
  const encoding = view.getUint8(offset);
  let pos = offset + 1;

  let mimeType = 'image/jpeg';
  if (version === 2) {
    // 3 char image format: 'JPG' or 'PNG'
    const format = String.fromCharCode(
      view.getUint8(pos),
      view.getUint8(pos + 1),
      view.getUint8(pos + 2)
    ).toLowerCase();
    mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    pos += 3;
  } else {
    // MIME string null-terminated
    let mimeStr = '';
    while (pos < offset + size && view.getUint8(pos) !== 0) {
      mimeStr += String.fromCharCode(view.getUint8(pos));
      pos++;
    }
    pos++; // skip null
    if (mimeStr) mimeType = mimeStr;
  }

  // Skip 1 byte picture type
  pos++;

  // Skip description null-terminated
  if (encoding === 0 || encoding === 3) {
    while (pos < offset + size && view.getUint8(pos) !== 0) {
      pos++;
    }
    pos++;
  } else {
    // UTF-16 (double null)
    while (
      pos + 1 < offset + size &&
      !(view.getUint8(pos) === 0 && view.getUint8(pos + 1) === 0)
    ) {
      pos += 2;
    }
    pos += 2;
  }

  if (pos >= offset + size) return null;

  const imageLength = offset + size - pos;
  const imageBuffer = view.buffer.slice(
    view.byteOffset + pos,
    view.byteOffset + pos + imageLength
  ) as ArrayBuffer;

  return new Blob([imageBuffer], { type: mimeType });
}

function decodeTextFrame(view: DataView, offset: number, size: number): string {
  if (size <= 1) return '';
  const encoding = view.getUint8(offset);
  const data = new Uint8Array(view.buffer, view.byteOffset + offset + 1, size - 1);

  try {
    if (encoding === 0) {
      // ISO-8859-1
      return new TextDecoder('iso-8859-1').decode(data).replace(/\0.*$/, '').trim();
    } else if (encoding === 1 || encoding === 2) {
      // UTF-16
      return new TextDecoder('utf-16').decode(data).replace(/\0.*$/, '').trim();
    } else if (encoding === 3) {
      // UTF-8
      return new TextDecoder('utf-8').decode(data).replace(/\0.*$/, '').trim();
    }
  } catch {
    // fallback
  }
  return '';
}
