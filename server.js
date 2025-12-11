import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = "./dummy.pdf";

// Generate 100MB dummy PDF if not exists
function createDummyPDF() {
  if (fs.existsSync(FILE_PATH)) return;

  const size = 100 * 1024 * 1024; // 100MB
  const fd = fs.openSync(FILE_PATH, "w");

  // Minimal PDF header
  fs.writeSync(fd, Buffer.from("%PDF-1.4\n"));

  // Fill rest with zeros
  const chunk = Buffer.alloc(1024 * 1024); // 1MB at a time
  for (let i = 0; i < 400; i++) {
    fs.writeSync(fd, chunk);
  }

  fs.closeSync(fd);
  console.log("Generated 400MB dummy PDF");
}

createDummyPDF();

// Reject HEAD requests
app.head("/file", (req, res) => {
  return res.status(405).send("HEAD not supported");
});

// Return full file always (ignore Range)
app.get("/file", (req, res) => {
  console.log("Incoming GET request headers:", req.headers);

  // Always ignore Range
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", fs.statSync(FILE_PATH).size);

  const stream = fs.createReadStream(FILE_PATH);
  stream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
