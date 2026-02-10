import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, User, LayoutGrid, ChevronRight, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AddExpense = () => {
  const navigate = useNavigate();

  // --- FLOW & DATA STATES ---
  const [flowStep, setFlowStep] = useState('CHOICE'); 
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // --- FORM STATES ---
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food'); 
  const [payerId, setPayerId] = useState('');
  const [splitWithIds, setSplitWithIds] = useState([]);
  const [splitMode, setSplitMode] = useState('EQUAL'); 
  const [manualAmounts, setManualAmounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState(''); // 🔥 Success/Error Popup

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
        setPayerId(loggedInUser.id);
        fetch(`${API_BASE_URL}/api/groups/my-groups?userId=${loggedInUser.id}`)
          .then(res => res.json())
          .then(data => setGroups(data))
          .catch(err => console.error(err));
    }
  }, []);

  const handleNoGroup = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    fetch(`${API_BASE_URL}/api/users/my-friends?email=${loggedInUser.email}`)
      .then(res => res.json())
      .then(friends => {
        const all = [loggedInUser, ...friends];
        setUsers(all);
        setSplitWithIds(all.map(u => u.id));
        setSelectedGroup(null);
        setFlowStep('FORM');
      });
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setUsers(group.members);
    setSplitWithIds(group.members.map(m => m.id));
    setFlowStep('FORM');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return alert("Description daalo bhai!");
    
    let finalTotal = parseFloat(amount);
    let splits = [];

    if (splitMode === 'EQUAL') {
      if (!amount || amount <= 0) return alert("Amount sahi daalo!");
      const share = parseFloat((finalTotal / splitWithIds.length).toFixed(2));
      splits = splitWithIds.map(id => ({ user: { id }, amountOwed: share }));
    } else {
      let calculatedTotal = 0;
      for (const id of splitWithIds) {
        const val = parseFloat(manualAmounts[id] || 0);
        calculatedTotal += val;
        splits.push({ user: { id }, amountOwed: val });
      }
      finalTotal = calculatedTotal;
    }

    setIsLoading(true);
    const expenseData = {
      description, totalAmount: finalTotal, category,
      paidBy: { id: payerId },
      group: selectedGroup ? { id: selectedGroup.id } : null,
      splits
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/expenses/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        setModalMsg('Saved Successfully! ✅');
        setTimeout(() => navigate('/home'), 1500);
      } else {
        setModalMsg('Error saving');
      }
    } catch (error) { setModalMsg('Error saving'); } finally { setIsLoading(false); }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0f172a' }}>
      
      {/* 1️⃣ CHOICE & GROUP LIST MODAL */}
      {(flowStep === 'CHOICE' || flowStep === 'GROUP_LIST') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', background: '#1e293b', borderRadius: '32px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {flowStep === 'CHOICE' ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '30px', textAlign: 'center' }}>Add Expense To</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div onClick={handleNoGroup} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <User size={28} color="#10b981" />
                    <h3 style={{ margin: '12px 0 0 0', fontSize: '18px', color: 'white' }}>Personal / Friends</h3>
                  </div>
                  <div onClick={() => setFlowStep('GROUP_LIST')} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <LayoutGrid size={28} color="#10b981" />
                    <h3 style={{ margin: '12px 0 0 0', fontSize: '18px', color: 'white' }}>In a Group</h3>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                  <ArrowLeft size={22} onClick={() => setFlowStep('CHOICE')} style={{ cursor: 'pointer', color: 'white' }} />
                  <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Select Group</h3>
                </div>
                {/* ... Group List Loop Same ... */}
                {groups.map(g => (
                    <div key={g.id} onClick={() => handleGroupSelect(g)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', cursor: 'pointer', marginBottom: '10px' }}>
                        <span style={{ color: 'white', fontWeight: '600' }}>{g.name}</span>
                        <ChevronRight size={18} color="#475569" />
                    </div>
                ))}
              </>
            )}
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <span onClick={() => navigate('/home')} style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Cancel</span>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ MAIN FORM PAGE */}
      <div className="container" style={{ padding: '0 20px 140px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
          <ArrowLeft onClick={() => setFlowStep('CHOICE')} style={{ cursor: 'pointer' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{selectedGroup ? `Group: ${selectedGroup.name}` : 'Add Expense'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Split Mode Tabs */}
          <div style={{ display: 'flex', background: '#1e293b', padding: '4px', borderRadius: '14px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setSplitMode('EQUAL')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: splitMode === 'EQUAL' ? '#334155' : 'transparent', color: 'white', border:'none' }}>Equal Split</button>
            <button type="button" onClick={() => { setSplitMode('UNEQUAL'); setAmount(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: splitMode === 'UNEQUAL' ? '#10b981' : 'transparent', color: 'white', border:'none' }}>Diff Bill</button>
          </div>

          {/* Amount & Description Card */}
          <div style={{ padding: '25px', borderRadius: '28px', background: '#1e293b', border: '1px solid #334155' }}>
            {splitMode === 'EQUAL' && (
              <input type="number" placeholder="₹ 0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#10b981', fontSize: '36px', fontWeight: 'bold', outline: 'none', marginBottom:'15px' }} />
            )}
            <input type="text" placeholder="Description (e.g. Pizza)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '18px', outline: 'none' }} />
          </div>

          {/* ... Users List Same ... */}
          <div style={{ marginTop: '20px' }}>
              {users.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#1e293b', borderRadius: '18px', marginBottom: '10px' }}>
                      <span>{u.name}</span>
                      {splitMode === 'UNEQUAL' && (
                          <input type="number" placeholder="₹0" onChange={(e) => setManualAmounts({ ...manualAmounts, [u.id]: e.target.value })} style={{ width: '60px', background: '#0f172a', border: 'none', color: 'white', padding: '8px', borderRadius: '8px' }} />
                      )}
                  </div>
              ))}
          </div>

          <button type="submit" disabled={isLoading} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', height: '65px', borderRadius: '22px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold' }}>
              {isLoading ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>

      {/* 🚀 🔥 SUCCESS/ERROR POPUP (SMALL WINDOW) */}
      {modalMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${modalMsg.includes('Error') ? '#f43f5e' : '#10b981'}`, width: '280px' }}>
                <div style={{ width: '60px', height: '60px', background: modalMsg.includes('Error') ? '#f43f5e' : '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    {modalMsg.includes('Error') ? <X color="white" size={30} onClick={() => setModalMsg('')} /> : <Check color="white" size={30} />}
                </div>
                <h3 style={{ margin: 0, color: 'white' }}>{modalMsg}</h3>
                {modalMsg.includes('Error') && <button onClick={() => setModalMsg('')} style={{marginTop:'15px', background:'#f43f5e', border:'none', color:'white', padding:'8px 20px', borderRadius:'10px'}}>Close</button>}
            </div>
        </div>
      )}
    </div>
  );
};

export default AddExpense;