"use client";

import { useCanvasStore } from "@/stores/canvas-store";

const CURSOR_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function getColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function CursorOverlay({ currentUserId }: { currentUserId: string }) {
  const cursors = useCanvasStore((s) => s.cursors);

  return (
    <>
      {Array.from(cursors.values())
        .filter((c) => c.userId !== currentUserId)
        .map((cursor) => {
          const color = getColor(cursor.userId);
          return (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                zIndex: 99999,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill={color}
                stroke="white"
                strokeWidth="1"
              >
                <path d="M0 0L16 6L8 8L6 16Z" />
              </svg>
              <span
                className="absolute left-4 top-3 text-[10px] px-1 py-0.5 rounded whitespace-nowrap text-white"
                style={{ backgroundColor: color }}
              >
                {cursor.userName}
              </span>
            </div>
          );
        })}
    </>
  );
}
