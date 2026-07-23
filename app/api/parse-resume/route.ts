import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai-providers";
import type { AIProviderName } from "@/lib/ai-providers/types";

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get("__session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { downloadURL, provider } = body as {
      downloadURL: string;
      provider: AIProviderName;
    };

    if (!downloadURL || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: downloadURL and provider" },
        { status: 400 }
      );
    }

    const validProviders: AIProviderName[] = [
      "gemini",
      "azure-openai",
      "bedrock-claude",
    ];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid AI provider" },
        { status: 400 }
      );
    }

    const pdfResponse = await fetch(downloadURL);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDF from storage" },
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    if (pdfBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit" },
        { status: 413 }
      );
    }

    const aiProvider = getProvider(provider);
    const parsedData = await aiProvider.parseResume(pdfBuffer);

    return NextResponse.json({ success: true, parsedData });
  } catch (error) {
    console.error("Resume parsing error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
