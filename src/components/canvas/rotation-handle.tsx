"use client";

import { useCallback, useRef } from "react";

type RotationHandleProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  rotation: number;
  onRotate: (rotation: number) => void;
  onRotateEnd: (rotation: number) => void;
};

export function RotationHandle({
  cardRef,
  rotation,
  onRotate,
  onRotateEnd,
}: RotationHandleProps) {
  const rotating = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      rotating.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!rotating.current || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) *
        (180 / Math.PI) + 90;

      onRotate(angle);
    },
    [cardRef, onRotate]
  );

  const handlePointerUp = useCallback(
    () => {
      rotating.current = false;
      onRotateEnd(rotation);
    },
    [rotation, onRotateEnd]
  );

  return (
    <div
      className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
      </svg>
    </div>
  );
}
