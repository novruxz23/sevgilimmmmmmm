import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Check,
} from 'lucide-react';
import { SongData } from '../types';

interface AudioPlayerProps {
  song: SongData;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.duration || 0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Initialize and update audio element
  useEffect(() => {
    if (song.duration && song.duration > 0) {
      setDuration(song.duration);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(song.audioUrl);
    } else {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = song.audioUrl;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }

    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
    audio.loop = isLooping;

    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration((prev) => (prev > 0 ? prev : audio.duration));
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration((prev) => (prev > 0 ? prev : audio.duration));
      }
    };

    const onEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', updateDuration);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [song.audioUrl, song.duration]);

  // Handle loop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard shortcut listener (Space to play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        skipTime(5);
      } else if (e.code === 'ArrowLeft') {
        skipTime(-5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Audio play error:', err);
      });
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 100, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const a = document.createElement('a');
      a.href = song.audioUrl;
      const downloadName = song.fileName && song.fileName.trim() ? song.fileName : 'Ahmx - Bir Ömür Sen.mp3';
      const cleanDownload = downloadName.endsWith('.mp3') || downloadName.endsWith('.wav') ? downloadName : `${downloadName}.mp3`;
      a.download = cleanDownload;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full max-w-md mx-auto my-2">
      {/* ========================================================================= */}
      {/* PEMBE IŞIK HALKASI / RADIAL PINK LIGHT EMITTING ONTO THE BLACK SCREEN    */}
      {/* ========================================================================= */}
      {/* Wide atmospheric pink dispersion onto deep black canvas */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[680px] h-[520px] sm:h-[680px] rounded-full bg-pink-500/25 blur-[120px] pointer-events-none transition-all duration-1000 ${
          isPlaying ? 'opacity-100 scale-110' : 'opacity-70 scale-95'
        }`}
      />

      {/* Intense neon-pink rim glow right behind player */}
      <div
        className={`absolute -inset-2 sm:-inset-4 rounded-[36px] bg-gradient-to-b from-pink-500/50 via-rose-500/40 to-fuchsia-500/50 blur-2xl pointer-events-none transition-all duration-700 ${
          isPlaying ? 'opacity-90 animate-pulse' : 'opacity-60'
        }`}
        style={{
          boxShadow: isPlaying
            ? '0 0 80px 30px rgba(236, 72, 153, 0.45), 0 0 140px 60px rgba(244, 63, 142, 0.3)'
            : '0 0 50px 15px rgba(236, 72, 153, 0.3), 0 0 100px 35px rgba(244, 63, 142, 0.2)',
        }}
      />

      {/* ========================================================================= */}
      {/* SİYAH MUSIC PLAYER KARTI (BLACK CARD WITH PINK NEON EDGES)                */}
      {/* ========================================================================= */}
      <div
        id="music-player-card"
        className="relative z-10 w-full bg-[#08080c]/95 border border-pink-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-300"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), inset 0 0 30px rgba(236, 72, 153, 0.08)',
        }}
      >
        {/* Top vibrant pink light reflection bar */}
        <div className="absolute -top-px left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_15px_#ec4899]" />

        {/* Center Artwork / Photo of the Song with radiant pink aura */}
        <div className="relative flex justify-center items-center mt-2 mb-4">
          {/* Inner Pink Light blooming from behind the photo */}
          <div
            className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-pink-500/35 blur-3xl transition-all duration-700 pointer-events-none ${
              isPlaying ? 'opacity-100 scale-110' : 'opacity-60 scale-95'
            }`}
          />

          {/* Modern Cinematic Artwork Frame with Pink Neon Border Glow */}
          <div
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-pink-500/40 shadow-2xl bg-[#0e0e14]"
            style={{
              boxShadow: '0 0 30px rgba(236,72,153,0.3), 0 10px 40px rgba(0,0,0,0.9)',
            }}
          >
            <img
              id="song-photo-center"
              src={song.coverUrl}
              alt={song.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Subtle bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            {/* Floating playing pulse indicator */}
            {isPlaying && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-pink-500/50 flex items-center gap-1.5 text-[11px] text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.5)]">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                <span>Çalıyor</span>
              </div>
            )}
          </div>
        </div>

        {/* Song Metadata */}
        <div className="text-center mt-5 mb-4">
          <h3
            id="player-song-title"
            className="text-xl sm:text-2xl font-semibold text-white tracking-wide truncate px-2 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]"
          >
            {song.title || 'Bizim Şarkımız'}
          </h3>
          <p
            id="player-song-artist"
            className="text-sm text-pink-300/80 mt-1 flex items-center justify-center gap-1.5 font-medium"
          >
            <span>{song.artist || 'Sadece Senin İçin'}</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
          </p>
        </div>

        {/* Animated Pink Sound Wave Equalizer Bars */}
        <div className="flex items-center justify-center gap-1 h-5 my-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-gradient-to-t from-pink-600 via-pink-400 to-rose-300 shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                  : 'bg-white/10 h-1.5'
              }`}
              style={{
                height: isPlaying
                  ? `${Math.max(4, Math.sin((i + currentTime * 5) * 0.8) * 16 + 8)}px`
                  : '4px',
              }}
            />
          ))}
        </div>

        {/* Scrubber / Progress Bar with Pink Accent */}
        <div className="space-y-1.5 my-3">
          <div
            id="player-progress-bar-container"
            ref={progressRef}
            onClick={handleSeek}
            className="group relative w-full h-2 bg-white/10 hover:bg-white/15 rounded-full cursor-pointer overflow-hidden transition-all"
          >
            {/* Active progress fill in glowing pink */}
            <div
              id="player-progress-fill"
              className="h-full bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 rounded-full relative transition-all shadow-[0_0_12px_rgba(236,72,153,0.7)]"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md shadow-pink-900 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex justify-between items-center text-xs text-neutral-400 font-mono select-none px-0.5">
            <span id="player-current-time">{formatTime(currentTime)}</span>
            <span id="player-total-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Playback Controls: DURDURMA / OYNATMA BUTONU */}
        <div className="flex items-center justify-between mt-5 mb-6">
          {/* Loop / Repeat Toggle */}
          <button
            id="toggle-loop-btn"
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isLooping
                ? 'text-pink-400 bg-pink-500/15 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
            }`}
            title={isLooping ? 'Tekrar Açık' : 'Tekrar Kapalı'}
          >
            {isLooping ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>

          {/* Rewind 10s */}
          <button
            id="rewind-10s-btn"
            type="button"
            onClick={() => skipTime(-10)}
            className="p-2.5 text-neutral-400 hover:text-pink-300 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="10 Saniye Geri"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Center Primary PLAY / PAUSE Button with Pink Neon Pulse */}
          <button
            id="play-pause-btn"
            type="button"
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 via-pink-500 to-rose-400 hover:from-pink-500 hover:to-rose-300 text-white flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.65)] hover:shadow-[0_0_40px_rgba(236,72,153,0.85)] transition-all active:scale-95 hover:scale-105 cursor-pointer"
            aria-label={isPlaying ? 'Durdur' : 'Oynat'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white text-white" />
            ) : (
              <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
            )}
          </button>

          {/* Forward 10s */}
          <button
            id="forward-10s-btn"
            type="button"
            onClick={() => skipTime(10)}
            className="p-2.5 text-neutral-400 hover:text-pink-300 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="10 Saniye İleri"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Volume Mute Toggle */}
          <button
            id="toggle-volume-btn"
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isMuted
                ? 'text-neutral-500 bg-white/5'
                : 'text-neutral-400 hover:text-pink-300 hover:bg-white/5'
            }`}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Volume Slider bar */}
        <div className="flex items-center justify-center gap-2 mb-6 px-6">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Ses</span>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVol = parseFloat(e.target.value);
              setVolume(newVol);
              if (isMuted && newVol > 0) setIsMuted(false);
            }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* İNDİRME BUTONU (PROMINENT DOWNLOAD BUTTON) */}
        <div className="pt-2 border-t border-white/5">
          <button
            id="download-song-btn"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-6 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 hover:border-pink-500/60 text-white font-medium text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:shadow-[0_0_30px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-pink-300" />
                <span className="text-pink-200 font-semibold">Şarkı Başarıyla İndirildi!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>Şarkıyı İndir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

