import mongoose from "mongoose";

const suspectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const clueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const caseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    story: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    suspects: [suspectSchema],
    clues: [clueSchema],
    hints: [String],
    culpritId: { type: String, required: true },
    solution: { type: String, required: true },
    discoveredClues: { type: [String], default: [] },
    usedHints: { type: [Number], default: [] },
    accusation: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    score: { type: Number, default: 0 },
    isSolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Case", caseSchema);
