import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ChatBox from "./components/ChatBox";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<ChatBox />} />
    </Routes>
  );
}

export default App;
