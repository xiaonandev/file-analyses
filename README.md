# Invoice Analyser

A full-stack invoice analysis application built with Next.js, Express, PostgreSQL, and AWS.

## Features

- Upload PNG and JPEG invoice images
- Store source images in a private S3 bucket
- Extract invoice fields with Textract Expense Analysis
- Track asynchronous jobs with frontend polling
- Preview the original image and extracted result together
- Edit and save the title and extracted fields
- List and delete previous analyses

## How it works

`Upload → S3 → Textract job → Polling → PostgreSQL → Review and edit`

When an image is uploaded, the Express backend stores it in S3 and starts an asynchronous Textract job. Textract returns a job ID, which is saved with a `processing` analysis record.

The frontend then polls the backend. Once Textract finishes, the backend saves the extracted fields to PostgreSQL and changes the status to `completed`. The result is displayed automatically and can be edited by the user.

## Tech stack

Next.js · React · TypeScript · Tailwind CSS · Express · PostgreSQL · Prisma · Amazon S3 · Amazon Textract

## Screenshots

### Analysis list

![Analysis list showing processing and completed invoices](frontend/public/screenshot-2.png)

### Invoice review and editing

![Invoice image preview and editable extracted fields](frontend/public/screenshot-1.png)
