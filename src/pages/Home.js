import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Bell, LogOut, MessageCircle, ArrowUpRight, ArrowDownLeft, 
  Utensils, Car, ShoppingBag, Zap, Receipt
} from 'lucide-react';
import { API_BASE_URL } from '../config'; 

const Home = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Balance States
  const [totalBalance, setTotalBalance] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);

  const [notifCount, setNotifCount] = useState(0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeExpenseId, setActiveExpenseId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [viewedExpenseIds, setViewedExpenseIds] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
    } else {
      setCurrentUser(user);
      fetchData(user.id);
    }
  }, []);

  const fetchData = (userId) => {
    setLoading(true);
    
    // 1. Fetch Expenses
    fetch(`${API_BASE_URL}/api/expenses/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log("🔥 API Data Received:", data); // Check Console to see if data is coming

        if (!Array.isArray(data)) {
            console.error("Data is not an array:", data);
            setExpenses([]);
            setLoading(false);
            return;
        }

        // Remove Duplicates & Sort
        const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
        const sortedData = uniqueData.sort((a, b) => {
            const dateA = parseDate(a.createdAt).getTime();
            const dateB = parseDate(b.createdAt).getTime();
            return dateB - dateA; 
        });
        
        setExpenses(sortedData);
        calculateRealBalance(sortedData, userId);
        setLoading(false);
      })
      .catch(err => {
          console.error("Fetch Error:", err);
          setLoading(false);
      });

    // 2. Fetch Notifications
    fetch(`${API_BASE_URL}/api/notifications/${userId}`)
        .then(res => res.json())
        .then(data => setNotifCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setNotifCount(0));
  };

  // 🔥 CORE LOGIC (SAFE VERSION)
  const calculateRealBalance = (data, userId) => {
      const myId = Number(userId);
      let balanceMap = {}; 

      if (!Array.isArray(data)) return;

      data.forEach(expense => {
          // Safety Check: Agar expense ya paidBy missing hai to skip karo
          if (!expense || !expense.paidBy) return;

          // PaidBy ID nikalne ka safe tareeka (Object ho ya Direct ID)
          const payerId = expense.paidBy.id ? Number(expense.paidBy.id) : Number(expense.paidBy);
          
          if (expense.splits && Array.isArray(expense.splits)) {
              expense.splits.forEach(split => {
                  if (!split.user) return;

                  // User ID nikalne ka safe tareeka
                  const splitUserId = split.user.id ? Number(split.user.id) : Number(split.user);
                  const amount = Number(split.amount) || Number(split.amountOwed) || 0;

                  // Calculation Logic
                  if (payerId === myId && splitUserId !== myId) {
                      // Maine pay kiya, dost udhaar hai (Positive)
                      balanceMap[splitUserId] = (balanceMap[splitUserId] || 0) + amount;
                  } 
                  else if (splitUserId === myId && payerId !== myId) {
                      // Dost ne pay kiya, main udhaar hu (Negative)
                      balanceMap[payerId] = (balanceMap[payerId] || 0) - amount;
                  }
              });
          }
      });

      let totalOwe = 0;
      let totalGet = 0;

      Object.values(balanceMap).forEach(bal => {
          if (bal > 0) totalGet += bal;
          else totalOwe += Math.abs(bal);
      });

      console.log("Calculated -> Owe:", totalOwe, "Get:", totalGet);

      setYouOwe(totalOwe);
      setYouAreOwed(totalGet);
      setTotalBalance(totalGet - totalOwe);
  };

  // --- Helpers ---
  const parseDate = (dateInput) => {
      if (!dateInput) return new Date(); 
      if (Array.isArray(dateInput)) {
          const [year, month, day, hour, minute, second] = dateInput;
          return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
      }
      return new Date(dateInput);
  };

  const formatDate = (dateInput) => {
      try {
        const date = parseDate(dateInput);
        if (isNaN(date.getTime())) return 'Just now';
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      } catch (e) { return 'Date Error'; }
  };

  const getCategoryIcon = (desc) => {
    const d = desc ? desc.toLowerCase() : "";
    if (d.includes('food') || d.includes('pizza')) return <Utensils size={20} color="#f59e0b" />;
    if (d.includes('travel') || d.includes('cab')) return <Car size={20} color="#3b82f6" />;
    if (d.includes('shopping')) return <ShoppingBag size={20} color="#ec4899" />;
    if (d.includes('bill') || d.includes('rent')) return <Zap size={20} color="#eab308" />;
    if (d.includes('settle')) return <ArrowUpRight size={20} color="#10b981" />; 
    return <Receipt size={20} color="#10b981" />;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };

  // --- Comments ---
  const openComments = (expenseId) => {
    setActiveExpenseId(expenseId);
    setShowCommentModal(true);
    fetchComments(expenseId);
    if (!viewedExpenseIds.includes(expenseId)) setViewedExpenseIds([...viewedExpenseIds, expenseId]);
  };

  const fetchComments = (expenseId) => {
    fetch(`${API_BASE_URL}/api/comments/${expenseId}`).then(res => res.json()).then(setComments).catch(e => console.log(e));
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
        await fetch(`${API_BASE_URL}/api/comments/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newComment, userId: currentUser.id, expenseId: activeExpenseId })
        });
        setNewComment('');
        fetchComments(activeExpenseId);
    } catch(e) { console.error("Comment Error", e); }
  };

  const hasUnreadChat = (expense) => {
      if (viewedExpenseIds.includes(expense.id)) return false;
      if (expense.comments && expense.comments.length > 0) {
          return expense.comments[expense.comments.length - 1].user?.id !== currentUser?.id;
      }
      return false;
  };

  const handleLogout = () => {
    if(window.confirm("Logout?")) { localStorage.removeItem('user'); navigate('/'); }
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', background: '#0f172a', minHeight:'100vh', color: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', position: 'sticky', top: 0, zIndex: 10, background: '#0f172a' }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight:'600' }}>{getGreeting()},</p>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0', color: 'white' }}>{currentUser?.name?.split(' ')[0]} 👋</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
             <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer', background:'#1e293b', padding:'10px', borderRadius:'50%' }}>
                <Bell size={20} color="white" />
                {notifCount > 0 && <span style={{ position: 'absolute', top: '0', right: '0', background: '#f43f5e', width: '10px', height: '10px', borderRadius: '50%' }}></span>}
             </div>
             <div onClick={handleLogout} style={{ cursor:'pointer', background:'#1e293b', padding:'10px', borderRadius:'50%' }}><LogOut size={20} color="#f43f5e" /></div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', padding: '25px', borderRadius: '28px', position: 'relative', overflow: 'hidden', marginBottom: '30px' }}>
        <div style={{position:'relative', zIndex:2}}>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight:'700' }}>TOTAL BALANCE</p>
            <h1 style={{ margin: '8px 0', fontSize: '42px', fontWeight: '800', color: 'white' }}>{totalBalance < 0 ? '-' : ''}₹{Math.abs(totalBalance).toFixed(2)}</h1>
            <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <div style={{flex:1, background:'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'16px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{background:'rgba(255,255,255,0.2)', padding:'6px', borderRadius:'50%'}}><ArrowDownLeft size={16} color="white"/></div>
                    <div><span style={{fontSize:'10px', color:'rgba(255,255,255,0.8)', display:'block'}}>Get Back</span><span style={{fontSize:'14px', fontWeight:'bold', color:'white'}}>₹{youAreOwed.toFixed(2)}</span></div>
                </div>
                <div style={{flex:1, background:'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'16px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{background:'rgba(255,255,255,0.2)', padding:'6px', borderRadius:'50%'}}><ArrowUpRight size={16} color="white"/></div>
                    <div><span style={{fontSize:'10px', color:'rgba(255,255,255,0.8)', display:'block'}}>You Owe</span><span style={{fontSize:'14px', fontWeight:'bold', color:'white'}}>₹{youOwe.toFixed(2)}</span></div>
                </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate('/settle')} style={{ background: 'white', color: '#047857', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', flex: 1 }}>Settle Up</button>
                <button onClick={() => navigate('/analysis')} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '12px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', flex: 1 }}>Analysis</button>
            </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color:'white' }}>Recent Transactions</h3>
        <span onClick={() => navigate('/history')} style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}>View All</span>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {expenses.length > 0 ? expenses.slice(0, 10).map((expense) => {
            // SAFE CHECK: Check if paidBy exists
            const isMyExpense = expense.paidBy?.id === currentUser?.id;
            const payerName = expense.paidBy?.name || "Unknown";
            const hasNewMsg = hasUnreadChat(expense);
            
            return (
                <div key={expense.id} className="card" style={{ padding: '16px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getCategoryIcon(expense.description)}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'white' }}>{expense.description}</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                                {isMyExpense ? 'You paid' : `${payerName} paid`} • {formatDate(expense.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 'bold', color: isMyExpense ? '#10b981' : '#f43f5e' }}>{isMyExpense ? '+' : '-'} ₹{expense.totalAmount}</span>
                        <div onClick={() => openComments(expense.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', background: hasNewMsg ? 'rgba(244, 63, 94, 0.15)' : '#334155', color: hasNewMsg ? '#f43f5e' : '#cbd5e1', padding: '4px 8px', borderRadius: '8px', border: hasNewMsg ? '1px solid rgba(244, 63, 94, 0.4)' : 'none' }}>
                            <MessageCircle size={12} fill={hasNewMsg ? "currentColor" : "none"} /> {hasNewMsg ? 'New' : 'Chat'}
                        </div>
                    </div>
                </div>
            )
          }) : <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}><Receipt size={40} style={{ opacity: 0.2, marginBottom: '10px' }} /><p>No expenses yet.</p></div>}
        </div>
      )}

      {/* FAB & Bottom Nav */}
      <div style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 10 }}>
        <button onClick={() => navigate('/add-expense')} style={{ width: '60px', height: '60px', borderRadius: '20px', background: '#10b981', border: 'none', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize:'30px' }}><Plus size={28} strokeWidth={3} /></button>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 5 }}>
        {['Home', 'Groups', 'Settle', 'Profile'].map((item) => (
            <div key={item} onClick={() => item === 'Home' ? null : navigate(`/${item.toLowerCase()}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: item === 'Home' ? 1 : 0.5 }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: item === 'Home' ? '#10b981' : '#64748b' }}>{item}</span>
            </div>
        ))}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div onClick={() => setShowCommentModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
             <div onClick={(e) => e.stopPropagation()} style={{ background: '#1e293b', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px' }}>
                <p style={{color:'white', marginBottom:'10px', fontWeight:'bold'}}>Discussion</p>
                <div style={{ maxHeight:'200px', overflowY:'auto', marginBottom:'15px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {comments.map((c, i) => <div key={i} style={{background: c.user?.id === currentUser?.id ? '#10b981' : '#334155', alignSelf: c.user?.id === currentUser?.id ? 'flex-end' : 'flex-start', padding:'8px 12px', borderRadius:'12px', color:'white', fontSize:'13px'}}>{c.text}</div>)}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Type..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendComment()} style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px', color: 'white', outline:'none' }} />
                    <button onClick={handleSendComment} style={{ background: '#10b981', border: 'none', padding:'0 15px', borderRadius: '12px', color:'white', fontWeight:'bold' }}>Send</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;