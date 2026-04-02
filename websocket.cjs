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

findFreePort(3030, (port) => {
  const wss = new WebSocket.Server({ port })
  console.log(`JS: port: ${port}`)
  
  fs.writeFileSync('./hisoka/tmp/work-port.txt', port.toString())
  
  const pear = spawn('pear', ['run', '.', '--dev'])
  
  wss.on('connection', (ws) => {
    console.log('JS: react connected')
    
    ws.on('message', (message) => {
      pear.stdin.write(message + '\n')
    })
    
    pear.stdout.on('data', (data) => {
      ws.send(data.toString())
    })
  })
})