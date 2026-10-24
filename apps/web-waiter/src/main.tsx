import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import Orders from './pages/Orders';

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/tables" element={token ? <Tables /> : <Navigate to="/login" />} />
        <Route path="/menu" element={token ? <Menu /> : <Navigate to="/login" />} />
        <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/tables" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
