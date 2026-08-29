import z from "zod";

export const createConferenceSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),

        passcode: z
            .string()
            .optional()
            .refine((value) => {
                if (value === undefined) return true;
                return value.length >= 4 && value.length <= 16;
            }, "Passcode must be between 4 and 16 characters long"),
    }),
});
export type CreateConferenceBody = z.infer<
    typeof createConferenceSchema
>["body"];
