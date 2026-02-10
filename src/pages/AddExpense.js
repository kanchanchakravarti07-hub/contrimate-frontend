import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Users, Receipt, IndianRupee } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AddExpense = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔥 Split Logic States
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL or MANUAL
  const [manualAmounts, setManualAmounts] = useState({}); // { friendId: amount }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
      fetchFriends(user.email);
    }
  }, []);

  const fetchFriends = (email) => {
    fetch(`${API_BASE_URL}/api/users/my-friends?email=${email}`)
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => console.error(err));
  };

  const toggleFriend = (friend) => {
    const isSelected = selectedFriends.find(f => f.id === friend.id);
    if (isSelected) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
      const updatedManual = { ...manualAmounts };
      delete updatedManual[friend.id];
      setManualAmounts(updatedManual);
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleManualAmountChange = (friendId, value) => {
    setManualAmounts({ ...manualAmounts, [friendId]: value });
  };

  const handleSave = async () => {
    if (!description || !totalAmount || selectedFriends.length === 0) {
      return alert("Bhai saari details bhar de!");
    }

    setLoading(true);
    const absTotal = parseFloat(totalAmount);
    let finalSplits = [];

    // 🔥 Logic: Equal vs Manual Split
    if (splitType === 'EQUAL') {
      const share = absTotal / (selectedFriends.length + 1);
      finalSplits = [
        { user: { id: currentUser.id }, amountOwed: share },
        ...selectedFriends.map(f => ({ user: { id: f.id }, amountOwed: share }))
      ];
    } else {
      const manualTotal = Object.values(manualAmounts).reduce((a, b) => a + parseFloat(b || 0), 0);
      const myShare = absTotal - manualTotal;

      if (manualTotal > absTotal) {
          setLoading(false);
          return alert(`Splits ka total (₹${manualTotal}) main amount (₹${absTotal}) se zyada hai!`);
      }

      finalSplits = [
        { user: { id: currentUser.id }, amountOwed: myShare },
        ...selectedFriends.map(f => ({ 
          user: { id: f.id }, 
          amountOwed: parseFloat(manualAmounts[f.id] || 0) 
        }))
      ];
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/expenses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          totalAmount: absTotal,
          category,
          paidBy: { id: currentUser.id },
          splits: finalSplits
        })
      });

      if (res.ok) {
        navigate('/home');
      } else {
        const errData = await res.text();
        alert("Error: " + errData);
      }
    } catch (err) {
      alert("Server error, check connection!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Add Expense</h2>
      </div>

      {/* Split Type Tabs */}
      <div style={{ display: 'flex', background: '#1e293b', padding: '5px', borderRadius: '12px', marginBottom: '20px' }}>
        <button 
          onClick={() => setSplitType('EQUAL')}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: splitType === 'EQUAL' ? '#10b981' : 'transparent', color: 'white', fontWeight: 'bold' }}
        >
          Equal Split
        </button>
        <button 
          onClick={() => setSplitType('MANUAL')}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: splitType === 'MANUAL' ? '#10b981' : 'transparent', color: 'white', fontWeight: 'bold' }}
        >
          Diff Bill
        </button>
      </div>

      {/* Main Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>TOTAL AMOUNT</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>₹</span>
            <input 
              type="number" placeholder="0.00" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontSize: '32px', fontWeight: '800', color: 'white', width: '100%', outline: 'none' }}
            />
          </div>
          <input 
            placeholder="What was this for? (e.g. Pizza)" value={description} onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: 'none', padding: '12px', borderRadius: '10px', color: 'white', marginTop: '15px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Friends Selection & Manual Input */}
      <h3 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '15px' }}>WITH WHOM?</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {friends.map(friend => {
          const isSelected = selectedFriends.find(f => f.id === friend.id);
          return (
            <div 
              key={friend.id} 
              onClick={() => !isSelected && toggleFriend(friend)}
              style={{ 
                padding: '15px', borderRadius: '16px', background: isSelected ? 'rgba(16, 185, 129, 0.1)' : '#1e293b',
                border: isSelected ? '1px solid #10b981' : '1px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => isSelected && toggleFriend(friend)}>
                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {friend.name.charAt(0)}
                </div>
                <span style={{ fontWeight: '600' }}>{friend.name}</span>
              </div>

              {isSelected && splitType === 'MANUAL' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#0f172a', padding: '5px 10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>₹</span>
                  <input 
                    type="number" placeholder="0" value={manualAmounts[friend.id] || ''} 
                    onChange={(e) => handleManualAmountChange(friend.id, e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '50px', outline: 'none', fontWeight: 'bold' }}
                  />
                </div>
              ) : isSelected && <Check size={20} color="#10b981" />}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave} disabled={loading}
        style={{ 
          position: 'fixed', bottom: '20px', left: '20px', right: '20px', 
          background: '#10b981', color: 'white', padding: '18px', borderRadius: '16px', 
          border: 'none', fontWeight: '800', fontSize: '16px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
        }}
      >
        {loading ? 'Saving...' : 'Save Expense'}
      </button>
    </div>
  );
};

export default AddExpense;