import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Send, Wallet, RefreshCcw } from 'lucide-react';

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
    // Make sure your backend has this endpoint or similar logic
    fetch(`http://localhost:8081/api/expenses/debts/${userId}`)
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

  // 🔥 NEW LOGIC: Record Settlement in Database
  const handleSettle = async (friendId, friendName, amount) => {
    const absAmount = Math.abs(amount);
    
    // Confirmation
    if (!window.confirm(`Mark ₹${absAmount} as paid to ${friendName}?`)) return;

    setLoading(true);

    try {
        // 🔥 Ye step zaroori hai taaki Analysis page ko pata chale ye Settlement hai
        const settlementData = {
            description: `Settled with ${friendName}`,
            totalAmount: parseFloat(absAmount),
            category: "Settlement", // ✅ Category set to Settlement
            paidBy: { id: user.id }, 
            splits: [{ user: { id: friendId }, amountOwed: parseFloat(absAmount) }]
        };

        const res = await fetch('http://localhost:8081/api/expenses/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settlementData)
        });

        if (res.ok) {
            alert("Settlement Recorded! 🎉");
            fetchDebts(user.id); // Refresh List
        } else {
            alert("Error settling up");
        }
    } catch (e) {
        console.error(e);
        alert("Server Error");
    } finally {
        setLoading(false);
    }
  };

  const handleRequest = async (friendId, friendName, amount) => {
      const message = `🔔 ${user.name} is requesting ₹${amount}. Please pay soon!`;
      try {
          const res = await fetch('http://localhost:8081/api/notifications/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  recipientId: friendId,
                  message: message
              })
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
    <div className="container" style={{ paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', marginTop: '10px' }}>
        <ArrowLeft onClick={() => navigate('/home')} style={{ cursor: 'pointer', color: 'white' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Settle Up</h2>
        <RefreshCcw 
          size={18} 
          onClick={() => user && fetchDebts(user.id)} 
          style={{ marginLeft: 'auto', cursor: 'pointer', opacity: 0.6 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Checking accounts...</p>
        ) : friends.length > 0 ? (
            friends.map((friend, index) => {
                // Backend se data structure match kar lena (friend.balance vs friend.amount)
                const balance = friend.balance || friend.amount || 0; 
                const isOwed = balance > 0;
                const isDebt = balance < 0;
                const isSettled = balance === 0;

                return (
                    <div key={friend.userId || index} className="card" style={{
                        padding: '20px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: '#1e1e1e',
                        borderRadius: '16px',
                        borderLeft: isOwed ? '5px solid #10b981' : isDebt ? '5px solid #f43f5e' : '5px solid #555'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                width: '45px', height: '45px', borderRadius: '12px',
                                background: '#333', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'
                            }}>
                                {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px', color: 'white' }}>{friend.name}</h4>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: isOwed ? '#10b981' : isDebt ? '#f43f5e' : '#888' }}>
                                    {isOwed ? `Owes you ₹${balance.toFixed(0)}` : isDebt ? `You owe ₹${Math.abs(balance).toFixed(0)}` : 'All Settled'}
                                </p>
                            </div>
                        </div>

                        <div>
                            {isOwed && (
                                <button 
                                    onClick={() => handleRequest(friend.userId, friend.name, balance.toFixed(0))}
                                    style={{
                                        background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', 
                                        border: 'none', padding: '10px 15px', borderRadius: '10px', 
                                        fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <Send size={16}/> Request
                                </button>
                            )}

                            {isDebt && (
                                <button 
                                    // 🔥 Updated Click Handler to use new Logic
                                    onClick={() => handleSettle(friend.userId, friend.name, balance)}
                                    style={{
                                        background: '#f43f5e', color: 'white', 
                                        border: 'none', padding: '10px 15px', borderRadius: '10px', 
                                        fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <Wallet size={16}/> Pay
                                </button>
                            )}

                            {isSettled && (
                                <div style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                                    <CheckCircle size={16}/> Settled
                                </div>
                            )}
                        </div>
                    </div>
                );
            })
        ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <CheckCircle size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <p>You are all settled up!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SettleUp;