import express from "express";
import cors from "cors";
import "dotenv/config";
import { runAgent } from "./agent.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Missing query in request body." });
    }
    const output = await runAgent(query);
    res.status(200).json({ output });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to process input" });
  }
});
app.get("/", (req, res) => {
  res.status(200).json({ message: "Post request kr bhadwe" });
});
app.listen(port, () => {
  console.log(`Server running on PORT ${port}`);
});
