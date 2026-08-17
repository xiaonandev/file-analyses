import { Router } from "express";
import multer from "multer";
import { prisma } from "../db.js";

const analysesRouter: Router = Router();
const upload = multer();

analysesRouter.get("/", async (req, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: {
        createdAt: "desc",
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

analysesRouter.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  // const mockResult = {
  //   id: 1,
  //   vendorName: "Adobe Systems",
  //   invoiceNumber: "INV-2026-0817",
  //   invoiceDate: "2026-08-10",
  //   dueDate: "2026-09-10",
  //   currency: "EUR",
  //   subtotal: 120,
  //   tax: 25.2,
  //   total: 145.2,
  // };
  const mockRes = {
    externalJobId: "mock-job-123",
  };
  try {
    // const command = new AnalyzeExpenseCommand({
    //   Document: {
    //     Bytes: req.file.buffer,
    //   },
    // });
    // const result = await textract.send(command);
    // console.log(result);

    // res.json({
    //   message: "Analysis completed",
    //   result,
    // });

    const analysis = await prisma.analysis.create({
      data: {
        title: req.file.originalname,
        externalJobId: mockRes.externalJobId,
      },
    });

    res.status(201).json(analysis);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Analysis failed",
    });
  }
});

export default analysesRouter;
