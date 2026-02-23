import httpx
import asyncio
import json

async def test_signup():
    url = "http://localhost:8000/auth/signup"
    data = {
        "first_name": "Debug",
        "last_name": "User",
        "email": f"debug_{int(asyncio.get_event_loop().time())}@example.com",
        "password": "password123",
        "admin_code": "123456"
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
    asyncio.run(test_signup())
