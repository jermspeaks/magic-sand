import pkg from "pg";
import fs from "fs";
import "dotenv/config";

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USERNAME,
  host: "localhost",
  database: 'rolodex', // as a default
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

async function dropTables(client) {
  try {
    const result = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );

    for (const row of result.rows) {
      await client.query(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`);
    }
    console.log("All tables dropped successfully.");
  } catch (err) {
    console.error("Error dropping tables:", err);
  }
}

async function createTables(client) {
  try {
    const schema = fs.readFileSync("./contacts-pg/db.sql", "utf-8");
    await client.query(schema);
    console.log("Schema created successfully.");
  } catch (err) {
    console.error("Error creating schema:", err);
  }
}

async function resetDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Drop all tables
    await dropTables(client);

    // Recreate schema
    await createTables(client);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error resetting database:", err);
  } finally {
    client.release();
  }
}

// Run the reset
resetDatabase();
