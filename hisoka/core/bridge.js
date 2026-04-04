class P2PBridge {
  constructor() {
    this.ws = null
    this.onMessageCallback = null
  }

  async getPort() {
    try {
      const response = await fetch('./tmp/work-port.txt')
      const port = await response.text()
      return parseInt(port)
    } catch {
      console.log("REACT: cant read /tmp/work-port.txt, trying port 3030")
      return 3030
    }
  }

  async connect() {
    const port = await this.getPort()
    console.log(typeof port)
    console.log(port)

    this.ws = new WebSocket(`ws://localhost:${port}`)
    
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        console.log(`REACT: port: ${port}`)
        resolve()
      }
      this.ws.onerror = reject
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log(data)
        if (this.onMessageCallback) {
          this.onMessageCallback(data)
        }
      }
      
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    })
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback
  }
}

export default new P2PBridge()