import express from "express";
import multer from "multer";
import cors from "cors";
import "dotenv/config";
import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract";

const region = process.env.AWS_REGION;

if (!region) {
  throw new Error("AWS_REGION is missing");
}

const textract = new TextractClient({
  region,
});

const app = express();
const upload = multer();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);

app.use(express.json());

app.get("/analysis", (req, res) => {
  res.send("re");
});

app.post("/analysis/new", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  try {
    const command = new AnalyzeExpenseCommand({
      Document: {
        Bytes: req.file.buffer,
      },
    });
    const result = await textract.send(command);
    console.log(result);

    res.json({
      message: "Analysis completed",
      result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Analysis failed",
    });
  }
});

app.listen(4000, () => {
  console.log("yes");
});
