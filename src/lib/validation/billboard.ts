import { z } from "zod";

// Strict schema for every billboard field: wrong type, wrong length, or
// wrong format is rejected outright rather than silently sanitized/escaped
// — per SECURITY REQUIREMENT 2.
export const billboardSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title must be 120 characters or fewer."),
  app_id: z.string().uuid("Select a valid app."),
  offer: z
    .string()
    .trim()
    .max(60, "Offer must be 60 characters or fewer.")
    .nullable(),
  display_order: z
    .number()
    .int("Display order must be a whole number.")
    .min(0)
    .max(9999),
  active: z.boolean(),
});

export type BillboardInput = z.infer<typeof billboardSchema>;

// CSS object-position emitted by the drag-to-reposition UI — constrained to
// the exact "N% N%" shape (0-100 each) it can actually produce, so a
// tampered form field can't inject arbitrary CSS.
export const coverPositionSchema = z
  .string()
  .regex(
    /^(100|[1-9]?\d)% (100|[1-9]?\d)%$/,
    "Invalid cover position."
  )
  .default("50% 50%");
