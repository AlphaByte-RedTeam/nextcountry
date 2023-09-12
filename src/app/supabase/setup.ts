import { createClient } from "@supabase/supabase-js"

const NextSupabase = createClient(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_PUBLIC_ANON_KEY || ""
)

export default NextSupabase
