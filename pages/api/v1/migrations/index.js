import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  // A dry run simulates migranting all the data.
  // Live run actually executes the migrations.
  let isDryRun = true;
  if (request.method === "GET") {
    isDryRun = true;
  } else if (request.method === "POST") {
    isDryRun = false;
  } else {
    return response
      .status(405)
      .json({ error: `Method "${request.method}" now allowed` });
  }

  const dbClient = await database.getNewClient();

  const migrations = await migrationRunner({
    dbClient: dbClient,
    databaseUrl: process.env.DATABASE_URL,
    dryRun: isDryRun,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  await dbClient.end();

  if (migrations.length > 0 && request.method == "POST") {
    return response.status(201).json(migrations);
  }

  return response.status(200).json(migrations);
}
