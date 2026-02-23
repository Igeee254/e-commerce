import httpx
import asyncio
import os
import random
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def test_full_flow():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    email = f"testuser_{random.randint(1000, 9999)}@gmail.com"
    password = "password123"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # 1. Signup
            print(f"Testing SIGNUP for: {email}")
            url_signup = f"{SUPABASE_URL.rstrip('/')}/auth/v1/signup"
            r_signup = await client.post(url_signup, headers=headers, json={"email": email, "password": password})
            print(f"Signup status: {r_signup.status_code}")
            signup_data = r_signup.json()
            print(f"Signup response: {signup_data}")
            
            user_id = signup_data.get("id")
            if not user_id and "user" in signup_data:
                user_id = signup_data["user"].get("id")
                print(f"User ID found nested in 'user': {user_id}")
            else:
                print(f"User ID found at root: {user_id}")
                
            if not user_id:
                print("FAILED to find user_id in signup response")
                return

            # 2. Upsert Profile
            print(f"\nTesting PROFILE UPSERT for ID: {user_id}")
            url_profile = f"{SUPABASE_URL.rstrip('/')}/rest/v1/profiles"
            profile_headers = headers.copy()
            profile_headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            
            profile_data = {
                "id": user_id,
                "email": email,
                "full_name": "Test User",
                "role": "User"
            }
            
            r_profile = await client.post(
                url_profile, 
                headers=profile_headers, 
                params={"on_conflict": "id"}, 
                json=profile_data
            )
            print(f"Profile upsert status: {r_profile.status_code}")
            print(f"Profile upsert response: {r_profile.text}")
            
        except Exception as e:
            print(f"Full flow test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_full_flow())
