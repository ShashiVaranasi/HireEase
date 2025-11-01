import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useAuth } from '../utils/auth';

function Card({title, value}){ return <div className='stat'><div className='stat-title'>{title}</div><div className='stat-value'>{value}</div></div> }

export default function HRDashboard(){
  const { token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [candidate, setCandidate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [datetime, setDatetime] = useState('');
  const [position, setPosition] = useState('');
  const api = (path)=> axios.get(`${API_BASE}${path}`, {
      headers: { Authorization: 'Bearer ' + token },
    });

  useEffect(() => {
    fetchAll();
    fetchUsers();
    // eslint-disable-next-line
  }, []);
  async function fetchAll(){ const res = await api('/api/interviews/all'); setInterviews(res.data); }
  async function fetchUsers(){ const res = await api('/api/users'); setUsers(res.data); }
  async function schedule(e){
    e.preventDefault();
     await axios.post(
        `${API_BASE}/api/interviews`,
        { candidateId: candidate, interviewerId: interviewer, datetime, position },
        { headers: { Authorization: 'Bearer ' + token } }
      );
    setCandidate(''); setInterviewer(''); setDatetime(''); setPosition('');
    fetchAll();
  }
  return (
    <div className="container">
      <header className="topbar"><h1>HR Dashboard</h1><div><button onClick={logout} className="btn-ghost">Logout</button></div></header>
      <div className="stats">
        <Card title="Total Interviews" value={interviews.length} />
        <Card title="Scheduled" value={interviews.filter(i=>i.status==='scheduled').length} />
        <Card title="Completed" value={interviews.filter(i=>i.status==='completed').length} />
        <Card title="Cancelled" value={interviews.filter(i=>i.status==='cancelled').length} />
      </div>

      <section className="panel">
        <h3>Schedule Interview</h3>
        <form className="form-inline" onSubmit={schedule}>
          <select value={candidate} onChange={e=>setCandidate(e.target.value)} required>
            <option value="">Select candidate</option>
            {users.filter(u=>u.role==='candidate').map(u=> <option key={u._id} value={u._id}>{u.name} ({u.username})</option>)}
          </select>
          <select value={interviewer} onChange={e=>setInterviewer(e.target.value)} required>
            <option value="">Select interviewer</option>
            {users.filter(u=>u.role==='interviewer').map(u=> <option key={u._id} value={u._id}>{u.name} ({u.username})</option>)}
          </select>
          <input type="datetime-local" value={datetime} onChange={e=>setDatetime(e.target.value)} required/>
          <input placeholder="Position" value={position} onChange={e=>setPosition(e.target.value)} required/>
          <button className="primary">Schedule Interview</button>
        </form>
      </section>

      <section className="panel">
        <h3>All Interviews</h3>
        {interviews.length===0 && <div>No interviews</div>}
        {interviews.map(iv=>(
          <div className="iv" key={iv._id}>
            <div><strong>{iv.candidate?.name}</strong> — {iv.position} <div className="muted">{new Date(iv.datetime).toLocaleString()}</div></div>
            <div className="iv-right">
              <div className="muted">Interviewer: {iv.interviewer?.name}</div>
              <div className={'badge '+iv.status}>{iv.status}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
