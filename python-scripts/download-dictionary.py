import urllib.request
import zipfile
import os
import json
import shutil


def download_unihan():
    """Download and process Unihan database"""
    url = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"
    zip_path = "Unihan.zip"

    print("Downloading Unihan database...")
    urllib.request.urlretrieve(url, zip_path)

    # Extract the files
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall("unihan_data")

    # Process the definitions file
    definitions = {}
    with open("unihan_data/Unihan_Readings.txt", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue
            parts = line.strip().split("\t")
            if len(parts) == 3:
                char = chr(int(parts[0].replace("U+", ""), 16))
                if "kDefinition" in parts[1]:
                    definitions[char] = parts[2]

    # Clean up
    os.remove(zip_path)

    shutil.rmtree("unihan_data")

    return definitions


def save_dictionary(dictionary, filename="comprehensive_dictionary.json"):
    """Save dictionary to JSON file"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(dictionary, f, ensure_ascii=False, indent=2)


# Download and create dictionary
definitions = download_unihan()
save_dictionary(definitions)
