import os
import re
import logging
import textwrap  # Importing textwrap for formatting

# Set up logging
logging.basicConfig(
    filename='speech_formatter.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def format_speech(content):
    # Split content into lines
    lines = content.splitlines()
    
    # Retain the first four lines (frontmatter)
    frontmatter = '\n'.join(lines[:4])  # Keep the first four lines
    content_to_format = '\n'.join(lines[4:])  # Skip the first four lines for formatting

    # Split content into paragraphs based on double line breaks
    paragraphs = re.split(r'\n\s*\n', content_to_format)
    formatted_paragraphs = []

    for paragraph in paragraphs:
        # Ensure space after square brackets
        paragraph = re.sub(r'(\[.*?\])(\S)', r'\1 \2', paragraph)

        # Replace two spaces after a period with a newline for paragraph breaks
        paragraph = re.sub(r'\.  ', '.\n\n\n', paragraph)

        # Ensure space after question marks (unless followed by a quotation mark)
        paragraph = re.sub(r'\?(?!\s|["\'])', '? ', paragraph)

        # Check if the paragraph has more than 4 sentences
        sentences = re.split(r'(?<=[.!?]) +', paragraph.strip())
        if len(sentences) > 5:
            # Split into multiple paragraphs
            formatted_paragraphs.extend(sentences)
        else:
            formatted_paragraphs.append(paragraph.strip())

    # Join paragraphs with double line breaks for Markdown formatting
    formatted_text = '\n\n'.join(formatted_paragraphs)

    # Combine frontmatter with formatted text
    return f"{frontmatter}\n\n{formatted_text}"  # Include frontmatter in the output

def process_file(file_path, output_folder):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            formatted_content = format_speech(content)

            # Create output file path
            file_name = os.path.basename(file_path)
            output_file_path = os.path.join(output_folder, file_name)

            # Write formatted content to new Markdown file
            with open(output_file_path, 'w', encoding='utf-8') as output_file:
                output_file.write(formatted_content)

            logging.info(f"Processed file: {file_name}")

    except Exception as e:
        logging.error(f"Error processing file {file_path}: {e}")

def main():
    # input_folder = 'american_presidency_project/campaign_speeches'
    # output_folder = 'app-campaign-speeches'
    # input_folder = 'american_presidency_project/press_releases'
    # output_folder = 'app-press-releases'
    input_folder = 'american_presidency_project/statements'
    output_folder = 'app-statements'
    

    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Process each text file in the input folder
    for file_name in os.listdir(input_folder):
        if file_name.endswith('.txt'):
            file_path = os.path.join(input_folder, file_name)
            process_file(file_path, output_folder)

if __name__ == "__main__":
    main()