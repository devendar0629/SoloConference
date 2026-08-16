import z from "zod";

export const leaveSchema = z.object({
    conference_id: z
        .string({
            error: "conference_id must be a string",
        })
        .min(1, {
            error: "conference_id cannot be empty.",
        }),
});

export type LeaveData = z.infer<typeof leaveSchema>;
