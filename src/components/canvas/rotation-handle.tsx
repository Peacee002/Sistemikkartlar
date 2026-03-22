"use client";

import { useCallback, useRef } from "react";

type RotationHandleProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  rotation: number;
  onRotate: (rotation: number) => void;
  onRotateEnd: (rotation: number) => void;
  onRotateStart?: () => void;
};

export function RotationHandle({
  cardRef,
  rotation,
  onRotate,
  onRotateEnd,
  onRotateStart,
}: RotationHandleProps) {
  const rotating = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      rotating.current = true;
      onRotateStart?.();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [onRotateStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!rotating.current || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let angle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) *
        (180 / Math.PI) + 90;

      // Snap to 15 degrees by default for easier alignment
      // Snap to 45 degrees if Shift is held
      if (e.shiftKey) {
        angle = Math.round(angle / 45) * 45;
      } else {
        angle = Math.round(angle / 15) * 15;
      }

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
      className="absolute -top-10 sm:-top-8 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-8 sm:h-8 bg-card border-2 border-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-md z-10 transition-transform hover:scale-110"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      title="Döndürmek için sürükleyin (Shift ile 45°)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
      </svg>
    </div>
  );
}
