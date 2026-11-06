
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Alumni from './pages/Alumni';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import MyProfile from './pages/MyProfile'
import MyConnections from './pages/MyConnections'
import Connections from './pages/Connections'
import Chat from './pages/Chat'
// Protect Post Job page
function AlumniProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (
    user.role !== 'Alumni' ||
    user.verificationStatus !== 'Approved'
  ) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/alumni" element={<Alumni />} />
        <Route path="/alumni/:id" element={<Profile />} />
        <Route path="/my-connections" element={<MyConnections />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route
          path="/post-job"
          element={
            <AlumniProtectedRoute>
              <PostJob />
            </AlumniProtectedRoute>
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
