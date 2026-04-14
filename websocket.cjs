const { spawn } = require('child_process')
const WebSocket = require('ws')
const fs = require('fs')

function findFreePort(startPort, callback) {
  const server = require('net').createServer()
  server.listen(startPort, () => {
    const port = server.address().port
    server.close(() => callback(port))
  })
  server.on('error', () => findFreePort(startPort + 1, callback))
}

function broadcast(wss, payload) {
  const s = typeof payload === 'string' ? payload : JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(s)
  }
}

findFreePort(3030, (port) => {
  const wss = new WebSocket.Server({ port })
  console.log(`JS: port: ${port}`)

  fs.writeFileSync('./tmp/work-port.txt', port.toString())

  const pear = spawn('pear', ['run', '.', '--dev'])

  let stdoutBuf = ''
  pear.stdout.on('data', (chunk) => {
    stdoutBuf += chunk.toString()
    let i
    while ((i = stdoutBuf.indexOf('\n')) !== -1) {
      const line = stdoutBuf.slice(0, i).trim()
      stdoutBuf = stdoutBuf.slice(i + 1)
      if (!line) continue
      try {
        const json = JSON.parse(line)
        broadcast(wss, json)
      } catch {
        console.log('not json:', line)
      }
    }
  })

  wss.on('connection', (ws) => {
    console.log('JS: react connected')

    ws.on('message', (message) => {
      const data = message.toString()
      pear.stdin.write(data + '\n')
    })
  })
})