import api, { setAccessToken } from "@/lib/api";
import type { LoginFormData } from "@/schemas/login";
import { useStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@/store/slices/useAuthSlice";

type LoginResponse = {
    message: string;
    data: User;
    accessToken: string;
};

type SignupResponse = {
    message: string;
    data: User;
};

const loginUser = async (data: LoginFormData) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

export const useLoginMutation = (
    onLoginSuccess?: (data: LoginResponse) => void
) => {
    const { login: storeLogin } = useStore((state) => state.auth);

    return useMutation<LoginResponse, Error, LoginFormData>({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            api.defaults.headers.common["Authorization"] =
                `Bearer ${data.accessToken}`;
            storeLogin(data.data);

            onLoginSuccess?.(data);
        }
    });
};

const signupUser = async (data: LoginFormData) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
};

export const useSignupMutation = () => {
    return useMutation<SignupResponse, Error, LoginFormData>({
        mutationFn: signupUser
    });
};
