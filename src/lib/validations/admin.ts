import { z } from "zod/v4"

export const clientProfileSchema = z.object({
  annual_salary: z.coerce.number().nonnegative().nullable().optional(),
  equity_capital: z.coerce.number().nonnegative().nullable().optional(),
  credit_score: z.enum(["A", "B", "C"]).nullable().optional(),
  tax_class: z.coerce.number().int().min(1).max(6).nullable().optional(),
  advisor_id: z.string().uuid().nullable().optional(),
  first_consultation_date: z.string().nullable().optional(),
  client_status: z.enum(["prospect", "active", "inactive"]),
  notes: z.string().nullable().optional(),
  risk_appetite: z.enum(["conservative", "moderate", "aggressive"]).nullable().optional(),
  investment_budget: z.coerce.number().nonnegative().nullable().optional(),
  preferred_region: z.string().nullable().optional(),
  preferred_property_type: z.string().nullable().optional(),
  planned_property_count: z.coerce.number().int().nonnegative().nullable().optional(),
  contract_type: z.string().nullable().optional(),
  commission_rate: z.coerce.number().nonnegative().nullable().optional(),
  payment_status: z.enum(["pending", "paid", "overdue", "not_applicable"]).optional(),
  contract_date: z.string().nullable().optional(),
})

export const propertySchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  zip_code: z.string().min(4, "PLZ ist erforderlich"),
  city: z.string().min(1, "Stadt ist erforderlich"),
  state: z.string().min(1, "Bundesland ist erforderlich"),
  country: z.string().default("Deutschland"),
  type: z.enum(["apartment", "house", "commercial", "multi_family"]),
  status: z.enum(["active", "sold", "in_acquisition"]),
  purchase_price: z.coerce.number().positive("Kaufpreis muss positiv sein"),
  purchase_date: z.string().nullable().optional(),
  rooms: z.coerce.number().nonnegative().nullable().optional(),
  size_sqm: z.coerce.number().positive().nullable().optional(),
  year_built: z.coerce.number().int().min(1800).max(2030).nullable().optional(),
  description: z.string().nullable().optional(),
})

export const offerSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  zip_code: z.string().min(4, "PLZ ist erforderlich"),
  city: z.string().min(1, "Stadt ist erforderlich"),
  type: z.enum(["apartment", "house", "commercial", "multi_family"]),
  status: z.enum(["active", "reserved", "sold", "withdrawn"]),
  price: z.coerce.number().positive("Preis muss positiv sein"),
  size_sqm: z.coerce.number().positive().nullable().optional(),
  rooms: z.coerce.number().nonnegative().nullable().optional(),
  year_built: z.coerce.number().int().min(1800).max(2030).nullable().optional(),
  expected_rent: z.coerce.number().nonnegative().nullable().optional(),
  expected_yield: z.coerce.number().nonnegative().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const valuationSchema = z.object({
  property_id: z.string().uuid(),
  market_value: z.coerce.number().positive("Marktwert muss positiv sein"),
  valuation_date: z.string().min(1, "Datum ist erforderlich"),
  source: z.string().nullable().optional(),
})

export const financialsSchema = z.object({
  property_id: z.string().uuid(),
  month: z.string().min(1, "Monat ist erforderlich"),
  rental_income: z.coerce.number().nonnegative(),
  mortgage_payment: z.coerce.number().nonnegative(),
  additional_costs: z.coerce.number().nonnegative(),
  management_fee: z.coerce.number().nonnegative(),
  interest_amount: z.coerce.number().nonnegative(),
  principal_amount: z.coerce.number().nonnegative(),
})
