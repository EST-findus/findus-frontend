"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import PhotoSkeleton from "./loading/PhotoSkeleton";

/**
 * 사진을 받는 동안 사람 모양 자리표시(ai면 반짝이가 뜨는 AI 톤)를 깔고, 다 받으면 흐릿함을 걷으며 나타나는 next/image.
 * 부모는 relative + 크기를 가져야 한다(fill 사진).
 */
export default function FadeInImage({ ai = false, alt, className = "", onLoad, onError, ...props }: ImageProps & { ai?: boolean }) {
  const [settled, setSettled] = useState(false);
  return (
    <>
      {!settled && <PhotoSkeleton ai={ai} />}
      <Image
        {...props}
        alt={alt}
        data-loaded={settled}
        className={`opacity-0 data-[loaded=true]:opacity-100 data-[loaded=true]:motion-safe:animate-photo-in ${className}`}
        onLoad={(event) => { setSettled(true); onLoad?.(event); }}
        onError={(event) => { setSettled(true); onError?.(event); }}
      />
    </>
  );
}
