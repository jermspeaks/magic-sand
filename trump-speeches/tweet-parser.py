import csv
from datetime import datetime
import os

def convert_time_to_iso(time_str):
    """Convert time string to ISO format for filename"""
    try:
        # Assuming time is in Twitter's format, adjust the strptime format if different
        dt = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%Y-%m-%dT%H%M%S")
    except ValueError:
        return time_str

# Create tweets directory if it doesn't exist
output_folder = "tweets"
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Process the CSV file
with open("./speech-parsing/tweets.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        # Get the data
        tweet_id = row["ID"]
        time = row["Time"]
        url = row["Tweet URL"]
        text = row["Tweet Text"]
        
        # Create filename using ISO timestamp
        iso_time = convert_time_to_iso(time)
        filename = f"{output_folder}/{iso_time}.txt"
        
        # Write tweet data to file
        with open(filename, "w", encoding="utf-8") as outfile:
            outfile.write(f"{tweet_id}\n")
            outfile.write(f"{time}\n")
            outfile.write(f"{url}\n")
            outfile.write(f"{text}")
            
        print(f"Wrote tweet from {time} to {filename}")

print("\nProcessing complete!")