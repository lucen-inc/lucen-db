import { z } from "zod";

export const industries = [
  "Retail",
  "Aviation",
  "Hospitality",
  "Banking",
  "Real Estate",
  "Luxury",
  "Technology",
  "Automotive",
  "Government",
  "Architecture",
  "Media",
  "Healthcare",
] as const;

export const pipelineStages = [
  "Prospect",
  "Qualified",
  "Meeting",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;

export const clientStatuses = [
  "Prospect",
  "Active Client",
  "Past Client",
  "Partner",
  "Vendor",
] as const;

export const organizationInputSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(200),
  legal_name: z.string().trim().max(300).optional().nullable(),
  industry: z.enum(industries),
  sub_industry: z.string().trim().min(1).max(200),
  hq: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(120),
  countries: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
  employees: z.number().int().min(0).max(10_000_000).default(0),
  revenue: z.string().trim().max(60).optional().nullable(),
  founded: z.number().int().min(1500).max(2100).optional().nullable(),
  website: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  logo: z.string().trim().max(8).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  score_lead: z.number().int().min(0).max(100).default(50),
  score_innovation: z.number().int().min(0).max(100).default(50),
  score_luxury: z.number().int().min(0).max(100).default(50),
  score_tech: z.number().int().min(0).max(100).default(50),
  score_priority: z.number().int().min(0).max(100).default(50),
  client_status: z.enum(clientStatuses).default("Prospect"),
  stage: z.enum(pipelineStages).default("Prospect"),
  owner: z.string().trim().max(120).optional().nullable(),
  locations: z.number().int().min(0).max(1_000_000).default(0),
});

export type OrganizationInput = z.infer<typeof organizationInputSchema>;

export function normalizeOrgName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
