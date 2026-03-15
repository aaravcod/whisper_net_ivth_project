export function handleMedical(packet, session) {

  const patientId = packet.data;

  const record = {
    type: "MEDICAL_REQUEST",
    patientId,
    timestamp: Date.now()
  };

  session.messages.push(record);

  return {
    status: "medical_request_received",
    patientId
  };
}