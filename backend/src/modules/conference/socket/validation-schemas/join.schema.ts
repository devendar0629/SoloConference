import z from "zod";

export const joinSchema = z.object({
    conference_id: z.uuid({
        error: "conference_id must be a valid UUID",
    }),
});

export type JoinData = z.infer<typeof joinSchema>;
