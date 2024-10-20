const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { parseStatement } = require("./parsers");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");

// Serve the upload page
app.get("/", (req, res) => {
  res.render("index", { transactions: null });
});

// Handle file uploads and parsing
app.post("/upload", upload.single("statement"), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Failed to read file.");

    try {
      const transactions = parseStatement(data);
      res.render("index", { transactions });
    } catch (error) {
      res.status(400).send(`Error: ${error.message}`);
    } finally {
      fs.unlinkSync(filePath); // Delete the uploaded file
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
