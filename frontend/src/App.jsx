import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
// import LoginPage from './components/LoginPage'; // No longer needed here
// import Dashboard from './components/Dashboard'; 
import './App.css'; 

function App() {
  return (
    <div className="App">
      <Routes>
        {/* The root path now points to the HomePage, which contains the tabs */}
        <Route path="/" element={<HomePage />} /> 
        
        {/* Placeholder for the secure Dashboard page */}
        <Route path="/dashboard" element={<h1>Welcome to the Dashboard!</h1>} />
      </Routes>
    </div>
  );
}

export default App;