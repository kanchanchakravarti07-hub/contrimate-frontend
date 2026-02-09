import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, ChevronRight, Edit2, CheckCircle2 } from 'lucide-react';

const PaymentOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { friendId, friendName, amount: initialAmount } = location.state || { amount: 0, friendName: 'User' };

  const [editableAmount, setEditableAmount] = useState(initialAmount);
  const [isEditing, setIsEditing] = useState(false);

  const paymentApps = [
    { name: 'Google Pay', icon: '💎', color: '#4285F4', sub: 'Instant Bank Transfer' },
    { name: 'Paytm', icon: '🔵', color: '#00BAF2', sub: 'Wallet & UPI' },
    { name: 'PhonePe', icon: '🟣', color: '#5f259f', sub: 'Secure UPI' },
  ];

  const handleFinalSettle = async (appName) => {
    if (editableAmount <= 0) return alert("Bhai, 0 rupaye kaun deta hai?");
    
    
    console.log(`Redirecting to ${appName} with ₹${editableAmount}`);
    
   
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const res = await fetch('http://localhost:8081/api/expenses/settle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payerId: user.id,
                receiverId: friendId,
                amount: parseFloat(editableAmount)
            })
        });
        if (res.ok) {
            alert(`Payment of ₹${editableAmount} via ${appName} recorded! 🎉`);
            navigate('/home');
        }
    } catch (err) { alert("Settlement error!"); }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', margin: '0 auto', paddingBottom: '40px' }}>
      
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <div 
          onClick={() => navigate(-1)} 
          style={{ background: '#1e1e1e', padding: '10px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #333' }}
        >
          <ArrowLeft size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Payment Method</h2>
      </div>

      
      <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '28px',
          padding: '40px 20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
          marginBottom: '35px',
          overflow: 'hidden'
      }}>

        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
          Paying to <span style={{ fontWeight: '800', color: 'white' }}>{friendName}</span>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span style={{ fontSize: '32px', color: 'white', fontWeight: '800' }}>₹</span>
          {isEditing ? (
            <input 
              autoFocus
              type="number"
              value={editableAmount}
              onChange={(e) => setEditableAmount(e.target.value)}
              onBlur={() => setIsEditing(false)}
              style={{
                background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white',
                fontSize: '48px', fontWeight: '800', width: '150px', textAlign: 'center',
                outline: 'none', borderRadius: '12px'
              }}
            />
          ) : (
            <h1 onClick={() => setIsEditing(true)} style={{ fontSize: '56px', color: 'white', margin: 0, fontWeight: '900', cursor: 'pointer' }}>
              {editableAmount}
            </h1>
          )}
          <Edit2 size={18} color="rgba(255,255,255,0.6)" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }} />
        </div>
        
        {isEditing && <p style={{ fontSize: '12px', color: 'white', marginTop: '10px', opacity: 0.8 }}>Tap outside to save</p>}
      </div>

      
      <div className="premium-card" style={{
          background: '#1e1e1e', borderRadius: '20px', padding: '20px',
          display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px',
          border: '1px solid #333', cursor: 'pointer', transition: '0.3s'
      }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '15px' }}>
          <QrCode color="#10b981" size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, color: 'white', fontSize: '16px' }}>Scan Any QR Code</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>GPay, Paytm, PhonePe supported</p>
        </div>
        <ChevronRight color="#444" size={20} />
      </div>

      <p style={{ fontSize: '12px', color: '#555', letterSpacing: '1px', fontWeight: '700', marginBottom: '15px', marginLeft: '5px' }}>
        INSTALLED APPS
      </p>

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paymentApps.map((app) => (
          <div 
            key={app.name} 
            onClick={() => handleFinalSettle(app.name)}
            className="payment-row"
            style={{
                background: '#161616', borderRadius: '18px', padding: '18px',
                display: 'flex', alignItems: 'center', gap: '15px',
                border: '1px solid #222', cursor: 'pointer', transition: '0.2s'
            }}
          >
            <div style={{ fontSize: '24px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e1e', borderRadius: '12px' }}>
              {app.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'white', fontSize: '15px' }}>{app.name}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>{app.sub}</p>
            </div>
            <CheckCircle2 size={18} color="#333" />
          </div>
        ))}
      </div>

      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ fontSize: '12px', color: '#444' }}>Secured by ContriMate UPI Stack</p>
      </div>
    </div>
  );
};

export default PaymentOptions;