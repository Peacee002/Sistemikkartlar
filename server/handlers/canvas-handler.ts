import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

type CanvasCardState = {
  id: string;
  cardId: string;
  roomId: string;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  scale: number;
  isOnCanvas: boolean;
  placedBy?: string;
  card?: { id: string; title: string; imageUrl: string; category: string };
};

export function registerCanvasHandlers(
  io: Server,
  socket: Socket,
  roomCanvasStates: Map<string, Map<string, CanvasCardState>>,
  debouncedSave: (roomId: string) => void,
  prisma: PrismaClient
) {
  const { roomId, userId, userName } = socket.data;

  // Move a card
  socket.on("card:move", (data: { id: string; x: number; y: number }) => {
    const state = roomCanvasStates.get(roomId);
    if (!state) return;

    const card = state.get(data.id);
    if (card) {
      card.x = data.x;
      card.y = data.y;
      socket.to(roomId).emit("card:moved", {
        id: data.id,
        x: data.x,
        y: data.y,
        userId,
      });
      debouncedSave(roomId);
    }
  });

  // Rotate a card
  socket.on(
    "card:rotate",
    (data: { id: string; rotation: number }) => {
      const state = roomCanvasStates.get(roomId);
      if (!state) return;

      const card = state.get(data.id);
      if (card) {
        card.rotation = data.rotation;
        socket.to(roomId).emit("card:rotated", {
          id: data.id,
          rotation: data.rotation,
          userId,
        });
        debouncedSave(roomId);
      }
    }
  );

  // Scale a card
  socket.on(
    "card:scale",
    (data: { id: string; scale: number }) => {
      const state = roomCanvasStates.get(roomId);
      if (!state) return;

      const card = state.get(data.id);
      if (card) {
        card.scale = data.scale;
        socket.to(roomId).emit("card:scaled", {
          id: data.id,
          scale: data.scale,
          userId,
        });
        debouncedSave(roomId);
      }
    }
  );

  // Add a card to canvas
  socket.on(
    "card:add",
    async (data: { cardId: string; x: number; y: number }) => {
      const state = roomCanvasStates.get(roomId) || new Map();
      if (!roomCanvasStates.has(roomId)) {
        roomCanvasStates.set(roomId, state);
      }

      // Check if card is already on canvas
      for (const card of state.values()) {
        if (card.cardId === data.cardId && card.isOnCanvas) {
          return; // Already on canvas
        }
      }

      // Fetch card details from DB
      const cardDetails = await prisma.card.findUnique({
        where: { id: data.cardId },
        select: { id: true, title: true, imageUrl: true, category: true },
      });

      if (!cardDetails) return;

      const id = randomUUID();
      const maxZ = Math.max(
        0,
        ...Array.from(state.values()).map((c) => c.zIndex)
      );

      const newCard: CanvasCardState = {
        id,
        cardId: data.cardId,
        roomId,
        x: data.x,
        y: data.y,
        rotation: 0,
        zIndex: maxZ + 1,
        scale: 1,
        isOnCanvas: true,
        placedBy: userId,
        card: cardDetails,
      };

      state.set(id, newCard);
      socket.emit("card:added", newCard);
      socket.to(roomId).emit("card:added", newCard);
      debouncedSave(roomId);
    }
  );

  // Remove a card from canvas
  socket.on("card:remove", (data: { id: string }) => {
    const state = roomCanvasStates.get(roomId);
    if (!state) return;

    const card = state.get(data.id);
    if (card) {
      card.isOnCanvas = false;
      socket.emit("card:removed", { id: data.id });
      socket.to(roomId).emit("card:removed", { id: data.id });
      debouncedSave(roomId);
    }
  });

  // Change z-index (bring to front)
  socket.on("card:zindex", (data: { id: string }) => {
    const state = roomCanvasStates.get(roomId);
    if (!state) return;

    const card = state.get(data.id);
    if (card) {
      const maxZ = Math.max(
        0,
        ...Array.from(state.values()).map((c) => c.zIndex)
      );
      card.zIndex = maxZ + 1;
      socket.emit("card:zindexed", {
        id: data.id,
        zIndex: card.zIndex,
      });
      socket.to(roomId).emit("card:zindexed", {
        id: data.id,
        zIndex: card.zIndex,
      });
      debouncedSave(roomId);
    }
  });

  // Cursor movement
  socket.on("cursor:move", (data: { x: number; y: number }) => {
    socket.to(roomId).emit("cursor:moved", {
      userId,
      userName,
      x: data.x,
      y: data.y,
    });
  });
}
