import express from "express";
import cors from "cors";
import "dotenv/config";
import analysesRouter from "./routes/analyses.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);

app.use(express.json());

app.use("/analyses", analysesRouter);

const port = Number(process.env.PORT) || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
