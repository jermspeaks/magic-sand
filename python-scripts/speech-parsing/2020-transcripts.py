import csv
import json
from datetime import datetime
import sys

# Increase CSV field size limit
maxInt = sys.maxsize
while True:
    try:
        csv.field_size_limit(maxInt)
        break
    except OverflowError:
        maxInt = int(maxInt/10)

def parse_date(date_str):
    # ... rest of your code
    """Convert 'Oct 20, 2020' to '2020-10-20' format"""
    try:
        date_obj = datetime.strptime(date_str, "%b %d, %Y")
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        return date_str


def process_campaign_speeches(input_file, output_file):
    speeches = []

    with open(input_file, "r", encoding="utf-8") as tsv_file:
        # Use tab delimiter and treat quotes properly
        reader = csv.reader(tsv_file, delimiter="\t", quotechar='"')

        # Skip header
        next(reader)

        for row in reader:
            if len(row) < 4:  # Skip malformed rows
                continue

            url, title, date, transcript = row

            # Check if it's a Donald Trump speech by checking the title
            if "Donald Trump" in title and ("Rally" in title or "Campaign" in title):
                speech = {
                    "url": url,
                    "title": title,
                    "date": parse_date(date),
                    "transcript": transcript,
                }
                speeches.append(speech)
                print(f"Processing: {title}")

    # Sort speeches by date
    speeches.sort(key=lambda x: x["date"])

    # Write to JSON file
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(speeches, json_file, indent=2, ensure_ascii=False)

    print(f"\nProcessed {len(speeches)} speeches")
    print(f"Output written to {output_file}")


# Usage
input_file = "2020_election_campaign.tsv"  # Your input TSV file
output_file = "trump_campaign_speeches.json"  # Output JSON file

process_campaign_speeches(input_file, output_file)
