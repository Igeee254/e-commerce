import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

from backend.supabase_client import supabase

async def diagnose():
    try:
        print("--- Diagnostic Report ---")
        prods = await supabase.get_table("products", select="id")
        cats = await supabase.get_table("categories", select="id")
        
        print(f"Products in DB: {len(prods)}")
        print(f"Categories in DB: {len(cats)}")
        
        if len(prods) == 0:
            print("WARNING: No products found. Did you run the seed script?")
        if len(cats) == 0:
            print("WARNING: No categories found.")
            
    except Exception as e:
        print(f"ERROR during diagnosis: {e}")
    finally:
        await supabase.close()

if __name__ == "__main__":
    asyncio.run(diagnose())
