import z from "zod";

export const joinConferenceFormSchema = z.object({
    code: z
        .string({
            error: "Conference code is required"
        })
        .min(1, "Conference code is required")
});

export type JoinConferenceFormData = z.infer<typeof joinConferenceFormSchema>;
