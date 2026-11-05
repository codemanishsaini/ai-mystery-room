import { Router } from "express";
import Case from "../models/Case.js";
import { DIFFICULTY_CONFIG, generateMystery } from "../services/gemini.js";

const router = Router();

function toPublic(caseDoc) {
  return {
    id: caseDoc._id.toString(),
    title: caseDoc.title,
    story: caseDoc.story,
    difficulty: caseDoc.difficulty,
    suspects: caseDoc.suspects,
    clues: caseDoc.clues.map((clue) => ({
      id: clue.id,
      text: caseDoc.discoveredClues.includes(clue.id)
        ? clue.text
        : "??? Undiscovered clue",
    })),
    hints: caseDoc.hints.map((hint, index) =>
      caseDoc.usedHints.includes(index) ? hint : "Hidden hint",
    ),
    discoveredClues: caseDoc.discoveredClues,
    usedHints: caseDoc.usedHints,
    isSolved: caseDoc.isSolved,
    accusation: caseDoc.accusation,
  };
}

function toResult(caseDoc) {
  const culprit = caseDoc.suspects.find(
    (suspect) => suspect.id === caseDoc.culpritId,
  );

  return {
    isCorrect: caseDoc.isCorrect,
    culpritId: caseDoc.culpritId,
    culpritName: culprit?.name,
    solution: caseDoc.solution,
    score: caseDoc.score,
  };
}

router.post("/", async (req, res) => {
  const { premise, difficulty } = req.body || {};
  if (typeof premise !== "string" || premise.trim().length < 5) {
    return res.status(400).json({ error: "Premise must be at least 5 characters" });
  }
  if (!Object.hasOwn(DIFFICULTY_CONFIG, difficulty)) {
    return res.status(400).json({ error: "Invalid difficulty" });
  }

  try {
    const mystery = await generateMystery(premise, difficulty);
    const caseDoc = await Case.create({ ...mystery, difficulty });
    return res.status(201).json({ id: caseDoc._id.toString() });
  } catch (error) {
    console.error(
      "Mystery generation failed:",
      error instanceof Error ? error.message : String(error),
    );
    return res.status(500).json({ error: "Generation failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }
    return res.json(toPublic(caseDoc));
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/clues/:clueId/discover", async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    const clue = caseDoc.clues.find((item) => item.id === req.params.clueId);
    if (!clue) {
      return res.status(404).json({ error: "Clue not found" });
    }

    if (!caseDoc.discoveredClues.includes(clue.id)) {
      caseDoc.discoveredClues.push(clue.id);
      await caseDoc.save();
    }

    return res.json({
      discoveredClues: caseDoc.discoveredClues,
      clue: { id: clue.id, text: clue.text },
    });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/hints", async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    const nextIdx = caseDoc.usedHints.length;
    if (nextIdx >= caseDoc.hints.length) {
      return res.status(400).json({ error: "No more hints" });
    }

    caseDoc.usedHints.push(nextIdx);
    await caseDoc.save();
    return res.json({ hintIndex: nextIdx, hint: caseDoc.hints[nextIdx] });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/accuse", async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }
    if (caseDoc.isSolved) {
      return res.status(400).json({ error: "Case already solved" });
    }

    const { suspectId } = req.body || {};
    const correct = caseDoc.culpritId === suspectId;
    const base = DIFFICULTY_CONFIG[caseDoc.difficulty].points;
    let score = correct ? base : 0;
    score += caseDoc.discoveredClues.length * 5;
    score -= caseDoc.usedHints.length * 10;
    if (score < 0) score = 0;

    caseDoc.accusation = suspectId ?? null;
    caseDoc.isCorrect = correct;
    caseDoc.score = score;
    caseDoc.isSolved = true;
    await caseDoc.save();

    return res.json(toResult(caseDoc));
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/result", async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }
    if (!caseDoc.isSolved) {
      return res.status(403).json({ error: "Case is not solved yet" });
    }
    return res.json(toResult(caseDoc));
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
