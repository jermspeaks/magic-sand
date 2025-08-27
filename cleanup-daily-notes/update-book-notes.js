const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory containing the daily notes
// Allow specifying a directory path as a command-line argument
const directoryPath = process.argv[2] || process.cwd();

// Log the directory being processed
console.log(`Processing files in directory: ${directoryPath}`);

// Function to get all markdown files in the directory
function getMarkdownFiles() {
  return fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.md'))
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
    
    // // Get the date from the filename (assuming YYYY-MM-DD.md format)
    // const filename = path.basename(filePath);
    
    // Update frontmatter
    let updatedFrontmatter = { ...frontmatter };
    
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
    
    // If there is no cover metadata, find it
    if (!updatedFrontmatter.cover) {
      // regex the `content` to determine if we can find the poster
      // format: ![poster](url)  
      const posterRegex = /!\[poster\]\((.*?)\)/
      const posterMatch = content.match(posterRegex);
      console.log(posterMatch);

      if (posterMatch) {
        // If the link is http, change to https
        if (posterMatch[1].startsWith('https')) {
          updatedFrontmatter.cover = posterMatch[1];
        } else if (posterMatch[1].startsWith('http')) {
          updatedFrontmatter.cover = posterMatch[1].replace('http', 'https');
        } else {
          updatedFrontmatter.cover = posterMatch[1];
        }
      }
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
  console.log('Starting book notes update process...');
  
  try {
    // Get all markdown files
    const markdownFiles = getMarkdownFiles();
    console.log(`Found ${markdownFiles.length} markdown files`);
    
    // Process each file
    markdownFiles.forEach((file, index) => {
      const filePath = path.join(directoryPath, file);
      updateFile(filePath, markdownFiles, index);
    });
    
    console.log('Book notes update completed successfully!');
  } catch (error) {
    console.error('Error updating book notes:', error);
  }
}

// Run the main function
main();
