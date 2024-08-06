import os
import re


def deduplicate_markdown(file_path):
    with open(file_path, "r") as file:
        content = file.read()

    # Split the content into frontmatter and body
    parts = re.split(r"---\s*\n?", content, 2)

    if len(parts) >= 3:
        frontmatter = parts[1]
        body = parts[2]

        # Remove any additional frontmatter
        body = re.sub(r"---\s*\n?.*?---\s*\n?", "", body, flags=re.DOTALL)

        # Remove duplicate content
        lines = body.splitlines()
        unique_lines = []
        seen = set()
        for line in lines:
            if line not in seen:
                unique_lines.append(line)
                seen.add(line)
        body = "\n".join(unique_lines)

        # Reconstruct the file with only the first frontmatter and deduplicated content
        deduped_content = f"---\n{frontmatter.strip()}\n---\n\n{body.strip()}\n"
    else:
        # If no frontmatter is found, just deduplicate the content
        lines = content.splitlines()
        unique_lines = []
        seen = set()
        for line in lines:
            if line not in seen:
                unique_lines.append(line)
                seen.add(line)
        deduped_content = "\n".join(unique_lines)

    return deduped_content


def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                print(f"Processing: {file_path}")

                deduped_content = deduplicate_markdown(file_path)

                with open(file_path, "w") as f:
                    f.write(deduped_content)

                print(f"Processed: {file_path}")


if __name__ == "__main__":
    # directory = input("Enter the directory path containing markdown files: ")
    directory = "./files"
    process_directory(directory)
    print("All markdown files have been processed.")
