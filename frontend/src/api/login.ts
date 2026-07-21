import api from "@/lib/api";
import type { LoginFormData } from "@/schemas/login";
import { useStore } from "@/store";
import { useMutation } from "@tanstack/react-query";

const loginUser = async (data: LoginFormData) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

// 3. Update the Custom Hook
export const useLoginMutation = (onLoginSuccess?: (data: any) => void) => {
    const { login: storeLogin } = useStore((state) => state.auth);

    return useMutation<any, Error, LoginFormData>({
        mutationFn: loginUser,
        onSuccess: (data) => {
            api.defaults.headers.common["Authorization"] =
                `Bearer ${data.accessToken}`;
            storeLogin(data.user);

            onLoginSuccess?.(data);
        }
    });
};

const signupUser = async (data: any) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
};

export const useSignupMutation = () => {
    return useMutation<any, Error, any>({
        mutationFn: signupUser
    });
};
