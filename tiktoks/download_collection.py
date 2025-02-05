import requests
import json
import time
from pathlib import Path

def download_collection(collection_id):
    # Base URL and headers from your curl command
    base_url = "https://www.tiktok.com/api/collection/item_list/"
    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        # Add your cookies here - they're required for authentication
        'cookie': 'tt_csrf_token=E0Syct1L-oF8envC9YW5RrER8MYEJi-qn3I0; tt_chain_token=+CMr/FNkL+brPkKlV2wOuA==; tiktok_webapp_theme_auto_dark_ab=1; s_v_web_id=verify_lxfakhzn_mwV4Ztr8_gRIu_4gQS_ANF9_NhRssizoi6YL; _ttp=2iO2pyN9cLkdAQS7hsS7qzifcUM; delay_guest_mode_vid=5; d_ticket=580006ecf1c6ebd76aaf00e5cffceef09c683; csrf_session_id=1528298f2afd30ddb65c3cbb9d03fc22; living_user_id=486848698310; tiktok_webapp_theme=light; ak_bmsc=E5F8C74FE9723ACF2F8968AE2EBC31BE~000000000000000000000000000000~YAAQ9TfLF47pX3aUAQAAubUIfBpi+ySVD5L06VpjIWSUVN14i16SL0l3rN1lrazOieKY3IETFaDCT1hCKwm6nlW1jFN/4RWR0z+4huup0A2IfiWFKt+QWcppHNpjDvQOwFcOLEq3VjmHtZgs0qO46YISNOsP6SDZMAyo28LzLEunOpjMyK7fOkTJEq9SGpWIFHG2XpNKTf3SmnIam8Auw9DSGm+hBYgmOPeB+ZZY+2uAkXxn0YQFDvCvKOrBU1lVZaWVVVqClqD3lRwshv1FD8CZgJMNEZieWFmm78aAbc2kvz1J8R8X9WhuzL5pwJl0ionyeGghqhYieFsM7XvI2gE3TDGk9G8yD8aubgrlOwhgpv0/9pYIC01Lee3QC3/sr8IXmgRX1Wg=; perf_feed_cache={%22expireTimestamp%22:1737417600000%2C%22itemIds%22:[%227442045740341366046%22%2C%227459190606309510430%22%2C%227461130446869466399%22]}; passport_csrf_token=d986179fcab188bb83c54641664f0455; passport_csrf_token_default=d986179fcab188bb83c54641664f0455; tiktok_webapp_theme_source=system; multi_sids=6889535974747325446%3Ae8db39741a2f057be6e80157977c4357; cmpl_token=AgQQAPNSF-RO0o-iYtDyJB0__A1SVBZN_6jZYNpW5Q; ttwid=1%7ClqsQdSEBY_tUU_Sna8WxQK9z1gC7AxMblsV3lGLiejo%7C1734906088%7C03b84c0029da40a79a8c393eb35a975b0007dec7f2acf331a707f0fff9761d7d; uid_tt=80912cf5dda520c6110bcf6a8614be4dc6a96e3c58f637aa346e5ca4e29e837f; uid_tt_ss=80912cf5dda520c6110bcf6a8614be4dc6a96e3c58f637aa346e5ca4e29e837f; sid_tt=e8db39741a2f057be6e80157977c4357; sessionid=e8db39741a2f057be6e80157977c4357; sessionid_ss=e8db39741a2f057be6e80157977c4357; store-idc=useast5; store-country-code=us; store-country-code-src=uid; tt-target-idc=useast5; tt-target-idc-sign=orj9lkOKObOd-racwSAJsEu_sGPAwK7PBVYx_9FDnNFXGkXmF5GzuPmCWMuWonhRMib9SJATizakVGuvYgW38DkwhiAfQERRiUHNmiSE2-gdCDo8eMpl-sNdQ3nFG7VMOUEwaywTI84QasX5smks2pxs3tMWE4QzcslGioP3E8iMF84B0tNpx1IbpNWDdWzWXAAPBNKNBEflo3hYVSfGrcdhunECjbatxJso9BXrsDbPV0DwFdPS4a10ePTvJe0vnxvByDeLOFX3bJH2DXEmXN7E5ugQX2vM1oNIGX6BLqovK54eQ7hx1G10FBW-WaiM_UdAUmj0BGvgQm19E8K19ioLB1w4q6xBQM5kf56XMXz-dkyOXPENyvKeKhdsNFVjKYsmfFtnCewcQLI_8_go9EcE1iHaq_pi27ssRWDa9UxbjCsx01RkqflBA-jIPMS-zlzRGWACCK5srcxfxQBGvyiBwZzoO1TYCmnOh-yNWuL0hrpBXy68Zr8SyWSafqXP; last_login_method=QRcode; sid_guard=e8db39741a2f057be6e80157977c4357%7C1737247798%7C15551990%7CFri%2C+18-Jul-2025+00%3A49%3A48+GMT; sid_ucp_v1=1.0.0-KGQzMzkyOGNhYWNhZTA1ZTU0YmU3NjdkZmE4ZmQ2YzY5NDgxNTc5NTQKGgiGiNvQ946jzl8QtpixvAYYsws4B0D0B0gEEAQaB3VzZWFzdDUiIGU4ZGIzOTc0MWEyZjA1N2JlNmU4MDE1Nzk3N2M0MzU3; ssid_ucp_v1=1.0.0-KGQzMzkyOGNhYWNhZTA1ZTU0YmU3NjdkZmE4ZmQ2YzY5NDgxNTc5NTQKGgiGiNvQ946jzl8QtpixvAYYsws4B0D0B0gEEAQaB3VzZWFzdDUiIGU4ZGIzOTc0MWEyZjA1N2JlNmU4MDE1Nzk3N2M0MzU3; odin_tt=61a2c3fcc05aef9ab3a344cb9dab8a3e141ca06c3e177dda39a973a03565f118a73028c81344100735d7d79474ae030ad3e85c05142b659f501fcfac4e473ef3bf8a2d79b36e2cac9a8f43e9178ac885; msToken=78HWBQXuz3azXr7AkhiItdxiztE3XE91d_48PrU-17YwchhreeZmJdkBoU4gLz5YKk232L9rB45fhgOcpZWD3VtsWY-uiZRViypvx5tessj56UFD_2jMETGNNY75mJ8AgMrNww9SodB9jw==; msToken=oWT6kDRHhF67qFuYwke5eeMd_COu0KRWs9n1SwRh2tV-ZWGc8zcm-4CV1apwYEMldMQDGi67y4lEHkV_JFH9zQ6Qd4hLZVfZMt3DtjXSCVVVmgdRHrX5msSCjVuqUKboBDRYcXWywUTZzQ==; passport_fe_beating_status=false; bm_sv=2951FC88C09937817D9788984B07AEA4~YAAQJwBPaLCjdmGUAQAA0ioWfBrfbQj3+d6TcGJGLQoQ0Pm8yVgsGrlvy+9d+id5zcGROMHr/dxHk11COgVlLdcEMbudnPUypKeExIt/2Vt40PjAykPvDcc6ujvOtQOYwjKrCe/edbfCxsbm/zY1lTBY/JVRUIX0f9p8fRnoi4l1i1Xo7yTTRf6eQBdupQTenHdAchXSDYPXABA7b7ooTkVvdTneWDZd+TFoy9JKy4M0rftC25gKYyGmk7oC8wZz~1'  # You'll need to replace this with your actual cookies
    }

    # Parameters that stay constant
    params = {
        'WebIdLastTime': '1718406006',
        'aid': '1988',
        'app_language': 'en',
        'app_name': 'tiktok_web',
        'browser_language': 'en-US',
        'browser_name': 'Mozilla',
        'browser_online': 'true',
        'browser_platform': 'MacIntel',
        'browser_version': '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'channel': 'tiktok_web',
        'collectionId': collection_id,
        'count': '30',
        'device_platform': 'web_pc',
        'language': 'en',
        'region': 'US',
    }

    all_items = []
    cursor = 0
    has_more = True

    while has_more:
        # Update cursor in parameters
        params['cursor'] = str(cursor)
        
        try:
            response = requests.get(base_url, headers=headers, params=params)
            response.raise_for_status()  # Raise an exception for bad status codes
            
            data = response.json()
            
            # Add items to our list
            if 'itemList' in data:
                all_items.extend(data['itemList'])
            
            # Update pagination info
            has_more = data.get('hasMore', False)
            cursor = data.get('cursor', None)
            
            if not cursor:
                break
                
            # Sleep to avoid rate limiting
            time.sleep(1)
            
        except Exception as e:
            print(f"Error occurred: {e}")
            break

    # Save to JSON file
    output_dir = Path('tiktoks/data')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / f'collection_{collection_id}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_items, f, indent=2)
    
    print(f"Downloaded {len(all_items)} items to {output_file}")
    return all_items

if __name__ == "__main__":
    # Replace with your collection ID
    collection_id = "7120305229517605674"
    download_collection(collection_id) 