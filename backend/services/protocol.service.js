export function parsePacket(decoded) {
  const parts = decoded.split("|");

  if (parts.length < 3) {
    return { error: "Invalid packet format" };
  }

  const [sessionId, command, ...rest] = parts;
  const data = rest.join("|");

  return {
    sessionId,
    command,
    data
  };
}