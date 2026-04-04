import b4a from 'b4a'
import process from 'bare-process'
import { registerChat, unregisterChat } from './chats.js'

function emit(event, data) {
  process.stdout.write(JSON.stringify({ event, data }) + '\n')
}

export async function runClient(key, dht) {
  const publicKey = b4a.from(key, 'hex')
  const conn = dht.connect(publicKey)

  conn.once('open', () => {
    registerChat(key, conn)
    emit('peer_connected', { peerKey: key })
  })

  conn.on('data', (data) => {
    try {
      const message = JSON.parse(data.toString())
      message.from = key
      message.timestamp = message.timestamp || Date.now()
      emit('message', message)
    } catch {
      emit('message', {
        text: data.toString(),
        from: key,
        timestamp: Date.now()
      })
    }
  })

  conn.on('close', () => {
    unregisterChat(key)
    emit('peer_disconnected', { peerKey: key })
  })
}
