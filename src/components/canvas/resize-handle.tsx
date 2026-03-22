"use client";

import { useCallback, useRef } from "react";

type ResizeHandleProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  onResize: (scale: number) => void;
  onResizeEnd: (scale: number) => void;
  onResizeStart?: () => void;
};

export function ResizeHandle({
  cardRef,
  scale,
  onResize,
  onResizeEnd,
  onResizeStart,
}: ResizeHandleProps) {
  const resizing = useRef(false);
  const initialDistance = useRef(0);
  const initialScale = useRef(scale);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      resizing.current = true;
      onResizeStart?.();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate initial distance from center to pointer
      const dist = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      initialDistance.current = dist;
      initialScale.current = scale;
    },
    [cardRef, scale, onResizeStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizing.current || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const currentDist = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      // Calculate new scale based on ratio of distances
      // Avoid division by zero
      if (initialDistance.current === 0) return;

      let newScale = initialScale.current * (currentDist / initialDistance.current);

      // Clamp scale to reasonable limits
      newScale = Math.max(0.5, Math.min(newScale, 3));
      
      // Snap to 1 if close
      if (Math.abs(newScale - 1) < 0.05) newScale = 1;

      onResize(newScale);
    },
    [cardRef, onResize]
  );

  const handlePointerUp = useCallback(
    () => {
      resizing.current = false;
      onResizeEnd(scale); // Pass current scale, which is updated via onResize -> parent state -> props
    },
    [scale, onResizeEnd]
  );

  return (
    <div
      className="absolute -top-10 sm:-top-8 left-1/2 ml-12 sm:ml-10 -translate-x-1/2 w-10 h-10 sm:w-8 sm:h-8 bg-card border-2 border-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-md z-10 transition-transform hover:scale-110"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      title="Boyutlandırmak için sürükleyin"
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
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </div>
  );
}
