import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Volume2, VolumeX, Volume1, Volume, PlayCircle, StopCircle } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { MUSIC_TRACKS, type MusicTrack } from "@/data/music";

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX size={20} />;
  if (volume < 0.34) return <Volume size={20} />;
  if (volume < 0.67) return <Volume1 size={20} />;
  return <Volume2 size={20} />;
}

function TrackPreviewButton({ track }: { track: MusicTrack }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnd = () => setPlaying(false);
    const onErr = () => {
      setPlaying(false);
      setAvailable(false);
    };
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);
    audio.volume = 0.6;
    return () => {
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onErr);
      audio.pause();
    };
  }, []);

  const toggle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !available) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setAvailable(false);
      });
  };

  if (!available) return null;
  return (
    <>
      <button
        type="button"
        className={`music-track-preview${playing ? " playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Tạm dừng nghe thử" : `Nghe thử ${track.title}`}
        title={playing ? "Tạm dừng" : "Nghe thử"}
      >
        {playing ? <StopCircle size={18} /> : <PlayCircle size={18} />}
      </button>
      <audio ref={audioRef} src={track.src} preload="none" />
    </>
  );
}

export default function MusicSettingsCard() {
  const enabled = useAppStore((s) => s.music.enabled);
  const trackId = useAppStore((s) => s.music.trackId);
  const volume = useAppStore((s) => s.music.volume);
  const setEnabled = useAppStore((s) => s.setMusicEnabled);
  const setTrack = useAppStore((s) => s.setMusicTrack);
  const setVolume = useAppStore((s) => s.setMusicVolume);

  const [expanded, setExpanded] = useState(false);
  const volumePct = Math.round(volume * 100);

  const toggleExpanded = () => setExpanded((v) => !v);

  return (
    <section
      className={`card music-settings${expanded ? " is-expanded" : " is-collapsed"}`}
      aria-labelledby="music-settings-title"
    >
      <header className="music-settings-head">
        <button
          type="button"
          className="music-settings-summary"
          aria-expanded={expanded}
          aria-controls="music-settings-body"
          onClick={toggleExpanded}
        >
          <span className="music-settings-intro">
            <span className="kicker">Nhạc nền</span>
            <span id="music-settings-title" className="music-settings-title">
              Không gian âm nhạc
            </span>
            <span className="music-settings-status">
              {enabled
                ? `Đang phát · ${volumePct}%`
                : "Đang tắt — nhấn để cài đặt"}
            </span>
          </span>
          <span className="music-settings-chevron" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={`music-lamp-switch${enabled ? " is-on" : " is-off"}`}
          onClick={(e) => {
            e.stopPropagation();
            setEnabled(!enabled);
          }}
        >
          <span className="music-lamp-track" aria-hidden>
            <svg
              className="music-lamp-glyph music-lamp-glyph--off"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="6"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            <svg
              className="music-lamp-glyph music-lamp-glyph--on"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="currentColor"
            >
              <path d="M12 2.5c.6 2.6 4 4.4 4 8.2 0 2.4-1.8 4.6-4 4.6s-4-2.2-4-4.6c0-3.8 3.4-5.6 4-8.2zm0 14.5c-.9 0-1.6.6-1.6 1.5s.7 1.5 1.6 1.5 1.6-.6 1.6-1.5-.7-1.5-1.6-1.5z" />
            </svg>
            <span className="music-lamp-knob">
              <span className="music-lamp-knob-inset" />
            </span>
          </span>
          <span className="music-lamp-label">
            <strong>{enabled ? "Đang bật" : "Đã tắt"}</strong>
            <small>
              {enabled ? "đèn dầu đã thắp" : "khẽ tay tắt đèn"}
            </small>
          </span>
        </button>
      </header>

      <div
        id="music-settings-body"
        className="music-settings-body"
        hidden={!expanded}
      >
        <p className="lead music-settings-lead">
          Một bản hòa tấu nhẹ nhàng đồng hành cùng việc đọc và trò chuyện với
          các nhân vật.
        </p>

        <div className="music-divider" aria-hidden>
          <span className="music-divider-mark">Bản nhạc</span>
        </div>

      <fieldset
        className={`music-track-group${enabled ? "" : " is-disabled"}`}
        disabled={!enabled}
        aria-label="Chọn bản nhạc nền"
      >
        {MUSIC_TRACKS.map((track, index) => {
          const selected = trackId === track.id;
          return (
            <label
              key={track.id}
              className={`music-track-card${selected ? " selected" : ""}`}
            >
              <input
                type="radio"
                name="music-track"
                value={track.id}
                checked={selected}
                onChange={() => setTrack(track.id)}
              />
              <span className="music-track-numeral" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="music-track-text">
                <strong className="music-track-title">{track.title}</strong>
                <small className="music-track-mood">{track.mood}</small>
              </span>
              <span className="music-track-stamp" aria-hidden>
                印
              </span>
              <TrackPreviewButton track={track} />
            </label>
          );
        })}
      </fieldset>

      <div className="music-divider" aria-hidden>
        <span className="music-divider-mark">Âm lượng</span>
      </div>

      <div
        className={`music-volume${enabled ? "" : " is-disabled"}`}
        aria-disabled={!enabled}
      >
        <span className="music-volume-icon" aria-hidden>
          <VolumeIcon volume={volume} muted={!enabled} />
        </span>
        <span
          className="music-volume-track"
          style={{ "--music-volume-fill": `${volumePct}%` } as CSSProperties}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            disabled={!enabled}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Âm lượng nhạc nền"
            className="music-volume-slider"
          />
          <span className="music-volume-ticks" aria-hidden>
            <span /> <span /> <span />
          </span>
        </span>
        <span className="music-volume-cartouche" aria-hidden>
          <strong>{volumePct}</strong>
          <small>%</small>
        </span>
        </div>
      </div>
    </section>
  );
}
