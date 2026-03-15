export function handleSOS(packet, session) {

  const location = packet.data;

  const alert = {
    type: "SOS",
    location,
    timestamp: Date.now(),
    severity: "HIGH"
  };

  session.messages.push(alert);

  return {
    status: "sos_alert_triggered",
    location
  };
}