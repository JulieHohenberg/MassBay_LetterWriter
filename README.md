# MassBay Forest Advocacy App

Life moves fast. This heuristic-powered tool helps you turn your thoughts into words quickly, clearly, and respectfully, while staying true to your voice. The web application enables Massachusetts residents to generate and send advocacy letters in support of protecting the MassBay Forest / Centennial Park parcel. This version uses a heuristic-based approach to keep costs low for nonprofit purposes, though an API key could be integrated in the future to produce more tailored and polished letters.

Access the heuristic-powered letter writer [here](https://massbay-forest-advocacy-app-562854066221.us-west1.run.app)!

*Note: you can also access the Gemini-powered letter writer (separate website) [here](https://ma-advocacy-letter-a-r9xi.bolt.host/).*

## Features
- **Step 1:** Select and rank talking points from a predefined list.
- **Step 2:** Choose recipients (High-priority targets or manually enter MA legislators).
- **Step 3:** Generate a concise, personalized letter using a heuristic, phrase-bank-based engine and easily copy, download, or email it.

## Tech Stack
- React 19 + TypeScript
- Vite + Express (Full-stack setup for metrics tracking)
- Tailwind CSS
- Heuristic Letter Engine (Client-side generation)

## How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## How to Deploy (Vercel Recommended)

While this app uses a custom Express server for local development, you can easily adapt it for Vercel by moving any required API routes (like `/api/track`) to Vercel Serverless Functions (`api/` directory) or by deploying it as a Node.js app on platforms like Render or Heroku.

To deploy on Vercel as a standard Vite app with serverless functions:
1. Move the logic from `server.ts` into `api/track.ts` (if you are using the tracking endpoint).
2. Push your code to GitHub.
3. Import the project in Vercel.
4. Deploy!
