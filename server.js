import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = "./dummy.pdf";
const FILE_SIZE_MB = 100;   // change to 1000 for 1GB PDF

// ---- Create a 100MB dummy PDF ----
function createDummyPDF() {
  if (fs.existsSync(FILE_PATH)) {
    console.log("Dummy PDF already exists");
    return;
  }

  console.log(`Generating ${FILE_SIZE_MB}MB dummy PDF...`);

  const fd = fs.openSync(FILE_PATH, "w");

  // Write valid PDF header
  fs.writeSync(fd, Buffer.from("%PDF-1.4\n"));

  // Write random binary chunks (1MB each)
  const chunk = Buffer.alloc(1024 * 1024); // 1MB

  for (let i = 0; i < FILE_SIZE_MB; i++) {
    fs.writeSync(fd, chunk);
  }

  fs.closeSync(fd);
  console.log("Dummy PDF generated successfully");
}

createDummyPDF();

// ---- Reject HEAD request ----
app.head("/file", (req, res) => {
  res.status(405).send("HEAD not supported");
});

// ---- GET returns full file with NO Content-Length ----
app.get("/file", (req, res) => {
  console.log("GET /file hit. Incoming headers:", req.headers);

  // Ignore Range request entirely
  // Return 200 (not 206)
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");

  // DO NOT SEND CONTENT-LENGTH → BREAKS FETCHER
  // res.setHeader("Content-Length", ...);  // INTENTIONALLY REMOVED

  const stream = fs.createReadStream(FILE_PATH);
  stream.pipe(res);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Dummy PDF server is running. Use /file to download.");
});

app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
