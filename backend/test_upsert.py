import httpx
import asyncio
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def test_upsert():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }
    
    # Generate a random UUID to avoid conflicts for this test
    test_id = str(uuid.uuid4())
    
    data = {
        "id": test_id,
        "email": "test_upsert@example.com",
        "full_name": "Test Upsert",
        "role": "User"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/profiles"
            print(f"Testing UPSERT to: {url}")
            
            # First insert
            print("Attempting FIRST insert...")
            r1 = await client.post(url, headers=headers, params={"on_conflict": "id"}, json=data)
            print(f"First insert status: {r1.status_code}")
            print(f"First insert response: {r1.text}")
            
            # Second insert (upsert)
            print("\nAttempting SECOND insert (same ID)...")
            data["full_name"] = "Updated Name"
            r2 = await client.post(url, headers=headers, params={"on_conflict": "id"}, json=data)
            print(f"Second insert status: {r2.status_code}")
            print(f"Second insert response: {r2.text}")
            
        except Exception as e:
            print(f"Upsert test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_upsert())
