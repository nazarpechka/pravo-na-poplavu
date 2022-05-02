import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const publicPath = path.join(__dirname, "..", "build");
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(port, () => {
  console.log("Server is up!");
});
