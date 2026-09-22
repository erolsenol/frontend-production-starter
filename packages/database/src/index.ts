import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
export * from "./schema";
export const databaseSchema = schema;
export const createNeonDatabase = (connectionString: string) => {
  if (!connectionString.startsWith("postgres")) throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  return drizzle(neon(connectionString), { schema });
};
