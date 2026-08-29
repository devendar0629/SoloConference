import z from "zod";

export const UUIDSchema = z.uuid({
    error: "Invalid UUID format",
});
