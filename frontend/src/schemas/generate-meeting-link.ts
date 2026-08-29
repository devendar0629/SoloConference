import z from "zod";

export const generateMeetingLinkFormSchema = z.object({
    title: z
        .string({
            error: "Title is required"
        })
        .min(1, "Title is required"),

    passcode: z
        .string({
            error: "Passcode is required"
        })
        .min(1, "Passcode is required")
});
export type GenerateMeetingLinkFormData = z.infer<
    typeof generateMeetingLinkFormSchema
>;
