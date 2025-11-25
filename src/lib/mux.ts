import Mux from '@mux/mux-node'

// Initialize Mux client
const muxClient = (() => {
  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET

  if (!tokenId || !tokenSecret) {
    console.warn('Mux credentials not configured. Video recording will be disabled.')
    return null
  }

  return new Mux({
    tokenId,
    tokenSecret,
  })
})()

export { muxClient }

// Helper to check if Mux is configured
export function isMuxConfigured(): boolean {
  return muxClient !== null
}
