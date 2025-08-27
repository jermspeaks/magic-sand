import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

// Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parses the markdown table to extract channel data.
 * @param {string} markdown - The markdown content.
 * @returns {Array<Object>} - An array of channel objects.
 */
function parseMarkdownTable(markdown) {
    const lines = markdown.trim().split('\n');
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const channels = [];
    for (let i = 2; i < lines.length; i++) {
        const row = lines[i].split('|').map(c => c.trim()).filter(c => c);
        if (row.length > 0) {
            const channel = {};
            headers.forEach((header, index) => {
                channel[header] = row[index] || '';
            });
            channels.push(channel);
        }
    }
    return channels;
}

/**
 * Parses the HTML to extract channel data, including the avatar.
 * @param {string} html - The HTML content of the subscriptions page.
 * @returns {Array<Object>} - An array of channel objects.
 */
function parseSubscriptionHtml(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const channels = [];
    document.querySelectorAll('ytd-channel-renderer').forEach(renderer => {
        const channelNameElement = renderer.querySelector('#text');
        const vanityUrlElement = renderer.querySelector('a#main-link');
        const handleElement = renderer.querySelector('#subscribers');
        const avatarImgElement = renderer.querySelector('#avatar #img');

        if (channelNameElement && vanityUrlElement && handleElement && avatarImgElement) {
            const name = channelNameElement.textContent.trim();
            const handle = handleElement.textContent.trim();
            const vanityUrl = `https://youtube.com${vanityUrlElement.getAttribute('href')}`;
            const avatarSrc = avatarImgElement.getAttribute('src');
            
            channels.push({
                'Author': name,
                'Vanity Handle': handle,
                'Vanity URL': `[Link](${vanityUrl})`,
                'Avatar': `![200](${avatarSrc})`
            });
        }
    });
    return channels;
}

/**
 * Generates a new markdown table.
 * @param {Array<Object>} channels - An array of channel objects.
 * @returns {string} - The markdown table string.
 */
function generateMarkdownTable(channels) {
    if (channels.length === 0) {
        return '';
    }
    const headers = ['Author', 'Avatar', 'Vanity Handle', 'Vanity URL', 'Channel Link', 'Feed Link', 'First Published', 'Latest Entry Link'];
    let table = `| ${headers.join(' | ')} |\n`;
    table += `| ${headers.map(() => '---').join(' | ')} |\n`;

    channels.forEach(channel => {
        const row = headers.map(header => channel[header] || '');
        table += `| ${row.join(' | ')} |\n`;
    });

    return table;
}

/**
 * Main function to update the markdown table.
 */
async function updateSubscriptionTable() {
    const inputMarkdownFile = 'table.md';
    const outputMarkdownFile = 'updated_table.md';
    const subscriptionsHtmlFile = 'subscriptions.html';

    try {
        // Read the existing markdown file
        const markdownPath = path.join(__dirname, inputMarkdownFile);
        let existingChannels = [];
        let existingChannelMap = new Map();
        try {
            const existingMarkdown = await fs.readFile(markdownPath, 'utf-8');
            existingChannels = parseMarkdownTable(existingMarkdown);
            existingChannelMap = new Map(existingChannels.map(c => [c.Author, c]));
        } catch (readError) {
            if (readError.code === 'ENOENT') {
                console.log(`Input file '${inputMarkdownFile}' not found. A new table will be created from scratch.`);
            } else {
                throw readError;
            }
        }
        
        // Read the HTML file with the new subscription list
        const htmlPath = path.join(__dirname, subscriptionsHtmlFile);
        const subscriptionHtml = await fs.readFile(htmlPath, 'utf-8');
        const newChannelsFromHtml = parseSubscriptionHtml(subscriptionHtml);

        const updatedChannels = [];
        const newChannelSet = new Set(newChannelsFromHtml.map(c => c.Author));
        const existingChannelSet = new Set(existingChannels.map(c => c.Author));

        // Identify added channels
        const addedChannels = newChannelsFromHtml.filter(c => !existingChannelSet.has(c.Author));

        // Identify removed channels
        const removedChannels = existingChannels.filter(c => !newChannelSet.has(c.Author));

        // Create the updated list of channels
        newChannelsFromHtml.forEach(newChannel => {
            const existingChannel = existingChannelMap.get(newChannel.Author);
            if (existingChannel) {
                // Preserve existing data and add new info
                updatedChannels.push({ ...existingChannel, ...newChannel });
            } else {
                // This is a new channel, add it with placeholders
                const channelHandle = newChannel['Vanity Handle'];
                updatedChannels.push({
                    ...newChannel,
                    'Channel Link': `[Link](https://www.youtube.com/${channelHandle})`,
                    'Feed Link': `[Link](https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_HERE)`,
                    'First Published': '',
                    'Latest Entry Link': ''
                });
            }
        });
        
        // Sort channels alphabetically by author
        updatedChannels.sort((a, b) => a.Author.localeCompare(b.Author));

        // Generate the new markdown table
        const newMarkdownTable = generateMarkdownTable(updatedChannels);

        // Write the new table to the output markdown file
        const outputPath = path.join(__dirname, outputMarkdownFile);
        await fs.writeFile(outputPath, newMarkdownTable);

        console.log(`Markdown table has been updated and saved to '${outputMarkdownFile}'.`);
        
        if (addedChannels.length > 0) {
            console.log('\nAdded Channels:');
            addedChannels.forEach(c => console.log(`- ${c.Author}`));
        }
        
        if (removedChannels.length > 0) {
            console.log('\nRemoved Channels:');
            removedChannels.forEach(c => console.log(`- ${c.Author}`));
        }

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: Could not find file. Make sure '${error.path}' exists in the same directory as the script.`);
        } else {
            console.error('An error occurred:', error);
        }
    }
}

// Execute the main function
updateSubscriptionTable();