import httpx
import asyncio
import json

async def test_login():
    url = "http://localhost:8000/auth/login"
    data = {
        "email": "alphawol477@gmail.com",
        "password": "123456"
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            print(f"Post to {url}...")
            r = await client.post(url, json=data)
            print(f"Status: {r.status_code}")
            print(f"Response: {r.text}")
        except Exception as e:
            print(f"API Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
