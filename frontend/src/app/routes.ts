import { createBrowserRouter } from "react-router";
import RootLayout from "@/app/root-layout";
import LoginPage from "@/pages/auth/login-page";
import SignupPage from "@/pages/auth/signup-page";
import Protected from "@/components/auth/protected";
import NotFound from "@/pages/misc/not-found";

export const router = createBrowserRouter([
    {
        path: "",
        Component: RootLayout,
        children: [
            {
                path: "/",
                Component: Protected,
                children: [
                    {
                        path: "/auth",
                        children: [
                            {
                                path: "login",
                                Component: LoginPage
                            },
                            {
                                path: "signup",
                                Component: SignupPage
                            }
                        ]
                    },
                    {
                        path: "/dashboard",
                        Component: () => "Dashboard"
                    }
                ]
            },
            {
                path: "*",
                Component: NotFound
            }
        ]
    }
]);
