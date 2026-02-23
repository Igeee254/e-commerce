import httpx
import asyncio
import os
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def list_users():
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/admin/users"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print("Fetching users...")
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Supabase returns {'users': [...], 'aud': '...', 'limit': ..., 'offset': ..., 'total': ...}
                users = data.get('users', [])
                print(f"Found {len(users)} users.")
                for user in users:
                    print(f"ID: {user['id']} | Email: {user['email']}")
            else:
                print(f"Failed to fetch users. Status: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(list_users())
