"use client";

import { useCallback, useMemo, useRef } from "react";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { useCanvasStore } from "@/stores/canvas-store";
import { CanvasCard } from "./canvas-card";
import { CardPool } from "./card-pool";
import { CursorOverlay } from "./cursor-overlay";
import type { CanvasCardState } from "@/types";

type PoolCard = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

type CanvasProps = {
  poolCards: PoolCard[];
  currentUserId: string;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onAdd: (cardId: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
  onCursorMove: (x: number, y: number) => void;
  connected: boolean;
};

export function Canvas({
  poolCards,
  currentUserId,
  onMove,
  onRotate,
  onAdd,
  onRemove,
  onBringToFront,
  onCursorMove,
  connected,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cards = useCanvasStore((s) => s.cards);
  const addCard = useCanvasStore((s) => s.addCard);
  const zCounter = useCanvasStore((s) => s.zCounter);

  const onCanvasCards = useMemo(() => {
    const result: CanvasCardState[] = [];
    cards.forEach((c) => {
      if (c.isOnCanvas && c.card) result.push(c);
    });
    return result;
  }, [cards]);

  const onCanvasCardIds = useMemo(
    () => new Set(onCanvasCards.map((c) => c.card.id)),
    [onCanvasCards]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      onCursorMove(e.clientX - rect.left, e.clientY - rect.top);
    },
    [onCursorMove]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const data = active.data.current;

      if (data?.type === "pool-card" && canvasRef.current) {
        // Card dropped from pool onto canvas
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, rect.width / 2 - 70 + delta.x);
        const y = Math.max(0, rect.height / 2 - 70 + delta.y);

        // Optimistic local update: show card immediately
        const poolCard = poolCards.find((c) => c.id === data.cardId);
        if (poolCard) {
          addCard({
            id: `temp-${data.cardId}`,
            cardId: data.cardId,
            roomId: "",
            x,
            y,
            rotation: 0,
            zIndex: zCounter,
            scale: 1,
            isOnCanvas: true,
            card: poolCard,
          });
        }

        // Emit to server (server response will replace the optimistic entry)
        onAdd(data.cardId, x, y);
      }
    },
    [onAdd, poolCards, addCard, zCounter]
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-full">
        {/* Canvas area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-muted/30"
          onPointerMove={handlePointerMove}
          style={{ touchAction: "none" }}
        >
          {/* Connection status */}
          <div className="absolute top-3 left-3 z-50">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                connected
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {connected ? "Bağlı" : "Bağlantı kesik"}
            </div>
          </div>

          {/* Grid pattern background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Canvas cards */}
          {onCanvasCards.map((card) => (
            <CanvasCard
              key={card.id}
              card={card}
              onMove={onMove}
              onRotate={onRotate}
              onBringToFront={onBringToFront}
              onRemove={onRemove}
            />
          ))}

          {/* Cursor overlay */}
          <CursorOverlay currentUserId={currentUserId} />
        </div>

        {/* Card pool sidebar */}
        <CardPool cards={poolCards} onCanvasCardIds={onCanvasCardIds} />
      </div>

      <DragOverlay />
    </DndContext>
  );
}
