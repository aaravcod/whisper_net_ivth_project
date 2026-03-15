export function handleChat(packet, session) {

  const message = {
    type: "CHAT",
    content: packet.data,
    timestamp: Date.now()
  };

  session.messages.push(message);

  return {
    status: "message_received",
    message
  };
}