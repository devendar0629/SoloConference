import z from "zod";

export const answerSchema = z.object({
    conference_id: z.uuid({
        error: "conference_id must be a valid UUID",
    }),

    sdp: z.any(),
});

export type AnswerData = z.infer<typeof answerSchema>;
