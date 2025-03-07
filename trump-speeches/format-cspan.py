import os
import re
import spacy

# Load English language model
nlp = spacy.load("en_core_web_sm")


def format_text(text):
    # Split into frontmatter and content
    lines = text.split("\n")
    frontmatter = lines[:3]
    content = "\n".join(lines[3:])

    # Convert everything to lowercase first
    content = content.lower()

    # List of words that should always be capitalized
    always_capitalize = {
        "i",
        "america",
        "american",
        "china",
        "russia",
        "iran",
        "north korea",
        "congress",
        "president",
        "vice president",
        "senator",
        "congressman",
        "general",
        "pentagon",
        "mr.",
        "mrs.",
        "ms.",
        "u.s.",
        "nato",
        "god",
        "united states",
        "alaska",
        "europe",
        "germany",
        "jerusalem",
        "asia",
        "middle east",
        "isis",
        "donald trump",
        "pence",
        "pelosi",
        "sullivan",
        "turner",
        "shanahan",
        "pat",
        "patrick",
        "david",
        "norquist",
        "mark",
        "heather",
        "wilson",
        "michael",
        "griffin",
        "ellen",
        "lord",
        "john",
        "rude",
        "paul",
        "silva",
        "joseph",
        "lengal",
        "james",
        "mcconville",
        "kennedy",
        "japanese",
        "democrat",
        "democrats",
        "syria",
        "nielsen",
        "kiersten",
        "william barr",
        "new zealand",
        "tijuana",
        "bedford",
        "massachusetts",
        "ice",
        "camp david",
        "san diego",
        "california",
        "cbp",
        "ncicap.org",
        "national cable satellite corp",
    }

    # Add paragraph breaks after [applause] and clean up bracket content
    content = re.sub(
        r"\[\s*([^\]]+)\s*\]", lambda m: f"[{m.group(1).lower().strip()}]\n\n", content
    )

    # Remove or preserve caption footer
    caption_footer = re.findall(r"\[CAPTIONS?.*?\]$", content, re.MULTILINE | re.DOTALL)
    content = re.sub(r"\[CAPTIONS?.*?\]$", "", content, flags=re.MULTILINE | re.DOTALL)

    # Add paragraph breaks for speech transitions and topic changes
    paragraph_starters = [
        r"thank you",
        r"ladies and gentlemen",
        r"good morning",
        r"first[,.]",
        r"second[,.]",
        r"third[,.]",
        r"fourth[,.]",
        r"fifth[,.]",
        r"sixth[,.]",
        r"finally[,.]",
        r"today,",
        r"now,",
        r"let me",
        r"i want to",
        r"mr\.?\s+president",
        r"vice president",
        r"secretary",
        r"my son",
        r"in my county",
        r"when we",
        r"earlier today",
        r"consistent with",
        r"we\'re joined",
    ]

    # Join patterns with | for alternation
    pattern = "|".join(f"(?<=[.!?]\\s)({starter})" for starter in paragraph_starters)
    content = re.sub(
        pattern, lambda m: f"\n\n{m.group(1)}", content, flags=re.IGNORECASE
    )
    # Before processing sentences, preserve Q&A format
    content = re.sub(r"(?m)^Q[:.]\s*", "\n\nQ: ", content)
    content = re.sub(r"(?m)^A[:.]\s*", "\n\nA: ", content)

    # Split into sentences properly
    sentences = re.split(r"([.!?]+(?:\s+|\s*\[|\s*$))", content)

    formatted_sentences = []
    for i in range(0, len(sentences) - 1, 2):
        sentence = sentences[i].strip()
        punctuation = sentences[i + 1] if i + 1 < len(sentences) else ""

        if sentence:
            # Capitalize first letter of sentence
            words = sentence.split()
            if words:
                words[0] = words[0].capitalize()

            # Capitalize proper nouns and always_capitalize words
            for j, word in enumerate(words):
                word_lower = word.lower()
                # Check for compound words (e.g., "Vice President")
                if j < len(words) - 1:
                    compound = f"{word_lower} {words[j+1].lower()}"
                    if compound in always_capitalize:
                        words[j] = word_lower.title()
                        words[j + 1] = words[j + 1].lower().title()
                        continue

                if word_lower in always_capitalize:
                    words[j] = word_lower.title()

            sentence = " ".join(words)
            formatted_sentences.append(sentence + punctuation)

    formatted_content = "".join(formatted_sentences)

    # Add back caption footer if needed
    if caption_footer:
        formatted_content += "\n\n" + caption_footer[0]

    # Clean up any remaining spacing issues
    formatted_content = re.sub(r"\s+", " ", formatted_content)  # Remove multiple spaces
    formatted_content = re.sub(
        r"\s*\.\s*", ". ", formatted_content
    )  # Fix period spacing
    formatted_content = re.sub(
        r"\s*\n\s*", "\n", formatted_content
    )  # Fix newline spacing
    formatted_content = re.sub(
        r"\n{3,}", "\n\n", formatted_content
    )  # Limit consecutive newlines

    # Remove duplicate adjacent words (e.g., "President President")
    formatted_content = re.sub(
        r"\b(\w+)(\s+\1)+\b", r"\1", formatted_content, flags=re.IGNORECASE
    )

    # Combine frontmatter and formatted content
    return "\n".join(frontmatter) + "\n\n" + formatted_content.strip()


# Rest of the code remains the same...
def process_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".txt"):
            filepath = os.path.join(directory, filename)

            # Read file
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()

            # Format text
            formatted_text = format_text(text)

            # Write back to file
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(formatted_text)

            print(f"Processed: {filename}")


# Usage
if __name__ == "__main__":
    directory = "test"  # Change this to your directory path
    process_files(directory)
