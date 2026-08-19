import { Router } from "express";
import multer from "multer";
import { prisma } from "../db.js";
import {
  deleteDocumentFromS3,
  getDocumentFromS3,
  uploadDocumentToS3,
  type S3ObjectLocation,
} from "../aws/s3.js";
import { getExpenseAnalysis, startExpenseAnalysis } from "../aws/textract.js";
import type { InvoiceContent } from "../aws/textract.js";

const analysesRouter: Router = Router();
const allowedImageTypes = new Set(["image/jpeg", "image/png"]);
const upload = multer({
  fileFilter: (_req, file, callback) => {
    callback(null, allowedImageTypes.has(file.mimetype));
  },
});

analysesRouter.get("/", async (req, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.json(analyses);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to get analyses.",
    });
  }
});

analysesRouter.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Upload a JPEG or PNG image.",
    });
  }
  let s3Object: S3ObjectLocation | null = null;

  try {
    s3Object = await uploadDocumentToS3(req.file);
    const externalJobId = await startExpenseAnalysis(s3Object);

    const analysis = await prisma.analysis.create({
      data: {
        title: req.file.originalname,
        externalJobId,
        s3Key: s3Object.key,
        mimeType: req.file.mimetype,
      },
    });

    res.status(201).json({
      ...analysis,
      s3Key: s3Object.key,
    });
  } catch (err) {
    console.error(err);
    if (s3Object) {
      try {
        await deleteDocumentFromS3(s3Object.key);
      } catch (cleanupError) {
        console.error("Failed to clean up S3 object", cleanupError);
      }
    }
    res.status(500).json({
      message: "Analysis failed",
    });
  }
});

analysesRouter.get("/:id", async (req, res) => {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!analysis) {
      return res.status(404).json({
        error: "Analysis not found",
      });
    }

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to get analysis.",
    });
  }
});

analysesRouter.get("/:id/document", async (req, res) => {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { title: true, s3Key: true, mimeType: true },
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (!analysis.s3Key) {
      return res.status(404).json({
        message: "The source document is unavailable for this older analysis.",
      });
    }

    const document = await getDocumentFromS3(analysis.s3Key);
    const bytes = await document.Body?.transformToByteArray();

    if (!bytes) {
      return res.status(404).json({ message: "Source document is empty." });
    }

    res.setHeader(
      "Content-Type",
      document.ContentType ?? analysis.mimeType ?? "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(analysis.title)}`,
    );
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get source document." });
  }
});

analysesRouter.patch("/:id", async (req, res) => {
  try {
    const content = req.body?.content as InvoiceContent | undefined;
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ message: "Valid invoice content is required." });
    }

    if (!title) {
      return res.status(400).json({ message: "Document title is required." });
    }

    const existingAnalysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { status: true },
    });

    if (!existingAnalysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (existingAnalysis.status !== "completed") {
      return res.status(409).json({
        message: "Only completed analyses can be edited.",
      });
    }

    const analysis = await prisma.analysis.update({
      where: { id: req.params.id },
      data: { title, content },
    });

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update analysis." });
  }
});

analysesRouter.delete("/:id", async (req, res) => {
  try {
    const analysis = await prisma.analysis.delete({
      where: {
        id: req.params.id,
      },
    });
    if (!analysis) {
      return res.status(404).json({
        error: "Analysis not found",
      });
    }

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to delete analysis.",
    });
  }
});

analysesRouter.post("/:id/check-status", async (req, res) => {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!analysis) {
      return res.status(404).json({
        message: "Analysis not found.",
      });
    }

    if (analysis.status !== "processing") {
      return res.json(analysis);
    }

    const textractResult = await getExpenseAnalysis(analysis.externalJobId);

    if (textractResult.status === "processing") {
      return res.json(analysis);
    }

    if (textractResult.status === "failed") {
      const failedAnalysis = await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: "failed" },
      });

      return res.json(failedAnalysis);
    }

    const completedAnalysis = await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: "completed",
        content: textractResult.content,
      },
    });

    res.json(completedAnalysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to check analysis status.",
    });
  }
});
export default analysesRouter;
