# AI Mystery Room — SPEC

## 1. Overview
AI-powered detective mystery game. User enters a premise + difficulty,
Gemini generates a unique case (suspects, clues, hints). User investigates,
requests hints, accuses a suspect. Backend validates, scores, and reveals
the culprit + explanation.

## 2. Tech Stack
- Frontend: React + Vite + Tailwind CSS, react-router-dom, axios
- Backend: Node.js + Express + MongoDB (Mongoose)
- AI: Gemini 2.0 Flash via @google/genai
- Validation: Zod
- Module system: ES modules (`"type": "module"` in both package.json files)

## 3. Difficulty Config
| Difficulty | Suspects | Clues | Hints | Base Points |
|------------|----------|-------|-------|-------------|
| easy       | 3        | 5     | 2     | 100         |
| medium     | 4        | 7     | 3     | 150         |
| hard       | 5        | 9     | 3     | 200         |

## 4. Scoring Rules (backend only)
- Correct accusation: +base points (100/150/200)
- Each discovered clue: +5
- Each used hint: -10
- Minimum score: 0
- Wrong accusation: base = 0 (but clue/hint bonuses/penalties still apply)

## 5. Database Model — Case
- title: String, required
- story: String, required
- difficulty: String enum ["easy","medium","hard"], required
- suspects: [{ id, name, description }]
- clues: [{ id, text }]
- hints: [String]
- culpritId: String, required  ← SECRET
- solution: String, required   ← SECRET
- discoveredClues: [String], default []
- usedHints: [Number], default []
- accusation: String | null, default null
- isCorrect: Boolean | null, default null
- score: Number, default 0
- isSolved: Boolean, default false
- timestamps: true

## 6. API Endpoints

### POST /api/cases
Body: { premise: string (min 5 chars), difficulty: "easy"|"medium"|"hard" }
Response 201: { id: string }
Errors: 400 invalid premise/difficulty, 500 generation failed

### GET /api/cases/:id
Response 200: public case view (see Security Rule)
Errors: 404 not found, 500 server error

### POST /api/cases/:id/clues/:clueId/discover
Response 200: { discoveredClues: [string], clue: { id, text } }
Errors: 404 case/clue not found

### POST /api/cases/:id/hints
Response 200: { hintIndex: number, hint: string }
Errors: 400 no more hints, 404 case not found

### POST /api/cases/:id/accuse
Body: { suspectId: string }
Response 200: { isCorrect, culpritId, culpritName, solution, score }
Errors: 400 already solved, 404 not found

### GET /api/cases/:id/result
Response 200: { isCorrect, culpritId, culpritName, solution, score }
Errors: 403 not solved yet, 404 not found

## 7. 🔒 SECURITY RULE (CRITICAL)
`culpritId` and `solution` MUST NEVER appear in any API response
EXCEPT `POST /api/cases/:id/accuse` and `GET /api/cases/:id/result`,
and ONLY after `isSolved === true`.

The `GET /api/cases/:id` response must use a `toPublic()` transform that
strips these two fields. Undiscovered clue text is replaced with
"??? Undiscovered clue". Unrevealed hints are replaced with "Hidden hint".

## 8. Gemini Output Shape (strict JSON)
{
  "title": "string",
  "story": "string (3-5 sentences, noir tone)",
  "suspects": [{ "id": "s1", "name": "string", "description": "string" }],
  "clues":    [{ "id": "c1", "text": "string" }],
  "hints":    ["string"],
  "culpritId": "s2",
  "solution": "string explaining why using at least 2 clues"
}

Validation (via Zod + manual):
- suspects.length === difficulty.suspects
- clues.length === difficulty.clues
- hints.length === difficulty.hints
- culpritId must match one of suspects[].id
- solution must reference at least 2 clues

## 9. Frontend Routes
- /                  → Home
- /create            → CreateMystery
- /case/:id          → Investigation
- /case/:id/accuse   → Accusation
- /case/:id/result   → Results

## 10. Acceptance Criteria
- All 3 difficulties generate cases
- Clues, hints, accusations, scoring work end-to-end
- culpritId + solution never leak before accusation (verify in Network tab)
- Score computed on backend only
- Results show correct culprit + explanation
- App works on deployed URLs (Vercel frontend + Render backend)I've added SPEC.md at the repo root. Please read it now and confirm:

1. The security rule in one line
2. The exact difficulty config table
3. The scoring formula

Then proceed to build `server/index.js` only.

Requirements:
- ES modules
- import "dotenv/config" first
- Express on PORT (default 5000)
- CORS: origin process.env.CLIENT_URL || "*"
- express.json()
- GET / → { status: "ok" }
- Mount casesRouter from "./routes/cases.js" at "/api/cases"
- mongoose.connect(process.env.MONGODB_URI)
- On success: log "✅ MongoDB connected" then app.listen(PORT)
- On error: log error.message, process.exit(1)
- Do NOT create routes/cases.js yet

Explain in 2 lines what each middleware does.