export function handleAttendance(packet, session) {

  const studentId = packet.data;

  const record = {
    type: "ATTEND",
    studentId,
    timestamp: Date.now()
  };

  session.messages.push(record);

  return {
    status: "attendance_recorded",
    studentId
  };
}