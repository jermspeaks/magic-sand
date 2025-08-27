# YouTube Subscription Table Updater

This project contains a Node.js script designed to automate the process of updating a Markdown table of your YouTube channel subscriptions. It parses your current subscriptions from a saved HTML file, compares it against an existing Markdown table, and generates a new, updated table with additional information like channel avatars, vanity URLs, and handles.

## Features

- **Adds New Subscriptions**: Automatically detects and adds newly subscribed channels to the table.
- **Identifies Removed Subscriptions**: Reports which channels you are no longer subscribed to.
- **Enriches Data**: Fetches and adds the following for each channel:
  - An `Avatar` image.
  - The `Vanity Handle` (e.g., `@channelname`).
  - A clickable `Vanity URL`.
- **Preserves Existing Data**: Keeps manually entered information (like `Feed Link`, `First Published`, etc.) for channels that already exist in your table.
- **Non-Destructive**: Creates a new file (`updated_table.md`) instead of overwriting your original `table.md`.
- **Alphabetical Sorting**: The final table is neatly sorted by the channel author's name.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 20.x or higher is recommended)
- [npm](https://www.npmjs.com/) (which is included with Node.js)

## Setup Instructions

If you are running this for the first time or on a new machine, follow these setup steps.

1.  **Clone the Repository**:

```sh
git clone magic-sand
cd magic-sand
```

2.  **Install Dependencies**:
    The script requires the `jsdom` package to parse HTML. Install it by running:

```sh
npm install
```

This command reads the `package.json` file and installs the necessary packages.

## How to Use the Script

Follow these steps each time you want to update your subscription list.

### Step 1: Get Your Subscriptions HTML File

You need to provide the script with an HTML file of your YouTube subscriptions page.

1.  **Navigate to Your Channels Page**:
    Open your web browser and go to your YouTube subscriptions list:
    [https://www.youtube.com/feed/channels](https://www.youtube.com/feed/channels)
    Sort by A-Z

2.  **Load All Channels**:
    Scroll down the page until **all** of your subscribed channels are visible. The page loads them dynamically, so this step is crucial for ensuring every channel is included.

3.  **Save the Page**:
    - Right-click anywhere on the page and select **"Save As..."** (or "Save Page As...").
    - In the save dialog, name the file exactly `subscriptions.html`.
    - For the "Format" or "Save as type" option, choose **"Webpage, HTML Only"**.
    - Save this file in the root directory of this project.

### Step 2: Place Your Existing Markdown Table (Optional)

- If you have an existing subscription table, make sure it is named `table.md` and is located in the root directory of this project.
- If you don't have a `table.md` file, the script will create a brand new table from your `subscriptions.html` file.

### Step 3: Run the Script

Open your terminal, make sure you are in the project's root directory, and run the following command:

```sh
node update_subscriptions.js
```

The other js file, `generate-table.js` was for generating the initial table, and is no longer needed. Same with `channels.txt`.

## Output

After the script finishes, you will see the following:

1.  **A New File**: A file named `updated_table.md` will be created in the project directory. This file contains your updated, sorted, and enriched Markdown table.
2.  **Console Messages**: The terminal will display a summary of the changes, including lists of any **Added Channels** and **Removed Channels**.

## Post-Run Actions

The script automates most of the work, but there are a couple of manual steps you'll need to take for newly added channels.

1.  **Update Feed Links**:
    For any new channels, the `Feed Link` column will contain a placeholder `CHANNEL_ID_HERE`. You will need to find the correct Channel ID manually.

    - Go to the new channel's main YouTube page.
    - Right-click on the page and select "View Page Source".
    - Search (Ctrl+F or Cmd+F) for `channel_id`. You will find a value that looks like `UC...`.
    - Copy this ID and replace the `CHANNEL_ID_HERE` placeholder in your `updated_table.md`.

2.  **Review and Replace**:
    - Open `updated_table.md` and review its contents to ensure everything looks correct.
    - Once you are satisfied, you can manually delete the old `table.md` and rename `updated_table.md` to `table.md` to use it as the new source for the next run.
