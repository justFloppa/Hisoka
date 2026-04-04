import b4a from 'b4a'
import DHT from 'hyperdht'
import process from 'bare-process'
import { registerChat, unregisterChat } from './chats.js'

function emit(event, data) {
  process.stdout.write(JSON.stringify({ event, data }) + '\n')
}

export async function runServer(dht) {
  const keyPair = DHT.keyPair()

  const server = dht.createServer((conn) => {
    const peerPublicKey = conn.remotePublicKey
      ? b4a.toString(conn.remotePublicKey, 'hex')
      : 'unknown'

    registerChat(peerPublicKey, conn)
    emit('peer_connected', { peerKey: peerPublicKey })

    conn.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString())
        message.from = peerPublicKey
        message.timestamp = message.timestamp || Date.now()
        emit('message', message)
      } catch (e) {
        emit('message', {
          text: data.toString(),
          from: peerPublicKey,
          timestamp: Date.now()
        })
      }
    })

    conn.on('close', () => {
      unregisterChat(peerPublicKey)
      emit('peer_disconnected', { peerKey: peerPublicKey })
    })
  })

  await server.listen(keyPair)
  emit('self', { publicKey: b4a.toString(keyPair.publicKey, 'hex') })

  Pear.teardown(() => server.close())
}
