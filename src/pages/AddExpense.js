import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Tag, Info, User, LayoutGrid, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AddExpense = () => {
  const navigate = useNavigate();

  // FLOW STATES
  const [flowStep, setFlowStep] = useState('CHOICE'); 
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // FORM STATES
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
        setFlowStep('FORM'); // Window gayab ho jayegi aur blur hat jayega
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
    // (Existing submit logic remains same...)
    setIsLoading(true);
    const expenseData = {
      description, totalAmount: parseFloat(amount), category,
      paidBy: { id: payerId },
      group: selectedGroup ? { id: selectedGroup.id } : null,
      splits: splitWithIds.map(id => ({ user: { id }, amountOwed: (parseFloat(amount)/splitWithIds.length) }))
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
      
      {/* 1️⃣ CHOICE OVERLAY (The Professional Modal) */}
      {(flowStep === 'CHOICE' || flowStep === 'GROUP_LIST') && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', // ✨ Background Blur Effect
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          padding: '20px'
        }}>
          
          {/* Choti Window */}
          <div style={{
            width: '100%', maxWidth: '380px', 
            background: '#1e293b', borderRadius: '28px',
            padding: '30px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            
            {flowStep === 'CHOICE' ? (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '25px', textAlign: 'center' }}>
                  Add Expense To
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div onClick={handleNoGroup} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.3s' }}>
                    <User size={24} color="#10b981" />
                    <h3 style={{ margin: '10px 0 0 0', fontSize: '16px', color: 'white' }}>Personal / Friends</h3>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Split with friends directly</p>
                  </div>
                  <div onClick={() => setFlowStep('GROUP_LIST')} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                    <LayoutGrid size={24} color="#10b981" />
                    <h3 style={{ margin: '10px 0 0 0', fontSize: '16px', color: 'white' }}>In a Group</h3>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Select from your groups</p>
                  </div>
                </div>
              </>
            ) : (
              /* Group List Window */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <ArrowLeft size={20} onClick={() => setFlowStep('CHOICE')} style={{ cursor: 'pointer', color: 'white' }} />
                  <h3 style={{ margin: 0, color: 'white' }}>Select Group</h3>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {groups.map(g => (
                    <div key={g.id} onClick={() => handleGroupSelect(g)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', cursor: 'pointer' }}>
                      <span style={{ color: 'white' }}>{g.name}</span>
                      <ChevronRight size={16} color="#475569" />
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span onClick={() => navigate('/home')} style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Cancel</span>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ MAIN FORM PAGE (Visible behind blur) */}
      <div className="container" style={{ padding: '20px 20px 140px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
          <ArrowLeft onClick={() => navigate('/home')} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Add Expense</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ opacity: flowStep === 'FORM' ? 1 : 0.4 }}>
          {/* Card: Amount & Description */}
          <div style={{ padding: '20px', borderRadius: '24px', background: '#1e293b', border: '1px solid #334155', marginBottom: '20px' }}>
            <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>TOTAL AMOUNT</label>
            <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
              <span style={{ fontSize: '32px', color: '#10b981', fontWeight: 'bold' }}>₹</span>
              <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '32px', fontWeight: 'bold', outline: 'none', marginLeft: '10px' }} />
            </div>
            <input type="text" placeholder="What was this for?" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', borderBottom: '1px solid #334155', padding: '10px 0' }} />
          </div>

          {/* Members List */}
          <h3 style={{ fontSize: '16px', margin: '20px 0 15px 0' }}>Split With</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#1e293b', borderRadius: '18px', border: '1px solid #334155' }}>
                <span style={{ color: 'white' }}>{u.name}</span>
                <Check size={18} color="#10b981" />
              </div>
            ))}
          </div>

          <button type="submit" disabled={isLoading || flowStep !== 'FORM'} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', height: '60px', borderRadius: '20px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
            {isLoading ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;