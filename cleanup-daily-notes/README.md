# Daily Notes Updater

A Node.js script to update and standardize markdown daily notes by modifying their YAML frontmatter.

## Features

- Adds `previousEntry` and `nextEntry` values to link notes chronologically
- Ensures all notes have the required tags (`journal` and `logs/daily`)
- Removes the `Title` property if it exists
- Maintains consistent double quote formatting for wiki links in the YAML frontmatter
- Handles files with duplicate keys in the frontmatter using a custom parser

## Requirements

- Node.js
- npm

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Usage

### Process files in the current directory

```bash
node update-daily-notes.js
```

### Process files in a specific directory

```bash
node update-daily-notes.js /path/to/your/markdown/files
```

## How It Works

The script:

1. Finds all markdown files in the specified directory (defaults to current directory)
2. Sorts them chronologically (based on filename in YYYY-MM-DD.md format)
3. For each file:
   - Parses the frontmatter
   - Adds or updates the required properties
   - Ensures consistent formatting
   - Writes the updated content back to the file

## Example

### Before

```markdown
---
created: 2021-12-20
Title: Daily Note for December 20
tags:
  - journal
---
# 2021-12-20 Journal
```

### After

```markdown
---
created: 2021-12-20
tags:
  - journal
  - logs/daily
previousEntry:
  - "[[2021-12-19]]"
nextEntry:
  - "[[2021-12-21]]"
---
# 2021-12-20 Journal
```

## Changelog

### v1.0.0 (2025-03-06)

- Initial release
- Basic functionality to update frontmatter

### v1.1.0 (2025-03-06)

- Added support for consistent double quote formatting for wiki links
- Fixed issues with duplicate keys in frontmatter
- Added custom parser as a fallback for files with duplicate keys

### v1.2.0 (2025-03-06)

- Added ability to specify a directory path as a command-line argument
- Improved error handling
- Added logging to show progress and results

## License

MIT
