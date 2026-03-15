import fetch from "node-fetch";

export async function transmitPacket(packet) {

  const response = await fetch("http://localhost:5001/process", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ packet })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.decoded;
}