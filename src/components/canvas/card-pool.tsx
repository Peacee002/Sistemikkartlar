"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PoolCard = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
};

export function CardPool({
  cards,
  onCanvasCardIds,
}: {
  cards: PoolCard[];
  onCanvasCardIds: Set<string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const availableCards = cards.filter((c) => !onCanvasCardIds.has(c.id));

  return (
    <div className="relative flex h-full">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 w-8 h-16 bg-background border border-r-0 rounded-l-md flex items-center justify-center hover:bg-muted transition-colors"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="w-[80vw] bg-background border-l flex flex-col h-full">
          <div className="p-3 border-b font-semibold text-sm">
            Kartlar ({availableCards.length})
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-wrap gap-3">
              {availableCards.map((card) => (
                <DraggablePoolCard key={card.id} card={card} />
              ))}
            </div>
            {availableCards.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Tüm kartlar tuval üzerinde
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PoolCardItem({ card, isOverlay = false }: { card: PoolCard, isOverlay?: boolean }) {
  return (
    <div
      className={`bg-card rounded-lg border ${
        isOverlay ? "shadow-xl cursor-grabbing scale-105" : "cursor-grab hover:bg-muted/50"
      } transition-all`}
    >
      <img
        src={card.imageUrl}
        alt={card.title}
        className="w-full h-auto rounded-lg"
        draggable={false}
      />
    </div>
  );
}

function DraggablePoolCard({ card }: { card: PoolCard }) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({
      id: `pool-${card.id}`,
      data: { cardId: card.id, type: "pool-card" },
    });

  const style = {
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="w-40"
    >
      <PoolCardItem card={card} />
    </div>
  );
}
