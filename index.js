// For interactive documentation and code auto-completion in editor
/** @typedef {import('pear-interface')} */

/* global Pear */
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import b4a from 'b4a'
import Runtime from 'pear-electron'
import Bridge from 'pear-bridge'

const { teardown, updates } = Pear

// Initialize bridge and runtime
const bridge = new Bridge()
await bridge.ready()

const runtime = new Runtime()
const pipe = await runtime.start({ bridge })
pipe.on('close', () => Pear.exit())

// P2P setup
const swarm = new Hyperswarm()

teardown(() => swarm.destroy())

updates(() => Pear.reload())

// Handle P2P connections
swarm.on('connection', (peer) => {
  const name = b4a.toString(peer.remotePublicKey, 'hex').substr(0, 6)
  
  peer.on('data', (message) => {
    // Send message to UI via bridge
    bridge.send('message', { from: name, message: message.toString() })
  })
  
  peer.on('error', e => console.log(`Connection error: ${e}`))
})

swarm.on('update', () => {
  // Update peer count in UI
  bridge.send('peer-count', swarm.connections.size)
})

// Listen for UI events via bridge
bridge.on('create-chat-room', async () => {
  const topicBuffer = crypto.randomBytes(32)
  await joinSwarm(topicBuffer)
})

bridge.on('join-chat-room', async (topicStr) => {
  const topicBuffer = b4a.from(topicStr, 'hex')
  await joinSwarm(topicBuffer)
})

bridge.on('send-message', (message) => {
  // Send to all connected peers
  const peers = [...swarm.connections]
  for (const peer of peers) peer.write(message)
  
  // Also show own message
  bridge.send('message', { from: 'You', message })
})

async function joinSwarm(topicBuffer) {
  bridge.send('loading-start')
  
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()
  
  const topic = b4a.toString(topicBuffer, 'hex')
  bridge.send('chat-joined', topic)
  bridge.send('loading-end')
}