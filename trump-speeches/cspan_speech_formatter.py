import os
import re
import random

def fix_capitalization(text):
    # Common proper nouns, places, and pronouns that should be capitalized
    proper_nouns = {
        r'\bi\b': 'I',
        r'\biran\b': 'Iran',
        r'\bchina\b': 'China',
        r'\brussia\b': 'Russia',
        r'\bamerica\b': 'America',
        r'\bamerican\b': 'American',
        r'\bunited states\b': 'United States',
        r'\bnato\b': 'NATO',
        r'\beurope\b': 'Europe',
        r'\beuropean\b': 'European',
        r'\bgermany\b': 'Germany',
        r'\basia\b': 'Asia',
        r'\bmiddle east\b': 'Middle East',
        r'\bjerusalem\b': 'Jerusalem',
        r'\balaska\b': 'Alaska',
        r'\bpentagon\b': 'Pentagon',
        r'\bcongress\b': 'Congress',
        r'\bsenate\b': 'Senate',
        r'\bhouse\b': 'House',
        r'\bdemocrats?\b': 'Democrat',
        r'\brepublicans?\b': 'Republican',
        r'\bisis\b': 'ISIS',
        r'\bgod\b': 'God',
        r'\bd\.o\.d\b': 'D.O.D.',
        r'\bnorth korea\b': 'North Korea',
        r'\bsouth korea\b': 'South Korea',
        r'\bkorean\b': 'Korean',
        r'\bsyria\b': 'Syria',
        r'\bspace force\b': 'Space Force',
    }
    
    # Split into sentences
    sentences = re.split(r'([.!?]+\s+)', text)
    formatted_sentences = []
    
    for i in range(0, len(sentences), 2):
        if i < len(sentences):
            # Get the sentence and any following punctuation
            sentence = sentences[i]
            punctuation = sentences[i + 1] if i + 1 < len(sentences) else ''
            
            # Capitalize first letter of sentence
            if sentence:
                sentence = sentence[0].upper() + sentence[1:].lower()
                
                # Capitalize proper nouns
                for pattern, replacement in proper_nouns.items():
                    sentence = re.sub(pattern, replacement, sentence, flags=re.IGNORECASE)
                
                # Capitalize names (words starting with Mr., Mrs., Ms., Dr., Sen., Rep., Gen., etc.)
                sentence = re.sub(r'\b(mr\.|mrs\.|ms\.|dr\.|sen\.|rep\.|gen\.|secretary|president|vice president|speaker|general|congressman|senator)\s+([a-z]+)', 
                                lambda m: f"{m.group(1).capitalize()} {m.group(2).capitalize()}", 
                                sentence)
            
            formatted_sentences.extend([sentence, punctuation])
    
    return ''.join(formatted_sentences)

def fix_contractions(text):
    # Common contractions
    contractions = {
        "It'S": "It's",
        "That'S": "That's",
        "I'M": "I'm",
        "I'Ve": "I've",
        "I'Ll": "I'll",
        "We'Re": "We're",
        "We'Ll": "We'll",
        "We'Ve": "We've",
        "You'Re": "You're",
        "They'Re": "They're",
        "Wasn'T": "Wasn't",
        "Don'T": "Don't",
        "Can'T": "Can't",
        "Won'T": "Won't",
        "Isn'T": "Isn't",
        "Aren'T": "Aren't",
        "Couldn'T": "Couldn't",
        "Wouldn'T": "Wouldn't",
        "Shouldn'T": "Shouldn't",
        "Haven'T": "Haven't",
        "Hasn'T": "Hasn't",
    }
    
    for wrong, right in contractions.items():
        text = text.replace(wrong, right)
    
    return text

def create_paragraphs(text):
    # Split into sentences
    sentences = re.split(r'([.!?]+\s+)', text)
    formatted_paragraphs = []
    current_paragraph = []
    sentence_count = 0
    
    # Random number of sentences per paragraph (between 3 and 6)
    target_sentences = random.randint(3, 6)
    
    for i in range(0, len(sentences), 2):
        if i < len(sentences):
            sentence = sentences[i]
            punctuation = sentences[i + 1] if i + 1 < len(sentences) else ''
            
            if sentence:
                current_paragraph.extend([sentence, punctuation])
                sentence_count += 1
                
                # Create a new paragraph after reaching target sentences
                if sentence_count >= target_sentences:
                    formatted_paragraphs.append(''.join(current_paragraph).strip())
                    current_paragraph = []
                    sentence_count = 0
                    target_sentences = random.randint(3, 6)  # New random target for next paragraph
    
    # Add any remaining sentences
    if current_paragraph:
        formatted_paragraphs.append(''.join(current_paragraph).strip())
    
    return '\n\n'.join(formatted_paragraphs)

def format_speech(text):
    # Split into lines
    lines = text.split('\n')
    
    # Preserve front matter
    front_matter = lines[:3]
    content = ' '.join(lines[3:])
    
    # Fix capitalization
    content = fix_capitalization(content)
    
    # Fix contractions
    content = fix_contractions(content)
    
    # Common patterns that indicate paragraph breaks
    paragraph_markers = [
        r'\[.*?\]',  # Anything in square brackets like [Applause]
        r'Thank you',  # Speaker transitions often start with "Thank you"
        r'Mr\.',  # Formal addresses often start new thoughts
        r'Ladies and gentlemen',
        r'First,',  # Enumeration often indicates new topics
        r'Second,',
        r'Third,',
        r'Fourth,',
        r'Fifth,',
        r'Sixth,',
        r'Finally,',
        r'Today,',  # Time transitions often start new thoughts
        r'Now,',
    ]
    
    # Add paragraph breaks for special markers
    for marker in paragraph_markers:
        content = re.sub(f'({marker})', r'\n\n\1', content)
    
    # Clean up multiple newlines and spaces
    content = re.sub(r'\n\s*\n', '\n\n', content)
    content = re.sub(r'\s+', ' ', content)
    
    # Create paragraphs based on sentence count
    content = create_paragraphs(content)
    
    # Combine front matter and formatted content
    formatted_text = '\n'.join(front_matter) + '\n\n' + content.strip()
    return formatted_text

def process_directory(input_dir, output_dir):
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Process each file in the input directory
    for filename in os.listdir(input_dir):
        if filename.endswith('.txt'):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            # Read input file
            with open(input_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            # Format the speech
            formatted_text = format_speech(text)
            
            # Write to output file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(formatted_text)

if __name__ == '__main__':
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define input and output directories relative to script location
    input_dir = os.path.join(script_dir, 'cspan_speeches')
    output_dir = os.path.join(script_dir, 'cspan_speeches_formatted')
    
    process_directory(input_dir, output_dir) 