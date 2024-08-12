import fs from 'fs/promises';
import path from 'path';

async function processMarkdownFiles(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await processMarkdownFiles(fullPath);
      } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error('Error processing directory:', error);
  }
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    if (!hasFrontmatter(content)) {
      const stats = await fs.stat(filePath);
      const createdDate = stats.birthtime.toISOString();
      
      const newContent = addFrontmatter(content, createdDate);
      await fs.writeFile(filePath, newContent);
      console.log(`Added frontmatter to ${filePath}`);
    } else {
      console.log(`Skipping ${filePath} - frontmatter already exists`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function hasFrontmatter(content) {
  return content.trim().startsWith('---');
}

function addFrontmatter(content, createdDate) {
  const frontmatter = `---
tags: 
up: 
related: 
created: "${createdDate}"
---

`;
  return frontmatter + content;
}

// Usage
const directoryPath = '/Users/jeremywong/Documents/dev-journal/Atlas';
processMarkdownFiles(directoryPath).then(() => {
  console.log('Processing complete.');
});