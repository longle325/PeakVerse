import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { MUSIC_TRACKS } from "@/data/music";

export default function BackgroundMusic() {
  const enabled = useAppStore((s) => s.music.enabled);
  const trackId = useAppStore((s) => s.music.trackId);
  const volume = useAppStore((s) => s.music.volume);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.preload = "auto";
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = MUSIC_TRACKS.find((t) => t.id === trackId);
    if (!track) return;

    const expectedSrc = new URL(track.src, window.location.origin).toString();
    if (audio.src !== expectedSrc) {
      audio.src = track.src;
    }

    if (!enabled) {
      audio.pause();
      return;
    }

    audio.play().catch(() => {
      // Autoplay blocked — retry on first user gesture below.
    });

    const onUserGesture = () => {
      const a = audioRef.current;
      if (!a || !a.paused) return;
      a.play().catch(() => {});
    };
    window.addEventListener("pointerdown", onUserGesture);
    window.addEventListener("keydown", onUserGesture);
    return () => {
      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
    };
  }, [enabled, trackId]);

  return null;
}
