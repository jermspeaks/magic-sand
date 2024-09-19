import csv from 'csv-parser';
import fs from 'fs';

// Check for errors
fs.createReadStream("./contacts-pg/contacts.csv")
  .pipe(csv())
  .on("data", async (row) => {
    console.log("row", row);
  });
