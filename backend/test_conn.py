import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        try:
            print("Testing Google...")
            r = await client.get("https://www.google.com", timeout=5.0)
            print(f"Google status: {r.status_code}")
        except Exception as e:
            print(f"Google failed: {e}")

        try:
            print("Testing Supabase...")
            r = await client.get("https://rtuwkvcplriwfvwgccwn.supabase.co/auth/v1/health", timeout=5.0)
            print(f"Supabase status: {r.status_code}")
            print(f"Supabase body: {r.text}")
        except Exception as e:
            print(f"Supabase failed: {e}")

if __name__ == "__main__":
    asyncio.run(test())
