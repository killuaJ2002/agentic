import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello there!" });
});

app.listen(port, () => {
  console.log(`Server running on PORT ${port}`);
});
