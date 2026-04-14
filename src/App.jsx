import { useEffect, useRef, useState } from 'react'
import bridge from '../core/bridge'
import './App.css'

function shortKey(hex) {
  if (!hex || hex.length < 16) return hex || '…'
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`
}

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [peerKey, setPeerKey] = useState('')
  const [selfKey, setSelfKey] = useState(null)
  const [chats, setChats] = useState({})
  const [activeKey, setActiveKey] = useState(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    bridge.connect().catch(console.error)
    bridge.onMessage((msg) => {
      if (msg.event === 'self' && msg.data?.publicKey) {
        setSelfKey(msg.data.publicKey)
        return
      }
      if (msg.event === 'peer_connected' && msg.data?.peerKey) {
        const k = msg.data.peerKey
        setChats((prev) => ({
          ...prev,
          [k]: {
            connected: true,
            messages: prev[k]?.messages ?? []
          }
        }))
        setActiveKey(k)
        return
      }
      if (msg.event === 'peer_disconnected' && msg.data?.peerKey) {
        const k = msg.data.peerKey
        setChats((prev) => {
          if (!prev[k]) return prev
          return {
            ...prev,
            [k]: { ...prev[k], connected: false }
          }
        })
        return
      }
      if (msg.event === 'message' && msg.data?.from != null) {
        const from = msg.data.from
        const text =
          msg.data.text != null ? String(msg.data.text) : ''
        const ts = msg.data.timestamp ?? Date.now()
        setChats((prev) => {
          const cur = prev[from] ?? { connected: true, messages: [] }
          return {
            ...prev,
            [from]: {
              ...cur,
              messages: [
                ...cur.messages,
                {
                  id: `${ts}-${Math.random().toString(36).slice(2)}`,
                  text,
                  ts,
                  mine: false
                }
              ]
            }
          }
        })
      }
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeKey, chats])

  useEffect(() => {
    if (!modalOpen) return
    const t = requestAnimationFrame(() => inputRef.current?.focus())
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(t)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen])

  function openModal() {
    setPeerKey('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setPeerKey('')
  }

  function confirmConnect() {
    const key = peerKey.trim()
    if (!key) {
      inputRef.current?.focus()
      return
    }
    bridge.sendConnectPeer(key)
    closeModal()
  }

  function sendMessage(e) {
    e.preventDefault()
    const k = activeKey
    const text = draft.trim()
    if (!k || !text) return
    if (!chats[k]?.connected) return
    const ts = Date.now()
    bridge.sendChat(k, text)
    setDraft('')
    setChats((prev) => {
      const cur = prev[k] ?? { connected: true, messages: [] }
      return {
        ...prev,
        [k]: {
          ...cur,
          messages: [
            ...cur.messages,
            {
              id: `${ts}-${Math.random().toString(36).slice(2)}`,
              text,
              ts,
              mine: true
            }
          ]
        }
      }
    })
  }

  const peerIds = Object.keys(chats)
  const active = activeKey ? chats[activeKey] : null
  const showChat = activeKey && active

  return (
    <div className="app-shell">
      {selfKey ? (
        <div className="self-bar">
          <span className="self-bar__label">Вы:</span>
          <code className="self-bar__key">{shortKey(selfKey)}</code>
        </div>
      ) : null}

      {showChat ? (
        <section className="chat-panel" aria-label="Чат">
          {peerIds.length > 1 ? (
            <div className="chat-tabs" role="tablist">
              {peerIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={id === activeKey}
                  className={
                    id === activeKey ? 'chat-tab chat-tab--active' : 'chat-tab'
                  }
                  onClick={() => setActiveKey(id)}
                >
                  {shortKey(id)}
                  {!chats[id]?.connected ? (
                    <span className="chat-tab__off" title="Нет соединения" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <header className="chat-header">
              <h2 className="chat-header__title">{shortKey(activeKey)}</h2>
              {!active.connected ? (
                <span className="chat-header__status">нет соединения</span>
              ) : null}
            </header>
          )}

          {peerIds.length > 1 && activeKey && !chats[activeKey]?.connected ? (
            <div className="chat-subhead">
              <span className="chat-header__status">нет соединения</span>
            </div>
          ) : null}

          <div className="chat-messages">
            {(active.messages ?? []).map((m) => (
              <div
                key={m.id}
                className={
                  m.mine ? 'chat-bubble chat-bubble--mine' : 'chat-bubble'
                }
              >
                <span className="chat-bubble__text">{m.text}</span>
                <span className="chat-bubble__time">
                  {new Date(m.ts).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-compose" onSubmit={sendMessage}>
            <input
              className="chat-compose__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Сообщение…"
              disabled={!active.connected}
              autoComplete="off"
            />
            <button
              type="submit"
              className="chat-compose__send"
              disabled={!active.connected || !draft.trim()}
            >
              Отправить
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="fab-add"
        aria-label="Добавить контакт"
        onClick={openModal}
      >
        +
      </button>

      {modalOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-peer-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-peer-title" className="modal-title">
              Подключение к пиру
            </h2>
            <label className="modal-label" htmlFor="peer-key-input">
              Ключ собеседника
            </label>
            <input
              id="peer-key-input"
              ref={inputRef}
              className="modal-input"
              type="text"
              value={peerKey}
              onChange={(e) => setPeerKey(e.target.value)}
              placeholder="Вставьте публичный ключ (hex)"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={closeModal}
              >
                Отмена
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={confirmConnect}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
