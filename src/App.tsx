import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import QuizLocation from "./pages/QuizLocation";
import QuizName from "./pages/QuizName";
import Progress from "./pages/Progress";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stadtplan" element={<MapView />} />
        <Route path="/wo-liegt" element={<QuizLocation />} />
        <Route path="/wie-heisst" element={<QuizName />} />
        <Route path="/fortschritt" element={<Progress />} />
      </Routes>
    </BrowserRouter>
  );
}
