import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCase, discoverClue, requestHint } from "../api";

export default function Investigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const loadCase = useCallback(async () => {
    setError("");
    try {
      const response = await getCase(id);
      setCaseData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not load this case.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const handleDiscover = async (clueId) => {
    setBusyId(clueId);
    setError("");
    try {
      await discoverClue(id, clueId);
      await loadCase();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not discover clue.");
    } finally {
      setBusyId("");
    }
  };

  const handleRequestHint = async () => {
    setBusyId("hint");
    setError("");
    try {
      await requestHint(id);
      await loadCase();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not request hint.");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-4xl p-8 text-slate-300">Loading case...</main>;
  }

  if (!caseData) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <p className="text-red-400">{error || "Case not found."}</p>
      </main>
    );
  }

  const clues = caseData.clues || [];
  const suspects = caseData.suspects || [];
  const hints = caseData.hints || [];
  const discoveredClues = caseData.discoveredClues || [];
  const usedHints = caseData.usedHints || [];
  const nextHintIndex = usedHints.length;

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-amber-400">{caseData.title}</h1>
        <p className="italic text-slate-300">{caseData.story}</p>
      </header>

      {error && <p className="text-red-400">{error}</p>}

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Suspects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {suspects.map((suspect) => (
            <article key={suspect.id} className="rounded-lg bg-slate-800 p-4">
              <h3 className="mb-2 font-semibold text-amber-300">{suspect.name}</h3>
              <p className="text-slate-300">{suspect.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          Clues ({discoveredClues.length}/{clues.length})
        </h2>
        <ul className="space-y-3">
          {clues.map((clue) => {
            const discovered = discoveredClues.includes(clue.id);
            return (
              <li key={clue.id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-800 p-4">
                <span className="text-slate-200">
                  {discovered ? clue.text : "??? Undiscovered clue"}
                </span>
                {!discovered && (
                  <button
                    type="button"
                    onClick={() => handleDiscover(clue.id)}
                    disabled={Boolean(busyId)}
                    className="shrink-0 rounded-md bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
                  >
                    {busyId === clue.id ? "Discovering..." : "Discover"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Hints (−10 pts each)</h2>
        <ul className="space-y-3">
          {hints.map((hint, index) => {
            const revealed = usedHints.includes(index);
            return (
              <li key={index} className="flex items-center justify-between gap-4 rounded-lg bg-slate-800 p-4">
                <span className="text-slate-200">
                  {revealed ? `💡 ${hint}` : "Hidden hint"}
                </span>
                {!revealed && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={Boolean(busyId) || index !== nextHintIndex}
                    className="shrink-0 rounded-md bg-slate-700 px-4 py-2 font-medium text-slate-100 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyId === "hint" ? "Requesting..." : `Request Hint #${index + 1}`}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => navigate(`/case/${id}/accuse`)}
        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-500"
      >
        Make Accusation →
      </button>
    </main>
  );
}
