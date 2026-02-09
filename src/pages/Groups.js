import React, { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, Trash2, ShieldCheck, X, CheckCircle, AtSign, Mail, User, Shield, Loader, BellRing, Clock, Eye, Wallet } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Groups = () => {
  const [activeTab, setActiveTab] = useState('GROUPS');
  
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  
  // 🔥 View Friend Logic
  const [viewFriend, setViewFriend] = useState(null);
  const [friendStats, setFriendStats] = useState({ spent: 0, friendsCount: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  // Inputs
  const [groupName, setGroupName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newFriendUPI, setNewFriendUPI] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  // --- LOAD DATA ---
  const fetchData = async () => {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) return;
      const user = JSON.parse(userJson);
      setCurrentUser(user);

      const [groupsRes, friendsRes, incReqRes, sentReqRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/groups/all`),
        fetch(`${API_BASE_URL}/api/users/my-friends?email=${user.email}`),
        fetch(`${API_BASE_URL}/api/users/pending-requests?email=${user.email}`),
        fetch(`${API_BASE_URL}/api/users/sent-requests?email=${user.email}`)
      ]);
      
      setGroups(await groupsRes.json());
      setFriends(await friendsRes.json());
      setIncomingRequests(await incReqRes.json());
      setSentRequests(await sentReqRes.json());
      setLoading(false);
    } catch (err) {
      console.error("Error loading data", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 🔥 FETCH REAL STATS & REAL FRIEND COUNT
  useEffect(() => {
    if (viewFriend) {
        setStatsLoading(true);
        
        // 1. Fetch Expenses (For Total Spent)
        const expensePromise = fetch(`${API_BASE_URL}/api/expenses/user/${viewFriend.id}`).then(res => res.json());
        
        // 2. Fetch Friends List (For Real Count)
        const friendListPromise = fetch(`${API_BASE_URL}/api/users/my-friends?email=${viewFriend.email}`).then(res => res.json());

        Promise.all([expensePromise, friendListPromise])
            .then(([expensesData, friendsData]) => {
                // Calculate Spent
                const total = Array.isArray(expensesData) 
                    ? expensesData.reduce((acc, curr) => (curr.paidBy?.id === viewFriend.id ? acc + curr.totalAmount : acc), 0)
                    : 0;
                
                // Calculate Real Friend Count
                const count = Array.isArray(friendsData) ? friendsData.length : 0;

                setFriendStats({ spent: total, friendsCount: count });
                setStatsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching stats", err);
                setFriendStats({ spent: 0, friendsCount: 0 });
                setStatsLoading(false);
            });
    }
  }, [viewFriend]);

  // --- Handlers ---
  const handleVerifyUPI = () => {
    if (!newFriendUPI) return alert("UPI ID daalo pehle!");
    if (!newFriendUPI.includes('@')) return alert("Invalid Format!");
    setIsVerifying(true);
    setTimeout(() => {
        setIsVerifying(false);
        setIsUpiVerified(true);
        if(!newFriendName) {
            const extractedName = newFriendUPI.split('@')[0];
            setNewFriendName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1)); 
        }
    }, 1500);
  };

  const handleAddFriend = async () => {
    if (!newFriendEmail || !isUpiVerified) return alert("Verify karna zaroori hai!");
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/add-friend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ myEmail: currentUser.email, friendEmail: newFriendEmail.trim().toLowerCase() })
        });
        if (res.ok) {
            alert("Request Sent! 📩");
            setShowFriendModal(false);
            setNewFriendName(''); setNewFriendEmail(''); setNewFriendUPI(''); setIsUpiVerified(false);
            fetchData(); 
        } else {
            alert(await res.text());
        }
    } catch (error) { alert("Server Error"); }
  };

  const handleAccept = async (requestId) => {
    await fetch(`${API_BASE_URL}/api/users/accept-friend`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ requestId })
    });
    fetchData();
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(type === 'CANCEL' ? "Cancel request?" : "Are you sure?")) return;
    if (type === 'GROUP') await fetch(`${API_BASE_URL}/api/groups/delete/${id}`, { method: 'DELETE' });
    else await fetch(`${API_BASE_URL}/api/users/remove-friend`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myEmail: currentUser.email, friendId: id })
    });
    fetchData();
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert("Name missing");
    const members = [...selectedFriendIds, currentUser.id];
    await fetch(`${API_BASE_URL}/api/groups/add`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, adminId: currentUser.id, memberIds: members })
    });
    setShowGroupModal(false); setGroupName(''); setSelectedFriendIds([]); fetchData();
  };

  const toggleFriendSelection = (id) => {
    setSelectedFriendIds(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  return (
    <div className="container" style={{paddingBottom:'100px', background:'#0f172a', minHeight:'100vh', color:'white'}}>
      <div style={{padding:'20px 0'}}>
        <h2 style={{fontSize:'24px', fontWeight:'800', marginBottom:'20px'}}>Community</h2>
        <div style={{display:'flex', background:'#1e293b', padding:'5px', borderRadius:'14px', border:'1px solid #334155'}}>
            <button onClick={() => setActiveTab('GROUPS')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', background: activeTab === 'GROUPS' ? '#10b981' : 'transparent', color: activeTab === 'GROUPS' ? 'white' : '#94a3b8', fontWeight:'600', transition:'0.3s', cursor:'pointer'}}>My Groups</button>
            <button onClick={() => setActiveTab('FRIENDS')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', background: activeTab === 'FRIENDS' ? '#10b981' : 'transparent', color: activeTab === 'FRIENDS' ? 'white' : '#94a3b8', fontWeight:'600', transition:'0.3s', cursor:'pointer'}}>
                Friends {incomingRequests.length > 0 && <span style={{background:'#f43f5e', padding:'2px 6px', borderRadius:'10px', fontSize:'10px', marginLeft:'5px', color:'white'}}>{incomingRequests.length}</span>}
            </button>
        </div>
      </div>

      {loading ? <p style={{textAlign:'center', color:'#64748b'}}>Loading...</p> : (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            
            {activeTab === 'GROUPS' && groups.map(group => (
                <div key={group.id} className="card" style={{padding:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <div style={{width:'50px', height:'50px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}><Users size={24} color="#10b981"/></div>
                        <div><h4 style={{margin:0, fontSize:'18px', color:'white'}}>{group.name}</h4><span style={{fontSize:'12px', color:'#94a3b8'}}>Admin: {group.adminId === currentUser?.id ? 'Me' : 'Friend'}</span></div>
                    </div>
                    {currentUser && group.adminId === currentUser.id && (<Trash2 size={20} color="#f43f5e" style={{cursor:'pointer', opacity:0.7}} onClick={() => handleDelete('GROUP', group.id)}/>)}
                </div>
            ))}

            {activeTab === 'FRIENDS' && (
                <>
                    {/* INCOMING */}
                    {incomingRequests.length > 0 && (
                        <div style={{marginBottom:'20px'}}>
                            <h4 style={{color:'#f43f5e', fontSize:'12px', marginBottom:'10px', letterSpacing:'1px', fontWeight:'bold', paddingLeft:'5px'}}>PENDING REQUESTS</h4>
                            {incomingRequests.map(req => (
                                <div key={req.id} className="card" style={{padding:'15px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid rgba(244, 63, 94, 0.3)', background:'rgba(244, 63, 94, 0.1)', borderRadius:'16px', marginBottom:'10px'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <div style={{width:'35px', height:'35px', background:'#0f172a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><BellRing size={16} color="#f43f5e"/></div>
                                        <div><p style={{margin:0, fontSize:'14px', fontWeight:'bold', color:'white'}}>{req.user.name}</p><p style={{margin:0, fontSize:'11px', color:'#ccc'}}>Wants to add you</p></div>
                                    </div>
                                    <div style={{display:'flex', gap:'8px'}}>
                                        <button onClick={() => handleAccept(req.id)} style={{background:'#10b981', border:'none', padding:'6px 12px', borderRadius:'8px', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:'bold'}}>Accept</button>
                                        <button onClick={() => handleDelete('USER', req.user.id)} style={{background:'#333', border:'none', padding:'6px', borderRadius:'8px', color:'#aaa', cursor:'pointer'}}><X size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SENT */}
                    {sentRequests.length > 0 && (
                        <div style={{marginBottom:'20px'}}>
                            <h4 style={{color:'#f59e0b', fontSize:'12px', marginBottom:'10px', letterSpacing:'1px', fontWeight:'bold', paddingLeft:'5px'}}>SENT REQUESTS</h4>
                            {sentRequests.map(req => (
                                <div key={req.id} className="card" style={{padding:'15px', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid rgba(245, 158, 11, 0.3)', background:'rgba(245, 158, 11, 0.1)', borderRadius:'16px', marginBottom:'10px'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <div style={{width:'35px', height:'35px', background:'#0f172a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><Clock size={16} color="#f59e0b"/></div>
                                        <div><p style={{margin:0, fontSize:'14px', fontWeight:'bold', color:'white'}}>{req.friend ? req.friend.name : 'Unknown'}</p><p style={{margin:0, fontSize:'11px', color:'#ccc'}}>Waiting for approval</p></div>
                                    </div>
                                    <button onClick={() => handleDelete('CANCEL', req.friend ? req.friend.id : req.id)} style={{background:'transparent', border:'1px solid #64748b', padding:'6px 12px', borderRadius:'8px', color:'#cbd5e1', fontSize:'11px', cursor:'pointer'}}>Cancel</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FRIENDS LIST */}
                    {friends.map(friend => (
                        <div key={friend.id} className="card" style={{padding:'15px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                <div style={{width:'40px', height:'40px', background:'#334155', borderRadius:'50%', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #475569'}}>
                                    {friend.profilePic ? (
                                        <img src={friend.profilePic} alt="pfp" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                    ) : (
                                        <span style={{fontWeight:'bold', color:'white'}}>{friend.name?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div><h4 style={{margin:0, fontSize:'16px', color:'white'}}>{friend.name}</h4><span style={{fontSize:'12px', color:'#94a3b8'}}>{friend.email}</span></div>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <div onClick={() => setViewFriend(friend)} style={{background:'#0f172a', padding:'8px', borderRadius:'8px', cursor:'pointer', border:'1px solid #334155'}}>
                                    <Eye size={16} color="#3b82f6"/>
                                </div>
                                <div onClick={() => handleDelete('USER', friend.id)} style={{background:'#0f172a', padding:'8px', borderRadius:'8px', cursor:'pointer', border:'1px solid #334155'}}>
                                    <Trash2 size={16} color="#f43f5e"/>
                                </div>
                            </div>
                        </div>
                    ))}
                    {friends.length === 0 && incomingRequests.length === 0 && sentRequests.length === 0 && (<div style={{textAlign:'center', marginTop:'50px', color:'#64748b'}}><UserPlus size={40} style={{opacity:0.5, marginBottom:'10px'}}/><p>No friends yet.</p></div>)}
                </>
            )}

            {activeTab === 'GROUPS' && groups.length === 0 && <div style={{textAlign:'center', marginTop:'50px', color:'#64748b'}}><Users size={40} style={{opacity:0.5, marginBottom:'10px'}}/><p>No groups yet.</p></div>}
        </div>
      )}

      {/* FAB */}
      <div style={{position:'fixed', bottom:'90px', right:'20px', zIndex:50}}>
        <button onClick={() => activeTab === 'GROUPS' ? setShowGroupModal(true) : setShowFriendModal(true)} style={{width:'60px', height:'60px', borderRadius:'20px', background:'#10b981', border:'none', boxShadow:'0 10px 25px rgba(16, 185, 129, 0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white'}}>
            {activeTab === 'GROUPS' ? <Plus size={28} strokeWidth={3}/> : <UserPlus size={26} strokeWidth={2.5}/>}
        </button>
      </div>

      {/* FRIEND PROFILE MODAL */}
      {viewFriend && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100}}>
            <div className="card" style={{width:'85%', maxWidth:'350px', padding:'0', background:'#1e293b', borderRadius:'24px', border:'1px solid #334155', overflow:'hidden'}}>
                <div style={{background:'#0f172a', padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white', fontSize:'16px'}}>Friend Profile</h3>
                    <div onClick={() => setViewFriend(null)} style={{cursor:'pointer', padding:'5px', background:'#1e293b', borderRadius:'50%'}}><X size={16} color="white"/></div>
                </div>
                
                <div style={{padding:'30px 20px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#3b82f6', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:'bold', color:'white', border:'4px solid #0f172a', marginBottom:'15px'}}>
                        {viewFriend.profilePic ? (
                             <img src={viewFriend.profilePic} alt="pfp" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        ) : (
                            viewFriend.name?.charAt(0).toUpperCase()
                        )}
                    </div>

                    <h2 style={{margin:0, fontSize:'22px'}}>{viewFriend.name}</h2>
                    <p style={{margin:'5px 0 20px 0', color:'#94a3b8', fontSize:'13px'}}>{viewFriend.email}</p>

                    <div style={{display:'flex', width:'100%', gap:'10px'}}>
                        <div style={{flex:1, background:'#0f172a', padding:'10px', borderRadius:'12px', textAlign:'center', border:'1px solid #334155'}}>
                            <Wallet size={18} color="#10b981" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontSize:'14px', fontWeight:'bold'}}>
                                {statsLoading ? '...' : `₹${friendStats.spent}`}
                            </p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Spent</span>
                        </div>
                        <div style={{flex:1, background:'#0f172a', padding:'10px', borderRadius:'12px', textAlign:'center', border:'1px solid #334155'}}>
                            <Users size={18} color="#3b82f6" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontSize:'14px', fontWeight:'bold'}}>
                                {/* 🔥 Real Count Display */}
                                {statsLoading ? '...' : friendStats.friendsCount}
                            </p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Friends</span>
                        </div>
                        <div style={{flex:1, background:'#0f172a', padding:'10px', borderRadius:'12px', textAlign:'center', border:'1px solid #334155'}}>
                            <ShieldCheck size={18} color="#f59e0b" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontSize:'14px', fontWeight:'bold'}}>Yes</p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Add Friend/Group Modals - (Omitted for brevity, keep existing) */}
      {showFriendModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
            <div className="card" style={{width:'85%', maxWidth:'350px', padding:'25px', background:'#1e293b', borderRadius:'24px', border:'1px solid #334155'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white'}}>Send Request</h3>
                    <div onClick={() => setShowFriendModal(false)} style={{cursor:'pointer', padding:'5px', background:'#334155', borderRadius:'50%'}}><X size={18} color="white"/></div>
                </div>
                <div style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px', background:'#0f172a', borderRadius:'12px', border: isUpiVerified ? '1px solid #10b981' : '1px solid #334155', padding:'0 5px'}}>
                    <div style={{padding:'12px', color:'#64748b'}}><AtSign size={18}/></div>
                    <input placeholder="UPI ID" value={newFriendUPI} onChange={e => { setNewFriendUPI(e.target.value); setIsUpiVerified(false); }} style={{width:'100%', background:'transparent', color:'white', border:'none', outline:'none', fontSize:'14px'}} />
                    {!isUpiVerified ? (<button onClick={handleVerifyUPI} disabled={isVerifying} style={{fontSize:'12px', background: isVerifying ? 'transparent' : '#10b981', border:'none', borderRadius:'8px', padding:'8px 12px', color: isVerifying ? '#64748b' : 'white', cursor:'pointer', fontWeight:'bold'}}>{isVerifying ? 'Checking...' : 'Verify'}</button>) : <CheckCircle size={20} color="#10b981" style={{marginRight:'10px'}}/>}
                </div>
                {isUpiVerified && <div style={{marginBottom:'15px', color:'#10b981', fontSize:'12px', background:'rgba(16, 185, 129, 0.1)', padding:'8px', borderRadius:'8px'}}>✓ Valid User: {newFriendName}</div>}
                <div style={{marginBottom:'15px', position:'relative'}}><User size={18} style={{position:'absolute', top:'14px', left:'14px', color:'#64748b'}}/><input placeholder="Name" value={newFriendName} onChange={e => setNewFriendName(e.target.value)} style={{width:'100%', padding:'14px 14px 14px 45px', background:'#0f172a', borderRadius:'12px', border:'1px solid #334155', color:'white', outline:'none'}} /></div>
                <div style={{marginBottom:'25px', position:'relative'}}><Mail size={18} style={{position:'absolute', top:'14px', left:'14px', color:'#64748b'}}/><input placeholder="Email" value={newFriendEmail} onChange={e => setNewFriendEmail(e.target.value)} style={{width:'100%', padding:'14px 14px 14px 45px', background:'#0f172a', borderRadius:'12px', border:'1px solid #334155', color:'white', outline:'none'}} /></div>
                <button onClick={handleAddFriend} disabled={!isUpiVerified} style={{width:'100%', padding:'15px', borderRadius:'16px', background: isUpiVerified ? '#10b981' : '#334155', color: isUpiVerified ? 'white' : '#64748b', border:'none', fontWeight:'bold', fontSize:'16px', cursor: isUpiVerified ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}><ShieldCheck size={20}/> Send Request</button>
            </div>
        </div>
      )}

      {showGroupModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
            <div className="card" style={{width:'85%', maxWidth:'350px', padding:'25px', background:'#1e293b', borderRadius:'24px', border:'1px solid #334155', maxHeight:'80vh', overflowY:'auto'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white'}}>Create Group</h3>
                    <div onClick={() => setShowGroupModal(false)} style={{cursor:'pointer', padding:'5px', background:'#334155', borderRadius:'50%'}}><X size={18} color="white"/></div>
                </div>
                <input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} style={{width:'100%', padding:'14px', background:'#0f172a', borderRadius:'12px', marginBottom:'20px', border:'1px solid #334155', color:'white', outline:'none'}} />
                <p style={{fontSize:'12px', color:'#64748b', marginBottom:'10px', fontWeight:'bold', letterSpacing:'1px'}}>SELECT MEMBERS</p>
                <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'25px'}}>
                    {friends.map(f => (
                        <div key={f.id} onClick={() => toggleFriendSelection(f.id)} style={{display:'flex', alignItems:'center', padding:'12px', background: selectedFriendIds.includes(f.id) ? 'rgba(16, 185, 129, 0.1)' : '#0f172a', borderRadius:'12px', cursor:'pointer', border: selectedFriendIds.includes(f.id) ? '1px solid #10b981' : '1px solid #334155', transition:'0.2s'}}>
                            {selectedFriendIds.includes(f.id) && <CheckCircle size={18} color="#10b981" style={{marginRight:'10px'}}/>}
                            <span style={{color:'white', fontWeight: selectedFriendIds.includes(f.id) ? 'bold' : 'normal'}}>{f.name}</span>
                        </div>
                    ))}
                    {friends.length === 0 && <p style={{fontSize:'12px', color:'#64748b', fontStyle:'italic'}}>Add friends first to create a group.</p>}
                </div>
                <button onClick={handleCreateGroup} disabled={friends.length === 0} style={{width:'100%', padding:'15px', borderRadius:'16px', background: friends.length > 0 ? '#10b981' : '#334155', color: 'white', border:'none', fontWeight:'bold', fontSize:'16px', cursor: friends.length > 0 ? 'pointer' : 'not-allowed'}}>Create Group</button>
            </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 5 }}>
        {['Home', 'Groups', 'Settle', 'Profile'].map((item) => (
            <div key={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: item === 'Groups' ? 1 : 0.5 }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: item === 'Groups' ? '#10b981' : '#64748b' }}>{item}</span>
            </div>
        ))}
      </div>
    </div>
  );
};
export default Groups;