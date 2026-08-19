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

app.listen(4000, () => {
  console.log("Server running at http://localhost:4000");
});
