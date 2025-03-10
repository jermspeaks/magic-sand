import json
import os

# Create cspan_speeches directory if it doesn't exist
output_folder = "cspan_speeches"
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Process each line in the JSONL file
with open("./speech-parsing/cspan_trump_speeches.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        # Parse JSON object from line
        speech = json.loads(line)

        # Get the data we need
        date = speech["Date"]
        speech_id = speech["SpeechID"]
        title = speech["SpeechTitle"]
        text = speech["RawText"]

        # Create filename using date
        filename = f"{output_folder}/{date}.txt"

        # Write speech data to file
        with open(filename, "w", encoding="utf-8") as outfile:
            # Write metadata first
            outfile.write(f"ID: {speech_id}\n")
            outfile.write(f"Title: {title}\n")
            outfile.write(f"Date: {date}\n\n")
            # Write the speech text
            outfile.write(text)

        print(f"Wrote speech from {date} to {filename}")

print("\nProcessing complete!")
