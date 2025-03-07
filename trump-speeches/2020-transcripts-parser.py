import json
import os

# Create speeches directory if it doesn't exist
output_folder = "speeches"
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Read the JSON file
with open("trump_campaign_speeches.json", "r", encoding="utf-8") as f:
    speeches = json.load(f)

# Process each speech
for speech in speeches:
    date = speech["date"]
    transcript = speech["transcript"]
    url = speech["url"]

    # Create filename with date
    filename = f"{output_folder}/{date}.txt"

    # Write URL and transcript to file
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"{url}\n\n")  # URL on first line, blank line after
        f.write(transcript)
        print(f"Wrote transcript to {filename}")

print(f"\nProcessed {len(speeches)} transcripts")
