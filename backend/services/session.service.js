const sessions = new Map();

export function createSession(type, mode) {
  const sessionId = "sess_" + Math.random().toString(36).substring(2, 10);

  const session = {
    id: sessionId,
    type,
    mode,
    status: "INITIATED",
    createdAt: Date.now(),
    messages: []
  };

  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId) {
  return sessions.get(sessionId);
}

export function activateSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  session.status = "ACTIVE";
  return session;
}

export function closeSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  session.status = "CLOSED";
  return session;
}