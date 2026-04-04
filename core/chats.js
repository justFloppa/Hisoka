const connections = new Map()

export function registerChat(peerKeyHex, conn) {
  connections.set(peerKeyHex, conn)
}

export function unregisterChat(peerKeyHex) {
  connections.delete(peerKeyHex)
}

export function sendChatMessage(peerKeyHex, text) {
  const conn = connections.get(peerKeyHex)
  if (!conn) return false
  try {
    conn.write(
      JSON.stringify({
        text,
        timestamp: Date.now()
      })
    )
    return true
  } catch {
    return false
  }
}
