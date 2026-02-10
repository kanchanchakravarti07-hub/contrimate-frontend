import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, HandCoins, Receipt, TrendingUp, Calendar, ChevronRight, PieChart as PieIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

const Analysis = () => {
  const navigate = useNavigate();
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [settlements, setSettlements] = useState([]);   
  const [timeFilter, setTimeFilter] = useState('MONTH'); 
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) fetchExpenses(user.id);
  }, []);

  const fetchExpenses = (userId) => {
    fetch(`${API_BASE_URL}/api/expenses/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setAllExpenses(data);
            applyFilter(data, 'MONTH'); 
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const applyFilter = (data, filterType) => {
    setTimeFilter(filterType);
    const now = new Date();
    const cutoff = new Date();

    if (filterType === 'WEEK') cutoff.setDate(now.getDate() - 7);
    if (filterType === 'MONTH') cutoff.setMonth(now.getMonth() - 1);
    if (filterType === 'YEAR') cutoff.setFullYear(now.getFullYear() - 1);

    const recentData = data.filter(item => {
        const dateVal = Array.isArray(item.createdAt) 
            ? new Date(item.createdAt[0], item.createdAt[1]-1, item.createdAt[2])
            : new Date(item.createdAt);
        return dateVal >= cutoff;
    });

    const realExpenses = recentData.filter(item => !item.description.toLowerCase().includes('settle'));
    const settlementData = recentData.filter(item => item.description.toLowerCase().includes('settle'));

    setSettlements(settlementData); 
    processChartData(realExpenses); 
  };

  const processChartData = (expenses) => {
    const total = expenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
    setTotalExpense(total);

    const categoryMap = {};
    expenses.forEach(exp => {
        let cat = 'General';
        const desc = exp.description.toLowerCase();
        if (desc.includes('food') || desc.includes('pizza') || desc.includes('dinner')) cat = 'Food';
        else if (desc.includes('travel') || desc.includes('cab') || desc.includes('fuel')) cat = 'Travel';
        else if (desc.includes('shopping') || desc.includes('amazon')) cat = 'Shopping';
        else if (desc.includes('bill') || desc.includes('recharge')) cat = 'Bills';

        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += exp.totalAmount;
    });

    const formattedData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));

    setFilteredData(formattedData);
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      
      {/* 🚀 Header */}
      <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div onClick={() => navigate('/home')} style={{ background: '#1e293b', padding: '10px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #334155' }}>
          <ArrowLeft size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Spending Analysis</h2>
      </div>

      {/* 📅 Filter Tabs */}
      <div style={{display:'flex', background:'#1e293b', padding:'5px', borderRadius:'16px', marginBottom:'25px', border:'1px solid #334155'}}>
        {['WEEK', 'MONTH', 'YEAR'].map(filter => (
            <button 
                key={filter}
                onClick={() => applyFilter(allExpenses, filter)}
                style={{
                    flex:1, padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'13px',
                    background: timeFilter === filter ? '#10b981' : 'transparent',
                    color: timeFilter === filter ? 'white' : '#64748b',
                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {filter}
            </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center', marginTop:'100px'}}><TrendingUp className="animate-bounce" color="#10b981" size={40}/></div>
      ) : (
        <>
            {/* 💰 Highlight Card */}
            <div style={{ 
              padding: '30px', borderRadius: '28px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              marginBottom: '30px', textAlign:'center', 
              boxShadow:'0 20px 40px rgba(16, 185, 129, 0.25)', 
              position:'relative', overflow:'hidden' 
            }}>
                <div style={{position:'absolute', bottom:'-20px', right:'-20px', width:'120px', height:'120px', background:'rgba(255,255,255,0.1)', borderRadius:'50%'}}></div>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.85)', letterSpacing:'2px', textTransform:'uppercase', fontWeight:'800' }}>TOTAL OUTFLOW</p>
                <h1 style={{ margin: '8px 0 0 0', fontSize: '48px', color: 'white', fontWeight:'900', letterSpacing: '-1px' }}>₹{totalExpense.toFixed(0)}</h1>
                <div style={{ marginTop: '15px', display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(0,0,0,0.2)', padding:'6px 14px', borderRadius:'20px', fontSize:'12px' }}>
                    <Calendar size={14} /> <span>Based on {timeFilter.toLowerCase()}ly data</span>
                </div>
            </div>

            {/* 📊 Chart Section */}
            <h3 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '18px', letterSpacing:'1.5px', fontWeight:'800', display:'flex', alignItems:'center', gap:'10px' }}>
                <PieIcon size={18} color="#10b981"/> CATEGORY WISE
            </h3>
            
            <div style={{ padding: '20px', borderRadius: '28px', background: '#1e293b', marginBottom:'30px', border:'1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {filteredData.length > 0 ? (
                    <>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={filteredData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={70} 
                                    outerRadius={95} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {filteredData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />)}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{background:'#0f172a', border:'1px solid #334155', borderRadius:'16px', boxShadow:'0 10px 15px rgba(0,0,0,0.3)'}} 
                                    itemStyle={{color:'white', fontWeight:'bold'}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* 🔥 Custom Professional Legend */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                        {filteredData.map((item, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#0f172a', borderRadius: '12px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                <span style={{ fontSize: '12px', fontWeight: '700' }}>{item.name}</span>
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>₹{item.value}</span>
                            </div>
                        ))}
                    </div>
                    </>
                ) : (
                    <div style={{height:'250px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                        <Receipt size={50} style={{opacity:0.1, marginBottom:'15px'}}/>
                        <p style={{fontWeight:'600'}}>No spending recorded yet</p>
                    </div>
                )}
            </div>

            {/* 💸 Settlements Section */}
            {settlements.length > 0 && (
                <>
                    <h3 style={{ fontSize: '14px', color: '#f43f5e', marginBottom: '18px', letterSpacing:'1.5px', fontWeight:'800' }}>SETTLEMENT HISTORY</h3>
                    <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'30px'}}>
                        {settlements.map((settle, index) => (
                            <div key={index} style={{padding:'18px', borderRadius:'20px', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid rgba(244, 63, 94, 0.2)'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                    <div style={{width:'45px', height:'45px', background:'rgba(244, 63, 94, 0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <HandCoins size={22} color="#f43f5e"/>
                                    </div>
                                    <div>
                                        <h4 style={{margin:0, fontSize:'15px', color:'white', fontWeight:'700'}}>{settle.description}</h4>
                                        <span style={{fontSize:'12px', color:'#64748b', fontWeight:'500'}}>
                                            {Array.isArray(settle.createdAt) ? `${settle.createdAt[2]} ${new Date(0, settle.createdAt[1]-1).toLocaleString('default', { month: 'short' })}` : 'Recent'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <span style={{fontWeight:'900', color:'#f43f5e', fontSize:'16px'}}>-₹{settle.totalAmount}</span>
                                    <div style={{ fontSize: '10px', color: '#64748b', textTransform:'uppercase' }}>Settled</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
      )}
    </div>
  );
};

export default Analysis;