"use client";

import { useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useCanvasStore } from "@/stores/canvas-store";
import type { CanvasCardState } from "@/types";

export function useCanvas(socket: Socket | null) {
  const {
    setCards,
    addCard,
    removeCard,
    moveCard,
    rotateCard,
    setZIndex,
    updateCursor,
    removeCursor,
  } = useCanvasStore();

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("canvas:state", (cards: CanvasCardState[]) => {
      setCards(cards);
    });

    socket.on("card:added", (card: CanvasCardState) => {
      addCard(card);
    });

    socket.on("card:removed", (data: { id: string }) => {
      removeCard(data.id);
    });

    socket.on(
      "card:moved",
      (data: { id: string; x: number; y: number }) => {
        moveCard(data.id, data.x, data.y);
      }
    );

    socket.on(
      "card:rotated",
      (data: { id: string; rotation: number }) => {
        rotateCard(data.id, data.rotation);
      }
    );

    socket.on(
      "card:zindexed",
      (data: { id: string; zIndex: number }) => {
        setZIndex(data.id, data.zIndex);
      }
    );

    socket.on(
      "cursor:moved",
      (data: { userId: string; userName: string; x: number; y: number }) => {
        updateCursor(data);
      }
    );

    socket.on("user:left", (data: { userId: string }) => {
      removeCursor(data.userId);
    });

    return () => {
      socket.off("canvas:state");
      socket.off("card:added");
      socket.off("card:removed");
      socket.off("card:moved");
      socket.off("card:rotated");
      socket.off("card:zindexed");
      socket.off("cursor:moved");
      socket.off("user:left");
    };
  }, [
    socket,
    setCards,
    addCard,
    removeCard,
    moveCard,
    rotateCard,
    setZIndex,
    updateCursor,
    removeCursor,
  ]);

  const emitMove = useCallback(
    (id: string, x: number, y: number) => {
      if (!socket) return;
      moveCard(id, x, y);
      socket.emit("card:move", { id, x, y });
    },
    [socket, moveCard]
  );

  const emitRotate = useCallback(
    (id: string, rotation: number) => {
      if (!socket) return;
      rotateCard(id, rotation);
      socket.emit("card:rotate", { id, rotation });
    },
    [socket, rotateCard]
  );

  const emitAdd = useCallback(
    (cardId: string, x: number, y: number) => {
      if (!socket) return;
      socket.emit("card:add", { cardId, x, y });
    },
    [socket]
  );

  const emitRemove = useCallback(
    (id: string) => {
      if (!socket) return;
      // Optimistic update
      removeCard(id);
      socket.emit("card:remove", { id });
    },
    [socket, removeCard]
  );

  const emitBringToFront = useCallback(
    (id: string) => {
      if (!socket) return;
      socket.emit("card:zindex", { id });
    },
    [socket]
  );

  const emitCursor = useCallback(
    (x: number, y: number) => {
      if (!socket) return;
      socket.emit("cursor:move", { x, y });
    },
    [socket]
  );

  return {
    emitMove,
    emitRotate,
    emitAdd,
    emitRemove,
    emitBringToFront,
    emitCursor,
  };
}
