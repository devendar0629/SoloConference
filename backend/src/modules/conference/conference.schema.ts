import z from "zod";

export const createConferenceSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
    }),
});
export type CreateConferenceBody = z.infer<
    typeof createConferenceSchema
>["body"];
