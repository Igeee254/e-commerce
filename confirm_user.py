import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

async def confirm_and_reset():
    user_id = "565738c1-b76d-49a0-9540-0f0722b9fa15"
    new_password = "123456"
    
    url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/admin/users/{user_id}"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"Attempting to confirm email and reset password for user {user_id}...")
            # email_confirm: true tells Supabase to mark the email as confirmed
            response = await client.put(url, headers=headers, json={
                "password": new_password,
                "email_confirm": True
            })
            
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("Email confirmed and password reset successfully!")
            else:
                print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(confirm_and_reset())
