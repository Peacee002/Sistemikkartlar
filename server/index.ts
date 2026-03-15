import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { registerCanvasHandlers } from "./handlers/canvas-handler";
import { registerRoomHandlers } from "./handlers/room-handler";

const prisma = new PrismaClient();

const httpServer = createServer((_req, res) => {
  // Health check
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok" }));
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// In-memory canvas state per room
const roomCanvasStates = new Map<
  string,
  Map<
    string,
    {
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
    }
  >
>();

// Debounced save timers
const saveTimers = new Map<string, NodeJS.Timeout>();

function debouncedSave(roomId: string) {
  const existing = saveTimers.get(roomId);
  if (existing) clearTimeout(existing);

  saveTimers.set(
    roomId,
    setTimeout(async () => {
      const state = roomCanvasStates.get(roomId);
      if (!state) return;

      try {
        const cards = Array.from(state.values());
        // Upsert all canvas cards
        for (const card of cards) {
          await prisma.canvasCard.upsert({
            where: {
              roomId_cardId: { roomId: card.roomId, cardId: card.cardId },
            },
            create: {
              id: card.id,
              roomId: card.roomId,
              cardId: card.cardId,
              x: card.x,
              y: card.y,
              rotation: card.rotation,
              zIndex: card.zIndex,
              scale: card.scale,
              isOnCanvas: card.isOnCanvas,
              placedBy: card.placedBy,
            },
            update: {
              x: card.x,
              y: card.y,
              rotation: card.rotation,
              zIndex: card.zIndex,
              scale: card.scale,
              isOnCanvas: card.isOnCanvas,
              placedBy: card.placedBy,
            },
          });
        }
        console.log(`Saved canvas state for room ${roomId}`);
      } catch (err) {
        console.error(`Error saving canvas state for room ${roomId}:`, err);
      }
    }, 5000)
  );
}

// Auth middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const roomId = socket.handshake.auth.roomId;

  if (!token || !roomId) {
    return next(new Error("Authentication required"));
  }

  try {
    // Verify user exists and has room access
    // In production, verify the JWT token properly
    const userId = socket.handshake.auth.userId;
    const userName = socket.handshake.auth.userName;

    if (!userId) {
      return next(new Error("Invalid user"));
    }

    // Check room membership
    const membership = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!membership && room?.creatorId !== userId) {
      return next(new Error("Not a room member"));
    }

    socket.data.userId = userId;
    socket.data.userName = userName;
    socket.data.roomId = roomId;
    next();
  } catch {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", async (socket) => {
  const { roomId, userId, userName } = socket.data;
  console.log(`User ${userName} connected to room ${roomId}`);

  // Join socket room
  socket.join(roomId);

  // Load canvas state from DB if not in memory
  if (!roomCanvasStates.has(roomId)) {
    const dbCards = await prisma.canvasCard.findMany({
      where: { roomId },
      include: {
        card: {
          select: { id: true, title: true, imageUrl: true, category: true },
        },
      },
    });
    const stateMap = new Map();
    for (const c of dbCards) {
      stateMap.set(c.id, {
        id: c.id,
        cardId: c.cardId,
        roomId: c.roomId,
        x: c.x,
        y: c.y,
        rotation: c.rotation,
        zIndex: c.zIndex,
        scale: c.scale,
        isOnCanvas: c.isOnCanvas,
        placedBy: c.placedBy,
        card: c.card,
      });
    }
    roomCanvasStates.set(roomId, stateMap);
  }

  // Send current canvas state
  const state = roomCanvasStates.get(roomId);
  if (state) {
    socket.emit("canvas:state", Array.from(state.values()));
  }

  // Notify others
  socket.to(roomId).emit("user:joined", { userId, userName });

  // Register handlers
  registerCanvasHandlers(
    io,
    socket,
    roomCanvasStates,
    debouncedSave,
    prisma
  );
  registerRoomHandlers(io, socket);

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${userName} disconnected from room ${roomId}`);
    socket.to(roomId).emit("user:left", { userId, userName });

    // If no more users in room, clean up after a delay
    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    if (!roomSockets || roomSockets.size === 0) {
      // Save state before cleanup
      debouncedSave(roomId);
      // Clean up in-memory state after 5 minutes
      setTimeout(() => {
        const roomSockets = io.sockets.adapter.rooms.get(roomId);
        if (!roomSockets || roomSockets.size === 0) {
          roomCanvasStates.delete(roomId);
        }
      }, 5 * 60 * 1000);
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
