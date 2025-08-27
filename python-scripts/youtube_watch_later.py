from googleapiclient.discovery import build

def get_video_details(api_key, video_ids):
    """
    Fetches details for a list of YouTube video IDs.
    """
    youtube = build('youtube', 'v3', developerKey=api_key)

    # The API allows fetching details for up to 50 videos at once
    # We'll split the list into chunks of 50
    all_video_details = []
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i:i+50]
        
        request = youtube.videos().list(
            part="snippet",  # 'snippet' contains title, description, tags, and publish date
            id=",".join(chunk)
        )
        response = request.execute()
        
        all_video_details.extend(response.get('items', []))
        
    return all_video_details

def main():
    api_key = "AIzaSyA5Kf-dn401qfO57S5cAyTgmqq38WlVfLg"  # <-- IMPORTANT: Replace with your API key
    
    # Example video IDs extracted from your markdown
    video_ids = [
        "EA4tO8RKTTs",
        "YVdQjqUXuDc",
        "TDvGpvyy5u8",
        "zq_xrmmyWCE",
        "pDj1QhPOVBo",
        "V1MuhbTQMSs"
    ]

    video_details = get_video_details(api_key, video_ids)

    for video in video_details:
        snippet = video['snippet']
        video_id = video['id']
        title = snippet['title']
        # The upload date is in ISO 8601 format, so we take the first 10 characters (YYYY-MM-DD)
        upload_date = snippet['publishedAt'][:10] 
        # Tags can be used as topics. They might not always exist.
        topics = snippet.get('tags', []) 

        print(f"--- Video: {title} ---")
        print(f"ID: {video_id}")
        print(f"Uploaded: {upload_date}")
        print(f"Topics (Tags): {', '.join(topics) if topics else 'No tags found'}")
        print("-" * (len(title) + 12))
        print("\n")

if __name__ == "__main__":
    main()
