import fs from "fs";
import fetch from "node-fetch"; // No need for specific version if 'type: module' is set
import { parseStringPromise } from "xml2js";

async function getChannelData(feedUrl) {
  try {
    const response = await fetch(feedUrl);
    const xml = await response.text();
    const result = await parseStringPromise(xml, { explicitArray: false });

    const channelId = result.feed["yt:channelId"];
    // The <link rel="alternate"> inside <author> gives the channel URL
    const channelLinkObj = result.feed.link.find(
      (link) => link.$.rel === "alternate" && link.$.href.includes("/channel/")
    );
    const channelLink = channelLinkObj
      ? channelLinkObj.$.href
      : `https://www.youtube.com/channel/${channelId}`;

    const author = result.feed.author.name;
    const firstPublished = result.feed.published;

    // console.log(result?.feed?.entry?.[0]);
    // Find the latest entry's alternate link (if entries exist)
    const latestEntry =
      result?.feed?.entry?.length > 0 ? result.feed.entry[0] : null;
    const latestEntryLink =
      latestEntry?.link?.$?.rel === "alternate"
        ? latestEntry.link.$.href
        : "N/A";

    return {
      author,
      channelLink,
      feedLink: feedUrl,
      firstPublished,
      latestEntryLink,
    };
  } catch (error) {
    console.error(
      `Error fetching or parsing feed for ${feedUrl}:`,
      error.message
    );
    return {
      author: "Error",
      channelLink: "N/A",
      feedLink: feedUrl,
      firstPublished: "N/A",
      latestEntryLink: "N/A",
    };
  }
}

async function generateMarkdownTable(inputFile) {
  const fileContent = fs.readFileSync(inputFile, "utf8");
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

  const channelFeeds = [];
  for (let i = 0; i < lines.length; i += 2) {
    // Assuming the format is always Name then Feed Link
    const feedLine = lines[i + 1];
    const feedUrlMatch = feedLine.match(
      /\((https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=[^)]+)\)/
    );
    if (feedUrlMatch && feedUrlMatch[1]) {
      channelFeeds.push(feedUrlMatch[1]);
    }
  }

  const tableRows = [];
  for (const feedUrl of channelFeeds) {
    const data = await getChannelData(feedUrl);
    tableRows.push(data);
  }

  // Generate markdown table
  let markdown =
    "| Author | Channel Link | Feed Link | First Published | Latest Entry Link |\n";
  markdown += "|---|---|---|---|---|\n";

  for (const row of tableRows) {
    markdown += `| ${row.author} | [Link](${row.channelLink}) | [Link](${row.feedLink}) | ${row.firstPublished} | [Link](${row.latestEntryLink}) |\n`;
  }

  console.log(markdown);
}

// Run the script
generateMarkdownTable("channels.txt");
