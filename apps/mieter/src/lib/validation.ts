import { z } from "zod";

// Issue (Mangel) validation schema
export const issueSchema = z.object({
  category: z.enum([
    "sanitaer",
    "elektrik",
    "heizung",
    "fenster_tueren",
    "wasserschaden",
    "schimmel",
    "sonstiges",
  ], { errorMap: () => ({ message: "Bitte wählen Sie eine gültige Kategorie" }) }),
  description: z
    .string()
    .min(10, { message: "Beschreibung muss mindestens 10 Zeichen haben" })
    .max(2000, { message: "Beschreibung darf maximal 2000 Zeichen haben" }),
  priority: z.enum(["niedrig", "mittel", "hoch", "notfall"], {
    errorMap: () => ({ message: "Ungültige Priorität" }),
  }),
});

// Meter reading validation schema
export const meterReadingSchema = z.object({
  meter_type: z.enum(["strom", "gas", "kaltwasser", "warmwasser"], {
    errorMap: () => ({ message: "Bitte wählen Sie einen gültigen Zählertyp" }),
  }),
  value: z
    .number({ invalid_type_error: "Zählerstand muss eine Zahl sein" })
    .min(0, { message: "Zählerstand kann nicht negativ sein" })
    .max(9999999999, { message: "Zählerstand ist zu hoch" }),
  previous_value: z.number().optional(),
});

// Document request validation schema
export const documentRequestSchema = z.object({
  document_type: z.enum([
    "mietbescheinigung",
    "nebenkostenabrechnung",
    "wohnungsgeberbestaetigung",
    "mietvertrag",
  ], { errorMap: () => ({ message: "Bitte wählen Sie einen gültigen Dokumenttyp" }) }),
  notes: z
    .string()
    .max(500, { message: "Anmerkungen dürfen maximal 500 Zeichen haben" })
    .optional(),
});

export type IssueFormData = z.infer<typeof issueSchema>;
export type MeterReadingFormData = z.infer<typeof meterReadingSchema>;
export type DocumentRequestFormData = z.infer<typeof documentRequestSchema>;
