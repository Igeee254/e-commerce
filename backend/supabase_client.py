import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables.")

class SupabaseClient:
    def __init__(self):
        self.url = SUPABASE_URL.rstrip('/')
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self._client = None

    async def get_client(self):
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def get_table(self, table_name: str, select: str = "*", filters: dict = None, limit: int = None, offset: int = None):
        params = {"select": select}
        if filters:
            params.update(filters)
        if limit is not None:
            params["limit"] = limit
        if offset is not None:
            params["offset"] = offset
            
        client = await self.get_client()
        response = await client.get(
            f"{self.url}/rest/v1/{table_name}",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    async def insert(self, table_name: str, data: list):
        client = await self.get_client()
        response = await client.post(
            f"{self.url}/rest/v1/{table_name}",
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()

    async def upsert(self, table_name: str, data: dict, on_conflict: str = "id"):
        headers = self.headers.copy()
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        
        client = await self.get_client()
        response = await client.post(
            f"{self.url}/rest/v1/{table_name}",
            headers=headers,
            params={"on_conflict": on_conflict},
            json=data
        )
        response.raise_for_status()
        return response.json()

    async def signup(self, email: str, password: str):
        """
        Creates a user via the Admin API, which auto-confirms the email.
        This prevents Supabase from sending any confirmation emails,
        which eliminates bounce rate issues from test/invalid addresses.
        """
        client = await self.get_client()
        try:
            # Use the Admin API to create user with email_confirm=True
            # This means NO confirmation email is ever sent.
            response = await client.post(
                f"{self.url}/auth/v1/admin/users",
                headers=self.headers,
                json={
                    "email": email,
                    "password": password,
                    "email_confirm": True
                }
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                try:
                    error_data = response.json()
                    print(f"Supabase Auth Error Body: {error_data}")
                    error_msg = (
                        error_data.get("msg") or
                        error_data.get("message") or
                        error_data.get("error_description") or
                        error_data.get("error") or
                        str(e)
                    )
                    raise Exception(error_msg)
                except (ValueError, KeyError):
                    print(f"Supabase Auth Error (non-JSON): {response.text}")
                    raise Exception(str(e))
            # Admin API returns the user object directly at the root
            return response.json()
        except httpx.RequestError as e:
            print(f"Network error connecting to Supabase: {e}")
            raise Exception(f"Could not connect to authentication server: {str(e)}. Please check your internet.")

    async def login(self, email: str, password: str):
        client = await self.get_client()
        try:
            response = await client.post(
                f"{self.url}/auth/v1/token?grant_type=password",
                headers=self.headers,
                json={"email": email, "password": password}
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                try:
                    error_data = response.json()
                    print(f"Supabase Login Error Body: {error_data}")
                    error_msg = (
                        error_data.get("error_description") or 
                        error_data.get("msg") or 
                        error_data.get("message") or
                        "Invalid credentials"
                    )
                    raise Exception(error_msg)
                except (ValueError, KeyError):
                    print(f"Supabase Login Error (non-JSON): {response.text}")
                    raise Exception("Invalid credentials")
            return response.json()
        except httpx.RequestError as e:
            print(f"Network error connecting to Supabase: {e}")
            raise Exception(f"Could not connect to authentication server: {str(e)}. Please check your internet.")

    async def update(self, table_name: str, filters: dict, data: dict):
        headers = self.headers.copy()
        headers["Prefer"] = "return=representation"
        
        client = await self.get_client()
        response = await client.patch(
            f"{self.url}/rest/v1/{table_name}",
            headers=headers,
            params=filters,
            json=data
        )
        response.raise_for_status()
        return response.json()

    async def delete(self, table_name: str, filters: dict):
        headers = self.headers.copy()
        headers["Prefer"] = "return=representation"
        
        client = await self.get_client()
        response = await client.delete(
            f"{self.url}/rest/v1/{table_name}",
            headers=headers,
            params=filters
        )
        response.raise_for_status()
        return response.json()

    async def update_profile(self, user_id: str, data: dict):
        return await self.update("profiles", {"id": f"eq.{user_id}"}, data)

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

supabase = SupabaseClient()
