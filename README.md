# MassBay Forest Advocacy App

A clean, elderly-friendly web application to help Massachusetts residents generate and send advocacy letters to protect the MassBay Forest / Centennial Park parcel.

## Features
- **Step 1:** Select and rank talking points from a predefined list.
- **Step 2:** Choose recipients (High-priority targets or manually enter MA legislators).
- **Step 3:** Generate a concise, personalized letter using Google Gemini AI and easily copy, download, or email it.

## Tech Stack
- React 19 + TypeScript
- Vite + Express (Full-stack setup)
- Tailwind CSS
- Google Gemini API (`@google/genai`)

## How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## How to Deploy (Vercel Recommended)

While this app uses a custom Express server for local development, you can easily adapt it for Vercel by moving the API routes to Vercel Serverless Functions (`api/` directory) or by deploying it as a Node.js app on platforms like Render or Heroku.

To deploy on Vercel as a standard Vite app with serverless functions:
1. Move the logic from `server.ts` into `api/generate-letter.ts`.
2. Push your code to GitHub.
3. Import the project in Vercel.
4. Add `GEMINI_API_KEY` to your Vercel Environment Variables.
5. Deploy!
