import sqlite3
import json
import os
from pathlib import Path
from loguru import logger
from datetime import datetime

def get_messages_db_path():
    """Get the path to the Messages database."""
    home = str(Path.home())
    return os.path.join(
        home,
        'Library/Messages/chat.db'
    )

def export_messages():
    """Export all messages to a JSON file for easier processing."""
    db_path = get_messages_db_path()
    
    if not os.path.exists(db_path):
        raise FileNotFoundError("Messages database not found. Make sure you're on macOS.")
    
    conversations = {}
    conn = None
    
    try:
        # Make a copy of the database first to avoid permission issues
        temp_db = 'messages_temp.db'
        os.system(f'cp "{db_path}" "{temp_db}"')
        logger.info("Created temporary copy of Messages database")
        
        # Connect to the copy of the database
        conn = sqlite3.connect(temp_db)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()
        
        # Check date range in messages
        date_query = """
        SELECT 
            MIN(datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 
                'unixepoch', 'localtime')) as earliest_date,
            MAX(datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 
                'unixepoch', 'localtime')) as latest_date,
            COUNT(*) as total_messages
        FROM message
        WHERE message.text IS NOT NULL
        """
        
        cursor.execute(date_query)
        date_info = cursor.fetchone()
        logger.info(f"Database contains messages from {date_info['earliest_date']} to {date_info['latest_date']}")
        logger.info(f"Total messages in database: {date_info['total_messages']}")
        
        # First get all chats
        chat_query = """
        SELECT 
            chat.ROWID as chat_id,
            chat.chat_identifier,
            chat.display_name,
            MIN(datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 
                'unixepoch', 'localtime')) as first_message,
            COUNT(message.ROWID) as message_count
        FROM chat
        LEFT JOIN chat_message_join ON chat_message_join.chat_id = chat.ROWID
        LEFT JOIN message ON chat_message_join.message_id = message.ROWID
        GROUP BY chat.ROWID
        HAVING message_count > 0
        ORDER BY first_message ASC
        """
        
        cursor.execute(chat_query)
        chats = cursor.fetchall()
        
        logger.info(f"Found {len(chats)} conversations with messages")
        
        # For each chat, get all messages
        message_query = """
        SELECT 
            message.ROWID as message_id,
            message.text,
            message.is_from_me,
            datetime(message.date/1000000000 + strftime('%s', '2001-01-01'), 
                    'unixepoch', 'localtime') as date,
            handle.id as contact_id
        FROM chat_message_join
        JOIN message ON chat_message_join.message_id = message.ROWID
        LEFT JOIN handle ON message.handle_id = handle.ROWID
        WHERE chat_message_join.chat_id = ?
        ORDER BY message.date ASC
        """
        
        total_messages = 0
        
        for chat in chats:
            chat_id = chat['chat_id']
            chat_name = chat['display_name'] or chat['chat_identifier']
            
            logger.info(f"Processing chat: {chat_name}")
            logger.info(f"  First message: {chat['first_message']}")
            logger.info(f"  Message count: {chat['message_count']}")
            
            cursor.execute(message_query, (chat_id,))
            messages = cursor.fetchall()
            
            # Convert messages to dictionary format
            messages_list = []
            earliest_date = None
            latest_date = None
            
            for msg in messages:
                if msg['text']:  # Only include messages with text
                    date = msg['date']
                    if not earliest_date or date < earliest_date:
                        earliest_date = date
                    if not latest_date or date > latest_date:
                        latest_date = date
                        
                    messages_list.append({
                        'message_id': msg['message_id'],
                        'text': msg['text'],
                        'date': date,
                        'is_from_me': bool(msg['is_from_me']),
                        'contact_id': msg['contact_id']
                    })
            
            total_messages += len(messages_list)
            
            if messages_list:  # Only include chats with messages
                logger.info(f"  Date range: {earliest_date} to {latest_date}")
                conversations[chat_name] = {
                    'chat_id': chat_id,
                    'messages': messages_list,
                    'first_message': earliest_date,
                    'last_message': latest_date,
                    'message_count': len(messages_list)
                }
        
        logger.info(f"Total messages processed: {total_messages}")
        
        # Save to JSON file
        output_file = 'messages_export.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(conversations, f, indent=2, ensure_ascii=False)
        
        logger.success(f"Exported {len(conversations)} conversations to {output_file}")
        
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
    finally:
        if conn:
            conn.close()
        if os.path.exists('messages_temp.db'):
            os.remove('messages_temp.db')
            logger.debug("Cleaned up temporary database")

if __name__ == "__main__":
    logger.add("export.log", level="INFO")
    logger.info("Starting Messages export...")
    logger.info("Note: You may need to grant 'Full Disk Access' to Terminal/IDE in")
    logger.info("System Preferences -> Security & Privacy -> Privacy -> Full Disk Access")
    export_messages() 