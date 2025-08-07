import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";

// Import pages
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
