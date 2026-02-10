import React, { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, Trash2, X, CheckCircle, Wallet, Clock, Loader, Eye } from 'lucide-react';
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
  
  const [viewFriend, setViewFriend] = useState(null);
  const [friendStats, setFriendStats] = useState({ spent: 0, friendsCount: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newFriendUPI, setNewFriendUPI] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  const fetchData = async () => {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) return;
      const user = JSON.parse(userJson);
      setCurrentUser(user);

      const [groupsRes, friendsRes, incReqRes, sentReqRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/groups/my-groups?userId=${user.id}`).then(res => res.json()).catch(() => []),
        fetch(`${API_BASE_URL}/api/users/my-friends?email=${user.email}`).then(res => res.json()).catch(() => []),
        fetch(`${API_BASE_URL}/api/users/pending-requests?email=${user.email}`).then(res => res.json()).catch(() => []),
        fetch(`${API_BASE_URL}/api/users/sent-requests?email=${user.email}`).then(res => res.json()).catch(() => [])
      ]);
      
      // Safety Check: Ensure data is array before setting
      setGroups(Array.isArray(groupsRes) ? groupsRes : []);
      setFriends(Array.isArray(friendsRes) ? friendsRes : []);
      setIncomingRequests(Array.isArray(incReqRes) ? incReqRes : []);
      setSentRequests(Array.isArray(sentReqRes) ? sentReqRes : []);
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading data", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const renderAvatar = (userObj, size = '40px') => {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden', border: '1px solid #475569' }}>
        {userObj?.profilePic ? (
          <img src={userObj.profilePic} alt="pfp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{color:'white'}}>{userObj?.name?.charAt(0).toUpperCase()}</span>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (viewFriend) {
        setStatsLoading(true);
        const expensePromise = fetch(`${API_BASE_URL}/api/expenses/user/${viewFriend.id}`).then(res => res.json()).catch(() => []);
        const friendListPromise = fetch(`${API_BASE_URL}/api/users/my-friends?email=${viewFriend.email}`).then(res => res.json()).catch(() => []);

        Promise.all([expensePromise, friendListPromise])
            .then(([expensesData, friendsData]) => {
                const total = Array.isArray(expensesData) 
                    ? expensesData.reduce((acc, curr) => (curr.paidBy?.id === viewFriend.id ? acc + curr.totalAmount : acc), 0)
                    : 0;
                const count = Array.isArray(friendsData) ? friendsData.length : 0;
                setFriendStats({ spent: total, friendsCount: count });
                setStatsLoading(false);
            })
            .catch(() => setStatsLoading(false));
    }
  }, [viewFriend]);

  const handleAcceptRequest = async (requestId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/accept-friend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: requestId })
        });
        if (res.ok) {
            alert("Dost ban gaya bhai! ✅");
            fetchData(); 
        } else {
            alert("Error: Accept nahi ho paya.");
        }
    } catch (err) {
        alert("Server Error!");
    }
  };

  const handleVerifyUPI = () => {
    if (!newFriendUPI.includes('@')) return alert("Invalid UPI Format!");
    setIsVerifying(true);
    setTimeout(() => {
        setIsVerifying(false);
        setIsUpiVerified(true);
        if(!newFriendName) {
            const extractedName = newFriendUPI.split('@')[0];
            setNewFriendName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1)); 
        }
    }, 1200);
  };

  const handleSendRequest = async () => {
    const cleanEmail = newFriendEmail.trim().toLowerCase();
    if(!cleanEmail || !isUpiVerified) return alert("Verify UPI and enter Email first!");
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/add-friend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                myEmail: currentUser.email, 
                friendEmail: cleanEmail 
            })
        });
        if(res.ok) {
            alert("Friend Request Sent! 📩");
            setShowFriendModal(false);
            setNewFriendEmail('');
            setNewFriendUPI('');
            setIsUpiVerified(false);
            fetchData();
        } else {
            alert("User not found or already a friend! Check email carefully.");
        }
    } catch (err) { alert("Server Error"); }
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert("Group name daalo bhai!");
    if (selectedFriendIds.length === 0) return alert("Kam se kam ek dost select karo!");
    const memberIds = [...selectedFriendIds, currentUser.id];
    try {
        const res = await fetch(`${API_BASE_URL}/api/groups/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: groupName, adminId: currentUser.id, memberIds: memberIds })
        });
        if (res.ok) {
            setShowGroupModal(false);
            setGroupName('');
            setSelectedFriendIds([]);
            fetchData();
        }
    } catch (err) { alert("Server Error"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure?")) return;
    if (type === 'GROUP') {
        await fetch(`${API_BASE_URL}/api/groups/delete/${id}`, { method: 'DELETE' });
    } else {
        await fetch(`${API_BASE_URL}/api/users/remove-friend`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ myEmail: currentUser.email, friendId: id })
        });
    }
    fetchData();
  };

  return (
    <div className="container" style={{paddingBottom:'100px', background:'#0f172a', minHeight:'100vh', color:'white'}}>
      <div style={{padding:'20px 0'}}>
        <h2 style={{fontSize:'24px', fontWeight:'800', marginBottom:'20px'}}>Community</h2>
        <div style={{display:'flex', background:'#1e293b', padding:'5px', borderRadius:'14px', border:'1px solid #334155'}}>
            <button onClick={() => setActiveTab('GROUPS')} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background: activeTab === 'GROUPS' ? '#10b981' : 'transparent', color: activeTab === 'GROUPS' ? 'white' : '#94a3b8', fontWeight:'bold', cursor:'pointer'}}>Groups</button>
            <button onClick={() => setActiveTab('FRIENDS')} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background: activeTab === 'FRIENDS' ? '#10b981' : 'transparent', color: activeTab === 'FRIENDS' ? 'white' : '#94a3b8', fontWeight:'bold', cursor:'pointer'}}>Friends</button>
        </div>
      </div>

      {loading ? <div style={{textAlign:'center', marginTop:'50px'}}><Loader className="animate-spin" color="#10b981"/></div> : (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            
            {/* SAFE MAP: Array.isArray check added */}
            {activeTab === 'GROUPS' && Array.isArray(groups) && groups.map(group => (
                 <div key={group.id} style={{padding:'20px', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155'}}>
                 <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'15px'}}>
                     <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                         <div style={{width:'50px', height:'50px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}><Users size={24} color="#10b981"/></div>
                         <div>
                             <h4 style={{margin:0, fontSize:'17px'}}>{group.name}</h4>
                             <span style={{fontSize:'12px', color:'#94a3b8'}}>{group.members?.length || 0} members</span>
                         </div>
                     </div>
                     {group.adminId === currentUser?.id && <Trash2 size={18} color="#f43f5e" onClick={() => handleDelete('GROUP', group.id)} style={{cursor:'pointer'}}/>}
                 </div>
                 
                 <div style={{display:'flex', alignItems:'center', marginLeft:'5px'}}>
                     {Array.isArray(group.members) && group.members.slice(0, 5).map((member, index) => (
                         <div key={member.id} style={{ marginLeft: index === 0 ? 0 : '-10px', border: '2px solid #1e293b', borderRadius: '50%' }}>
                             {renderAvatar(member, '30px')}
                         </div>
                     ))}
                     {group.members?.length > 5 && (
                         <div style={{ marginLeft: '-10px', width: '30px', height: '30px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', border: '2px solid #1e293b', color:'#94a3b8' }}>
                             +{group.members.length - 5}
                         </div>
                     )}
                 </div>
             </div>
            ))}

            {activeTab === 'FRIENDS' && (
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    
                    {Array.isArray(incomingRequests) && incomingRequests.length > 0 && (
                        <div>
                            <h4 style={{fontSize:'12px', color:'#f43f5e', letterSpacing:'1.5px', marginBottom:'12px', fontWeight:'800'}}>PENDING FOR YOU</h4>
                            {incomingRequests.map(req => (
                                <div key={req.id} style={{padding:'16px', background:'rgba(244, 63, 94, 0.05)', borderRadius:'20px', border:'1px solid rgba(244, 63, 94, 0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                                     <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        {renderAvatar(req.user, '42px')}
                                        <div>
                                            <p style={{margin:0, fontWeight:'700', fontSize:'14px'}}>{req.user.name}</p>
                                            <p style={{margin:0, fontSize:'11px', color:'#94a3b8'}}>Wants to be friends</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => handleAcceptRequest(req.id)}
                                        style={{background:'#10b981', color:'white', border:'none', padding:'8px 16px', borderRadius:'10px', fontWeight:'bold', fontSize:'12px', cursor:'pointer'}}
                                     >
                                        Accept
                                     </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {Array.isArray(sentRequests) && sentRequests.length > 0 && (
                        <div>
                            <h4 style={{fontSize:'12px', color:'#3b82f6', letterSpacing:'1.5px', marginBottom:'12px', fontWeight:'800'}}>SENT REQUESTS</h4>
                            {sentRequests.map(req => (
                                <div key={req.id} style={{padding:'14px 18px', background:'#1e293b', borderRadius:'18px', border:'1px solid #334155', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', opacity: 0.85}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        {renderAvatar(req.friend, '38px')}
                                        <span style={{fontSize:'14px', fontWeight:'600'}}>{req.friend.name}</span>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#64748b', fontSize:'11px', fontWeight: 'bold'}}>
                                        <Clock size={12}/> Pending
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <h4 style={{fontSize:'12px', color:'#64748b', letterSpacing:'1.5px', marginBottom:'12px', fontWeight:'800'}}>MY FRIENDS</h4>
                        {Array.isArray(friends) && friends.length > 0 ? friends.map(friend => (
                            <div key={friend.id} style={{padding:'18px', background:'#1e293b', borderRadius:'22px', border:'1px solid #334155', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                                    {renderAvatar(friend, '48px')}
                                    <div>
                                        <h4 style={{margin:0, fontSize:'15px'}}>{friend.name}</h4>
                                        <span style={{fontSize:'12px', color:'#94a3b8'}}>{friend.email}</span>
                                    </div>
                                </div>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button onClick={() => setViewFriend(friend)} style={{background:'#0f172a', border:'1px solid #334155', padding:'8px', borderRadius:'8px'}}><Eye size={16} color="#3b82f6"/></button>
                                    <button onClick={() => handleDelete('USER', friend.id)} style={{background:'#0f172a', border:'1px solid #334155', padding:'8px', borderRadius:'8px'}}><Trash2 size={16} color="#f43f5e"/></button>
                                </div>
                            </div>
                        )) : (
                            <div style={{textAlign:'center', marginTop:'40px', opacity: 0.6}}>
                                <UserPlus size={40} color="#64748b" style={{marginBottom:'10px'}}/>
                                <h3 style={{margin:0, fontSize:'18px'}}>No friends yet</h3>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}

      <div style={{position:'fixed', bottom:'90px', right:'20px', zIndex:50}}>
        <button onClick={() => activeTab === 'GROUPS' ? setShowGroupModal(true) : setShowFriendModal(true)} style={{width:'60px', height:'60px', borderRadius:'20px', background:'#10b981', border:'none', display:'flex', alignItems:'center', justifyContent:'center', color:'white', boxShadow:'0 10px 25px rgba(16, 185, 129, 0.4)'}}>
            {activeTab === 'GROUPS' ? <Plus size={30} /> : <UserPlus size={26} />}
        </button>
      </div>

      {showFriendModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
            <div style={{width:'100%', maxWidth:'380px', background:'#1e293b', borderRadius:'24px', padding:'25px', border:'1px solid #334155'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3 style={{margin:0, color:'white'}}>Add New Friend</h3>
                    <X onClick={() => setShowFriendModal(false)} style={{cursor:'pointer', color:'white'}}/>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <div style={{position:'relative'}}>
                        <input placeholder="Enter UPI ID (e.g. name@upi)" value={newFriendUPI} onChange={e => setNewFriendUPI(e.target.value)} style={{width:'100%', padding:'14px', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', color:'white', outline:'none'}} />
                        <button onClick={handleVerifyUPI} style={{position:'absolute', right:'10px', top:'10px', background:'#3b82f6', border:'none', color:'white', padding:'5px 10px', borderRadius:'8px', fontSize:'12px'}}>Verify</button>
                    </div>

                    {isUpiVerified && (
                        <div style={{background:'rgba(16, 185, 129, 0.1)', padding:'12px', borderRadius:'12px', border:'1px solid #10b981', display:'flex', alignItems:'center', gap:'10px'}}>
                            <CheckCircle size={18} color="#10b981"/>
                            <span style={{fontSize:'14px', color:'#10b981'}}>Found: {newFriendName}</span>
                        </div>
                    )}

                    <input placeholder="Friend's Email Address" value={newFriendEmail} onChange={e => setNewFriendEmail(e.target.value)} style={{width:'100%', padding:'14px', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', color:'white', outline:'none'}} />
                    
                    <button onClick={handleSendRequest} style={{width:'100%', padding:'15px', background:'#10b981', border:'none', borderRadius:'15px', color:'white', fontWeight:'bold', cursor:'pointer', marginTop:'10px'}}>Send Friend Request</button>
                </div>
            </div>
        </div>
      )}

      {viewFriend && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
            <div style={{width:'100%', maxWidth:'350px', background:'#1e293b', borderRadius:'24px', border:'1px solid #334155', overflow:'hidden'}}>
                <div style={{padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #334155'}}>
                    <h3 style={{margin:0}}>Profile</h3>
                    <X onClick={() => setViewFriend(null)} style={{cursor:'pointer', color:'white'}}/>
                </div>
                <div style={{padding:'30px 20px', textAlign:'center'}}>
                    <div style={{margin:'0 auto 15px'}}>{renderAvatar(viewFriend, '80px')}</div>
                    <h2 style={{margin:0, color:'white'}}>{viewFriend.name}</h2>
                    <p style={{color:'#94a3b8', marginBottom:'25px'}}>{viewFriend.email}</p>
                    <div style={{display:'flex', gap:'10px'}}>
                        <div style={{flex:1, background:'#0f172a', padding:'15px', borderRadius:'15px'}}>
                            <Wallet size={20} color="#10b981" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontWeight:'bold', color:'white'}}>{statsLoading ? '...' : `₹${friendStats.spent}`}</p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Spent</span>
                        </div>
                        <div style={{flex:1, background:'#0f172a', padding:'15px', borderRadius:'15px'}}>
                            <Users size={20} color="#3b82f6" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontWeight:'bold', color:'white'}}>{statsLoading ? '...' : friendStats.friendsCount}</p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Friends</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showGroupModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
            <div style={{width:'100%', maxWidth:'380px', background:'#1e293b', borderRadius:'24px', padding:'25px', border:'1px solid #334155'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3 style={{margin:0, color:'white'}}>Create New Group</h3>
                    <X onClick={() => setShowGroupModal(false)} style={{cursor:'pointer', color:'white'}}/>
                </div>
                <input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} style={{width:'100%', padding:'14px', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', color:'white', marginBottom:'20px', outline:'none'}} />
                <p style={{fontSize:'12px', color:'#94a3b8', marginBottom:'10px'}}>SELECT MEMBERS</p>
                <div style={{maxHeight:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
                    {/* Safe Map for friends in modal */}
                    {Array.isArray(friends) && friends.map(f => (
                        <div key={f.id} onClick={() => setSelectedFriendIds(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id])} style={{padding:'12px', borderRadius:'12px', background: selectedFriendIds.includes(f.id) ? 'rgba(16, 185, 129, 0.1)' : '#0f172a', border: selectedFriendIds.includes(f.id) ? '1px solid #10b981' : '1px solid #334155', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                            {selectedFriendIds.includes(f.id) ? <CheckCircle size={18} color="#10b981"/> : <div style={{width:18, height:18, borderRadius:'50%', border:'1px solid #475569'}}/>}
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                {renderAvatar(f, '24px')}
                                <span style={{color: 'white'}}>{f.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleCreateGroup} style={{width:'100%', padding:'15px', background:'#10b981', border:'none', borderRadius:'15px', color:'white', fontWeight:'bold', cursor:'pointer'}}>Create Group</button>
            </div>
        </div>
      )}
    </div>
  );
};
export default Groups;