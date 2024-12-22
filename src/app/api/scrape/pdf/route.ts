import { NextRequest } from "next/server";
import pdf from "pdf-parse/lib/pdf-parse.js";

export interface PdfScrapeRequest {
  url: string;
}

// Handle unsupported methods
export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { url } = body as PdfScrapeRequest;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Fetch the PDF file
    const pdfResponse = await fetch(url, {
      headers: {
        "Accept": "application/pdf",
      },
    });

    if (!pdfResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch PDF",
          details: `Status: ${pdfResponse.status} ${pdfResponse.statusText}` 
        }), 
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check content type
    const contentType = pdfResponse.headers.get("content-type");
    if (!contentType?.includes("application/pdf")) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid content type",
          details: `Expected PDF but got ${contentType}` 
        }), 
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Convert the response to ArrayBuffer
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF with options to avoid test file dependency
    const data = await pdf(buffer, {
      max: 0, // No page limit
      version: "default"
    });

    return new Response(JSON.stringify({ text: data.text }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : String(error)
      }), 
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
