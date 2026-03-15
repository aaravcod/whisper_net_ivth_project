import { handleChat } from "../handlers/chat.handler.js";
import { handleAttendance } from "../handlers/attendance.handler.js";
import { handleMedical } from "../handlers/medical.handler.js";
import { handleSOS } from "../handlers/sos.handler.js";

export async function routePacket(packet, session) {

  switch (packet.command) {
    case "CHAT":
      return handleChat(packet, session);

    case "ATTEND":
      return handleAttendance(packet, session);

    case "MEDICAL":
      return handleMedical(packet, session);

    case "SOS":
      return handleSOS(packet, session);

    default:
      return { error: "Unknown command" };
  }
}