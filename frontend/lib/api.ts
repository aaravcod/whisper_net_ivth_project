const BASE_URL = "http://localhost:4000"

export async function startSession(type: string, mode: string) {
  const res = await fetch(`${BASE_URL}/whisper/session/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ type, mode })
  })

  if (!res.ok) throw new Error("Failed to start session")
  return res.json()
}

export async function handshake(sessionId: string) {
  const res = await fetch(`${BASE_URL}/whisper/session/handshake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessionId })
  })

  if (!res.ok) throw new Error("Handshake failed")
  return res.json()
}

export async function sendPacket(sessionId: string, command: string, data: string) {
  const res = await fetch(`${BASE_URL}/whisper/session/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId,
      command,
      data
    })
  })

  if (!res.ok) throw new Error("Send failed")
  return res.json()
}