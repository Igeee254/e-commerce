import asyncio
import os
import sys

# Add current directory to path to find backend
sys.path.append(os.getcwd())

from backend.supabase_client import supabase

async def check():
    email = "admin@gmail.com"
    print(f"Checking for profile with email: {email}")
    try:
        r = await supabase.get_table('profiles', select='*', filters={'email': f'eq.{email}'})
        print(f"Results: {r}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
