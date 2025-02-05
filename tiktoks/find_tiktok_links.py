import json
import re
from pathlib import Path
from loguru import logger
from collections import defaultdict
from datetime import datetime

def find_tiktok_links():
    """Find TikTok links in exported messages."""
    
    if not Path('messages_export.json').exists():
        logger.error("messages_export.json not found. Run export_messages.py first.")
        return
    
    # TikTok URL patterns
    tiktok_patterns = [
        r'https?://(?:www\.)?tiktok\.com/\S+',
        r'https?://(?:vm|vt)\.tiktok\.com/\S+'
    ]
    
    # Load exported messages
    with open('messages_export.json', 'r', encoding='utf-8') as f:
        conversations = json.load(f)
    
    links = set()
    by_chat = defaultdict(list)
    by_year = defaultdict(list)
    by_month = defaultdict(list)
    
    logger.info(f"Processing {len(conversations)} conversations...")
    
    for chat_name, chat_data in conversations.items():
        for message in chat_data['messages']:
            if message['text']:
                date = datetime.fromisoformat(message['date'])
                year = str(date.year)
                month = f"{year}-{date.month:02d}"
                
                for pattern in tiktok_patterns:
                    found_links = re.findall(pattern, message['text'])
                    if found_links:
                        by_chat[chat_name].extend(found_links)
                        by_year[year].extend(found_links)
                        by_month[month].extend(found_links)
                        links.update(found_links)
    
    # Save links to file
    with open('tiktok_links.txt', 'w') as f:
        for link in sorted(links):
            f.write(f"{link}\n")
    
    # Print summaries
    logger.info("\nLinks found by chat:")
    for chat, chat_links in sorted(by_chat.items()):
        logger.info(f"{chat}: {len(chat_links)} links")
    
    logger.info("\nLinks found by year:")
    for year in sorted(by_year.keys()):
        logger.info(f"{year}: {len(by_year[year])} links")
    
    logger.info("\nLinks found by month (last 12 months):")
    recent_months = sorted(by_month.keys(), reverse=True)[:12]
    for month in sorted(recent_months):
        logger.info(f"{month}: {len(by_month[month])} links")
    
    logger.success(f"Found {len(links)} unique TikTok links")
    return links

if __name__ == "__main__":
    logger.add("find_links.log", level="INFO")
    find_tiktok_links() 