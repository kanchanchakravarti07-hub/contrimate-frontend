import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Send, Wallet, RefreshCcw } from 'lucide-react';
import { API_BASE_URL } from '../config';

const SettleUp = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchDebts(storedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchDebts = (userId) => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/expenses/debts/${userId}`)
      .then(res => res.json())
      .then(data => {
        setFriends(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching debts:", err);
        setLoading(false);
      });
  };

  const renderAvatar = (friend, size = '45px') => {
    return (
      <div style={{ 
        width: size, height: size, borderRadius: '12px', 
        background: '#333', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '18px', overflow: 'hidden',
        border: '1px solid #444'
      }}>
        {friend.profilePic ? (
          <img src={friend.profilePic} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{friend.name ? friend.name.charAt(0).toUpperCase() : '?'}</span>
        )}
      </div>
    );
  };

  // 🔥 UPDATED: Real UPI Payment Logic
  const handleSettle = async (friendId, friendName, amount, friendUpi) => {
    const absAmount = Math.abs(amount).toFixed(2);
    
    // 1. Agar UPI ID missing hai
    if (!friendUpi) {
        return alert(`Bhai, ${friendName} ki UPI ID missing hai! Real payment nahi ho sakti.`);
    }

    // 2. User confirmation
    if (!window.confirm(`Redirecting to UPI apps to pay ₹${absAmount} to ${friendName}?`)) return;

    // 3. UPI Deep Link (Google Pay, PhonePe, Paytm automatically handle this)
    const upiLink = `upi://pay?pa=${friendUpi}&pn=${encodeURIComponent(friendName)}&am=${absAmount}&cu=INR&tn=Settled%20via%20Contrimate`;
    
    window.location.href = upiLink;

    // 4. Record the settlement in database after a small delay
    setTimeout(async () => {
      if (window.confirm("Payment complete kar di? Record update kar dein?")) {
        setLoading(true);
        try {
          const settlementData = {
            description: `Settled with ${friendName} (Real Payment)`,
            totalAmount: parseFloat(absAmount),
            category: "Settlement",
            paidBy: { id: user.id },
            splits: [{ user: { id: friendId }, amountOwed: parseFloat(absAmount) }]
          };

          const res = await fetch(`${API_BASE_URL}/api/expenses/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settlementData)
          });

          if (res.ok) {
            alert("Settlement Recorded! 🎉");
            fetchDebts(user.id);
          }
        } catch (e) {
          alert("Error recording settlement");
        } finally {
          setLoading(false);
        }
      }
    }, 3000); 
  };

  const handleRequest = async (friendId, friendName, amount) => {
    const message = `🔔 ${user.name} is requesting ₹${amount}. Please pay soon!`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: friendId, message: message })
      });
      if (res.ok) {
        alert(`Request sent to ${friendName} successfully! ✅`);
      } else {
        alert("Failed to send request.");
      }
    } catch (err) {
      alert("Server Error while sending notification");
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0', marginBottom: '10px' }}>
        <ArrowLeft onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Settle Up</h2>
        <RefreshCcw
          size={18}
          onClick={() => user && fetchDebts(user.id)}
          style={{ marginLeft: 'auto', cursor: 'pointer', opacity: 0.6 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 15px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Checking accounts...</p>
        ) : friends.length > 0 ? (
          friends.map((friend, index) => {
            const balance = friend.balance || friend.amount || 0;
            const isOwed = balance > 0;
            const isDebt = balance < 0;
            const isSettled = balance === 0;

            return (
              <div key={friend.userId || index} style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#1e293b',
                borderRadius: '20px',
                border: '1px solid #334155',
                borderLeft: isOwed ? '6px solid #10b981' : isDebt ? '6px solid #f43f5e' : '6px solid #475569'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {renderAvatar(friend, '50px')}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{friend.name}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: isOwed ? '#10b981' : isDebt ? '#f43f5e' : '#94a3b8', fontWeight: '600' }}>
                      {isOwed ? `Owes you ₹${balance.toFixed(0)}` : isDebt ? `You owe ₹${Math.abs(balance).toFixed(0)}` : 'All Settled'}
                    </p>
                  </div>
                </div>

                <div>
                  {isOwed && (
                    <button
                      onClick={() => handleRequest(friend.userId, friend.name, balance.toFixed(0))}
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 18px', borderRadius: '12px',
                        fontWeight: 'bold', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '8px'
                      }}
                    >
                      <Send size={16} /> Request
                    </button>
                  )}

                  {isDebt && (
                    <button
                      onClick={() => handleSettle(friend.userId, friend.name, balance, friend.upiId)}
                      style={{
                        background: '#f43f5e', color: 'white',
                        border: 'none', padding: '10px 18px', borderRadius: '12px',
                        fontWeight: 'bold', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)'
                      }}
                    >
                      <Wallet size={16} /> Pay
                    </button>
                  )}

                  {isSettled && (
                    <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                      <CheckCircle size={18} color="#10b981" /> Settled
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ width: '80px', height: '80px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={40} style={{ opacity: 0.3 }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>You are all settled up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettleUp;