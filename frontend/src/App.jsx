import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import Header from './components/Header/Header';
import WelcomePage from './pages/WelcomePage';
import CatalogPage from './pages/CatalogPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Footer from './components/Footer/Footer';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import AddProductPage from './pages/AddProductPage';
import EmployeeRoute from './components/EmployeeRoute';

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
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>}/>
            <Route path="/products/new" element={<EmployeeRoute><AddProductPage /></EmployeeRoute>}/>
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;