import pkg from "pg";
import "dotenv/config";

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USERNAME,
  host: "localhost",
  database: process.env.POSTGRES_USERNAME, // as a default
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

async function getFirstFiveContacts() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM organizations LIMIT 5");
    console.log(result.rows.map(row => row.name));
  } catch (err) {
    console.error("Error querying the database:", err);
  } finally {
    client.release();
  }
}

// Run the function
getFirstFiveContacts();
