import type { StateCreator } from "zustand";
import type { CombinedStore } from "../types";

export type User = {
    id: number;
    name: string;
    email: string;
};

export type AuthSliceState = {
    user: User | null;
    isLoggedIn: boolean;
    isInitializing: boolean;

    login: (user: User) => void;
    logout: () => void;
};

export const createAuthSlice: StateCreator<
    CombinedStore,
    [["zustand/immer", never]],
    [],
    AuthSliceState
> = (set) => {
    return {
        user: null,
        isLoggedIn: false,
        isInitializing: true,

        login: (newUser) => {
            set((state) => {
                state.auth.user = newUser;

                state.auth.isLoggedIn = true;
                state.auth.isInitializing = false;
            });
        },

        logout: () => {
            set((state) => {
                state.auth.user = null;

                state.auth.isLoggedIn = false;
                state.auth.isInitializing = false;
            });
        }
    };
};
