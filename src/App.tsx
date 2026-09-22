import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Music2 } from 'lucide-react';
import { AmbientBackground } from './components/AmbientBackground';
import { AudioPlayer } from './components/AudioPlayer';
import { DedicationNote } from './components/DedicationNote';
import { SongData } from './types';
import { getCustomSong } from './utils/storage';
import { createRomanticDefaultAudio } from './utils/audioGenerator';
import { parseAudioFile } from './utils/audioMetadata';

export default function App() {
  const [song, setSong] = useState<SongData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load song: checks project static files first (song.mp3, sarki.mp3, etc.),
  // parses exact duration and embedded cover photo automatically.
  const loadSongData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check if user placed a song file in public/ directory (e.g. Ahmx - Bir Ömür Sen.mp3, sarki.wav, etc.)
      const candidatePaths = [
        '/Ahmx - Bir Ömür Sen.mp3',
        encodeURI('/Ahmx - Bir Ömür Sen.mp3'),
        '/Ahmx-BirOmurSen.mp3',
        '/Ahmx - Bir Omur Sen.mp3',
        encodeURI('/Ahmx - Bir Omur Sen.mp3'),
        '/ahmx - bir ömür sen.mp3',
        '/sarki.wav',
        '/sarki.mp3',
        '/song.wav',
        '/song.mp3',
        '/bizim_sarkimiz.mp3',
        '/muzik.mp3',
        '/music.mp3',
        '/audio.mp3',
      ];

      let localAudioFound: { url: string; blob: Blob; fileName: string } | null = null;

      for (const path of candidatePaths) {
        try {
          const res = await fetch(path, { cache: 'no-cache' });
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            // Make sure it's not Vite fallback index.html
            if (!contentType.includes('text/html')) {
              const blob = await res.blob();
              if (blob.size > 1000) {
                localAudioFound = {
                  url: path,
                  blob,
                  fileName: decodeURIComponent(path.replace('/', '')),
                };
                break;
              }
            }
          }
        } catch {
          // continue checking
        }
      }

      // If local song file found in project directory:
      if (localAudioFound) {
        const file = new File([localAudioFound.blob], localAudioFound.fileName, {
          type: localAudioFound.blob.type || 'audio/mpeg',
        });

        // Parse exact seconds (via AudioContext) & embedded ID3 cover photo
        const meta = await parseAudioFile(file);

        // Check for standalone photo file if ID3 didn't have one
        let coverUrl = meta.coverUrl;
        if (!coverUrl) {
          const possibleCovers = ['/song_cover.jpg', '/foto.jpg', '/kapak.jpg', '/cover.jpg', '/song_cover.png'];
          for (const imgPath of possibleCovers) {
            try {
              const imgRes = await fetch(imgPath, { method: 'HEAD', cache: 'no-cache' });
              if (imgRes.ok) {
                const cType = imgRes.headers.get('content-type') || '';
                if (!cType.includes('text/html')) {
                  coverUrl = imgPath;
                  break;
                }
              }
            } catch {
              // continue
            }
          }
        }

        setSong({
          title: meta.title || 'Bir Ömür Sen',
          artist: meta.artist || 'Ahmx',
          dedication:
            'Bu şarkının her notasında sana olan sevgim, seninle geçen her anın huzuru ve hayatıma kattığın sonsuz güzellik var. İyi ki varsın, iyi ki hayatımdasın...',
          audioBlob: localAudioFound.blob,
          audioUrl: localAudioFound.url,
          fileName: localAudioFound.fileName || 'Ahmx - Bir Ömür Sen.mp3',
          coverUrl: coverUrl || '/song_cover.jpg',
          duration: meta.duration,
        });
        return;
      }

      // 2. Check IndexedDB storage if any previous custom song was saved
      const saved = await getCustomSong();
      if (saved && saved.audioBlob) {
        const audioUrl = URL.createObjectURL(saved.audioBlob);
        const coverUrl = saved.coverBlob
          ? URL.createObjectURL(saved.coverBlob)
          : '/song_cover.jpg';

        let duration = saved.duration || 0;
        if (!duration) {
          try {
            const AudioCtxClass =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtxClass) {
              const ctx = new AudioCtxClass();
              const buf = await saved.audioBlob.arrayBuffer();
              const decoded = await ctx.decodeAudioData(buf);
              duration = decoded.duration;
              await ctx.close();
            }
          } catch (e) {
            console.warn('AudioContext decode fallback:', e);
          }
        }

        setSong({
          title: saved.title || 'Bir Ömür Sen',
          artist: saved.artist || 'Ahmx',
          dedication: saved.dedication || '',
          audioBlob: saved.audioBlob,
          audioUrl,
          fileName: saved.fileName || 'Ahmx - Bir Ömür Sen.mp3',
          coverUrl,
          duration,
        });
        return;
      }

      // 3. Fallback: Generate the romantic love melody
      const defaultAudioBlob = await createRomanticDefaultAudio();
      const audioUrl = URL.createObjectURL(defaultAudioBlob);

      setSong({
        title: 'Bir Ömür Sen',
        artist: 'Ahmx',
        dedication:
          'Bu şarkının her notasında sana olan sevgim, seninle geçen her anın huzuru ve hayatıma kattığın sonsuz güzellik var. İyi ki varsın, iyi ki hayatımdasın...',
        audioBlob: defaultAudioBlob,
        audioUrl,
        fileName: 'Ahmx - Bir Ömür Sen.mp3',
        coverUrl: '/song_cover.jpg',
        duration: 28,
      });
    } catch (err) {
      console.error('Error loading song:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongData();
  }, [loadSongData]);

  return (
    <div className="relative min-h-screen bg-transparent text-[#f3f3f6] flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 overflow-x-hidden selection:bg-pink-600/30 selection:text-white">
      {/* Ambient background particles, red & black gradient, pink glow and floating hearts */}
      <AmbientBackground />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-lg flex flex-col items-center my-auto py-6">
        {/* YUKARIDA İSE DOĞRUDAN HERŞEYİM YAZSIN */}
        <div className="text-center mb-6 space-y-2">
          <h1
            id="page-main-title"
            className="font-serif-romantic text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_0_35px_rgba(236,72,153,0.6)] animate-pulse-subtle"
          >
            Herşeyim
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 font-light tracking-wide max-w-sm mx-auto">
            Senin için bestelenen, kalbimin en derin melodisi
          </p>
        </div>

        {/* Music Player Container with Pink Light effect */}
        {isLoading || !song ? (
          <div className="w-full max-w-md h-96 rounded-3xl bg-[#08080c]/90 border border-pink-500/20 flex flex-col items-center justify-center gap-3 shadow-[0_0_50px_rgba(236,72,153,0.2)]">
            <Music2 className="w-8 h-8 text-pink-400 animate-bounce" />
            <p className="text-sm text-neutral-400">Şarkı hazırlanıyor...</p>
          </div>
        ) : (
          <>
            <AudioPlayer song={song} />

            {/* Personalized Dedication Letter / Note */}
            <DedicationNote
              dedication={song.dedication}
              artist={song.artist}
            />
          </>
        )}
      </main>

      {/* Romantic Pure Footer (No 'Ekle' buttons) */}
      <footer className="relative z-10 w-full max-w-md flex flex-col items-center gap-2 py-4 text-xs text-neutral-400 border-t border-white/5">
        <p className="flex items-center justify-center gap-1.5">
          <span>Her notada, her saniyede sadece sen</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
        </p>
      </footer>
    </div>
  );
}



