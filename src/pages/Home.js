import React, { useState, useEffect, useRef } from 'react';
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
  
  const [totalBalance, setTotalBalance] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);

  const [notifCount, setNotifCount] = useState(0);
  const prevCountRef = useRef(0);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeExpenseId, setActiveExpenseId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 🔥 FIX 1: Read Status ko LocalStorage se uthao (Refresh ke baad bhi yaad rahega)
  const [readStatus, setReadStatus] = useState(() => {
      const saved = localStorage.getItem('chatReadStatus');
      return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
    } else {
      setCurrentUser(user);
      fetchData(user.id);
      const interval = setInterval(() => fetchNotifications(user.id), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async (userId) => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count/${userId}`);
          if (res.ok) {
              const count = await res.json();
              setNotifCount(count);
              if (count > prevCountRef.current) {
                  const audio = new Audio('/notification.mp3');
                  audio.play().catch(e => console.log("Audio permission needed"));
              }
              prevCountRef.current = count;
          }
      } catch (e) { console.error("Notif Error"); }
  };

  const fetchData = async (userId) => {
    setLoading(true);
    try {
      const [expensesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/expenses/user/${userId}`).then(res => res.ok ? res.json() : [])
      ]);
      
      fetchNotifications(userId);

      const safeExpenses = Array.isArray(expensesRes) ? expensesRes : [];
      const uniqueData = Array.from(new Map(safeExpenses.map(item => [item.id, item])).values());
      const sortedData = uniqueData.sort((a, b) => {
          return parseDate(b.createdAt) - parseDate(a.createdAt); 
      });
      
      setExpenses(sortedData);
      calculateRealBalance(sortedData, userId);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRealBalance = (data, userId) => {
      const myId = Number(userId);
      let balanceMap = {}; 

      if (!Array.isArray(data)) return;

      data.forEach(expense => {
          if (!expense || !expense.paidBy) return;
          const payerId = typeof expense.paidBy === 'object' ? Number(expense.paidBy.id) : Number(expense.paidBy);
          
          if (expense.splits && Array.isArray(expense.splits)) {
              expense.splits.forEach(split => {
                  if (!split.user) return;
                  const splitUserId = typeof split.user === 'object' ? Number(split.user.id) : Number(split.user);
                  const amount = Number(split.amount) || Number(split.amountOwed) || 0;

                  if (payerId === myId && splitUserId !== myId) {
                      balanceMap[splitUserId] = (balanceMap[splitUserId] || 0) + amount;
                  } 
                  else if (splitUserId === myId && payerId !== myId) {
                      balanceMap[payerId] = (balanceMap[payerId] || 0) - amount;
                  }
              });
          }
      });

      let finalOwe = 0;
      let finalGet = 0;

      Object.values(balanceMap).forEach(bal => {
          if (bal > 0) finalGet += bal;
          else finalOwe += Math.abs(bal);
      });

      setYouOwe(finalOwe);
      setYouAreOwed(finalGet);
      setTotalBalance(finalGet - finalOwe);
  };

  const parseDate = (dateInput) => {
      if (!dateInput) return new Date(); 
      if (Array.isArray(dateInput)) {
          return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3]||0, dateInput[4]||0, dateInput[5]||0);
      }
      return new Date(dateInput);
  };

  const formatDate = (dateInput) => {
      try {
        const date = parseDate(dateInput);
        if (isNaN(date.getTime())) return 'Just now';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
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

  const openComments = (expenseId, lastCommentId) => {
    setActiveExpenseId(expenseId);
    setShowCommentModal(true);
    fetchComments(expenseId);

    // 🔥 FIX 2: Jab chat khule, toh LocalStorage update karo
    if (lastCommentId) {
        const newStatus = { ...readStatus, [expenseId]: lastCommentId };
        setReadStatus(newStatus);
        localStorage.setItem('chatReadStatus', JSON.stringify(newStatus));
    }
  };

  const fetchComments = (expenseId) => {
    fetch(`${API_BASE_URL}/api/comments/${expenseId}`).then(res => res.ok ? res.json() : []).then(setComments).catch(() => {});
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    
    // Optimistic Update
    const tempComment = { text: newComment, user: { id: currentUser.id }, createdAt: new Date() };
    setComments([...comments, tempComment]);

    try {
        const res = await fetch(`${API_BASE_URL}/api/comments/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newComment, userId: currentUser.id, expenseId: activeExpenseId })
        });
        
        if (res.ok) {
            const savedComment = await res.json();
            setNewComment('');
            // Apne khud ke comment ko bhi read mark kar lo
            const newStatus = { ...readStatus, [activeExpenseId]: savedComment.id };
            setReadStatus(newStatus);
            localStorage.setItem('chatReadStatus', JSON.stringify(newStatus));
            fetchComments(activeExpenseId);
        }
    } catch(e) {}
  };

  // 🔥 FIX 3: Smart "New Chat" Logic
  const hasUnreadChat = (expense) => {
      if (!expense.comments || expense.comments.length === 0) return false;
      
      const lastComment = expense.comments[expense.comments.length - 1];
      const commentUserId = lastComment.user?.id || lastComment.user;
      
      // Agar maine msg kiya hai, to unread nahi hai
      if (String(commentUserId) === String(currentUser?.id)) return false;

      // Agar last comment ID mere saved ID se bada hai, to New Chat hai
      const lastReadId = readStatus[expense.id] || 0;
      return lastComment.id > lastReadId;
  };

  const handleLogout = () => {
    if(window.confirm("Logout?")) { localStorage.removeItem('user'); navigate('/'); }
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', background: '#0f172a', minHeight:'100vh', color: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', position: 'sticky', top: 0, zIndex: 10, background: '#0f172a' }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight:'600' }}>{getGreeting()},</p>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0', color: 'white' }}>{currentUser?.name?.split(' ')[0]} 👋</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
             <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer', background:'#1e293b', padding:'10px', borderRadius:'50%' }}>
                <Bell size={20} color="white" />
                {notifCount > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#f43f5e', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0f172a' }}>
                        {notifCount > 9 ? '9+' : notifCount}
                    </span>
                )}
             </div>
             <div onClick={handleLogout} style={{ cursor:'pointer', background:'#1e293b', padding:'10px', borderRadius:'50%' }}><LogOut size={20} color="#f43f5e" /></div>
        </div>
      </div>

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color:'white' }}>Recent Transactions</h3>
        <span onClick={() => navigate('/history')} style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}>View All</span>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {expenses.length > 0 ? expenses.slice(0, 10).map((expense) => {
            const isMyExpense = String(expense.paidBy?.id) === String(currentUser?.id);
            const payerName = expense.paidBy?.name || "Unknown";
            const hasNewMsg = hasUnreadChat(expense);
            // Get last comment ID for updating read status
            const lastCommentId = expense.comments && expense.comments.length > 0 ? expense.comments[expense.comments.length-1].id : null;
            
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
                        <div onClick={() => openComments(expense.id, lastCommentId)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', background: hasNewMsg ? 'rgba(244, 63, 94, 0.15)' : '#334155', color: hasNewMsg ? '#f43f5e' : '#cbd5e1', padding: '4px 8px', borderRadius: '8px', border: hasNewMsg ? '1px solid rgba(244, 63, 94, 0.4)' : 'none' }}>
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

      {showCommentModal && (
        <div onClick={() => setShowCommentModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
             <div onClick={(e) => e.stopPropagation()} style={{ background: '#1e293b', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px' }}>
                <p style={{color:'white', marginBottom:'10px', fontWeight:'bold'}}>Discussion</p>
                <div style={{ maxHeight:'200px', overflowY:'auto', marginBottom:'15px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {comments.map((c, i) => {
                        const isMe = String(c.user?.id || c.user) === String(currentUser?.id);
                        return (
                            <div key={i} style={{background: isMe ? '#10b981' : '#334155', alignSelf: isMe ? 'flex-end' : 'flex-start', padding:'8px 12px', borderRadius:'12px', color:'white', fontSize:'13px'}}>
                                {c.text}
                            </div>
                        );
                    })}
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