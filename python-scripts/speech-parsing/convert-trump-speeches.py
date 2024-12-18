import json
import os
from datetime import datetime

output_folder = "transcripts"

def convert_date_format(doc_name):
    """Convert date from 'Month-D-YYYY-rest' to 'YYYY-MM-DD-rest' format"""
    try:
        # Split the doc_name into date parts and remaining text
        parts = doc_name.split('-', 3)  # Split on first 3 hyphens
        if len(parts) < 3:
            return doc_name
            
        # Reconstruct the date portion
        date_str = '-'.join(parts[:3])
        # Get the remaining text if it exists
        remaining = parts[3] if len(parts) > 3 else ""
        
        # Parse and convert the date portion
        date_obj = datetime.strptime(date_str, "%B-%d-%Y")
        new_date = date_obj.strftime("%Y-%m-%d")
        
        # Reconstruct the full doc_name with new date format
        return f"{new_date}-{remaining}" if remaining else new_date
        
    except ValueError:
        # Return original if parsing fails
        return doc_name

with open("trump_speeches.json", "r") as f:
    data = json.load(f)

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for item in data:
    # Convert the date format in doc_name
    new_doc_name = convert_date_format(item["doc_name"])

    # Write the transcript to a file with new date format
    with open(f"{output_folder}/{new_doc_name}.txt", "w") as f:
        f.write(item["transcript"])
        print(f"wrote {new_doc_name}.txt")
