import { z } from "zod";

export const salesAreaSchema = z.object({
  area_name: z.string().min(2).max(100),
  area_type: z.enum([
    "Apartment",
    "Company",
    "Office",
    "Shop",
    "Residential",
    "Other",
  ]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});

export const customerSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  alternate_phone: z.string().optional().refine(val => !val || /^\d{10}$/.test(val), "Alternate phone number must be exactly 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  sales_area_id: z.string().uuid(),
  assigned_employee_id: z.string().uuid(),
  status: z.enum(["Active", "Inactive", "Blocked"]),
  notes: z.string().optional(),
});

export const customerPurchaseSchema = z.object({
  customer_id: z.string().uuid(),
  amount: z.number().positive(),
  purchase_date: z.string(),
  remarks: z.string().optional(),
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
  incentive_status: z
    .enum(["Not Eligible", "Eligible", "Pending Review", "Approved", "Rejected"])
    .optional(),
});

export const customerFollowupSchema = z.object({
  customer_id: z.string().uuid(),
  followup_date: z.string().optional(),
  followup_type: z.enum([
    "Call",
    "Visit",
    "WhatsApp",
    "Meeting",
    "Other",
  ]),
  remarks: z.string().optional(),
  next_followup_date: z.string().optional().nullable(),
});

export const incentiveRuleSchema = z.object({
  minimum_purchase: z.number().positive(),
  incentive_amount: z.number().positive(),
  status: z.enum(["Active", "Inactive"]),
});

export type SalesAreaForm = z.infer<typeof salesAreaSchema>;
export type CustomerForm = z.infer<typeof customerSchema>;
export type CustomerPurchaseForm = z.infer<typeof customerPurchaseSchema>;
export type CustomerFollowupForm = z.infer<typeof customerFollowupSchema>;
export type IncentiveRuleForm = z.infer<typeof incentiveRuleSchema>;