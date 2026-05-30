import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Character } from "@/types";

export default function CharacterArt({ character }: { character: Character }) {
  const images = useMemo(
    () =>
      character.images?.length
        ? character.images
        : character.image
          ? [character.image]
          : [],
    [character.image, character.images],
  );
  const [activeImage, setActiveImage] = useState(0);
  const hasGallery = images.length > 1;

  const showPrevious = () => {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveImage((current) => (current + 1) % images.length);
  };

  if (images.length) {
    return (
      <div className={`art image-art${hasGallery ? " profile-gallery" : ""}`}>
        <div
          className="gallery-track"
          style={
            {
              "--active-image": activeImage,
            } as React.CSSProperties
          }
        >
          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={
                hasGallery
                  ? `${character.name} - ảnh ${index + 1}/${images.length}`
                  : character.name
              }
            />
          ))}
        </div>
        <span className="tag">{character.genre || "Kinh điển"}</span>
        {hasGallery && (
          <>
            <button
              type="button"
              className="gallery-zone gallery-zone-left"
              aria-label="Xem ảnh trước"
              onClick={showPrevious}
            />
            <button
              type="button"
              className="gallery-zone gallery-zone-right"
              aria-label="Xem ảnh tiếp theo"
              onClick={showNext}
            />
            <div className="gallery-controls" aria-label="Ảnh nhân vật">
              <button
                type="button"
                className="gallery-arrow"
                aria-label="Ảnh trước"
                onClick={showPrevious}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="gallery-dots" role="tablist">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={index === activeImage ? "active" : ""}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-selected={index === activeImage}
                    role="tab"
                    onClick={() => setActiveImage(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="gallery-arrow"
                aria-label="Ảnh tiếp theo"
                onClick={showNext}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <div
      className="art"
      data-initial={character.initial}
      style={
        {
          "--art-a": character.artA,
          "--art-b": character.artB,
        } as React.CSSProperties
      }
    >
      <span className="tag">{character.genre || "Kinh điển"}</span>
      <div className="art-scene">
        <strong>{character.artTitle}</strong>
        <span>{character.imageBrief}</span>
      </div>
    </div>
  );
}
