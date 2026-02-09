import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, User, Plus, Repeat, Users } from 'lucide-react';

// Pages 
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomePage from './pages/Home';
import AddExpense from './pages/AddExpense';
import SettleUp from './pages/SettleUp';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Notifications from './pages/Notifications'; 
import PaymentOptions from './pages/PaymentOptions';
import Analysis from './pages/Analysis';
import History from './pages/History';
import Account from './pages/Account';
import NotificationSettings from './pages/NotificationSettings';
import Privacy from './pages/Privacy';
import Help from './pages/Help';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;


  if (path === '/login' || path === '/' || path === '/signup') return null;

  return (
    <div className="bottom-nav">
      <Link to="/home" className={`nav-item ${path === '/home' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>

      <Link to="/groups" className={`nav-item ${path === '/groups' ? 'active' : ''}`}>
        <Users size={24} />
        <span>Groups</span>
      </Link>

      <div style={{width:'50px'}}></div> 
      <Link to="/add-expense" className="fab-btn">
        <Plus size={32} strokeWidth={2.5} />
      </Link>

      <Link to="/settle" className={`nav-item ${path === '/settle' ? 'active' : ''}`}>
        <Repeat size={24} />
        <span>Settle</span>
      </Link>

      <Link to="/profile" className={`nav-item ${path === '/profile' ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/home" element={<HomePage />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/settle" element={<SettleUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/payment-options" element={<PaymentOptions />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/account" element={<Account />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;