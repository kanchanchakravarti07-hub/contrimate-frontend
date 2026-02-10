import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Bell, Info, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config';

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
    fetch(`${API_BASE_URL}/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
      })
      .catch(err => console.error("Error fetching notifications:", err));
  };

  const fetchSystemAlerts = (userId) => {
    fetch(`${API_BASE_URL}/api/users/all`)
      .then(res => res.json())
      .then(data => {
        const myAlerts = [];
        data.forEach(u => {
          if (u.id === userId && u.balance < 0) {
            myAlerts.push({
              id: `owe-${u.id}`,
              message: `Pending dues detected. Check Settle Up!`,
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
      return { icon: "👋", label: "New Friend", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" };
    }
    if (text.includes("requesting") || text.includes("owe") || text.includes("request")) {
      return { icon: "💸", label: "Money Request", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" };
    }
    if (text.includes("paid") || text.includes("settled") || text.includes("received") || text.includes("accepted")) {
      return { icon: "✅", label: "Update", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
    }
    return { icon: "🔔", label: "Notification", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
  };

  const handleNotifClick = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes("friend request")) {
      navigate('/groups');
    } else if (text.includes("requesting") || text.includes("owe")) {
      navigate('/settle');
    }
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/notifications/clear/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '40px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0', marginBottom: '10px' }}>
        <ArrowLeft onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Activity</h2>
      </div>

      <h3 style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', letterSpacing: '1.5px', fontWeight: '800', paddingLeft: '5px' }}>
        RECENT ACTIVITY
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px', padding: '0 5px' }}>
        {notifications.length > 0 ? notifications.map((n) => {
          const meta = getNotifMeta(n.message);
          return (
            <div
              key={n.id}
              onClick={() => handleNotifClick(n.message)}
              style={{
                display: 'flex', alignItems: 'center', gap: '15px', padding: '16px',
                background: '#1e293b', borderRadius: '22px', border: '1px solid #334155',
                position: 'relative', cursor: 'pointer', transition: '0.2s'
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: meta.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
              }}>
                {meta.icon}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '600', lineHeight: '1.4' }}>
                  {n.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: meta.color, fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                    {meta.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                    <Clock size={10} />
                    <span style={{ fontSize: '11px' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              {!n.isRead && <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6' }}></div>}

              <div 
                onClick={(e) => deleteNotif(e, n.id)} 
                style={{ padding: '8px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.05)', marginLeft: '8px' }}
              >
                <Trash2 size={16} color="#f43f5e" style={{ opacity: 0.7 }} />
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '22px', border: '1px dashed #334155' }}>
            <p style={{ margin: 0, color: '#64748b', fontStyle: 'italic', fontSize: '14px' }}>No new activity found.</p>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <>
          <h3 style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', letterSpacing: '1.5px', fontWeight: '800', paddingLeft: '5px' }}>
            SYSTEM ALERTS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 5px' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => navigate(alert.link)}
                style={{
                  padding: '18px', background: 'linear-gradient(to right, #1e293b, #0f172a)', borderRadius: '20px', border: '1px solid #334155',
                  display: 'flex', gap: '15px', alignItems: 'center', cursor: 'pointer'
                }}
              >
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px' }}>
                    <Info size={20} color="#10b981" />
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', fontWeight: '500' }}>{alert.message}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {notifications.length === 0 && alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
          <div style={{ width: '80px', height: '80px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Bell size={40} style={{ opacity: 0.2 }} />
          </div>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'white' }}>
            All caught up!
          </p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>No new notifications or alerts for you.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;