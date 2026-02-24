import os
import base64
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from supabase_client import supabase
from pydantic import BaseModel
import httpx

app = FastAPI(title="Alpha Boutique Smart Webs API")

@app.get("/")
async def root():
    return {"status": "success", "message": "Alpha Boutique API is live and running!"}

print(f"Backend started with SUPABASE_URL: {os.environ.get('SUPABASE_URL')}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_SECRET_CODE = os.environ.get("ADMIN_SECRET_CODE", "123456")

# M-Pesa Credentials
MPESA_CONSUMER_KEY = os.environ.get("MPESA_CONSUMER_KEY", "GTWADFxIpUfDoNikNGqq1C3023evM6UH")
MPESA_CONSUMER_SECRET = os.environ.get("MPESA_CONSUMER_SECRET", "amFbAoUByPV2rM5A")
MPESA_SHORTCODE = os.environ.get("MPESA_SHORTCODE", "174379")
MPESA_PASSKEY = os.environ.get("MPESA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919")
MPESA_CALLBACK_URL = os.environ.get("MPESA_CALLBACK_URL", "https://modcom.co.ke/job/confirmation.php")
MPESA_ENV = os.environ.get("MPESA_ENV", "sandbox") # sandbox or production

class Product(BaseModel):
    id: str
    name: str
    price: str
    category: str
    image: str
    description: Optional[str] = None

class CreateProduct(BaseModel):
    name: str
    price: int
    category: str
    image: str
    description: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignUp(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    admin_code: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    alt_contact: Optional[str] = None

class UpdateProductStock(BaseModel):
    stock: int

class STKPushRequest(BaseModel):
    phone_number: str
    amount: int
    user_email: Optional[str] = None

class UpdateOrderStatus(BaseModel):
    order_id: str
    status: str
    user_email: Optional[str] = None
    phone_number: Optional[str] = None
    amount: Optional[int] = None
    payment_method: Optional[str] = None

class CreateNotification(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info" # info, alert, system

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    created_at: str

class ItemRequest(BaseModel):
    item_name: str
    user_email: str

class FulfillRequest(BaseModel):
    request_id: str
    item_name: str
    user_email: str

class CreateFeedback(BaseModel):
    user_email: str
    message: str

@app.post("/auth/signup")
async def signup(user: UserSignUp):
    try:
        # 1. Signup user via Admin API (auto-confirms email, no email sent)
        auth_result = await supabase.signup(user.email, user.password)
        print(f"Auth result keys: {list(auth_result.keys())}")
        
        # Admin API returns user object at the root level
        user_id = auth_result.get("id")
            
        if not user_id:
            raise Exception("Failed to create user account. Please try again.")

        # 2. Determine role
        role = "Admin" if user.admin_code == ADMIN_SECRET_CODE else "User"
        
        # 3. Create/Update profile
        print(f"Creating profile for {user_id} ({user.email})...")
        profile_data = {
            "id": user_id,
            "email": user.email,
            "full_name": f"{user.first_name} {user.last_name}",
            "role": role
        }
        try:
            await supabase.upsert("profiles", profile_data, on_conflict="id")
            print("Profile created/updated successfully.")
        except Exception as profile_err:
            print(f"Profile creation deferred: {profile_err}")

        # 4. Auto-login to get a real access token (email is auto-confirmed so this always works)
        access_token = None
        try:
            login_result = await supabase.login(user.email, user.password)
            access_token = login_result.get("access_token")
            print(f"Auto-login after signup successful, token obtained.")
        except Exception as login_err:
            print(f"Auto-login after signup failed: {login_err}")

        return {
            "status": "success", 
            "user_id": user_id, 
            "role": role, 
            "access_token": access_token,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Signup error: {error_msg}")
        # Clean up common Supabase error messages for the user
        if "User already registered" in error_msg:
            error_msg = "This email is already registered. Please sign in instead."
        elif "email rate limit exceeded" in error_msg.lower():
            error_msg = "Too many registration attempts. This email likely already has an account. Please try signing in instead."
        elif "Password should be at least" in error_msg:
            error_msg = "Password is too short. Please use at least 6 characters."
        elif "Too many requests" in error_msg.lower() or "429" in error_msg:
            error_msg = "Too many attempts. Please wait a few minutes before trying again."
            
        raise HTTPException(status_code=400, detail=error_msg)

@app.post("/auth/stkpush")
async def stk_push(request: STKPushRequest):
    if not MPESA_CONSUMER_KEY or not MPESA_CONSUMER_SECRET or not MPESA_PASSKEY:
        raise HTTPException(status_code=500, detail="M-Pesa credentials not configured on server")

    try:
        # 1. Get Access Token
        api_url = "https://sandbox.safaricom.co.ke" if MPESA_ENV == "sandbox" else "https://api.safaricom.co.ke"
        auth_url = f"{api_url}/oauth/v1/generate?grant_type=client_credentials"
        
        auth_string = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                auth_url,
                headers={"Authorization": f"Basic {encoded_auth}"}
            )
            auth_response.raise_for_status()
            access_token = auth_response.json()["access_token"]

            # 2. Initiate STK Push
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            password_str = f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}"
            password = base64.b64encode(password_str.encode()).decode()
            
            # Format phone number: ensure it starts with 254
            phone = request.phone_number.strip().replace("+", "")
            if phone.startswith("0"):
                phone = "254" + phone[1:]
            elif not phone.startswith("254"):
                phone = "254" + phone
            elif not phone.startswith("254"):
                phone = "254" + phone

            checkout_url = f"{api_url}/mpesa/stkpush/v1/processrequest"
            payload = {
                "BusinessShortCode": MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": request.amount,
                "PartyA": phone,
                "PartyB": MPESA_SHORTCODE,
                "PhoneNumber": phone,
                "CallBackURL": MPESA_CALLBACK_URL,
                "AccountReference": "AlphaBoutique",
                "TransactionDesc": "Payment for order"
            }
            
            stk_response = await client.post(
                checkout_url,
                headers={"Authorization": f"Bearer {access_token}"},
                json=payload
            )
            stk_data = stk_response.json()
            
            if stk_response.status_code != 200:
                print(f"STK Push Error: {stk_data}")
                raise HTTPException(status_code=400, detail=stk_data.get("errorMessage", "Failed to initiate M-Pesa payment"))

            # Save order to Supabase
            if request.user_email:
                try:
                    order_data = {
                        "user_email": request.user_email,
                        "phone_number": phone,
                        "amount": request.amount,
                        "payment_method": "mpesa",
                        "status": "pending"
                    }
                    await supabase.insert("orders", [order_data])
                    print(f"Order saved for {request.user_email}")
                except Exception as order_err:
                    print(f"Failed to save order: {order_err}")

            return {"status": "success", "message": "STK Push initiated", "data": stk_data}
            
    except Exception as e:
        print(f"M-Pesa Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
async def login(user: UserLogin):
    try:
        # 1. Login user
        login_result = await supabase.login(user.email, user.password)
        user_id = login_result["user"]["id"]
        
        # 2. Fetch role from profile
        profiles = await supabase.get_table("profiles", select="role, full_name", filters={"id": f"eq.{user_id}"})
        
        # 3. Lazily create profile if it doesn't exist yet (e.g. after email confirmation)
        if not profiles:
            print(f"Profile not found for {user_id}, creating now...")
            full_name = login_result.get("user", {}).get("user_metadata", {}).get("full_name", user.email.split("@")[0])
            profile_data = {"id": user_id, "email": user.email, "full_name": full_name, "role": "User"}
            try:
                await supabase.upsert("profiles", profile_data, on_conflict="id")
                print("Profile created lazily on login.")
                profiles = [{"role": "User", "full_name": full_name}]
            except Exception as pe:
                print(f"Failed to create profile on login: {pe}")
        
        role = profiles[0]["role"] if profiles else "User"
        name = profiles[0]["full_name"] if profiles else "Member"
        
        return {
            "status": "success",
            "access_token": login_result["access_token"],
            "role": role,
            "name": name,
            "email": user.email
        }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/products")
async def get_products(category: Optional[str] = None):
    try:
        if category:
            cats = await supabase.get_table("categories", select="id", filters={"name": f"eq.{category}"})
            if cats:
                cat_id = cats[0]["id"]
                data = await supabase.get_table("products", filters={"category_id": f"eq.{cat_id}"})
            else:
                data = []
        else:
            data = await supabase.get_table("products")
            
        all_cats = await supabase.get_table("categories")
        cat_map = {c["id"]: c["name"] for c in all_cats}
        
        return [
            {
                "id": str(p["id"]),
                "name": p["name"],
                "price": str(p["price_ksh"]),
                "category": cat_map.get(p["category_id"], "Unknown"),
                "image": p["image_url"],
                "description": p.get("description")
            } for p in data
        ]
    except Exception as e:
        print(f"Fetch error: {e}")
        return []

@app.get("/products/{product_id}")
async def get_product_details(product_id: str):
    try:
        data = await supabase.get_table("products", filters={"id": f"eq.{product_id}"})
        if not data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        item = data[0]
        # Fetch category name
        cats = await supabase.get_table("categories", select="name", filters={"id": f"eq.{item['category_id']}"})
        category_name = cats[0]["name"] if cats else "Unknown"
        
        return {
            "id": str(item["id"]),
            "name": item["name"],
            "price": str(item["price_ksh"]),
            "category": category_name,
            "image": item["image_url"],
            "description": item.get("description", "No description available.")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Product detail error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/products", response_model=Product)
async def create_product(product: CreateProduct):
    print(f"[IN] Received Product Creation: {product.name} in {product.category}")
    try:
        cats = await supabase.get_table("categories", select="id", filters={"name": f"eq.{product.category}"})
        if not cats:
            print(f"[AUTO] Auto-creating category: {product.category}")
            cat_result = await supabase.upsert("categories", {"name": product.category})
            cat_id = cat_result[0]['id']
        else:
            cat_id = cats[0]['id']
        
        data = {
            "name": product.name,
            "price_ksh": product.price,
            "category_id": cat_id,
            "image_url": product.image,
            "description": product.description
        }
        
        result = await supabase.insert("products", [data])
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create product")
        
        item = result[0]
        return {
            "id": str(item["id"]),
            "name": item["name"],
            "price": str(item["price_ksh"]),
            "category": product.category,
            "image": item["image_url"],
            "description": item.get("description")
        }
    except Exception as e:
        print(f"Creation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/products/{product_id}")
async def delete_product(product_id: str):
    try:
        await supabase.delete("products", {"id": f"eq.{product_id}"})
        return {"status": "success", "message": "Product deleted"}
    except Exception as e:
        print(f"Delete error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/products/{product_id}/stock")
async def update_product_stock(product_id: str, payload: UpdateProductStock):
    try:
        result = await supabase.update("products", {"id": f"eq.{product_id}"}, {"stock": payload.stock})
        return {"status": "success", "stock": payload.stock}
    except Exception as e:
        print(f"Stock update error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/categories")
async def get_categories():
    try:
        rows = await supabase.get_table("categories", select="name")
        # Return plain list of strings so the frontend can render them directly
        return [row["name"] for row in rows if "name" in row]
    except Exception as e:
        print(f"Categories error: {e}")
        return []

@app.get("/admin/orders")
async def get_admin_orders():
    try:
        return await supabase.get_table("orders")
    except Exception as e:
        print(f"Orders error: {e}")
        return []

@app.get("/admin/requests")
async def get_admin_requests():
    try:
        return await supabase.get_table("item_requests")
    except Exception as e:
        print(f"Requests error: {e}")
        return []

@app.post("/requests")
async def submit_item_request(ir: ItemRequest):
    try:
        data = {
            "item_name": ir.item_name,
            "user_email": ir.user_email,
            "status": "pending"
        }
        result = await supabase.insert("item_requests", [data])
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"Request error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/fulfill")
async def fulfill_request(fr: FulfillRequest):
    try:
        await supabase.update("item_requests", {"id": f"eq.{fr.request_id}"}, {"status": "fulfilled"})
        return {"status": "success"}
    except Exception as e:
        print(f"Fulfill error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin/feedback")
async def get_admin_feedback():
    try:
        return await supabase.get_table("feedback")
    except Exception as e:
        print(f"Feedback error: {e}")
        return []

@app.post("/feedback")
async def submit_feedback(fb: CreateFeedback):
    try:
        data = {
            "user_email": fb.user_email,
            "message": fb.message
        }
        result = await supabase.insert("feedback", [data])
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"Feedback error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/notifications")
async def get_notifications():
    try:
        return await supabase.get_table("notifications")
    except Exception as e:
        print(f"Notifications error: {e}")
        return []

@app.post("/notifications")
async def create_notification(notif: CreateNotification):
    try:
        data = {
            "title": notif.title,
            "message": notif.message,
            "type": notif.type
        }
        result = await supabase.insert("notifications", [data])
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"Notification error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/admin/users")
async def get_admin_users():
    try:
        return await supabase.get_table("profiles", select="id,email,full_name,role,created_at")
    except Exception as e:
        print(f"Users error: {e}")
        return []
