import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createNeonDatabase } from "./index";

const connectionString = process.env.INTEGRATION_DATABASE_URL;
type QueryRow = Readonly<Record<string, unknown>>;

describe.skipIf(!connectionString)("PostgreSQL integration", () => {
  it("connects to the intended database and exposes the migrated starter schema", async () => {
    const database = createNeonDatabase(connectionString as string);
    const result = await database.execute(sql`select current_database() as database_name`);
    const tables = await database.execute(sql`select table_name from information_schema.tables where table_schema = 'public'`);
    const resultRows = result as unknown as readonly QueryRow[];
    const tableRows = tables as unknown as readonly QueryRow[];
    const tableNames = new Set(tableRows.map((row) => String(row["table_name"])));

    expect(String(resultRows[0]?.["database_name"])).toBeTruthy();
    expect(tableNames).toEqual(expect.arrayContaining(["user", "role", "permission", "user_role", "role_permission", "audit_log"]));
  });
});
