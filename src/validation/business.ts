import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  industry: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  openTime: z.string().min(1, "Opening time is required"), // e.g. "09:00"
  closeTime: z.string().min(1, "Closing time is required"), // e.g. "18:00"
});

export type CreateBusinessForm = z.infer<typeof createBusinessSchema>;
