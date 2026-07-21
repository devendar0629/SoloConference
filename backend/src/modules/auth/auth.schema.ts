import z from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});
export type LoginBody = z.infer<typeof loginSchema>["body"];

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});
export type SignupBody = z.infer<typeof signupSchema>["body"];
