import z from "zod";

export const joinConferenceFormSchema = z.object({
    conferenceCodeOrLink: z
        .string({
            error: "Conference code or link is required"
        })
        .min(1, "Conference code or link is required")
});
export type JoinConferenceFormData = z.infer<typeof joinConferenceFormSchema>;
