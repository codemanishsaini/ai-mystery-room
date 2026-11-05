import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCase, accuse } from "../api";

export default function Accusation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suspects, setSuspects] = useState([]);
  const [selectedSuspect, setSelectedSuspect] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCase = async () => {
      try {
        const response = await getCase(id);
        setSuspects(response.data.suspects || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Could not load this case.");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSuspect) return;

    setSubmitting(true);
    setError("");
    try {
      await accuse(id, selectedSuspect);
      navigate(`/case/${id}/result`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not submit accusation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-3xl p-8 text-slate-300">Loading suspects...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-3xl font-bold text-amber-400">Who is your suspect?</h1>
      {error && <p className="text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {suspects.map((suspect) => (
            <button
              key={suspect.id}
              type="button"
              onClick={() => setSelectedSuspect(suspect.id)}
              aria-pressed={selectedSuspect === suspect.id}
              className={`rounded-xl border p-6 text-left transition ${
                selectedSuspect === suspect.id
                  ? "border-red-500 bg-red-900 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-100 hover:border-red-500"
              }`}
            >
              <span className="block text-xl font-bold">{suspect.name}</span>
              <span className="mt-2 block text-slate-300">{suspect.description}</span>
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={!selectedSuspect || submitting}
          className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting accusation..." : "Submit Accusation"}
        </button>
      </form>
    </main>
  );
}
