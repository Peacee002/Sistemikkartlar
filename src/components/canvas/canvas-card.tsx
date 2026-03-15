"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { RotationHandle } from "./rotation-handle";
import type { CanvasCardState } from "@/types";

type CanvasCardProps = {
  card: CanvasCardState;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onBringToFront: (id: string) => void;
  onRemove: (id: string) => void;
};

export function CanvasCard({
  card,
  onMove,
  onRotate,
  onBringToFront,
  onRemove,
}: CanvasCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const isRotating = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [localRotation, setLocalRotation] = useState(card.rotation);
  const [showContext, setShowContext] = useState(false);

  useEffect(() => {
    if (!isRotating.current) {
      setLocalRotation(card.rotation);
    }
  }, [card.rotation]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-rotation-handle]")) return;

      e.stopPropagation();
      e.preventDefault();
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Calculate offset from card position to pointer
      const canvas = cardRef.current?.parentElement;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - canvasRect.left - card.x,
        y: e.clientY - canvasRect.top - card.y,
      };

      onBringToFront(card.id);
    },
    [card.id, card.x, card.y, onBringToFront]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;

      const canvas = cardRef.current?.parentElement;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - dragOffset.current.x;
      const y = e.clientY - canvasRect.top - dragOffset.current.y;

      onMove(card.id, x, y);
    },
    [card.id, onMove]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleRotateStart = useCallback(() => {
    isRotating.current = true;
  }, []);

  const handleRotate = useCallback((rotation: number) => {
    setLocalRotation(rotation);
  }, []);

  const handleRotateEnd = useCallback(
    (rotation: number) => {
      isRotating.current = false;
      onRotate(card.id, rotation);
    },
    [card.id, onRotate]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setShowContext(true);
      setTimeout(() => setShowContext(false), 3000);
    },
    []
  );

  const displayRotation = localRotation;

  return (
    <div
      ref={cardRef}
      className="absolute group select-none touch-none"
      style={{
        transform: `translate(${card.x}px, ${card.y}px) rotate(${displayRotation}deg)`,
        zIndex: card.zIndex,
        width: "140px",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <div data-rotation-handle>
        <RotationHandle
          cardRef={cardRef}
          rotation={displayRotation}
          onRotate={handleRotate}
          onRotateEnd={handleRotateEnd}
          onRotateStart={handleRotateStart}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-transparent hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing">
        <img
          src={card.card.imageUrl}
          alt={card.card.title}
          className="w-full aspect-square object-cover pointer-events-none"
          draggable={false}
        />
        <div className="p-1.5 text-center">
          <p className="text-xs font-medium truncate">{card.card.title}</p>
        </div>
      </div>

      {/* Context menu */}
      {showContext && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border p-1 z-50">
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded-sm text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(card.id);
              setShowContext(false);
            }}
          >
            Kaldır
          </button>
        </div>
      )}
    </div>
  );
}
