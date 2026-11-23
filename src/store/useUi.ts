// Flüchtiger UI-Zustand (wird nicht gespeichert): Belohnungen & Konfetti
import { create } from 'zustand';

type Celebration = { id: number; title: string; sub: string; big: boolean };

type UiState = {
  celebration: Celebration | null;
  show: (title: string, sub: string, big: boolean) => void;
  clear: () => void;
};

export const useUi = create<UiState>()((set) => ({
  celebration: null,
  show: (title, sub, big) => set({ celebration: { id: Date.now(), title, sub, big } }),
  clear: () => set({ celebration: null }),
}));

export const celebrate = (title: string, sub: string, big = false) => useUi.getState().show(title, sub, big);
