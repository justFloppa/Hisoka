import { useEffect, useRef, useState } from 'react'
import bridge from '../core/bridge'
import './App.css'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [peerKey, setPeerKey] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    bridge.connect().catch(console.error)
    bridge.onMessage((msg) => {
      console.log('New message:', msg)
    })
  }, [])

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

  return (
    <div className="app-shell">
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
