'use client'

/**
 * Debug component to verify environment variables are loading
 * Only shows in development or when ?debug=true is in URL
 */
export function EnvCheck() {
  if (typeof window === 'undefined') return null

  const isDebugMode =
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'))

  if (!isDebugMode) return null

  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasPostHogKey = !!process.env.NEXT_PUBLIC_POSTHOG_KEY

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div><strong>ENV CHECK</strong></div>
      <div>Clerk: {hasClerkKey ? '✓' : '✗'}</div>
      <div>Supabase: {hasSupabaseUrl ? '✓' : '✗'}</div>
      <div>PostHog: {hasPostHogKey ? '✓' : '✗'}</div>
      {!hasClerkKey && <div style={{color: 'red', marginTop: '5px'}}>⚠️ Clerk key missing!</div>}
    </div>
  )
}
