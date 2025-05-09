import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createClient = () => {
  // Don't create a client during SSR
  if (typeof window === "undefined") {
    throw new Error("Supabase client cannot be created during server-side rendering")
  }

  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
    throw new Error("Missing Supabase environment variables")
  }

  try {
    console.log("Creating Supabase client with URL:", supabaseUrl)
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Don't persist auth state to avoid issues
      },
      global: {
        fetch: (...args) => {
          // Add a timeout to fetch requests
          const [resource, config] = args
          return fetch(resource, {
            ...config,
            signal: AbortSignal.timeout(10000), // 10 second timeout
          })
        },
      },
    })
    return supabaseInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw new Error(`Failed to initialize Supabase client: ${error}`)
  }
}
