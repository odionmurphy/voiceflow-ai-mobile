import { z } from "zod";

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(3, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export type CreateCustomerForm = z.infer<typeof createCustomerSchema>;
