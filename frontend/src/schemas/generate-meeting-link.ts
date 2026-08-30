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
        .optional()
        .refine(
            (val) => {
                if (val == undefined || val === "") return true;

                return val.length >= 4;
            },
            {
                error: "Passcode must be at least 4 characters long"
            }
        )
});
export type GenerateMeetingLinkFormData = z.infer<
    typeof generateMeetingLinkFormSchema
>;
