import z from "zod";

export const generateMeetingLinkFormSchema = z.object({
    title: z
        .string({
            error: "Title is required"
        })
        .min(1, "Title is required"),

    password: z
        .string({
            error: "Password is required"
        })
        .min(1, "Password is required")
});
export type GenerateMeetingLinkFormData = z.infer<
    typeof generateMeetingLinkFormSchema
>;
