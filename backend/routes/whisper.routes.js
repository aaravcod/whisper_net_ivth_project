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

/* INIT */
router.post("/session/init", (req, res) => {
  const { type, mode } = req.body;
  const session = createSession(type, mode);
  res.json(session);
});

/* HANDSHAKE */
router.post("/session/handshake", (req, res) => {
  const { sessionId } = req.body;
  const session = activateSession(sessionId);

  if (!session) return res.status(404).json({ error: "Session not found" });

  res.json({ status: "ACTIVE", session });
});

/* SEND */
router.post("/session/send", async (req, res) => {
  const { sessionId, command, data } = req.body;

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (session.status !== "ACTIVE")
    return res.status(400).json({ error: "Session not active" });

  const packet = `${sessionId}|${command}|${data}`;

  try {
    const decoded = await transmitPacket(packet);

    const parsed = parsePacket(decoded);
    if (parsed.error) return res.status(400).json(parsed);

    const result = await routePacket(parsed, session);

    res.json({ packet, decoded, result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* END */
router.post("/session/end", (req, res) => {
  const { sessionId } = req.body;
  const session = closeSession(sessionId);

  if (!session) return res.status(404).json({ error: "Session not found" });

  res.json({ status: "CLOSED", session });
});

export default router;