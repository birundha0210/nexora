import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
export default function ProtectedRoute({ role }) { const user = JSON.parse(localStorage.getItem('nexora_user') || 'null'); return user && (!role || user.role === role) ? <Outlet /> : <Navigate to="/login" replace />; }
