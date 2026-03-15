"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";

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
  const availableCards = cards.filter((c) => !onCanvasCardIds.has(c.id));

  return (
    <div className="w-64 bg-background border-l flex flex-col h-full">
      <div className="p-3 border-b font-semibold text-sm">
        Kartlar ({availableCards.length})
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {availableCards.map((card) => (
          <DraggablePoolCard key={card.id} card={card} />
        ))}
        {availableCards.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Tüm kartlar tuval üzerinde
          </p>
        )}
      </div>
    </div>
  );
}

function DraggablePoolCard({ card }: { card: PoolCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `pool-${card.id}`,
      data: { cardId: card.id, type: "pool-card" },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-center gap-2 p-2 bg-card rounded-md border cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors"
    >
      <img
        src={card.imageUrl}
        alt={card.title}
        className="w-10 h-10 rounded object-cover flex-shrink-0"
        draggable={false}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{card.title}</p>
        <Badge variant="secondary" className="text-[10px] mt-0.5">
          {card.category}
        </Badge>
      </div>
    </div>
  );
}
