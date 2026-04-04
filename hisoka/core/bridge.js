class P2PBridge {
  constructor() {
    this.ws = null
    this.onMessageCallback = null
    this._connectPromise = null
  }

  async getPort() {
    try {
      const response = await fetch('./tmp/work-port.txt')
      const port = await response.text()
      return parseInt(port, 10)
    } catch {
      console.log("REACT: cant read /tmp/work-port.txt, trying port 3030")
      return 3030
    }
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    if (this._connectPromise) return this._connectPromise

    this._connectPromise = (async () => {
      if (this.ws) {
        try {
          this.ws.close()
        } catch (_) {}
        this.ws = null
      }

      const port = await this.getPort()
      this.ws = new WebSocket(`ws://localhost:${port}`)

      await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Connection timeout')), 3000)
        this.ws.onopen = () => {
          clearTimeout(t)
          console.log(`REACT: port: ${port}`)
          resolve()
        }
        this.ws.onerror = (e) => {
          clearTimeout(t)
          reject(e)
        }
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          console.log(data)
          if (this.onMessageCallback) this.onMessageCallback(data)
        }
        const sock = this.ws
        sock.onclose = () => {
          if (this.ws === sock) this.ws = null
          this._connectPromise = null
        }
      })
    })()

    try {
      await this._connectPromise
    } catch (e) {
      this._connectPromise = null
      throw e
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  sendConnectPeer(publicKeyHex) {
    const key = publicKeyHex.trim().replace(/^0x/i, '').replace(/\s+/g, '')
    if (!key) return
    this.send(`/${key}`)
  }

  onMessage(callback) {
    this.onMessageCallback = callback
  }
}

export default new P2PBridge()
