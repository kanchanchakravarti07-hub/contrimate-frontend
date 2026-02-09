import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Check, Tag, Info } from 'lucide-react';

const AddExpense = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food'); 

  const [payerId, setPayerId] = useState('');
  const [splitWithIds, setSplitWithIds] = useState([]);
  
  // Modes: 'EQUAL' or 'UNEQUAL' (Diff Bill)
  const [splitMode, setSplitMode] = useState('EQUAL'); 
  const [manualAmounts, setManualAmounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Categories List
  const categories = ["Food", "Travel", "Shopping", "Entertainment", "Rent", "Bills", "Misc"];

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
        fetch(`http://localhost:8081/api/users/my-friends?email=${loggedInUser.email}`)
          .then(res => res.json())
          .then(friendsData => {
            const allParticipants = [loggedInUser, ...friendsData];
            setUsers(allParticipants);
            if (allParticipants.length > 0) {
                setPayerId(loggedInUser.id);
                // Default select everyone
                setSplitWithIds(allParticipants.map(u => u.id)); 
            }
          })
          .catch(err => console.error(err));
    }
  }, []);

  const toggleUser = (id) => {
    if (splitWithIds.includes(id)) {
        setSplitWithIds(splitWithIds.filter(userId => userId !== id));
        const newManuals = {...manualAmounts};
        delete newManuals[id];
        setManualAmounts(newManuals);
    } else {
        setSplitWithIds([...splitWithIds, id]);
    }
  };

  const handleManualChange = (userId, val) => {
    setManualAmounts({ ...manualAmounts, [userId]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return alert("Description daalo bhai!");
    if (splitWithIds.length === 0) return alert("Kam se kam ek banda select karo!");

    let finalTotal = parseFloat(amount);
    let splits = [];

    if (splitMode === 'EQUAL') {
      // EQUAL SPLIT LOGIC
      if (!amount || amount <= 0) return alert("Total Amount sahi daalo!");
      const share = parseFloat((finalTotal / splitWithIds.length).toFixed(2));
      splits = splitWithIds.map(id => ({ user: { id }, amountOwed: share }));
    
    } else {
      // 🔥 UNEQUAL (DIFF BILL) LOGIC - FIXED
      let calculatedTotal = 0;
      
      for (const id of splitWithIds) {
        // Agar value empty hai to 0 maano
        const val = parseFloat(manualAmounts[id] || 0);
        
        // ✅ FIX: Pehle 'val <= 0' check tha, ab sirf negative check hai.
        // Matlab 0 amount ab valid hai.
        if (val < 0) return alert("Amount negative nahi ho sakta!");
        
        calculatedTotal += val;
        splits.push({ user: { id }, amountOwed: val });
      }

      // Check: Total bill 0 nahi hona chahiye
      if (calculatedTotal <= 0) return alert("Total bill 0 nahi ho sakta! Kisi ka toh amount daalo.");
      
      finalTotal = calculatedTotal;
    }

    setIsLoading(true);
    
    const expenseData = {
      description,
      totalAmount: finalTotal,
      category,
      paidBy: { id: payerId },
      group: null, 
      splits
    };

    try {
      const res = await fetch('http://localhost:8081/api/expenses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      
      if (res.ok) {
          navigate('/home');
      } else {
          alert("Error saving expense");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{paddingBottom:'100px', background:'#0f172a', minHeight:'100vh', color:'white'}}>
      
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:'15px', padding:'20px 0'}}>
        <ArrowLeft onClick={() => navigate('/home')} style={{cursor:'pointer', color:'white'}} />
        <h2 style={{fontSize:'20px', fontWeight:'700', margin:0}}>Add Expense</h2>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Toggle Mode */}
        <div style={{display:'flex', background:'#1e293b', padding:'4px', borderRadius:'12px', marginBottom:'20px'}}>
            <button 
                type="button"
                onClick={() => setSplitMode('EQUAL')}
                style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', background: splitMode === 'EQUAL' ? '#1e293b' : 'transparent', color: splitMode === 'EQUAL' ? 'white' : '#94a3b8', fontWeight:'600', cursor:'pointer', border: splitMode === 'EQUAL' ? '1px solid #334155' : 'none'}}
            >
                Equal Split
            </button>
            <button 
                type="button"
                onClick={() => {
                    setSplitMode('UNEQUAL');
                    setAmount(''); // Reset total amount logic for unequal
                }}
                style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', background: splitMode === 'UNEQUAL' ? '#10b981' : 'transparent', color: splitMode === 'UNEQUAL' ? 'white' : '#94a3b8', fontWeight:'600', cursor:'pointer'}}
            >
                Diff Bill
            </button>
        </div>

        <div className="card" style={{padding:'20px', borderRadius:'20px', background:'#1e293b', marginBottom:'20px', border:'1px solid #334155'}}>
            
            {/* Disclaimer for Diff Bill */}
            {splitMode === 'UNEQUAL' && (
                <div style={{marginBottom:'15px', padding:'10px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'8px', border:'1px solid rgba(16, 185, 129, 0.2)', fontSize:'12px', color:'#10b981', display:'flex', alignItems:'center', gap:'8px'}}>
                    <Info size={14}/>
                    <span>Enter individual amounts. Put 0 if someone paid but didn't eat.</span>
                </div>
            )}

            {/* Total Amount Input (Only show in Equal Mode) */}
            {splitMode === 'EQUAL' && (
                <div style={{borderBottom:'1px solid #334155', paddingBottom:'15px', marginBottom:'15px'}}>
                    <label style={{color:'#94a3b8', fontSize:'11px', letterSpacing:'1px', fontWeight:'bold'}}>TOTAL AMOUNT</label>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <span style={{fontSize:'32px', color:'#10b981', fontWeight:'bold'}}>₹</span>
                        <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{width:'100%', background:'transparent', border:'none', color:'white', fontSize:'32px', fontWeight:'bold', outline:'none', marginLeft:'10px'}} />
                    </div>
                </div>
            )}

            {/* Description */}
            <div style={{marginBottom:'15px'}}>
                <label style={{color:'#94a3b8', fontSize:'11px', letterSpacing:'1px', fontWeight:'bold'}}>DESCRIPTION</label>
                <input type="text" placeholder="e.g. Pizza, Uber" value={description} onChange={(e) => setDescription(e.target.value)} style={{width:'100%', background:'transparent', border:'none', color:'white', fontSize:'16px', outline:'none', marginTop:'5px', padding:'5px 0'}} />
            </div>

            {/* Category */}
            <div>
                <label style={{color:'#94a3b8', fontSize:'11px', letterSpacing:'1px', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold'}}><Tag size={12}/> CATEGORY</label>
                <div style={{display:'flex', gap:'8px', overflowX:'auto', marginTop:'10px', paddingBottom:'5px', scrollbarWidth:'none'}}>
                    {categories.map(cat => (
                        <div 
                            key={cat} 
                            onClick={() => setCategory(cat)}
                            style={{
                                padding:'6px 14px', borderRadius:'20px', fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap',
                                background: category === cat ? '#10b981' : '#334155',
                                color: category === cat ? 'white' : '#94a3b8',
                                border: category === cat ? 'none' : '1px solid #475569'
                            }}
                        >
                            {cat}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Payer Selection */}
        <div className="card" style={{padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'16px', background:'#1e293b', border:'1px solid #334155', marginBottom:'25px'}}>
            <span style={{color:'#94a3b8', fontSize:'14px'}}>Paid by</span>
            <select value={payerId} onChange={(e) => setPayerId(e.target.value)} style={{background:'#0f172a', color:'#10b981', border:'1px solid #334155', padding:'8px 12px', borderRadius:'10px', fontSize:'14px', outline:'none', fontWeight:'bold'}}>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select>
        </div>

        <h3 style={{fontSize:'16px', margin:'0 0 15px 0', display:'flex', alignItems:'center', gap:'10px', color:'white'}}>
            <Users size={18} color="#10b981"/> Split With
        </h3>

        {/* User Selection List */}
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {users.map(user => {
                const isSelected = splitWithIds.includes(user.id);
                return (
                    <div key={user.id} 
                        onClick={() => splitMode === 'EQUAL' && toggleUser(user.id)} 
                        className="card" 
                        style={{
                            display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', 
                            border: isSelected ? '1px solid #10b981' : '1px solid transparent', 
                            background: isSelected ? 'rgba(16, 185, 129, 0.1)' : '#1e293b', 
                            borderRadius:'16px', cursor: splitMode === 'EQUAL' ? 'pointer' : 'default'
                        }}
                    >
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'36px', height:'36px', borderRadius:'10px', background: isSelected ? '#10b981' : '#334155', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold', color:'white', fontSize:'14px'}}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <p style={{margin:0, fontWeight: isSelected ? '600' : 'normal', color: isSelected ? 'white' : '#94a3b8', fontSize:'14px'}}>{user.name}</p>
                        </div>
                        
                        {splitMode === 'EQUAL' ? (
                            isSelected && <Check size={18} color="#10b981" />
                        ) : (
                            // Input for Diff Bill
                            <div style={{display:'flex', alignItems:'center', gap:'5px', background:'#0f172a', padding:'5px 10px', borderRadius:'8px', border:'1px solid #334155'}}>
                                <span style={{color:'#10b981', fontSize:'12px'}}>₹</span>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={manualAmounts[user.id] || ''}
                                    onChange={(e) => {
                                        if(!splitWithIds.includes(user.id)) toggleUser(user.id);
                                        handleManualChange(user.id, e.target.value);
                                    }}
                                    style={{width:'60px', background:'transparent', border:'none', color:'white', outline:'none', textAlign:'right', fontWeight:'bold'}}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>

        <div style={{position:'fixed', bottom:'20px', left:'0', right:'0', padding:'0 20px', zIndex:10}}>
            <button type="submit" className="btn-primary" disabled={isLoading} style={{height:'55px', width: '100%', borderRadius:'16px', background: '#10b981', color: 'white', border: 'none', fontSize:'16px', fontWeight:'bold', boxShadow:'0 10px 20px rgba(16, 185, 129, 0.3)'}}>
                {isLoading ? 'Saving...' : 'Save Expense'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default AddExpense;