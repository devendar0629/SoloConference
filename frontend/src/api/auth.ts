import api from "@/lib/api";

export const fetchCurrentUser = async () => {
    return api.get("/users/me").then((res) => {
        return res.data;
    });
};
