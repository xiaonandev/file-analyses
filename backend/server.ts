import express from "express";
import cors from "cors";
import "dotenv/config";
import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract";
import analysesRouter from "./routes/analyses.js";

const region = process.env.AWS_REGION;

if (!region) {
  throw new Error("AWS_REGION is missing");
}

const textract = new TextractClient({
  region,
});

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);

app.use(express.json());

app.use("/analyses", analysesRouter);

app.listen(4000, () => {
  console.log("yes");
});
