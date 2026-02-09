import React, { useState, useEffect } from 'react';

function App() {
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  
 
  const [settlePayer, setSettlePayer] = useState('');
  const [settleReceiver, setSettleReceiver] = useState('');
  const [mode, setMode] = useState('EXPENSE'); // 'EXPENSE' ya 'SETTLE' toggle karne ke liye

  const [expenses, setExpenses] = useState([]); 
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState({}); 
  const [message, setMessage] = useState('');

  
  const fetchData = async () => {
    try {
      const userRes = await fetch('http://localhost:8081/api/users/all');
      const userData = await userRes.json();
      setUsers(userData);
      
     
      if(userData.length > 0) {
        if(!payerId) setPayerId(userData[0].id);
        if(!settlePayer) setSettlePayer(userData[0].id);
        if(!settleReceiver) setSettleReceiver(userData.length > 1 ? userData[1].id : userData[0].id);
      }

      const expRes = await fetch('http://localhost:8081/api/expenses/all');
      const expData = await expRes.json();
      setExpenses(expData);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  
  useEffect(() => {
    if (users.length === 0) return;
    const newBalances = {};
    users.forEach(u => newBalances[u.id] = 0);

    expenses.forEach(exp => {
      const paidBy = exp.paidBy.id;
      newBalances[paidBy] += exp.totalAmount; // Payer ka (+)
      
      exp.splits.forEach(split => {
        newBalances[split.user.id] -= split.amountOwed; // Consumer ka (-)
      });
    });
    setBalances(newBalances);
  }, [expenses, users]);

  
  const handleSubmit = async () => {
    setMessage('Processing...');
    
    let url = '';
    let data = {};

    if (mode === 'EXPENSE') {
        url = 'http://localhost:8081/api/expenses/add';
        data = { groupId: 1, payerId, description, amount };
    } else {
        
        if(settlePayer === settleReceiver) {
            alert("Khud ko paise wapas nahi kar sakte bhai! 😂");
            setMessage('');
            return;
        }
        url = 'http://localhost:8081/api/expenses/settle';
        data = { payerId: settlePayer, receiverId: settleReceiver, amount };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setMessage('✅ Success!');
        setDescription('');
        setAmount('');
        fetchData(); 
      } else {
        setMessage('❌ Error.');
      }
    } catch (error) { setMessage('❌ Server Error.'); }
  };

  const handleClearAll = async () => {
    if(!window.confirm("⚠️ Are you sure? Sara hisaab delete ho jayega!")) return;

    try {
      await fetch('http://localhost:8081/api/expenses/clear', {
        method: 'DELETE'
      });
      fetchData(); 
      alert("App Reset Successfully! 🧹");
    } catch (error) {
      alert("Failed to clear!");
    }
  };
  
  const handleDelete = async (id) => {
    if(!window.confirm("Sure delete karna hai?")) return;

    try {
      await fetch(`http://localhost:8081/api/expenses/delete/${id}`, {
        method: 'DELETE'
      });
      fetchData(); 
    } catch (error) {
      alert("Delete failed!");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1>💸 ContriMate</h1>
      <button 
        onClick={handleClearAll}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          padding: '10px 15px', 
          borderRadius: '5px', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🧨 Reset App
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {users.map(user => {
            const bal = balances[user.id] || 0;
            const color = bal >= 0 ? '#28a745' : '#dc3545';
            return (
                <div key={user.id} style={{ border: `2px solid ${color}`, borderRadius: '10px', padding: '15px', width: '120px', backgroundColor: 'white' }}>
                    <strong>{user.name}</strong>
                    <h3 style={{ color: color, margin: '10px 0' }}>
                        {bal >= 0 ? `+${bal.toFixed(0)}` : bal.toFixed(0)}
                    </h3>
                </div>
            )
        })}
      </div>

      
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '15px' }}>
            <button onClick={() => setMode('EXPENSE')} style={{ padding: '10px 20px', marginRight: '10px', borderRadius: '20px', border: 'none', backgroundColor: mode === 'EXPENSE' ? '#007bff' : '#e2e6ea', color: mode === 'EXPENSE' ? 'white' : 'black', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ Add Expense
            </button>
            <button onClick={() => setMode('SETTLE')} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: mode === 'SETTLE' ? '#28a745' : '#e2e6ea', color: mode === 'SETTLE' ? 'white' : 'black', cursor: 'pointer', fontWeight: 'bold' }}>
                🤝 Settle Up
            </button>
        </div>

        {mode === 'EXPENSE' ? (
          
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <select value={payerId} onChange={(e) => setPayerId(e.target.value)} style={{padding: '10px'}}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="text" placeholder="Item (e.g. Pizza)" value={description} onChange={(e) => setDescription(e.target.value)} style={{padding: '10px'}} />
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{padding: '10px', width: '100px'}} />
            </div>
        ) : (
           
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={settlePayer} onChange={(e) => setSettlePayer(e.target.value)} style={{padding: '10px'}}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <span> ➡️ Pays ➡️ </span>
                <select value={settleReceiver} onChange={(e) => setSettleReceiver(e.target.value)} style={{padding: '10px'}}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{padding: '10px', width: '100px'}} />
            </div>
        )}

        <button onClick={handleSubmit} style={{ marginTop: '15px', padding: '10px 30px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {mode === 'EXPENSE' ? 'Add Expense' : 'Pay Now'}
        </button>
        <p>{message}</p>
      </div>

   
      <h3 style={{textAlign: 'left', marginTop: '30px'}}>Recent Activity</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <tbody>
          {expenses.slice().reverse().map((exp) => (
            <tr key={exp.id} style={{ borderBottom: '1px solid #eee', height: '50px' }}>
              
              
              <td>
                  <div style={{fontWeight: 'bold'}}>{exp.description}</div>
                  <div style={{fontSize: '12px', color: '#888'}}>
                    {exp.splits.map(s => s.amountOwed > 0 ? `${s.user.name} owes ₹${s.amountOwed} ` : '').join(' | ')}
                  </div>
              </td>

            
              <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                <div style={{fontWeight: 'bold'}}>₹{exp.totalAmount}</div>
                <div style={{fontSize: '12px', color: '#555'}}>
                  {exp.paidBy ? exp.paidBy.name : 'Unknown'} paid
                </div>
              </td>

              
              <td style={{ width: '50px', textAlign: 'center' }}>
                <button 
                  onClick={() => handleDelete(exp.id)}
                  style={{ 
                    backgroundColor: '#ffcccc', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '30px', 
                    height: '30px', 
                    cursor: 'pointer',
                    color: 'red',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;