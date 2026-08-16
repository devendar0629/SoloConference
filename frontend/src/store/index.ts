import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import type { CombinedStore } from "./types";
import { createAuthSlice } from "./slices/useAuthSlice";

const useStore = create<CombinedStore>()(
    devtools(
        immer((set, get, store) => {
            return {
                auth: {
                    ...createAuthSlice(set, get, store)
                }
            };
        })
    )
);

export { useStore };
