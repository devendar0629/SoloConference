import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CombinedStore } from "./types";
import { createAuthSlice } from "./slices/useAuthSlice";

const useStore = create<CombinedStore>()(
    immer((set, get, store) => {
        return {
            auth: {
                ...createAuthSlice(set, get, store),
            },
        };
    }),
);

export { useStore };
