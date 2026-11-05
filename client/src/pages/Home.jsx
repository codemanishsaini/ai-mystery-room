import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-5xl font-bold text-amber-400">🕵️ AI Mystery Room</h1>
      <p className="mb-8 max-w-xl text-lg text-slate-300">
        Type any mystery premise, pick a difficulty, and let Gemini AI generate a
        unique detective case...
      </p>
      <Link
        to="/create"
        className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-300"
      >
        Start a Mystery
      </Link>
    </main>
  );
}
