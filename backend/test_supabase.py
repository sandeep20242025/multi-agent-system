from app.core.supabase_client import supabase

try:
    result = supabase.table("chat_sessions").select("*").limit(1).execute()

    print("✅ Connected Successfully!")
    print(result.data)

except Exception as e:
    print("❌ Connection Failed")
    print(e)