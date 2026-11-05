import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResult } from "../api";

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        const response = await getResult(id);
        setResult(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Could not load the result.");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [id]);

  if (loading) {
    return <main className="mx-auto max-w-3xl p-8 text-slate-300">Loading result...</main>;
  }

  if (!result) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 p-8">
        <p className="text-red-400">{error || "Result unavailable."}</p>
        <button
          type="button"
          onClick={() => navigate("/create")}
          className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300"
        >
          Play Another Mystery
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className={`text-4xl font-bold ${result.isCorrect ? "text-amber-400" : "text-red-400"}`}>
        {result.isCorrect ? "✅ Case Solved!" : "❌ Wrong Accusation"}
      </h1>
      <section className="space-y-3 rounded-xl bg-slate-800 p-6">
        <h2 className="text-xl font-semibold text-amber-300">Culprit</h2>
        <p className="text-lg">{result.culpritName}</p>
        <h2 className="pt-3 text-xl font-semibold text-amber-300">Explanation</h2>
        <p className="text-slate-300">{result.solution}</p>
        <h2 className="pt-3 text-xl font-semibold text-amber-300">Score</h2>
        <p className="text-2xl font-bold">{result.score}</p>
      </section>
      <button
        type="button"
        onClick={() => navigate("/create")}
        className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300"
      >
        Play Another Mystery
      </button>
    </main>
  );
}
