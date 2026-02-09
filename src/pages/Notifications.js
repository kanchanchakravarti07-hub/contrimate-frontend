import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Bell, Info } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
      fetchPaymentRequests(currentUser.id);
      fetchSystemAlerts(currentUser.id);
    }
  }, []);

  const fetchPaymentRequests = (userId) => {
    fetch(`http://localhost:8081/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
      })
      .catch(err => console.error("Error fetching notifications:", err));
  };

  const fetchSystemAlerts = (userId) => {
    fetch(`http://localhost:8081/api/users/all`)
      .then(res => res.json())
      .then(data => {
        const myAlerts = [];
        data.forEach(u => {
            if (u.id === userId && u.balance < 0) {
                 myAlerts.push({
                    id: `owe-${u.id}`,
                    message: `System: You have pending dues. Check Settle Up!`,
                    link: '/settle'
                 });
            }
        });
        setAlerts(myAlerts);
      });
  };

  const getNotifMeta = (msg) => {
    const text = msg ? msg.toLowerCase() : "";
    
    if (text.includes("friend") || text.includes("added")) {
        return { icon: "👋", label: "New Friend", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" };
    }
    if (text.includes("requesting") || text.includes("owe") || text.includes("request")) {
        return { icon: "💸", label: "Money Request", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)" };
    }
    if (text.includes("paid") || text.includes("settled") || text.includes("received") || text.includes("accepted")) {
        return { icon: "✅", label: "Success", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
    }
    return { icon: "🔔", label: "Update", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
  };

  // 🔥 NEW: Smart Navigation Logic
  const handleNotifClick = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes("friend request")) {
        navigate('/groups'); // Request accept karne ke liye Groups page par bhejo
    } else if (text.includes("requesting") || text.includes("owe")) {
        navigate('/settle'); // Paise dene ke liye Settle page par bhejo
    }
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation(); // Parent click rokne ke liye
    await fetch(`http://localhost:8081/api/notifications/clear/${id}`, { method: 'DELETE' });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', marginTop: '10px' }}>
        <ArrowLeft onClick={() => navigate('/home')} style={{ cursor: 'pointer', color: 'white' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Activity</h2>
      </div>

      <h3 style={{ fontSize: '12px', color: '#666', marginBottom: '15px', letterSpacing: '1px', fontWeight: '800' }}>NEW ACTIVITY</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        {notifications.length > 0 ? notifications.map((n) => {
            const meta = getNotifMeta(n.message);
            return (
                <div 
                    key={n.id} 
                    onClick={() => handleNotifClick(n.message)} // 🔥 Clickable Card
                    style={{
                        display: 'flex', alignItems: 'center', gap: '15px', padding: '14px',
                        background: '#161616', borderRadius: '18px', border: '1px solid #222',
                        position: 'relative', overflow: 'hidden', cursor: 'pointer' // Cursor Pointer added
                    }}
                >
                    <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background: meta.color}}></div>

                    <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', 
                        background: meta.bg, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' 
                    }}>
                        {meta.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '500', lineHeight: '1.4' }}>{n.message}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: meta.color, fontWeight: '700' }}>{meta.label}</span>
                            <span style={{ fontSize: '10px', color: '#444' }}>• {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                        </div>
                    </div>
                   
                    {!n.isRead && <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>}
                    
                    <Trash2 size={16} color="#333" onClick={(e) => deleteNotif(e, n.id)} style={{ cursor: 'pointer', marginLeft: '5px', zIndex: 10 }} />
                </div>
            );
        }) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#444', fontStyle: 'italic', fontSize: '13px' }}>
                No recent activity.
            </div>
        )}
      </div>

      {alerts.length > 0 && (
        <>
            <h3 style={{ fontSize: '12px', color: '#666', marginBottom: '15px', letterSpacing: '1px', fontWeight: '800' }}>SYSTEM ALERTS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map((alert) => (
                    <div key={alert.id} onClick={() => navigate(alert.link)} style={{
                        padding: '16px', background: '#1e1e1e', borderRadius: '16px', border: '1px solid #333',
                        display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer'
                    }}>
                        <Info size={18} color="#10b981" />
                        <p style={{ margin: 0, fontSize: '14px', color: '#bbb' }}>{alert.message}</p>
                    </div>
                ))}
            </div>
        </>
      )}

      {notifications.length === 0 && alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#333' }}>
            <Bell size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#555' }}>You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;