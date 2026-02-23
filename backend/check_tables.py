import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def check_table(table_name):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}?select=*"
            print(f"Checking table: {table_name} at {url}")
            r = await client.get(url, headers=headers)
            print(f"Status for {table_name}: {r.status_code}")
            if r.status_code == 200:
                print(f"Table {table_name} exists.")
            elif r.status_code == 404:
                print(f"Table {table_name} DOES NOT exist.")
            else:
                print(f"Error checking {table_name}: {r.text}")
        except Exception as e:
            print(f"Failed to check {table_name}: {e}")

async def main():
    await check_table("profiles")
    await check_table("categories")
    await check_table("products")

if __name__ == "__main__":
    asyncio.run(main())
