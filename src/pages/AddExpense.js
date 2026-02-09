import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Tag, Info, User, LayoutGrid, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AddExpense = () => {
  const navigate = useNavigate();

  // --- FLOW STATES ---
  const [flowStep, setFlowStep] = useState('CHOICE'); // 'CHOICE', 'GROUP_LIST', 'FORM'
  
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food'); 
  const [payerId, setPayerId] = useState('');
  const [splitWithIds, setSplitWithIds] = useState([]);
  const [splitMode, setSplitMode] = useState('EQUAL'); 
  const [manualAmounts, setManualAmounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = ["Food", "Travel", "Shopping", "Entertainment", "Rent", "Bills", "Misc"];

  // Fetch groups on mount
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
        setPayerId(loggedInUser.id);
        fetch(`${API_BASE_URL}/api/groups/my-groups?userId=${loggedInUser.id}`)
          .then(res => res.json())
          .then(data => setGroups(data))
          .catch(err => console.error("Groups load error:", err));
    }
  }, []);

  // --- HANDLERS ---
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

  const toggleUser = (id) => {
    if (splitWithIds.includes(id)) {
        setSplitWithIds(splitWithIds.filter(userId => userId !== id));
    } else {
        setSplitWithIds([...splitWithIds, id]);
    }
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
      else alert("Error saving expense");
    } catch (error) { alert("Server Error"); } finally { setIsLoading(false); }
  };

  // --- 1. WINDOW: CHOICE ---
  if (flowStep === 'CHOICE') {
    return (
      <div className="container" style={{background:'#0f172a', minHeight:'100vh', padding:'40px 20px', color:'white', textAlign:'center'}}>
        <h2 style={{fontSize:'24px', fontWeight:'800', marginBottom:'30px'}}>Select Expense Type</h2>
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            <div onClick={handleNoGroup} style={{background:'#1e293b', padding:'25px', borderRadius:'20px', border:'1px solid #334155', cursor:'pointer', textAlign:'left'}}>
                <User size={40} color="#10b981" style={{marginBottom:'10px'}}/>
                <h3 style={{margin:0}}>Personal / Non-Group</h3>
                <p style={{color:'#94a3b8', fontSize:'13px', marginTop:'5px'}}>Split with specific friends directly</p>
            </div>
            <div onClick={() => setFlowStep('GROUP_LIST')} style={{background:'#1e293b', padding:'25px', borderRadius:'20px', border:'1px solid #334155', cursor:'pointer', textAlign:'left'}}>
                <LayoutGrid size={40} color="#10b981" style={{marginBottom:'10px'}}/>
                <h3 style={{margin:0}}>With a Group</h3>
                <p style={{color:'#94a3b8', fontSize:'13px', marginTop:'5px'}}>Select from your created groups</p>
            </div>
        </div>
        <button onClick={() => navigate('/home')} style={{marginTop:'40px', background:'transparent', color:'#94a3b8', border:'none', cursor:'pointer'}}>Cancel</button>
      </div>
    );
  }

  // --- 2. WINDOW: GROUP LIST ---
  if (flowStep === 'GROUP_LIST') {
    return (
      <div className="container" style={{background:'#0f172a', minHeight:'100vh', padding:'20px', color:'white'}}>
        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px'}}>
            <ArrowLeft onClick={() => setFlowStep('CHOICE')} style={{cursor:'pointer'}} />
            <h2 style={{fontSize:'20px', fontWeight:'700', margin:0}}>Select Group</h2>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {groups.length > 0 ? groups.map(group => (
                <div key={group.id} onClick={() => handleGroupSelect(group)} style={{background:'#1e293b', padding:'18px', borderRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #334155', cursor:'pointer'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <div style={{width:'45px', height:'45px', borderRadius:'12px', background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'bold'}}>{group.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h4 style={{margin:0, fontSize:'16px'}}>{group.name}</h4>
                            <p style={{margin:0, fontSize:'12px', color:'#94a3b8'}}>{group.members.length} members</p>
                        </div>
                    </div>
                    <ChevronRight size={20} color="#334155" />
                </div>
            )) : <p style={{textAlign:'center', color:'#94a3b8', marginTop:'20px'}}>No groups found. Create one first!</p>}
        </div>
      </div>
    );
  }

  // --- 3. WINDOW: FORM ---
  return (
    <div className="container" style={{padding: '0 20px 140px 20px', background:'#0f172a', minHeight:'100vh', color:'white'}}>
      <div style={{display:'flex', alignItems:'center', gap:'15px', padding:'20px 0'}}>
        <ArrowLeft onClick={() => setFlowStep('CHOICE')} style={{cursor:'pointer', color:'white'}} />
        <h2 style={{fontSize:'18px', fontWeight:'700', margin:0}}>{selectedGroup ? `Group: ${selectedGroup.name}` : 'Personal Expense'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{display:'flex', background:'#1e293b', padding:'4px', borderRadius:'12px', marginBottom:'20px'}}>
            <button type="button" onClick={() => setSplitMode('EQUAL')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', background: splitMode === 'EQUAL' ? '#1e293b' : 'transparent', color: splitMode === 'EQUAL' ? 'white' : '#94a3b8', fontWeight:'600', cursor:'pointer', border: splitMode === 'EQUAL' ? '1px solid #334155' : 'none'}}>Equal Split</button>
            <button type="button" onClick={() => { setSplitMode('UNEQUAL'); setAmount(''); }} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', background: splitMode === 'UNEQUAL' ? '#10b981' : 'transparent', color: splitMode === 'UNEQUAL' ? 'white' : '#94a3b8', fontWeight:'600', cursor:'pointer'}}>Diff Bill</button>
        </div>

        <div className="card" style={{padding:'20px', borderRadius:'20px', background:'#1e293b', marginBottom:'20px', border:'1px solid #334155'}}>
            {splitMode === 'EQUAL' && (
                <div style={{borderBottom:'1px solid #334155', paddingBottom:'15px', marginBottom:'15px'}}>
                    <label style={{color:'#94a3b8', fontSize:'11px', fontWeight:'bold'}}>TOTAL AMOUNT</label>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <span style={{fontSize:'32px', color:'#10b981', fontWeight:'bold'}}>₹</span>
                        <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{width:'100%', background:'transparent', border:'none', color:'white', fontSize:'32px', fontWeight:'bold', outline:'none', marginLeft:'10px'}} />
                    </div>
                </div>
            )}
            <div style={{marginBottom:'15px'}}>
                <label style={{color:'#94a3b8', fontSize:'11px', fontWeight:'bold'}}>DESCRIPTION</label>
                <input type="text" placeholder="e.g. Pizza Party" value={description} onChange={(e) => setDescription(e.target.value)} style={{width:'100%', background:'transparent', border:'none', color:'white', fontSize:'16px', outline:'none', marginTop:'5px'}} />
            </div>
            <div>
                <label style={{color:'#94a3b8', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold'}}><Tag size={12}/> CATEGORY</label>
                <div style={{display:'flex', gap:'8px', overflowX:'auto', marginTop:'10px', paddingBottom:'5px', scrollbarWidth:'none'}}>
                    {categories.map(cat => (
                        <div key={cat} onClick={() => setCategory(cat)} style={{padding:'6px 14px', borderRadius:'20px', fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap', background: category === cat ? '#10b981' : '#334155', color: category === cat ? 'white' : '#94a3b8'}}>{cat}</div>
                    ))}
                </div>
            </div>
        </div>

        <h3 style={{fontSize:'16px', margin:'0 0 15px 0', display:'flex', alignItems:'center', gap:'10px'}}>
            <Users size={18} color="#10b981"/> {selectedGroup ? 'Group Members' : 'Split With'}
        </h3>

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {users.map(user => {
                const isSelected = splitWithIds.includes(user.id);
                return (
                    <div key={user.id} onClick={() => splitMode === 'EQUAL' && toggleUser(user.id)} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', border: isSelected ? '1px solid #10b981' : '1px solid transparent', background: isSelected ? 'rgba(16, 185, 129, 0.1)' : '#1e293b', borderRadius:'16px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'36px', height:'36px', borderRadius:'10px', background: isSelected ? '#10b981' : '#334155', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold'}}>{user.name.charAt(0).toUpperCase()}</div>
                            <p style={{margin:0, color: isSelected ? 'white' : '#94a3b8', fontSize:'14px'}}>{user.name}</p>
                        </div>
                        {isSelected && <Check size={18} color="#10b981" />}
                    </div>
                )
            })}
        </div>

        <div style={{marginTop:'30px'}}>
            <button type="submit" disabled={isLoading} style={{height:'55px', width: '100%', borderRadius:'16px', background: '#10b981', color: 'white', border: 'none', fontSize:'16px', fontWeight:'bold', cursor: 'pointer'}}>
                {isLoading ? 'Saving...' : 'Save Expense'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;