import express from "express";
import cors from "cors";
import "dotenv/config";
import { runLLM } from "./agent.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res
        .status(400)
        .json({ message: "Missing input in request body." });
    }
    const output = await runLLM(input);
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
