"""
Creates an Expo project for the admin portal and injects the projectId into app.json.
Reads the EAS token from ~/.expo/state.json (set by eas-cli login).
"""
import httpx
import asyncio
import json
import os

async def create_project():
    # Read the EAS session from the CLI's state file
    state_path = os.path.expanduser("~/.expo/state.json")
    if not os.path.exists(state_path):
        print("ERROR: Not logged in to EAS. Run 'npx eas-cli login' first.")
        return

    with open(state_path) as f:
        state = json.load(f)

    # Find the session token  
    sessions = state.get("auth", {}).get("sessionSecret") or state.get("sessionSecret")
    if not sessions:
        # Try alternate structure
        accounts = state.get("auth", {}).get("accounts", [])
        if accounts:
            sessions = accounts[0].get("sessionSecret")
    
    if not sessions:
        print(f"State keys: {list(state.keys())}")
        print(f"Full state: {json.dumps(state, indent=2)[:500]}")
        print("ERROR: Could not find session token in state.json")
        return

    print(f"Found session token: {sessions[:20]}...")

    headers = {
        "expo-session": sessions,
        "Content-Type": "application/json",
    }

    query = """
    mutation CreateApp($appInput: AppInput!) {
        app {
            createApp(appInput: $appInput) {
                id
                fullName
            }
        }
    }
    """

    variables = {
        "appInput": {
            "accountName": "mutethia",
            "projectName": "alpha-admin-portal",
            "privacy": "UNLISTED"
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            print("Creating Expo project via API...")
            response = await client.post(
                "https://api.expo.dev/graphql",
                headers=headers,
                json={"query": query, "variables": variables},
                timeout=30.0
            )
            print(f"Status: {response.status_code}")
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)[:500]}")

            errors = data.get("errors")
            if errors:
                print(f"GraphQL errors: {errors}")
                return

            project_id = data["data"]["app"]["createApp"]["id"]
            print(f"\nProject created! ID: {project_id}")

            # Inject into admin-portal/app.json
            app_json_path = os.path.join(os.getcwd(), "admin-portal", "app.json")
            with open(app_json_path) as f:
                app_json = json.load(f)

            app_json["expo"]["extra"] = {
                "eas": {"projectId": project_id}
            }

            with open(app_json_path, "w") as f:
                json.dump(app_json, f, indent=2)

            print(f"Injected projectId into admin-portal/app.json ✓")

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_project())
