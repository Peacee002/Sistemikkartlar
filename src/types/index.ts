import { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type CanvasCardState = {
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
  card: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
  };
};

export type CursorState = {
  userId: string;
  userName: string;
  x: number;
  y: number;
};
