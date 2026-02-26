import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/generate-letter", async (req, res) => {
  const { recipient, sender, tone, personalNote, selectedPoints } = req.body;

  if (!recipient || !sender || !selectedPoints || selectedPoints.length < 3) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // --- START API KEY CHECK ---
  const possibleKeys = [
    process.env.API_KEY,               // Where Google Cloud integration puts it
    process.env.GOOGLE_API_KEY,
    process.env.GEMINI_API_KEY,        // Where your secret ghost might be
    process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ];

  // Scan all variables and grab the first one that exists
  const validKey = possibleKeys.find(key => key && key.trim().length > 0);
  const apiKey = validKey ? validKey.trim() : "";

  if (!apiKey) {
    return res.status(500).json({
      error: "Could not find a valid API key. Please check your Secrets panel and make sure a valid Google API key is entered."
    });
  }
  // --- END API KEY CHECK ---

  console.log(`[DEBUG] Successfully loaded API Key. Length: ${apiKey.length}`);

  try {
    const ai = new GoogleGenAI({ apiKey });

    const isGovHealey = recipient?.name?.includes("Maura Healey");
    const isSelectBoard = recipient?.name?.includes("Wellesley Select Board");

    const salutation = isSelectBoard
      ? "Dear Wellesley Select Board,"
      : `Dear ${recipient?.name || 'Recipient'},`;

    const govHealeyInstruction = isGovHealey
      ? `You MUST include this exact sentence naturally in the body: "Maura Healey’s goal of 30% State Designated Conservation Land by 2030 is sorely needed in Wellesley’s Tree City."`
      : "";

    const pointsText = selectedPoints
      .map((p: any, i: number) => `${i + 1}. ${p.title}: ${p.text}`)
      .join("\n");

    const prompt = `
You are writing an advocacy letter to protect the "MassBay Forest / Centennial Park parcel" from development.
The letter must be concise, human, and natural. No filler.
Tone: ${tone}

Sender Info:
Name: ${sender.name}
Town: ${sender.town}
State: ${sender.state}

Recipient:
${recipient?.name || 'Recipient'}

Salutation to use:
${salutation}

Key Theme to incorporate:
"the strong sense of community that the MassBay Forest provides to repeat visitors"

Talking Points to incorporate (prioritize the first ones):
${pointsText}

Personal Note from Sender (incorporate if provided):
${personalNote || "None"}

${govHealeyInstruction}

STRICT REQUIREMENTS:
1. Length MUST be between 150 and 200 words. Do not exceed 200 words.
2. Must include today's date at the top in the format "Month DD, YYYY".
3. Must start with the exact salutation provided above.
4. Must end exactly with:
Sincerely,
${sender.name}
${sender.town}, ${sender.state}
5. Do not leave any blanks or placeholders.
6. Do not invent new facts outside of the provided talking points.
`;

    const generateWithRetry = async (currentPrompt: string, attempt: number = 1): Promise<string> => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: currentPrompt,
      });
      
      let text = response.text || "";
      let wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

      if (attempt === 1) {
        if (wordCount > 200) {
          return generateWithRetry(currentPrompt + "\n\nTHE PREVIOUS GENERATION WAS TOO LONG (" + wordCount + " words). You MUST shorten it to be under 200 words while keeping the exact same structure and closing.", 2);
        } else if (wordCount < 150) {
          return generateWithRetry(currentPrompt + "\n\nTHE PREVIOUS GENERATION WAS TOO SHORT (" + wordCount + " words). You MUST expand it slightly to be at least 150 words while staying concise.", 2);
        }
      }

      return text;
    };

    const letter = await generateWithRetry(prompt);
    res.json({ letter });
  } catch (error: any) {
    console.error("Gemini error:", error);
    let errorMessage = error.message || "Failed to generate letter";
    
    if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not valid")) {
      errorMessage = "The Gemini API key provided is invalid. Please check your Secrets panel and enter a valid Google Gemini API key.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/track", async (req, res) => {
  const { METRICS_WEBAPP_URL, METRICS_TOKEN } = process.env;
  
  if (!METRICS_WEBAPP_URL || !METRICS_TOKEN) {
    return res.status(500).json({ error: "Tracking configuration missing" });
  }

  const { town, state, recipient, mode, points_count } = req.body;

  if (!town || typeof town !== 'string' || town.trim() === '') {
    return res.status(400).json({ error: "Town is required" });
  }

  const finalState = (!state || typeof state !== 'string' || state.trim() === '') ? "MA" : state.trim();

  try {
    const response = await fetch(`${METRICS_WEBAPP_URL}?token=${METRICS_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        town: town.trim(),
        state: finalState,
        recipient,
        mode,
        points_count
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Tracking error:", error);
    res.status(500).json({ error: "Failed to track metrics" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // Global error handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      next(err);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();