import { NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });

    return NextResponse.json({ text: result.value });
  } catch (error) {
    console.error("Error extracting DOC text:", error);
    return NextResponse.json(
      { error: "Failed to extract text from DOC" },
      { status: 500 }
    );
  }
}
