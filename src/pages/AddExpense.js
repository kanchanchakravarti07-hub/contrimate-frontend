import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Tag, Info, User, LayoutGrid, ChevronRight, Edit2 } from 'lucide-react';
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

  const categories = ["Food", "Travel", "Shopping", "Entertainment", "Rent", "Bills", "Misc"];

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

  const handleManualChange = (userId, val) => {
    setManualAmounts({ ...manualAmounts, [userId]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return alert("Description daalo bhai!");
    
    let finalTotal = parseFloat(amount);
    let splits = [];

    if (splitMode === 'EQUAL') {
      if (!amount || amount <= 0) return alert("Total Amount sahi daalo!");
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
      if (res.ok) navigate('/home');
    } catch (error) { alert("Error saving"); } finally { setIsLoading(false); }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0f172a' }}>
      
      {/* 1️⃣ CHOICE & GROUP LIST MODAL */}
      {(flowStep === 'CHOICE' || flowStep === 'GROUP_LIST') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', background: '#1e293b', borderRadius: '32px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            {flowStep === 'CHOICE' ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '30px', textAlign: 'center' }}>Add Expense To</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div onClick={handleNoGroup} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                    <User size={28} color="#10b981" />
                    <h3 style={{ margin: '12px 0 0 0', fontSize: '18px', color: 'white' }}>Personal / Friends</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Split with friends directly</p>
                  </div>
                  <div onClick={() => setFlowStep('GROUP_LIST')} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                    <LayoutGrid size={28} color="#10b981" />
                    <h3 style={{ margin: '12px 0 0 0', fontSize: '18px', color: 'white' }}>In a Group</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Select from your groups</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                  <ArrowLeft size={22} onClick={() => setFlowStep('CHOICE')} style={{ cursor: 'pointer', color: 'white' }} />
                  <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Select Group</h3>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px' }}>
                  {groups.length > 0 ? groups.map(g => (
                    <div key={g.id} onClick={() => handleGroupSelect(g)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{g.name.charAt(0).toUpperCase()}</div>
                        <span style={{ color: 'white', fontWeight: '600' }}>{g.name}</span>
                      </div>
                      <ChevronRight size={18} color="#475569" />
                    </div>
                  )) : <p style={{ color: '#94a3b8', textAlign: 'center' }}>No groups found</p>}
                </div>
              </>
            )}
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <span onClick={() => navigate('/home')} style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Cancel</span>
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
          {/* Toggle Split Mode */}
          <div style={{ display: 'flex', background: '#1e293b', padding: '4px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #334155' }}>
            <button type="button" onClick={() => setSplitMode('EQUAL')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: splitMode === 'EQUAL' ? '#334155' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Equal Split</button>
            <button type="button" onClick={() => { setSplitMode('UNEQUAL'); setAmount(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: splitMode === 'UNEQUAL' ? '#10b981' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Diff Bill</button>
          </div>

          <div className="card" style={{ padding: '25px', borderRadius: '28px', background: '#1e293b', marginBottom: '20px', border: '1px solid #334155' }}>
            {splitMode === 'EQUAL' && (
              <div style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL AMOUNT</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '36px', color: '#10b981', fontWeight: 'bold' }}>₹</span>
                  <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '36px', fontWeight: 'bold', outline: 'none', marginLeft: '12px' }} />
                </div>
              </div>
            )}
            <div>
              <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>DESCRIPTION</label>
              <input type="text" placeholder="e.g. Dinner, Movie" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '18px', outline: 'none', marginTop: '10px' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '16px', margin: '25px 0 15px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="#10b981" /> Split With</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', background: '#1e293b', borderRadius: '20px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{u.name.charAt(0).toUpperCase()}</div>
                  <span style={{ fontWeight: '600' }}>{u.name}</span>
                </div>
                
                {splitMode === 'UNEQUAL' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', padding: '8px 15px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹</span>
                    <input type="number" placeholder="0" value={manualAmounts[u.id] || ''} onChange={(e) => handleManualChange(u.id, e.target.value)} style={{ width: '70px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', outline: 'none', textAlign: 'right' }} />
                  </div>
                ) : <Check size={20} color="#10b981" />}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px' }}>
            <button type="submit" disabled={isLoading} style={{ height: '65px', width: '100%', borderRadius: '22px', background: '#10b981', color: 'white', border: 'none', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}>
              {isLoading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;