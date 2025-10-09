import { z } from "zod";

/**
 * Factory function to create a typed createOne schema
 * @param dataSchema - The Zod schema for the model's creation data
 * @returns A Zod schema that wraps the data schema in a { data: ... } object
 */
export function createCreateOneSchema(dataSchema: z.ZodType<any>) {
  return z.object({
    data: dataSchema,
  });
}

/**
 * Factory function to create a typed updateOne schema
 * @param updatesSchema - The Zod schema for the model's update data
 * @returns A Zod schema with { id: string, updates: ... }
 */
export function createUpdateOneSchema(updatesSchema: z.ZodType<any>) {
  return z.object({
    id: z.string().describe("Resource ID to update"),
    updates: updatesSchema,
  });
}
