"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UiState {
  analyticsHidden: boolean;
  toggleAnalyticsHidden: () => void;
  setAnalyticsHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      analyticsHidden: false,

      toggleAnalyticsHidden: () =>
        set((state) => ({ analyticsHidden: !state.analyticsHidden })),

      setAnalyticsHidden: (hidden) => set({ analyticsHidden: hidden }),
    }),
    {
      name: "vgc-analyzer:ui",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
