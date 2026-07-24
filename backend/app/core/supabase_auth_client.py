"""
supabase_auth_client.py
-----------------------
A Supabase client initialised with the **anon key**.

Supabase Auth operations (sign-up, sign-in, sign-out, get_user) must be
performed with a client that carries a *user-scoped* JWT, not the
service-role key.  The existing ``supabase_client`` uses the service-role
key and is reserved for server-side DB/admin operations; this module
provides the companion anon-key client used exclusively by auth routes.
"""

from supabase import create_client, Client

from app.core.config import settings

supabase_auth: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)
