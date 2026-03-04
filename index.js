import DHT from 'hyperdht'
import process from 'bare-process'
import readline from 'bare-readline' 
import { runServer } from './core/server.js'
import { runClient } from './core/client.js'

const dht = new DHT({connectionKeepAlive:300000}) //хэш таблица

async function main() {
  const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
  })

  await runServer(dht)

  rl.on('data', (line) => {
  if (line.startsWith('/')) {
    runClient(line.slice(1), dht)
  }
  })
}

main()

Pear.teardown(() => {
  dht.destroy()
})
