import gzip
import json
import os
import re
import shutil
import urllib.request


def get_tone_mark(vowel, tone):
    tone_marks = {
        "a": {"1": "ā", "2": "á", "3": "ǎ", "4": "à"},
        "e": {"1": "ē", "2": "é", "3": "ě", "4": "è"},
        "i": {"1": "ī", "2": "í", "3": "ǐ", "4": "ì"},
        "o": {"1": "ō", "2": "ó", "3": "ǒ", "4": "ò"},
        "u": {"1": "ū", "2": "ú", "3": "ǔ", "4": "ù"},
        "ü": {"1": "ǖ", "2": "ǘ", "3": "ǚ", "4": "ǜ"},
    }
    return tone_marks[vowel][tone]


def convert_pinyin_tone(pinyin_num):
    if not any(char.isdigit() for char in pinyin_num):
        return pinyin_num

    pinyin = pinyin_num.lower().replace("v", "ü")
    tone = next(char for char in pinyin if char.isdigit())
    pinyin = pinyin.replace(tone, "")

    # If it's tone 5 (neutral tone), just return without tone mark
    if tone == "5":
        return pinyin

    # vowels = 'aeiouü'
    vowel_priority = "aeoiuü"

    # Find the vowel to mark based on priority
    for v in vowel_priority:
        if v in pinyin:
            vowel_index = pinyin.index(v)
            return (
                pinyin[:vowel_index]
                + get_tone_mark(v, tone)
                + pinyin[vowel_index + 1 :]
            )

    return pinyin


def parse_line(line):
    parts = line.strip().split(";")
    if len(parts) < 3:
        return None
    char = parts[0]
    pinyin = parts[1]
    examples = parts[2].split(",")
    return char, pinyin, examples


def download_cedict():
    """Download the CC-CEDICT dictionary and parse it into a usable format"""
    url = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"
    gz_path = "cedict.txt.gz"
    dict_path = "cedict.txt"

    # Download the gzipped dictionary
    print("Downloading CC-CEDICT...")
    urllib.request.urlretrieve(url, gz_path)

    # Decompress the file
    print("Decompressing dictionary...")
    with gzip.open(gz_path, "rb") as f_in:
        with open(dict_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)

    # Parse the dictionary into a more usable format
    print("Parsing dictionary...")
    chinese_dict = {}

    with open(dict_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):  # Skip comments
                continue

            # CC-CEDICT format: traditional simplified [pinyin] /definition 1/definition 2/
            match = re.match(r"(\S+)\s+(\S+)\s+\[(.*?)\]\s+/(.*?)/", line)
            if match:
                traditional, simplified, pinyin, definitions = match.groups()
                # We'll use simplified characters as keys
                chinese_dict[simplified] = definitions.split("/")[
                    0
                ]  # Take first definition

    # Save processed dictionary to JSON for faster loading next time
    print("Saving dictionary to JSON...")
    with open("chinese_dictionary.json", "w", encoding="utf-8") as f:
        json.dump(chinese_dict, f, ensure_ascii=False, indent=2)

    # Clean up temporary files

    os.remove(gz_path)
    os.remove(dict_path)

    print("Dictionary processing complete!")
    return chinese_dict


def create_dictionary():
    """Load and merge dictionaries from JSON files"""
    merged_dict = {}

    # Load primary dictionary (new format)
    if os.path.exists("all_cedict.json"):
        with open("all_cedict.json", "r", encoding="utf-8") as f:
            merged_dict = json.load(f)

    # Load and merge secondary dictionary
    if os.path.exists("comprehensive_dictionary.json"):
        with open("comprehensive_dictionary.json", "r", encoding="utf-8") as f:
            secondary_dict = json.load(f)

            # Merge entries
            for char, definition in secondary_dict.items():
                if char not in merged_dict:
                    # Create new entry in new format
                    merged_dict[char] = {
                        "simplified": char,
                        "traditional": char,
                        "pinyin": ["none1"],  # placeholder pinyin
                        "definitions": {"none1": definition},
                    }
                else:
                    # Add definition to existing entry
                    existing = merged_dict[char]
                    pinyin_key = existing["pinyin"][0]  # use first pinyin as key
                    existing_def = existing["definitions"][pinyin_key]

                    # Combine definitions if they're different
                    if definition != existing_def:
                        combined_def = f"{existing_def}; {definition}"
                        existing["definitions"][pinyin_key] = combined_def

    return merged_dict


def format_examples(examples, base_pinyin, dictionary):
    formatted = []
    for char in examples:
        char_info = dictionary.get(char, None)
        if char_info is None:
            formatted.append(f"{char} ({base_pinyin}, [meaning not found])")
            continue

        # Find matching pinyin definition
        matching_def = None
        for pinyin in char_info["pinyin"]:
            # Convert both to tonal format before comparing
            dict_pinyin_tonal = convert_pinyin_tone(pinyin)
            if dict_pinyin_tonal == base_pinyin:
                matching_def = char_info["definitions"].get(pinyin)
                break

        if matching_def:
            formatted.append(f"{char} ({base_pinyin}, {matching_def})")
        else:
            # If no matching pinyin found, use the first definition
            first_pinyin = char_info["pinyin"][0]
            first_def = char_info["definitions"][first_pinyin]
            first_pinyin_tonal = convert_pinyin_tone(pinyin)
            formatted.append(f"{char} ({first_pinyin_tonal}, {first_def})")

    return ", ".join(formatted)


def process_file(input_path, output_path):
    print("Loading and merging dictionaries...")
    dictionary = create_dictionary()
    print("Processing file...")

    with open(input_path, "r", encoding="utf-8") as infile:
        with open(output_path, "w", encoding="utf-8") as outfile:
            for line in infile:
                result = parse_line(line)
                if result:
                    char, pinyin_num, examples = result
                    pinyin = convert_pinyin_tone(pinyin_num)
                    formatted = format_examples(examples, pinyin, dictionary)
                    outfile.write(f"{char};{pinyin};{formatted}\n")


# Example usage
input_file = "phonetic.txt"
output_file = "phonetic_formatted.txt"
process_file(input_file, output_file)
