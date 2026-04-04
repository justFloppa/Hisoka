import DHT from 'hyperdht'
import process from 'bare-process'
import readline from 'bare-readline'
import { runServer } from './core/server.js'
import { runClient } from './core/client.js'
import { sendChatMessage } from './core/chats.js'

const dht = new DHT({ connectionKeepAlive: 300000 })

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  })

  await runServer(dht)

  rl.on('data', (line) => {
    const t = typeof line === 'string' ? line.trim() : String(line).trim()
    if (t.startsWith('/')) {
      runClient(t.slice(1), dht)
      return
    }
    try {
      const j = JSON.parse(t)
      if (
        j.action === 'send' &&
        typeof j.peer === 'string' &&
        typeof j.text === 'string'
      ) {
        const peer = j.peer.trim().replace(/^0x/i, '').replace(/\s+/g, '')
        sendChatMessage(peer, j.text)
      }
    } catch (_) {}
  })
}

main()

Pear.teardown(() => {
  dht.destroy()
})
