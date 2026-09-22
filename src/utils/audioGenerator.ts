/**
 * Generates a warm, emotional romantic piano/ambient love melody
 * as a downloadable audio Blob using Web Audio OfflineAudioContext.
 */

export function createRomanticDefaultAudio(): Promise<Blob> {
  const sampleRate = 44100;
  const duration = 28; // 28 seconds of sweet romantic piano arpeggio
  const totalSamples = sampleRate * duration;

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // Musical notes in Hz (Key of D major / B minor romantic ballad)
  const notes: { [key: string]: number } = {
    D3: 146.83,
    Fsharp3: 185.0,
    A3: 220.0,
    B3: 246.94,
    Csharp4: 277.18,
    D4: 293.66,
    E4: 329.63,
    Fsharp4: 369.99,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    Csharp5: 554.37,
    D5: 587.33,
    E5: 659.25,
    Fsharp5: 739.99,
  };

  // Melody sequence: note name, start time (sec), note duration (sec), velocity (0-1)
  const sequence: Array<[string, number, number, number]> = [
    // Bar 1 - D major arpeggio
    ['D3', 0.0, 3.5, 0.6],
    ['A3', 0.4, 2.8, 0.45],
    ['D4', 0.8, 2.5, 0.5],
    ['Fsharp4', 1.2, 2.2, 0.6],
    ['A4', 1.6, 2.0, 0.65],
    ['Fsharp4', 2.2, 1.6, 0.5],
    ['D5', 2.7, 2.4, 0.7],

    // Bar 2 - A major / C#
    ['A3', 3.6, 3.5, 0.55],
    ['E4', 4.0, 2.8, 0.45],
    ['A4', 4.4, 2.5, 0.5],
    ['Csharp5', 4.9, 2.2, 0.65],
    ['E5', 5.4, 2.0, 0.6],
    ['Csharp5', 6.0, 1.6, 0.5],

    // Bar 3 - B minor
    ['B3', 7.2, 3.5, 0.6],
    ['Fsharp4', 7.6, 2.8, 0.45],
    ['B4', 8.0, 2.5, 0.55],
    ['D5', 8.5, 2.2, 0.68],
    ['Fsharp5', 9.1, 2.4, 0.72],
    ['D5', 9.8, 1.8, 0.55],

    // Bar 4 - G major (tender cadence)
    ['G4', 10.8, 3.5, 0.58],
    ['D4', 11.2, 2.8, 0.48],
    ['B4', 11.6, 2.5, 0.55],
    ['D5', 12.1, 2.2, 0.65],
    ['B4', 12.8, 1.8, 0.5],
    ['A4', 13.4, 2.0, 0.6],

    // Bar 5 - D major reprise higher register
    ['D3', 14.4, 3.5, 0.6],
    ['A3', 14.8, 2.8, 0.45],
    ['Fsharp4', 15.2, 2.2, 0.5],
    ['A4', 15.6, 2.2, 0.6],
    ['D5', 16.1, 2.5, 0.7],
    ['E5', 16.8, 2.0, 0.65],
    ['Fsharp5', 17.4, 2.8, 0.75],

    // Bar 6 - Warm romantic descent
    ['A3', 18.0, 3.5, 0.55],
    ['E4', 18.4, 2.8, 0.45],
    ['Csharp5', 18.9, 2.4, 0.62],
    ['B4', 19.6, 2.0, 0.58],
    ['A4', 20.2, 2.2, 0.65],

    // Bar 7 - G to D resolution
    ['G4', 21.6, 3.5, 0.58],
    ['B4', 22.1, 2.8, 0.52],
    ['D5', 22.7, 2.5, 0.68],
    ['Fsharp5', 23.4, 3.0, 0.72],

    // Final Chord (D major held gently with warm resonance)
    ['D3', 24.8, 3.2, 0.65],
    ['A3', 25.0, 3.0, 0.5],
    ['Fsharp4', 25.2, 2.8, 0.55],
    ['A4', 25.4, 2.6, 0.6],
    ['D5', 25.6, 2.4, 0.68],
  ];

  // Master bus
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.7, 0);
  masterGain.connect(offlineCtx.destination);

  // Reverb simulation via delay & feedback
  const delay = offlineCtx.createDelay();
  delay.delayTime.value = 0.32;
  const feedback = offlineCtx.createGain();
  feedback.gain.value = 0.4;
  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2400;

  delay.connect(feedback);
  feedback.connect(filter);
  filter.connect(delay);
  filter.connect(masterGain);

  sequence.forEach(([noteName, startTime, noteLen, vel]) => {
    const freq = notes[noteName];
    if (!freq) return;

    // Dual oscillator for rich piano/bell harmonic depth
    const osc1 = offlineCtx.createOscillator();
    const osc2 = offlineCtx.createOscillator();
    const noteGain = offlineCtx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1 octave overtone

    // Envelope
    const attack = 0.015;
    const decay = noteLen * 0.8;
    const maxGain = vel * 0.32;

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(maxGain, startTime + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + decay);

    osc1.connect(noteGain);
    osc2.connect(noteGain);

    noteGain.connect(masterGain);
    noteGain.connect(delay);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + attack + decay);
    osc2.stop(startTime + attack + decay);
  });

  return offlineCtx.startRendering().then((renderedBuffer) => {
    return audioBufferToWavBlob(renderedBuffer);
  });
}

/**
 * Encodes an AudioBuffer into a WAV Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(s: string) {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(pos++, s.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF header
  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  setUint32(16); // subchunk1size
  setUint16(1); // PCM format
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample
  writeString('data');
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });
}
