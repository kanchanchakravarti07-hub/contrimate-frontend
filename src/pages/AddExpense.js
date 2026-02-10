import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, Circle, User, LayoutGrid, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AddExpense = () => {
  const navigate = useNavigate();

  const [flowStep, setFlowStep] = useState('CHOICE'); 
  const [users, setUsers] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); 
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food'); 
  const [payerId, setPayerId] = useState('');
  const [splitMode, setSplitMode] = useState('EQUAL'); 
  
  const [manualAmounts, setManualAmounts] = useState({});
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
        setPayerId(loggedInUser.id);
        
        fetch(`${API_BASE_URL}/api/groups/my-groups?userId=${loggedInUser.id}`)
          .then(res => res.json())
          .then(data => {
              if(Array.isArray(data)) setGroups(data);
              else setGroups([]); // Crash proof
          })
          .catch(err => {
              console.error(err);
              setGroups([]);
          });

        fetch(`${API_BASE_URL}/api/users/all`)
          .then(res => res.json())
          .then(data => setAllUsers(data))
          .catch(err => console.error(err));
    }
  }, []);

  const initializeUsers = (userList) => {
      setUsers(userList);
      setSelectedUserIds(userList.map(u => u.id));
      setManualAmounts({});
  };

  const handleNoGroup = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    fetch(`${API_BASE_URL}/api/users/my-friends?email=${loggedInUser.email}`)
      .then(res => res.json())
      .then(friends => {
        const safeFriends = Array.isArray(friends) ? friends : [];
        const all = [loggedInUser, ...safeFriends];
        initializeUsers(all);
        setSelectedGroup(null);
        setFlowStep('FORM');
      });
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    if (group.memberIds && allUsers.length > 0) {
        const groupMembers = allUsers.filter(user => group.memberIds.includes(user.id));
        initializeUsers(groupMembers);
    } else {
        setUsers([]);
    }
    setFlowStep('FORM');
  };

  const toggleUserSelection = (userId) => {
      if (selectedUserIds.includes(userId)) {
          setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
      } else {
          setSelectedUserIds([...selectedUserIds, userId]);
      }
  };

  const handleManualChange = (userId, val) => {
    setManualAmounts({ ...manualAmounts, [userId]: val });
  };

  const getDiffTotal = () => {
      let total = 0;
      Object.values(manualAmounts).forEach(val => {
          total += parseFloat(val) || 0;
      });
      return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return alert("Description daalo bhai!");

    let finalTotal = 0;
    let splits = [];

    if (splitMode === 'EQUAL') {
      finalTotal = parseFloat(amount);
      if (!finalTotal || finalTotal <= 0) return alert("Total Amount sahi daalo!");
      if (selectedUserIds.length === 0) return alert("Kam se kam ek banda toh select karo!");

      const share = parseFloat((finalTotal / selectedUserIds.length).toFixed(2));
      
      splits = selectedUserIds.map(id => ({ 
          user: { id }, 
          amountOwed: share 
      }));

    } else {
      finalTotal = getDiffTotal();
      if (finalTotal <= 0) return alert("Amounts toh daalo bhai!");

      users.forEach(u => {
          const val = parseFloat(manualAmounts[u.id] || 0);
          if (val > 0) {
              splits.push({ user: { id: u.id }, amountOwed: val });
          }
      });
    }

    setIsLoading(true);
    const expenseData = {
      description,
      totalAmount: finalTotal,
      category,
      paidBy: { id: payerId },
      group: selectedGroup ? { id: selectedGroup.id } : null,
      splits: splits
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/expenses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      
      if (res.ok) {
        navigate('/home');
      } else {
        const errText = await res.text();
        alert("Error: " + errText);
      }
    } catch (error) {
      alert("Network Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0f172a', fontFamily: 'sans-serif' }}>
      
      {(flowStep === 'CHOICE' || flowStep === 'GROUP_LIST') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px', background: '#1e293b', borderRadius: '32px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {flowStep === 'CHOICE' ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '30px', textAlign: 'center' }}>Add Expense To</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div onClick={handleNoGroup} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '12px'}}><User size={28} color="#10b981" /></div>
                    <div><h3 style={{ margin: '0', fontSize: '18px', color: 'white' }}>Personal / Friends</h3><p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Split with friends directly</p></div>
                  </div>
                  <div onClick={() => setFlowStep('GROUP_LIST')} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '12px'}}><LayoutGrid size={28} color="#10b981" /></div>
                    <div><h3 style={{ margin: '0', fontSize: '18px', color: 'white' }}>In a Group</h3><p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Select from your groups</p></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                  <ArrowLeft size={22} onClick={() => setFlowStep('CHOICE')} style={{ cursor: 'pointer', color: 'white' }} />
                  <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '700' }}>Select Group</h3>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* SAFE MAP: Check if groups is array */}
                  {Array.isArray(groups) && groups.map(g => (
                    <div key={g.id} onClick={() => handleGroupSelect(g)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'white', fontWeight: '600' }}>{g.name}</span>
                      <ChevronRight size={18} color="#475569" />
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ textAlign: 'center', marginTop: '25px' }}><span onClick={() => navigate('/home')} style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Cancel</span></div>
          </div>
        </div>
      )}

      {flowStep === 'FORM' && (
      <div className="container" style={{ padding: '0 20px 140px 20px', color: 'white', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
          <ArrowLeft onClick={() => setFlowStep('CHOICE')} style={{ cursor: 'pointer' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{selectedGroup ? selectedGroup.name : 'Add Expense'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', background: '#1e293b', padding: '4px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #334155' }}>
            <button type="button" onClick={() => setSplitMode('EQUAL')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: splitMode === 'EQUAL' ? '#334155' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Equal Split</button>
            <button type="button" onClick={() => setSplitMode('UNEQUAL')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: splitMode === 'UNEQUAL' ? '#10b981' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Diff Bill</button>
          </div>

          <div className="card" style={{ padding: '25px', borderRadius: '28px', background: '#1e293b', marginBottom: '20px', border: '1px solid #334155' }}>
            
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
                <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL AMOUNT</label>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '36px', color: '#10b981', fontWeight: 'bold' }}>₹</span>
                  
                  {splitMode === 'EQUAL' ? (
                      <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '36px', fontWeight: 'bold', outline: 'none', marginLeft: '12px' }} />
                  ) : (
                      <span style={{ fontSize: '36px', color: 'white', fontWeight: 'bold', marginLeft: '12px' }}>{getDiffTotal()}</span>
                  )}
                </div>
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>DESCRIPTION</label>
              <input type="text" placeholder="e.g. Dinner, Movie" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '18px', outline: 'none', marginTop: '10px' }} />
            </div>
          </div>

          <h3 style={{ fontSize: '16px', margin: '25px 0 15px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="#10b981" /> Split With</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.length > 0 ? users.map(u => {
                const isSelected = selectedUserIds.includes(u.id);

                return (
                  <div 
                    key={u.id} 
                    onClick={() => splitMode === 'EQUAL' && toggleUserSelection(u.id)} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', background: isSelected || splitMode === 'UNEQUAL' ? '#1e293b' : '#0f172a', borderRadius: '20px', border: isSelected ? '1px solid #10b981' : '1px solid #334155', cursor: splitMode === 'EQUAL' ? 'pointer' : 'default', opacity: (splitMode === 'EQUAL' && !isSelected) ? 0.6 : 1, transition: '0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                          {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span style={{ fontWeight: '600' }}>{u.name}</span>
                    </div>
                    
                    {splitMode === 'UNEQUAL' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', padding: '8px 15px', borderRadius: '12px', border: '1px solid #334155' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹</span>
                        <input type="number" placeholder="0" value={manualAmounts[u.id] || ''} onChange={(e) => handleManualChange(u.id, e.target.value)} style={{ width: '70px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', outline: 'none', textAlign: 'right' }} />
                      </div>
                    ) : (
                        isSelected ? <CheckCircle size={22} color="#10b981" fill="#10b981" stroke="black" /> : <Circle size={22} color="#64748b" />
                    )}
                  </div>
                );
            }) : <p style={{color: '#64748b', textAlign: 'center'}}>No members found</p>}
          </div>

          <div style={{ marginTop: '30px' }}>
            <button type="submit" disabled={isLoading} style={{ height: '65px', width: '100%', borderRadius: '22px', background: isLoading ? '#334155' : '#10b981', color: 'white', border: 'none', fontSize: '18px', fontWeight: 'bold', boxShadow: isLoading ? 'none' : '0 12px 24px rgba(16, 185, 129, 0.3)', cursor: isLoading ? 'not-allowed' : 'pointer', transition: '0.3s' }}>
              {isLoading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default AddExpense;