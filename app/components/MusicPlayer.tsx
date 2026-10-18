"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25;

    let startedByInteraction = false;

    const updatePlaying = () => {
      setIsPlaying(!audio.paused && !audio.ended);
    };

    const handleError = () => {
      setIsPlaying(false);
      console.error("A.GO music failed to load:", audio.error);
    };

    const startMusic = async () => {
      if (startedByInteraction || !audio.paused) return;

      startedByInteraction = true;

      try {
        await audio.play();
        setShowHint(false);
      } catch (error) {
        console.error("Could not play A.GO music:", error);
        setIsPlaying(false);
        setShowHint(true);
        startedByInteraction = false;
      }
    };

    const handleFirstInteraction = () => {
      void startMusic();
    };

    audio.addEventListener("play", updatePlaying);
    audio.addEventListener("pause", updatePlaying);
    audio.addEventListener("ended", updatePlaying);
    audio.addEventListener("error", handleError);

    // محاولة التشغيل التلقائي عند فتح الموقع
    audio.play().catch(() => {
      setIsPlaying(false);
      setShowHint(true);
    });

    // لو المتصفح منع التشغيل، نبدأ من أول لمسة أو ضغطة
    document.addEventListener(
      "pointerdown",
      handleFirstInteraction,
      true
    );

    document.addEventListener(
      "keydown",
      handleFirstInteraction,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleFirstInteraction,
        true
      );

      document.removeEventListener(
        "keydown",
        handleFirstInteraction,
        true
      );

      audio.removeEventListener("play", updatePlaying);
      audio.removeEventListener("pause", updatePlaying);
      audio.removeEventListener("ended", updatePlaying);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setShowHint(false);
      return;
    }

    try {
      await audio.play();
      setShowHint(false);
    } catch (error) {
      console.error("Could not play A.GO music:", error);
      setShowHint(true);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/ago_music.mp3"
        loop
        preload="auto"
      />

      <button
        type="button"
        onClick={toggleMusic}
        className="ago-music-button"
        aria-label={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
        title={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
      >
        <span className={isPlaying ? "music-icon playing" : "music-icon"}>
          {isPlaying ? "♫" : "♪"}
        </span>

        <span>{isPlaying ? "MUSIC ON" : "MUSIC OFF"}</span>
      </button>

      {showHint && !isPlaying && (
        <div className="ago-music-hint">
          🎵 اضغط في أي مكان لتشغيل موسيقى A.GO
        </div>
      )}

      <style jsx>{`
        .ago-music-button {
          position: fixed;
          right: 18px;
          bottom: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          border: 1px solid rgba(212, 175, 55, 0.8);
          border-radius: 999px;
          background: rgba(8, 8, 8, 0.94);
          color: #d4af37;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.3px;
          cursor: pointer;
          box-shadow: 0 0 18px rgba(212, 175, 55, 0.13);
          backdrop-filter: blur(10px);
        }

        .music-icon {
          font-size: 20px;
          line-height: 1;
        }

        .music-icon.playing {
          animation: pulse 1s infinite alternate;
        }

        .ago-music-hint {
          position: fixed;
          right: 18px;
          bottom: 76px;
          z-index: 9999;
          padding: 10px 13px;
          border: 1px solid #d4af37;
          border-radius: 10px;
          background: #080808;
          color: #fff;
          font-size: 12px;
        }

        @keyframes pulse {
          from {
            opacity: 0.55;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}