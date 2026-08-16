import { createBrowserRouter } from "react-router";
import RootLayout from "@/app/root-layout";
import LoginPage from "@/pages/auth/login-page";
import SignupPage from "@/pages/auth/signup-page";
import Protected from "@/components/auth/protected";
import NotFound from "@/pages/misc/not-found";
import AllConferences from "@/pages/conference/all";
import Dashboard from "./dashboard";
import Conference from "@/pages/conference/conference";
import JoinConferenceById from "@/pages/conference/join-conference-by-id";

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
                        Component: Dashboard
                    },
                    {
                        path: "/conferences",
                        Component: AllConferences
                    },
                    {
                        path: "/conference/:conference_id",
                        Component: Conference
                    },
                    {
                        path: "/conference/join/:conference_id",
                        Component: JoinConferenceById
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
