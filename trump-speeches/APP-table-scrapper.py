import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime
import time

BASE_URL = "https://www.presidency.ucsb.edu"


def convert_date_format(date_str):
    """Convert date from 'Month D, YYYY' to 'YYYY-MM-DD' format"""
    try:
        # Parse the original date format (e.g., "January 20, 2020")
        date_obj = datetime.strptime(date_str, "%B %d, %Y")
        # Convert to desired format
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        return date_str


def get_content(url):
    """Get the title and content from a specific page"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Get title and content using the CSS classes
        title = soup.select_one(".field-ds-doc-title")
        date = soup.select_one(".field-docs-start-date-time")
        content = soup.select_one(".field-docs-content")
        citation = soup.select_one(".field-prez-document-citation")

        if title and content:
            # Convert date format
            date_text = date.get_text(strip=True)
            formatted_date = convert_date_format(date_text)

            return {
                "title": title.get_text(strip=True),
                "date": formatted_date,
                "content": content.get_text(strip=True),
                "url": url,
                "citation": citation.get_text(strip=True),
            }
        else:
            print(f"Could not find title or content for {url}")
            return None

    except requests.RequestException as e:
        print(f"Error fetching {url}: {str(e)}")
        return None


# def scrape_local_table(html_file):
#     """Scrape the table from local HTML file and get content from each link"""
#     try:
#         # Read the local HTML file
#         with open(html_file, "r", encoding="utf-8") as f:
#             soup = BeautifulSoup(f.read(), "html.parser")

#         # Find all links in the first td of each row
#         rows = soup.select("tbody tr")
#         documents = []

#         for row in rows:
#             # Get the first td and find the link
#             first_td = row.find("td")
#             if first_td:
#                 link = first_td.find("a")
#                 if link and link.get("href"):
#                     relative_url = link.get("href")
#                     full_url = (
#                         BASE_URL + relative_url
#                         if relative_url.startswith("/")
#                         else BASE_URL + "/" + relative_url
#                     )

#                     print(f"Fetching content from: {full_url}")
#                     content = get_content(full_url)

#                     if content:
#                         documents.append(content)

#                     # Be nice to the server
#                     time.sleep(1)

#         return documents

#     except Exception as e:
#         print(f"Error reading local HTML file: {str(e)}")
#         return []


def scrape_local_table(html_file):
    """Scrape the table from local HTML file and get content from each link"""
    try:
        # Read the local HTML file
        with open(html_file, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

        # Find all rows in tbody
        rows = soup.select("tbody tr")
        documents = []

        for row in rows:
            # Get the third td (title column) and find the link
            title_td = row.select_one(".views-field-title")  # Using the class name
            if title_td:
                link = title_td.find("a")
                if link and link.get("href"):
                    relative_url = link.get("href")
                    full_url = (
                        BASE_URL + relative_url
                        if relative_url.startswith("/")
                        else BASE_URL + "/" + relative_url
                    )

                    print(f"Fetching content from: {full_url}")
                    content = get_content(full_url)

                    if content:
                        documents.append(content)

                    # Be nice to the server
                    time.sleep(1)

        return documents

    except Exception as e:
        print(f"Error reading local HTML file: {str(e)}")
        return []


def save_documents(documents, output_folder="scraped_docs"):
    """Save each document to a text file"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for doc in documents:
        # Get date and sanitize title for filename
        date = doc["date"]  # Already in YYYY-MM-DD format
        title = doc["title"]

        # Sanitize title: remove special chars and replace spaces with dashes
        sanitized_title = "".join(
            c if c.isalnum() or c == " " else "" for c in title
        ).replace(" ", "-")

        # Create filename with date and limited title
        filename = f"{date}-{sanitized_title[:100]}.txt"
        filepath = os.path.join(output_folder, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"Title: {doc['title']}\n")
            f.write(f"Date: {doc['date']}\n")
            f.write(f"URL: {doc['url']}\n")
            f.write(f"Citation: {doc['citation']}\n\n")
            f.write(doc["content"])

        print(f"Saved: {filepath}")


# Usage
html_file = "./speech-parsing/campaign-speeches.html"
documents = scrape_local_table(html_file)
save_documents(documents, output_folder="press_releases")
