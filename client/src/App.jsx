import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CreateMystery from "./pages/CreateMystery.jsx";
import Investigation from "./pages/Investigation.jsx";
import Accusation from "./pages/Accusation.jsx";
import Results from "./pages/Results.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateMystery />} />
        <Route path="/case/:id" element={<Investigation />} />
        <Route path="/case/:id/accuse" element={<Accusation />} />
        <Route path="/case/:id/result" element={<Results />} />
      </Routes>
    </div>
  );
}
