import express from "express";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"));
})
app.get("/simulate/:msg", (req, res) => {
  const msg = req.params.msg;


  exec(
    `matlab -batch "result = demo('${msg}'); disp(result);"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      res.json({ message: msg, matlab_output: stdout.trim() });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
