import React, { useState, useEffect } from 'react';
import { Plus, Users, UserPlus, Trash2, ShieldCheck, X, CheckCircle, AtSign, Mail, User, Shield, Loader, BellRing, Clock, Eye, Wallet, ChevronRight } from 'lucide-react';
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

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) return;
      const user = JSON.parse(userJson);
      setCurrentUser(user);

      // ✅ Fetching specific groups for the user
      const [groupsRes, friendsRes, incReqRes, sentReqRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/groups/my-groups?userId=${user.id}`),
        fetch(`${API_BASE_URL}/api/users/my-friends?email=${user.email}`),
        fetch(`${API_BASE_URL}/api/users/pending-requests?email=${user.email}`),
        fetch(`${API_BASE_URL}/api/users/sent-requests?email=${user.email}`)
      ]);
      
      if (groupsRes.ok) setGroups(await groupsRes.json());
      if (friendsRes.ok) setFriends(await friendsRes.json());
      if (incReqRes.ok) setIncomingRequests(await incReqRes.json());
      if (sentReqRes.ok) setSentRequests(await sentReqRes.json());
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading data", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- STATS LOGIC ---
  useEffect(() => {
    if (viewFriend) {
        setStatsLoading(true);
        const expensePromise = fetch(`${API_BASE_URL}/api/expenses/user/${viewFriend.id}`).then(res => res.json());
        const friendListPromise = fetch(`${API_BASE_URL}/api/users/my-friends?email=${viewFriend.email}`).then(res => res.json());

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

  // --- HANDLERS ---
  const handleVerifyUPI = () => {
    if (!newFriendUPI.includes('@')) return alert("Invalid Format!");
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

  const handleCreateGroup = async () => {
    if (!groupName) return alert("Group name daalo bhai!");
    if (selectedFriendIds.length === 0) return alert("Kam se kam ek dost select karo!");
    
    // Add current user to members
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
      {/* Header Tabs */}
      <div style={{padding:'20px 0'}}>
        <h2 style={{fontSize:'24px', fontWeight:'800', marginBottom:'20px'}}>Community</h2>
        <div style={{display:'flex', background:'#1e293b', padding:'5px', borderRadius:'14px', border:'1px solid #334155'}}>
            <button onClick={() => setActiveTab('GROUPS')} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background: activeTab === 'GROUPS' ? '#10b981' : 'transparent', color: activeTab === 'GROUPS' ? 'white' : '#94a3b8', fontWeight:'bold', cursor:'pointer'}}>Groups</button>
            <button onClick={() => setActiveTab('FRIENDS')} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background: activeTab === 'FRIENDS' ? '#10b981' : 'transparent', color: activeTab === 'FRIENDS' ? 'white' : '#94a3b8', fontWeight:'bold', cursor:'pointer'}}>Friends</button>
        </div>
      </div>

      {loading ? <div style={{textAlign:'center', marginTop:'50px'}}><Loader className="animate-spin" color="#10b981"/></div> : (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {/* GROUPS TAB */}
            {activeTab === 'GROUPS' && (
                <>
                {groups.map(group => (
                    <div key={group.id} style={{padding:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <div style={{width:'50px', height:'50px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}><Users size={24} color="#10b981"/></div>
                            <div>
                                <h4 style={{margin:0, fontSize:'17px'}}>{group.name}</h4>
                                <span style={{fontSize:'12px', color:'#94a3b8'}}>{group.members?.length || 0} members</span>
                            </div>
                        </div>
                        {group.adminId === currentUser?.id && <Trash2 size={18} color="#f43f5e" onClick={() => handleDelete('GROUP', group.id)} style={{cursor:'pointer'}}/>}
                    </div>
                ))}
                {groups.length === 0 && <p style={{textAlign:'center', color:'#64748b', marginTop:'40px'}}>No groups yet. Click + to create one.</p>}
                </>
            )}

            {/* FRIENDS TAB */}
            {activeTab === 'FRIENDS' && (
                <>
                {friends.map(friend => (
                    <div key={friend.id} style={{padding:'15px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#1e293b', borderRadius:'16px', border:'1px solid #334155'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'40px', height:'40px', background:'#334155', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>
                                {friend.name?.charAt(0).toUpperCase()}
                            </div>
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
                ))}
                </>
            )}
        </div>
      )}

      {/* FAB */}
      <div style={{position:'fixed', bottom:'90px', right:'20px', zIndex:50}}>
        <button onClick={() => activeTab === 'GROUPS' ? setShowGroupModal(true) : setShowFriendModal(true)} style={{width:'60px', height:'60px', borderRadius:'20px', background:'#10b981', border:'none', display:'flex', alignItems:'center', justifyContent:'center', color:'white', boxShadow:'0 10px 25px rgba(16, 185, 129, 0.4)'}}>
            {activeTab === 'GROUPS' ? <Plus size={30} /> : <UserPlus size={26} />}
        </button>
      </div>

      {/* PROFILE MODAL */}
      {viewFriend && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
            <div style={{width:'100%', maxWidth:'350px', background:'#1e293b', borderRadius:'24px', border:'1px solid #334155', overflow:'hidden'}}>
                <div style={{padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #334155'}}>
                    <h3 style={{margin:0}}>Profile</h3>
                    <X onClick={() => setViewFriend(null)} style={{cursor:'pointer'}}/>
                </div>
                <div style={{padding:'30px 20px', textAlign:'center'}}>
                    <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#10b981', margin:'0 auto 15px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', fontWeight:'bold'}}>{viewFriend.name.charAt(0)}</div>
                    <h2 style={{margin:0}}>{viewFriend.name}</h2>
                    <p style={{color:'#94a3b8', marginBottom:'25px'}}>{viewFriend.email}</p>
                    <div style={{display:'flex', gap:'10px'}}>
                        <div style={{flex:1, background:'#0f172a', padding:'15px', borderRadius:'15px'}}>
                            <Wallet size={20} color="#10b981" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontWeight:'bold'}}>{statsLoading ? '...' : `₹${friendStats.spent}`}</p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Spent</span>
                        </div>
                        <div style={{flex:1, background:'#0f172a', padding:'15px', borderRadius:'15px'}}>
                            <Users size={20} color="#3b82f6" style={{marginBottom:'5px'}}/>
                            <p style={{margin:0, fontWeight:'bold'}}>{statsLoading ? '...' : friendStats.friendsCount}</p>
                            <span style={{fontSize:'10px', color:'#64748b'}}>Friends</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* GROUP MODAL */}
      {showGroupModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
            <div style={{width:'100%', maxWidth:'380px', background:'#1e293b', borderRadius:'24px', padding:'25px', border:'1px solid #334155'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3 style={{margin:0}}>Create New Group</h3>
                    <X onClick={() => setShowGroupModal(false)} style={{cursor:'pointer'}}/>
                </div>
                <input placeholder="Group Name" value={groupName} onChange={e => setGroupName(e.target.value)} style={{width:'100%', padding:'15px', background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', color:'white', marginBottom:'20px', outline:'none'}} />
                <p style={{fontSize:'12px', color:'#94a3b8', marginBottom:'10px'}}>SELECT MEMBERS</p>
                <div style={{maxHeight:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
                    {friends.map(f => (
                        <div key={f.id} onClick={() => setSelectedFriendIds(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id])} style={{padding:'12px', borderRadius:'12px', background: selectedFriendIds.includes(f.id) ? 'rgba(16, 185, 129, 0.1)' : '#0f172a', border: selectedFriendIds.includes(f.id) ? '1px solid #10b981' : '1px solid #334155', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                            {selectedFriendIds.includes(f.id) ? <CheckCircle size={18} color="#10b981"/> : <div style={{width:18, height:18, borderRadius:'50%', border:'1px solid #475569'}}/>}
                            <span>{f.name}</span>
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