import { create } from "zustand";
import type { CanvasCardState, CursorState } from "@/types";

type CanvasStore = {
  cards: Map<string, CanvasCardState>;
  cursors: Map<string, CursorState>;
  zCounter: number;

  setCards: (cards: CanvasCardState[]) => void;
  addCard: (card: CanvasCardState) => void;
  removeCard: (id: string) => void;
  moveCard: (id: string, x: number, y: number) => void;
  rotateCard: (id: string, rotation: number) => void;
  scaleCard: (id: string, scale: number) => void;
  bringToFront: (id: string) => void;
  setZIndex: (id: string, zIndex: number) => void;
  updateCursor: (cursor: CursorState) => void;
  removeCursor: (userId: string) => void;
  getCardsArray: () => CanvasCardState[];
  getOnCanvasCards: () => CanvasCardState[];
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  cards: new Map(),
  cursors: new Map(),
  zCounter: 1,

  setCards: (cards) => {
    const map = new Map<string, CanvasCardState>();
    let maxZ = 0;
    for (const card of cards) {
      map.set(card.id, card);
      if (card.zIndex > maxZ) maxZ = card.zIndex;
    }
    set({ cards: map, zCounter: maxZ + 1 });
  },

  addCard: (card) => {
    set((state) => {
      const cards = new Map(state.cards);
      // Remove any existing canvas card with the same cardId
      // (handles optimistic → server-confirmed transition)
      for (const [id, existing] of cards) {
        if (existing.cardId === card.cardId && existing.isOnCanvas && id !== card.id) {
          cards.delete(id);
          break;
        }
      }
      cards.set(card.id, card);
      return {
        cards,
        zCounter: Math.max(state.zCounter, card.zIndex + 1),
      };
    });
  },

  removeCard: (id) => {
    set((state) => {
      const cards = new Map(state.cards);
      const card = cards.get(id);
      if (card) {
        cards.set(id, { ...card, isOnCanvas: false });
      }
      return { cards };
    });
  },

  moveCard: (id, x, y) => {
    set((state) => {
      const cards = new Map(state.cards);
      const card = cards.get(id);
      if (card) {
        cards.set(id, { ...card, x, y });
      }
      return { cards };
    });
  },

  rotateCard: (id, rotation) => {
    set((state) => {
      const cards = new Map(state.cards);
      const card = cards.get(id);
      if (card) {
        cards.set(id, { ...card, rotation });
      }
      return { cards };
    });
  },

  scaleCard: (id, scale) => {
    set((state) => {
      const cards = new Map(state.cards);
      const card = cards.get(id);
      if (card) {
        cards.set(id, { ...card, scale });
      }
      return { cards };
    });
  },

  bringToFront: (id) => {
    set((state) => {
      const cards = new Map(state.cards);
      const card = cards.get(id);
      if (card) {
        cards.set(id, { ...card, zIndex: state.zCounter });
      }
      return { cards, zCounter: state.zCounter + 1 };
    });
  },

  setZIndex: (id, zIndex) => {
    set((state) => {
      const cards = new Map(state.cards);
      const card = cards.get(id);
      if (card) {
        cards.set(id, { ...card, zIndex });
      }
      return {
        cards,
        zCounter: Math.max(state.zCounter, zIndex + 1),
      };
    });
  },

  updateCursor: (cursor) => {
    set((state) => {
      const cursors = new Map(state.cursors);
      cursors.set(cursor.userId, cursor);
      return { cursors };
    });
  },

  removeCursor: (userId) => {
    set((state) => {
      const cursors = new Map(state.cursors);
      cursors.delete(userId);
      return { cursors };
    });
  },

  getCardsArray: () => Array.from(get().cards.values()),

  getOnCanvasCards: () =>
    Array.from(get().cards.values()).filter((c) => c.isOnCanvas),
}));
