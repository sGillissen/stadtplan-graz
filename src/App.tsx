import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapView from "./pages/MapView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapView />} />
        {/* Alte /stadtplan URL leitet auf / um */}
        <Route path="/stadtplan" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
