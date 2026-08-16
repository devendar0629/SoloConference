import z from "zod";

export const iceCandidateSchema = z.object({
    conference_id: z.uuid({
        error: "conference_id must be a valid UUID",
    }),

    iceCandidate: z.any(),
});

export type IceCandidateData = z.infer<typeof iceCandidateSchema>;
