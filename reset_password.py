import httpx
import asyncio
import os
import traceback
from dotenv import load_dotenv

env_path = os.path.join(os.getcwd(), 'backend', '.env')
print(f"Loading env from {env_path}")
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def reset_password():
    user_id = "565738c1-b76d-49a0-9540-0f0722b9fa15"
    new_password = "123456"
    
    # Supabase Auth Admin API endpoint
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/admin/users/{user_id}"
    print(f"URL: {url}")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            print(f"Attempting to reset password for user {user_id}...")
            response = await client.put(url, headers=headers, json={"password": new_password})
            
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("Password reset successfully!")
            else:
                print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Exception Type: {type(e).__name__}")
            print(f"Exception Message: {str(e)}")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reset_password())
