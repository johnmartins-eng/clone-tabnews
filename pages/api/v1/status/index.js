import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const version = await database.query("SHOW server_version;");

  const maxCon = await database.query("SHOW max_connections;");

  const databaseName = process.env.POSTGRES_DB;
  const openCon = await database.query({
    text: "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version.rows[0].server_version,
        max_connections: parseInt(maxCon.rows[0].max_connections),
        open_connections: parseInt(openCon.rows[0].count),
      },
    },
  });
}

export default status;
