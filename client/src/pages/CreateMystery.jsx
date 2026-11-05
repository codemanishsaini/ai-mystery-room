import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCase } from "../api";

export default function CreateMystery() {
  const [premise, setPremise] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await createCase(premise, difficulty);
      const id = response.data.id;
      navigate(`/case/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to generate mystery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-amber-400">Create a Mystery</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="premise" className="mb-2 block font-medium">
            Mystery premise
          </label>
          <textarea
            id="premise"
            value={premise}
            onChange={(event) => setPremise(event.target.value)}
            className="h-32 w-full resize-y rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="A priceless painting disappears during a stormy night..."
            required
            minLength={5}
          />
        </div>

        <fieldset>
          <legend className="mb-2 font-medium">Difficulty</legend>
          <div className="flex gap-3">
            {["easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`rounded-lg px-4 py-2 capitalize transition ${
                  difficulty === level
                    ? "bg-amber-500 text-slate-900 font-bold"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                aria-pressed={difficulty === level}
              >
                {level}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating mystery..." : "Generate Mystery"}
        </button>
      </form>
    </main>
  );
}
