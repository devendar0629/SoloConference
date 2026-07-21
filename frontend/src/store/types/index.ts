import type { AuthSliceState } from "../slices/useAuthSlice";

export type CombinedStore = {
    auth: AuthSliceState;
};
