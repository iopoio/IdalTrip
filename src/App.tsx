import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaceSelectionPage from './pages/PlaceSelectionPage';
import CourseResultPage from './pages/CourseResultPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=2574')] bg-cover bg-center bg-fixed">
        <div className="max-w-[430px] mx-auto min-h-screen bg-surface relative shadow-2xl text-on-surface font-body overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/places" element={<PlaceSelectionPage />} />
            <Route path="/course/:id" element={<CourseResultPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
