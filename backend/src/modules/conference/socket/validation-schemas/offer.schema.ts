import z from "zod";

export const offerSchema = z.object({
    conference_id: z.uuid({
        error: "conference_id must be a valid UUID",
    }),

    sdp: z.any(),
});

export type OfferData = z.infer<typeof offerSchema>;
