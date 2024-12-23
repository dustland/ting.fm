import { NextResponse } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";

// Initialize PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const data = await pdf(Buffer.from(buffer));

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
