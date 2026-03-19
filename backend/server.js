import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import whisperRoutes from "./routes/whisper.routes.js";
import classRoutes from "./routes/class.routes.js"


const app = express();

app.use(cors());
app.use(express.json());
app.use("/classes", classRoutes)
/* START PYTHON MATLAB SERVICE */

const pythonProcess = spawn("python", ["./matlab-service/server.py"], {
  stdio: "inherit"
});

pythonProcess.on("error", (err) => {
  console.error("Failed to start Python MATLAB service:", err);
});

/* ROUTES */

app.use("/whisper", whisperRoutes);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`WhisperNet backend running on port ${PORT}`);
});