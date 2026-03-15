"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useCanvasStore } from "@/stores/canvas-store";
import { CanvasCard } from "./canvas-card";
import { CardPool, PoolCardItem } from "./card-pool";
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
  const [activeDragItem, setActiveDragItem] = useState<PoolCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    
    if (data?.type === "pool-card") {
      const card = poolCards.find((c) => c.id === data.cardId);
      if (card) {
        setActiveDragItem(card);
      }
    }
  }, [poolCards]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active } = event;
      const data = active.data.current;
      setActiveDragItem(null);

      if (data?.type === "pool-card" && canvasRef.current) {
        // Card dropped from pool onto canvas
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // active.rect.current.translated contains the DOMRect of the item after dragging (overlay position)
        const droppedRect = active.rect.current.translated;
        
        if (!droppedRect) return;

        let x = droppedRect.left - canvasRect.left;
        let y = droppedRect.top - canvasRect.top;

        // Ensure the card is dropped within the canvas bounds
        // Card width is 140px, we want to keep it somewhat visible
        // However, allow dropping partially outside but snap to edge if too far?
        // Let's just allow it for now, but keep it reachable.
        // Actually, if dropped outside canvas (e.g. back to pool), we should probably cancel?
        // But the user might want to drop it near the edge.
        // Let's check if it's generally over the canvas.
        
        // Simple check: if top-left is wildly outside
        if (
             droppedRect.left > canvasRect.right || 
             droppedRect.right < canvasRect.left || 
             droppedRect.top > canvasRect.bottom || 
             droppedRect.bottom < canvasRect.top
        ) {
             // Dropped outside canvas
             return;
        }

        // Adjust coordinates to be relative to canvas content
        // Note: Canvas might have scroll or zoom in future, but for now it's simple div.
        
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
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

      <DragOverlay>
        {activeDragItem ? (
          <div className="w-52">
             <PoolCardItem card={activeDragItem} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
