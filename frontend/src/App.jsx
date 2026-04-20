import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import Header from './components/Header/Header';
import WelcomePage from './pages/WelcomePage';
import CatalogPage from './pages/CatalogPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Footer from './components/Footer/Footer';
import ChatButton from './components/ChatButton/ChatButton';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/register" element={<RegisterPage />} /> 
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer/>
        <ChatButton/>
      </div>
    </Router>
  );
}

export default App;