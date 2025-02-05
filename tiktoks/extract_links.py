import sqlite3
import re
import os
from pathlib import Path
from loguru import logger
from datetime import datetime, timedelta

def get_messages_db_path():
    """Get the path to the Messages database."""
    home = str(Path.home())
    return os.path.join(
        home,
        'Library/Messages/chat.db'
    )

def extract_tiktok_links():
    """Extract TikTok links from Messages database."""
    db_path = get_messages_db_path()
    
    if not os.path.exists(db_path):
        raise FileNotFoundError("Messages database not found. Make sure you're on macOS.")
    
    # TikTok URL patterns
    tiktok_patterns = [
        r'https?://(?:www\.)?tiktok\.com/\S+',
        r'https?://(?:vm|vt)\.tiktok\.com/\S+'
    ]
    
    links = set()
    conn = None
    
    try:
        # Make a copy of the database first to avoid permission issues
        temp_db = 'messages_temp.db'
        os.system(f'cp "{db_path}" "{temp_db}"')
        logger.info("Created temporary copy of Messages database")
        
        # Connect to the copy of the database
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        
        # Query all messages from all possible tables
        queries = [
            # Main messages query
            """
            SELECT DISTINCT
                message.text,
                datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date,
                chat.chat_identifier,
                handle.id as contact
            FROM message
            LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
            LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
            LEFT JOIN handle ON message.handle_id = handle.ROWID
            WHERE message.text IS NOT NULL
            """,
            # Attachment messages query
            """
            SELECT DISTINCT
                message.text,
                datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 'unixepoch', 'localtime') as date,
                chat.chat_identifier,
                handle.id as contact
            FROM message
            LEFT JOIN message_attachment_join ON message_attachment_join.message_id = message.ROWID
            LEFT JOIN attachment ON attachment.ROWID = message_attachment_join.attachment_id
            LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
            LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
            LEFT JOIN handle ON message.handle_id = handle.ROWID
            WHERE message.text IS NOT NULL
            """
        ]
        
        logger.info("Querying messages database...")
        total_messages = 0
        by_chat = {}  # Track links by chat
        by_year = {}  # Track links by year
        
        for query in queries:
            cursor.execute(query)
            
            for message_text, date, chat_id, contact in cursor.fetchall():
                total_messages += 1
                
                if message_text:
                    year = date[:4] if date else 'unknown'  # Extract year from date
                    
                    for pattern in tiktok_patterns:
                        found_links = re.findall(pattern, message_text)
                        if found_links:
                            chat_name = chat_id or 'unknown_chat'
                            by_chat.setdefault(chat_name, []).extend(found_links)
                            by_year.setdefault(year, []).extend(found_links)
                            logger.debug(f"Found link(s) from {date} in chat {chat_name}: {found_links}")
                            links.update(found_links)
                
                if total_messages % 1000 == 0:
                    logger.info(f"Processed {total_messages} messages...")
        
        logger.info(f"Processed {total_messages} messages total")
        
        # Print summary by chat
        logger.info("\nLinks found by chat:")
        for chat, chat_links in by_chat.items():
            logger.info(f"{chat}: {len(chat_links)} links")
        
        # Print summary by year
        logger.info("\nLinks found by year:")
        for year in sorted(by_year.keys()):
            logger.info(f"{year}: {len(by_year[year])} links")
        
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
    finally:
        if conn:
            conn.close()
        # Clean up temporary database
        if os.path.exists('messages_temp.db'):
            os.remove('messages_temp.db')
            logger.debug("Cleaned up temporary database")
    
    # Save links to file
    with open('tiktok_links.txt', 'w') as f:
        for link in sorted(links):
            f.write(f"{link}\n")
    
    logger.success(f"Found {len(links)} unique TikTok links")
    return links

if __name__ == "__main__":
    logger.add("extract.log", level="INFO")
    logger.info("Attempting to extract TikTok links from Messages...")
    logger.info("Note: You may need to grant 'Full Disk Access' to Terminal/IDE in")
    logger.info("System Preferences -> Security & Privacy -> Privacy -> Full Disk Access")
    extract_tiktok_links() 