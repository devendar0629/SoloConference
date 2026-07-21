import z from "zod";

export const signupFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
        .string()
        .min(6, "Confirm Password must be at least 6 characters"),
});
export type SignupFormData = z.infer<typeof signupFormSchema>;
