import express from "express";
import {
  createSession,
  activateSession,
  closeSession,
  getSession
} from "../services/session.service.js";

import { transmitPacket } from "../services/transport.service.js";
import { parsePacket } from "../services/protocol.service.js";
import { routePacket } from "../services/router.service.js";

const router = express.Router();


router.post("/session/init", (req, res) => {
  const { type, mode } = req.body;
  const session = createSession(type, mode);
  res.json(session);
});


router.post("/session/handshake", (req, res) => {
  const { sessionId } = req.body;
  const session = activateSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json({ status: "ACTIVE", session });
});


router.post("/session/send", async (req, res) => {
  const { sessionId, command, data } = req.body;

  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.status !== "ACTIVE") {
    return res.status(400).json({ error: "Session not active" });
  }

  const packet = `${sessionId}|${command}|${data}`;

  try {
    const decoded = await transmitPacket(packet);
    const parsed = parsePacket(decoded);

    if (parsed.error) {
      return res.status(400).json(parsed);
    }

    const result = await routePacket(parsed, session);

    res.json({
      packet,
      decoded,
      result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/session/end", (req, res) => {
  const { sessionId } = req.body;
  const session = closeSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json({ status: "CLOSED", session });
});


router.post('/register', (req, res) => {
  const { username, deviceId } = req.body;

  if (!username || !deviceId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  global.activeUsers[username] = deviceId;

  res.json({ success: true, users: Object.keys(global.activeUsers) });
});

router.get('/users', (req, res) => {
  res.json({ users: Object.keys(global.activeUsers) });
});


router.post('/send', (req, res) => {
  const { type, payload } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  const message = {
    id: Date.now(),
    type,
    decoded: payload,
    timestamp: new Date().toISOString()
  };

  global.messageQueue.push(message);

  res.json({ success: true });
});


router.get('/listen', (req, res) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).json({ error: 'User required' });
  }

  const userMessages = global.messageQueue.filter(
    msg => msg.decoded?.to === user
  );

  global.messageQueue = global.messageQueue.filter(
    msg => msg.decoded?.to !== user
  );

  res.json({ messages: userMessages });
});

export default router;