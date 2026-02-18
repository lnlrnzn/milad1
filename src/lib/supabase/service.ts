import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

/**
 * Supabase client with service-role key.
 * Use ONLY for admin operations that need to bypass RLS (e.g., creating auth users).
 * Never expose to client-side code.
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
