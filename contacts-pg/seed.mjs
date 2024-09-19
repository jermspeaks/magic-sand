import pkg from "pg";
import fs from "fs";
import csv from "csv-parser";
import "dotenv/config";

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USERNAME,
  host: "localhost",
  database: 'rolodex', // as a default
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

async function truncateTables(client) {
  const tables = [
    "contacts",
    "organizations",
    "contact_organizations",
    "emails",
    "phones",
    "addresses",
    "facebook_links",
    "website_links",
    "twitter_links",
    "linkedin_links",
  ];

  for (const table of tables) {
    await client.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);
  }
}

async function seedDatabase() {
  const client = await pool.connect();
  try {
    // Truncate all tables before seeding
    await truncateTables(client);

    const readStream = fs.createReadStream("./contacts-pg/contacts.csv");
    const tasks = []; // Array to hold all insertion tasks

    readStream
      .pipe(csv())
      .on("data", (row) => {
        const task = (async () => {
          // Insert into contacts table
          const birthday = row["Birthday"]
            ? new Date(birthday).toISOString()
            : null;
          const contactResult = await client.query(
            `INSERT INTO contacts (first_name, middle_name, last_name, phonetic_first_name, phonetic_middle_name, phonetic_last_name, name_prefix, name_suffix, nickname, file_as, birthday, notes, photo, labels)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
            [
              row["First Name"],
              row["Middle Name"],
              row["Last Name"],
              row["Phonetic First Name"],
              row["Phonetic Middle Name"],
              row["Phonetic Last Name"],
              row["Name Prefix"],
              row["Name Suffix"],
              row["Nickname"],
              row["File As"],
              birthday,
              row["Notes"],
              row["Photo"],
              row["Labels"],
            ]
          );
          const contactId = contactResult.rows[0].id;

          // Insert into emails table
          if (row["E-mail 1 - Value"]) {
            await client.query(
              `INSERT INTO emails (contact_id, email, label) VALUES ($1, $2, $3)`,
              [contactId, row["E-mail 1 - Value"], row["E-mail 1 - Label"]]
            );
          }
          if (row["E-mail 2 - Value"]) {
            await client.query(
              `INSERT INTO emails (contact_id, email, label) VALUES ($1, $2, $3)`,
              [contactId, row["E-mail 2 - Value"], row["E-mail 2 - Label"]]
            );
          }
          if (row["E-mail 3 - Value"]) {
            await client.query(
              `INSERT INTO emails (contact_id, email, label) VALUES ($1, $2, $3)`,
              [contactId, row["E-mail 3 - Value"], row["E-mail 3 - Label"]]
            );
          }

          // Insert into phones table
          if (row["Phone 1 - Value"]) {
            await client.query(
              `INSERT INTO phones (contact_id, phone, label) VALUES ($1, $2, $3)`,
              [contactId, row["Phone 1 - Value"], row["Phone 1 - Label"]]
            );
          }
          if (row["Phone 2 - Value"]) {
            await client.query(
              `INSERT INTO phones (contact_id, phone, label) VALUES ($1, $2, $3)`,
              [contactId, row["Phone 2 - Value"], row["Phone 2 - Label"]]
            );
          }

          // Insert into addresses table
          if (row["Address 1 - Formatted"]) {
            await client.query(
              `INSERT INTO addresses (contact_id, formatted, street, city, po_box, region, postal_code, country, extended_address, label)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                contactId,
                row["Address 1 - Formatted"],
                row["Address 1 - Street"],
                row["Address 1 - City"],
                row["Address 1 - PO Box"],
                row["Address 1 - Region"],
                row["Address 1 - Postal Code"],
                row["Address 1 - Country"],
                row["Address 1 - Extended Address"],
                row["Address 1 - Label"],
              ]
            );
          }

          // Insert into website links
          if (row["Website 1 - Value"]) {
            await client.query(
              `INSERT INTO website_links (contact_id, url, label) VALUES ($1, $2, $3)`,
              [contactId, row["Website 1 - Value"], row["Website 1 - Label"]]
            );
          }

          // Insert into social media links
          if (row["facebook_url"]) {
            await client.query(
              `INSERT INTO facebook_links (contact_id, url) VALUES ($1, $2)`,
              [contactId, row["facebook_url"]]
            );
          }
          if (row["twitter_url"]) {
            await client.query(
              `INSERT INTO twitter_links (contact_id, url) VALUES ($1, $2)`,
              [contactId, row["twitter_url"]]
            );
          }
          if (row["linkedin_url"]) {
            await client.query(
              `INSERT INTO linkedin_links (contact_id, url) VALUES ($1, $2)`,
              [contactId, row["linkedin_url"]]
            );
          }

          let organizationId;
          if (row["Organization Name"]) {
            const orgName = row["Organization Name"].trim();
            // Check if the organization already exists
            const existingOrgResult = await client.query(
              `SELECT id FROM organizations WHERE name = $1`,
              [orgName]
            );

            if (existingOrgResult.rows.length > 0) {
              // Use existing organization ID
              organizationId = existingOrgResult.rows[0].id;
            } else {
              // Insert new organization and get its ID
              // Use INSERT ... ON CONFLICT to handle potential race conditions
              const orgResult = await client.query(
                `INSERT INTO organizations (name, address_formatted, address_street, address_city, address_po_box, address_region, address_postal_code, address_country, address_extended_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
                [
                  orgName,
                  null, // address_formatted is not in the CSV
                  null, // address_street is not in the CSV
                  null, // address_city is not in the CSV
                  null, // address_po_box is not in the CSV
                  null, // address_region is not in the CSV
                  null, // address_postal_code is not in the CSV
                  null, // address_country is not in the CSV
                  null, // address_extended_address is not in the CSV
                ]
              );
              organizationId = orgResult.rows[0].id;
            }
          } else {
            // console.log("No organization name found, skipping");
          }

          if (organizationId) {
            // Insert into contact_organizations table
            await client.query(
              `INSERT INTO contact_organizations (contact_id, organization_id, title, department)
             VALUES ($1, $2, $3, $4)`,
              [
                contactId,
                organizationId,
                row["Organization Title"],
                row["Organization Department"],
              ]
            );
          }
        })();

        // Add the task to the array
        tasks.push(task);
      })
      .on("end", async () => {
        // Wait for all the tasks to complete
        await Promise.all(tasks);
        console.log("CSV file successfully processed and database seeded.");
      });
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    client.release(); // Use release instead of end to return the client to the pool
  }
}

seedDatabase();
