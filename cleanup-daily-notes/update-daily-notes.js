const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory containing the daily notes
// Allow specifying a directory path as a command-line argument
const directoryPath = process.argv[2] || process.cwd();

// Log the directory being processed
console.log(`Processing files in directory: ${directoryPath}`);

// Function to parse date strings into ISO format
function parseAndFormatDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }
  
  // Try to parse various date formats
  let parsedDate;
  
  // Remove any quotes
  dateString = dateString.replace(/^['"]/g, '').replace(/['"]$/g, '');
  
  // Pattern for YYYY-MM-DD
  // if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
  //   parsedDate = new Date(dateString);
  // }
  // // Pattern for YYYY-MM-DD, HH:MM AM/PM
  // else if (/^\d{4}-\d{2}-\d{2},?\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)$/.test(dateString)) {
  //   parsedDate = new Date(dateString);
  // }
  // // Pattern for MM-DD-YYYY, HH:MM:AM/PM
  // else if (/^\d{2}-\d{2}-\d{4},?\s+\d{1,2}:\d{2}\s*\:*(?:AM|PM|am|pm)$/.test(dateString)) {
  //   parsedDate = new Date(dateString);
  // }
  // // Pattern for MM/DD/YYYY HH:MM AM/PM
  // else if (/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)$/.test(dateString)) {
  //   parsedDate = new Date(dateString);
  // }
  parsedDate = new Date(dateString);
  
  // If we successfully parsed the date, convert to ISO format
  if (parsedDate && !isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString();
  }
  
  // Return the original string if we couldn't parse it
  return dateString;
}

// Function to get all markdown files in the directory
function getMarkdownFiles() {
  return fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.md'))
    .filter(file => {
      // Optional: Filter to only include files with date format (YYYY-MM-DD.md)
      const datePattern = /^\d{4}-\d{2}-\d{2}\.md$/;
      return datePattern.test(file) || file === 'old-entry.md' || file === 'current-entry.md';
    })
    .sort(); // Sort files alphabetically (which sorts by date for YYYY-MM-DD format)
}

// Function to manually parse frontmatter to handle duplicate keys
function parseFileContent(fileContent) {
  // Extract frontmatter and content
  const match = fileContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  
  if (!match) {
    return { frontmatter: {}, content: fileContent };
  }
  
  const frontmatterStr = match[1];
  const content = match[2];
  
  // Parse frontmatter manually to handle duplicate keys
  const frontmatter = {};
  const lines = frontmatterStr.split('\n');
  
  for (const line of lines) {
    // Skip empty lines or lines that don't contain a key-value pair
    if (!line.trim() || !line.includes(':')) continue;
    
    // Extract key and value
    const colonIndex = line.indexOf(':');
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Skip indented lines (they are part of a multi-line value)
    if (line.startsWith(' ') || line.startsWith('\t')) continue;
    
    // Handle arrays (simple implementation)
    if (value === '') {
      // This might be the start of an array
      const arrayValues = [];
      let i = lines.indexOf(line) + 1;
      
      while (i < lines.length && (lines[i].startsWith('    -') || lines[i].startsWith('\t-'))) {
        const arrayValue = lines[i].replace(/^\s*-\s*/, '').trim();
        arrayValues.push(arrayValue);
        i++;
      }
      
      if (arrayValues.length > 0) {
        frontmatter[key] = arrayValues;
        continue;
      }
    }
    
    // Store the value (overwriting any duplicates)
    frontmatter[key] = value;
  }
  
  return { frontmatter, content };
}

// Function to update a single file
function updateFile(filePath, allFiles, fileIndex) {
  console.log(`Processing file: ${filePath}`);
  
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter - use our custom parser to handle duplicate keys
    let frontmatter, content;
    
    try {
      // Try using gray-matter first
      const parsed = matter(fileContent);
      frontmatter = parsed.data;
      content = parsed.content;
    } catch (error) {
      console.log(`Warning: Error parsing frontmatter with gray-matter: ${error.message}`);
      console.log('Falling back to custom parser...');
      
      // Fall back to custom parser
      const parsed = parseFileContent(fileContent);
      frontmatter = parsed.frontmatter;
      content = parsed.content;
    }
    
    // Get the date from the filename (assuming YYYY-MM-DD.md format)
    const filename = path.basename(filePath);
    let dateStr = '';
    
    if (/^\d{4}-\d{2}-\d{2}\.md$/.test(filename)) {
      dateStr = filename.replace('.md', '');
    } else {
      // For test files that don't follow the date format
      // We'll use a placeholder date based on the file index
      const baseDate = new Date('2025-03-01');
      baseDate.setDate(baseDate.getDate() + fileIndex);
      dateStr = baseDate.toISOString().split('T')[0];
    }
    
    // Calculate previous and next dates
    let previousDate = '';
    let nextDate = '';
    
    if (fileIndex > 0) {
      const prevFile = allFiles[fileIndex - 1];
      if (/^\d{4}-\d{2}-\d{2}\.md$/.test(prevFile)) {
        previousDate = prevFile.replace('.md', '');
      } else {
        const prevBaseDate = new Date('2025-03-01');
        prevBaseDate.setDate(prevBaseDate.getDate() + (fileIndex - 1));
        previousDate = prevBaseDate.toISOString().split('T')[0];
      }
    }
    
    if (fileIndex < allFiles.length - 1) {
      const nextFile = allFiles[fileIndex + 1];
      if (/^\d{4}-\d{2}-\d{2}\.md$/.test(nextFile)) {
        nextDate = nextFile.replace('.md', '');
      } else {
        const nextBaseDate = new Date('2025-03-01');
        nextBaseDate.setDate(nextBaseDate.getDate() + (fileIndex + 1));
        nextDate = nextBaseDate.toISOString().split('T')[0];
      }
    }
    
    // Update frontmatter
    let updatedFrontmatter = { ...frontmatter };
    
    // Ensure tags property exists and includes required tags
    if (!updatedFrontmatter.tags) {
      updatedFrontmatter.tags = ['journal', 'logs/daily'];
    } else if (Array.isArray(updatedFrontmatter.tags)) {
      if (!updatedFrontmatter.tags.includes('journal')) {
        updatedFrontmatter.tags.push('journal');
      }
      if (!updatedFrontmatter.tags.includes('logs/daily')) {
        updatedFrontmatter.tags.push('logs/daily');
      }
    } else if (typeof updatedFrontmatter.tags === 'string') {
      // Convert string to array and ensure it includes required tags
      const tagsArray = updatedFrontmatter.tags.split(',').map(tag => tag.trim());
      if (!tagsArray.includes('journal')) {
        tagsArray.push('journal');
      }
      if (!tagsArray.includes('logs/daily')) {
        tagsArray.push('logs/daily');
      }
      updatedFrontmatter.tags = tagsArray;
    }
    
    // Parse and format the created date if it exists
    if (updatedFrontmatter.created) {
      updatedFrontmatter.created = parseAndFormatDate(updatedFrontmatter.created);
    }
    
    // Update previousEntry and nextEntry
    if (previousDate) {
      // Using the correct format for wiki links with double quotes
      updatedFrontmatter.previousEntry = [`"[[${previousDate}]]"`];
    }
    
    if (nextDate) {
      // Using the correct format for wiki links with double quotes
      updatedFrontmatter.nextEntry = [`"[[${nextDate}]]"`];
    }
    
    // Process all array values to ensure consistent double quote formatting
    Object.keys(updatedFrontmatter).forEach(key => {
      if (Array.isArray(updatedFrontmatter[key])) {
        updatedFrontmatter[key] = updatedFrontmatter[key].map(value => {
          // If the value is a wiki link, ensure it has double quotes
          if (typeof value === 'string' && value.includes('[[') && value.includes(']]')) {
            // Remove any existing quotes and add double quotes
            const cleanValue = value.replace(/^['"]|['"]$/g, '');
            return `"${cleanValue}"`;
          }
          return value;
        });
      }
    });
    
    // Use default stringify options without forcing quotes
    // This will prevent adding extra quotes around wiki links
    const stringifyOptions = {
      quotingType: '"'  // Use double quotes when needed, but don't force them
    };
    
    // Remove Title property if it exists
    if (updatedFrontmatter.Title) {
      delete updatedFrontmatter.Title;
    }
    
    // Remove Type property if it exists
    if (updatedFrontmatter.Type) {
      delete updatedFrontmatter.Type;
    }

    // Remove createdDate property if it exists
    if (updatedFrontmatter.createdDate) {
      delete updatedFrontmatter.createdDate;
    }
    
    // Create updated file content without forcing quotes
    let updatedFileContent = matter.stringify(content, updatedFrontmatter, stringifyOptions);
    
    // Fix for extra quotes around wiki links
    // This removes any extra quotes around wiki links
    updatedFileContent = updatedFileContent.replace(/^(\s*-\s*)['"]("\[\[.*?\]\]")['"]/gm, '$1$2');
    
    // Make sure wiki links are not quoted at all
    updatedFileContent = updatedFileContent.replace(/^(\s*-\s*)'(\[\[.*?\]\])'/gm, '$1$2');
    updatedFileContent = updatedFileContent.replace(/^(\s*-\s*)(\[\[.*?\]\])/gm, '$1$2');
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedFileContent);
    
    console.log(`Updated file: ${filePath}`);
    console.log('Updated frontmatter:', JSON.stringify(updatedFrontmatter, null, 2));
    console.log('-------------------');
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Main function
function main() {
  console.log('Starting daily notes update process...');
  
  try {
    // Get all markdown files
    const markdownFiles = getMarkdownFiles();
    console.log(`Found ${markdownFiles.length} markdown files`);
    
    // Process each file
    markdownFiles.forEach((file, index) => {
      const filePath = path.join(directoryPath, file);
      updateFile(filePath, markdownFiles, index);
    });
    
    console.log('Daily notes update completed successfully!');
  } catch (error) {
    console.error('Error updating daily notes:', error);
  }
}

// Run the main function
main();
