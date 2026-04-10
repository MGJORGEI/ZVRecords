import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrate: {
    adapter: async () => {
      const { PrismaSQLiteAdapter } = await import("@prisma/adapter-sqlite");
      const { default: Database } = await import("better-sqlite3");
      const db = new Database(path.join(__dirname, "prisma", "data", "zv.db"));
      return new PrismaSQLiteAdapter(db);
    },
  },
});
