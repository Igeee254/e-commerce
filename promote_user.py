import asyncio
import os
import sys

# Add current directory to path to find backend
sys.path.append(os.getcwd())

from backend.supabase_client import supabase

async def promote():
    user_id = "565738c1-b76d-49a0-9540-0f0722b9fa15"
    email = "alphawol477@gmail.com"
    print(f"Promoting user {email} to Admin...")
    try:
        # Update the role in the profiles table
        r = await supabase.upsert('profiles', {
            'id': user_id, 
            'email': email, 
            'role': 'Admin',
            'full_name': 'Alpha Wolf'
        }, on_conflict='id')
        print(f"Success! {r}")
    except Exception as e:
        print(f"Error promoting user: {e}")

if __name__ == "__main__":
    asyncio.run(promote())
