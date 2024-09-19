# Contacts to Postgres

I haven't worked with Postgres in awhile, and I have a spreadsheet that I wanted to seed.

## Installation

Create the rolodex db

```sql
CREATE DATABASE rolodex
  WITH 
  OWNER = jeremywong
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE = template0;
```

Run this to reset then seed the db

```sh
bunx run contacts-pg/reset.mjs && bunx run contacts-pg/seed.mjs
```

For the `contacts.csv` feel free to upload the latest export from google contacts

## Ideas on where this can go

- Be able to easily add groups for each contact so we can visualize how everyone is connected together.
- Use social media APIs to fetch and parse information relevant to updating contacts, like job and employment history
- Use AI to see what things are mentioned and see what interests people have
- Have a way to bring up a "Person of the day" to surface who to reach out to, especially if I haven't reached out to them in awhile
- Export easily to other programs, like Obsidian (interoperability) - my "rolodex"
  - Easily re-import information I discover about people
- Cron to grab the latest contacts daily for any changes
