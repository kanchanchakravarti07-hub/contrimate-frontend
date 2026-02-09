import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, LogOut, ChevronRight, Shield, Bell, HelpCircle, 
  Edit2, Camera, Wallet, Users, Loader 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalSpent: 0, friends: 0, groups: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [updating, setUpdating] = useState(false); // 🔥 Loading state for update

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(storedUser);
      setNewName(storedUser.name);
      fetchStats(storedUser.id, storedUser.email);
    }
  }, []);

  const fetchStats = async (userId, email) => {
    try {
        const [expensesRes, friendsRes, groupsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/expenses/user/${userId}`),
            fetch(`${API_BASE_URL}/api/users/my-friends?email=${email}`),
            fetch(`${API_BASE_URL}/api/groups/my-groups?userId=${userId}`) // ✅ Updated to your new endpoint
        ]);

        const expenses = await expensesRes.json();
        const friends = await friendsRes.json();
        const groups = await groupsRes.json();

        const total = Array.isArray(expenses) 
            ? expenses.reduce((acc, curr) => curr.paidBy.id === userId ? acc + curr.totalAmount : acc, 0) 
            : 0;

        setStats({
            totalSpent: total,
            friends: Array.isArray(friends) ? friends.length : 0,
            groups: Array.isArray(groups) ? groups.length : 0
        });

    } catch (error) {
        console.error("Error fetching stats", error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  // 🔥 UPDATED: Now sends data to Backend
  const handleUpdateProfile = async () => {
      if (!newName.trim()) return alert("Naam toh daal bhai!");
      
      setUpdating(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/users/update-profile`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  id: user.id, 
                  name: newName.trim() 
              })
          });

          if (res.ok) {
              const updatedUser = { ...user, name: newName.trim() };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              setIsEditing(false);
              alert("Profile Updated! ✅");
          } else {
              alert("Server error: Update fail ho gaya.");
          }
      } catch (error) {
          console.error(error);
          alert("Connection error!");
      } finally {
          setUpdating(false);
      }
  };

  const settingsOptions = [
      { icon: <User size={20} color="#3b82f6" />, label: 'Account Settings', path: '/account' },
      { icon: <Bell size={20} color="#f59e0b" />, label: 'Notifications', path: '/notification-settings' },
      { icon: <Shield size={20} color="#10b981" />, label: 'Privacy & Security', path: '/privacy' },
      { icon: <HelpCircle size={20} color="#ec4899" />, label: 'Help & Support', path: '/help' },
  ];

  return (
    <div className="container" style={{ paddingBottom: '100px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      
      {/* Header */}
      <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>My Profile</h2>
        <div onClick={handleLogout} style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
            <LogOut size={20} color="#f43f5e" />
        </div>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
          padding: '25px', borderRadius: '24px', border: '1px solid #334155', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px'
      }}>
        <div style={{ position: 'relative', marginBottom: '15px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'white', border: '4px solid #0f172a' }}>
                {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', padding: '6px', borderRadius: '50%', border: '2px solid #0f172a' }}>
                <Camera size={14} color="white" />
            </div>
        </div>

        {isEditing ? (
            <div style={{display:'flex', gap:'10px', marginBottom:'5px', alignItems:'center'}}>
                <input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    style={{background:'#334155', border:'none', padding:'8px', borderRadius:'8px', color:'white', textAlign:'center', outline:'none'}} 
                />
                <button 
                    onClick={handleUpdateProfile} 
                    disabled={updating}
                    style={{background:'#10b981', border:'none', borderRadius:'6px', padding:'8px 15px', color:'white', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center'}}
                >
                    {updating ? <Loader size={14} className="animate-spin" /> : 'Save'}
                </button>
            </div>
        ) : (
            <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
                {user?.name} 
                <Edit2 size={14} color="#94a3b8" style={{cursor:'pointer'}} onClick={() => setIsEditing(true)}/>
            </h3>
        )}
        
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{user?.email}</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <div style={{ flex: 1, background: '#1e293b', padding: '15px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
              <Wallet size={20} color="#10b981" style={{ marginBottom: '5px' }} />
              <h4 style={{ margin: 0, fontSize: '18px' }}>₹{stats.totalSpent}</h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Total Spent</span>
          </div>
          <div style={{ flex: 1, background: '#1e293b', padding: '15px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
              <Users size={20} color="#3b82f6" style={{ marginBottom: '5px' }} />
              <h4 style={{ margin: 0, fontSize: '18px' }}>{stats.friends}</h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Friends</span>
          </div>
          <div style={{ flex: 1, background: '#1e293b', padding: '15px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
              <Shield size={20} color="#f59e0b" style={{ marginBottom: '5px' }} />
              <h4 style={{ margin: 0, fontSize: '18px' }}>Verified</h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Status</span>
          </div>
      </div>

      {/* Settings Menu */}
      <h4 style={{ color: '#94a3b8', fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>SETTINGS</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {settingsOptions.map((item, index) => (
              <div 
                key={index} 
                onClick={() => navigate(item.path)}
                style={{ 
                  padding: '16px', borderRadius: '16px', background: '#1e293b', 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid #334155'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: '#0f172a', padding: '8px', borderRadius: '10px' }}>{item.icon}</div>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </div>
                  <ChevronRight size={18} color="#64748b" />
              </div>
          ))}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 5 }}>
        {['Home', 'Groups', 'Settle', 'Profile'].map((item) => (
            <div key={item} onClick={() => item === 'Profile' ? null : navigate(`/${item.toLowerCase()}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: item === 'Profile' ? 1 : 0.5 }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: item === 'Profile' ? '#10b981' : '#64748b' }}>{item}</span>
            </div>
        ))}
      </div>

    </div>
  );
};

export default Profile;