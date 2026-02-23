import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def test():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/health"
            print(f"Testing Supabase Health: {url}")
            r = await client.get(url, headers=headers)
            print(f"Health status: {r.status_code}")
            print(f"Health body: {r.text}")
        except Exception as e:
            print(f"Health failed: {e}")

        try:
            url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/signup"
            print(f"Testing Supabase Signup (Invalid Data): {url}")
            # Sending invalid data to see if we get a 400 or a RequestError
            r = await client.post(url, headers=headers, json={"email": "test@example.com", "password": "123"})
            print(f"Signup status: {r.status_code}")
            print(f"Signup body: {r.text}")
        except Exception as e:
            print(f"Signup failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
