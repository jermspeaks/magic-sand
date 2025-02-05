import yt_dlp
import os
from pathlib import Path
from loguru import logger

def download_videos():
    # text_link = 'tiktok_links.txt'
    text_link = 'for_class.txt'
    """Download videos from links in tiktok_links.txt using yt-dlp"""
    if not os.path.exists(text_link):
        logger.error("No links file found. Run extract_links.py first.")
        return
    
    # Create downloads directory
    downloads_dir = Path('downloads')
    downloads_dir.mkdir(exist_ok=True)
    
    # Read links
    with open(text_link, 'r') as f:
        links = [line.strip() for line in f if line.strip()]
    
    logger.info(f"Found {len(links)} links to download")
    
    # Configure yt-dlp
    ydl_opts = {
        'format': 'best',  # Download best quality
        'outtmpl': str(downloads_dir / '%(id)s_%(title).50s.%(ext)s'),  # Output template
        'ignoreerrors': True,  # Skip on error
        'no_warnings': True,
        'quiet': False,
        'extract_flat': False,
    }
    
    # Download each video
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for i, link in enumerate(links, 1):
            try:
                logger.info(f"Downloading video {i}/{len(links)}: {link}")
                ydl.download([link])
                
            except Exception as e:
                logger.error(f"Error downloading {link}: {e}")
    
    logger.success("Download complete!")

if __name__ == "__main__":
    logger.add("download.log")  # Add logging to file
    download_videos() 