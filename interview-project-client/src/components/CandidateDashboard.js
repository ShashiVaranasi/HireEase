import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useAuth } from '../utils/auth';
export default function CandidateDashboard(){
  const { token, user, logout } = useAuth();
  const [list, setList] = useState([]);
  useEffect(()=> fetchList(),[]);
  async function fetchList(){ const res = await axios.get((process.env.REACT_APP_API||'http://localhost:5000')+'/api/interviews',{headers:{Authorization:'Bearer '+token}}); setList(res.data); }
  return (
    <div className="container">
      <header className="topbar"><h1>Candidate Dashboard</h1><div><button onClick={logout} className="btn-ghost">Logout</button></div></header>
      <div className="stats">
        <div className='stat'><div className='stat-title'>Upcoming</div><div className='stat-value'>{list.filter(i=>i.status==='scheduled' && new Date(i.datetime)>new Date()).length}</div></div>
        <div className='stat'><div className='stat-title'>Completed</div><div className='stat-value'>{list.filter(i=>i.status==='completed').length}</div></div>
      </div>

      <section className="panel">
        <h3>Upcoming Interviews</h3>
        {list.filter(i=>i.status==='scheduled' && new Date(i.datetime)>new Date()).length===0 && <div className="muted">No upcoming interviews</div>}
        {list.filter(i=>i.status==='scheduled' && new Date(i.datetime)>new Date()).map(iv=>(
          <div className="iv" key={iv._id}>
            <div><strong>{iv.position}</strong><div className="muted">{new Date(iv.datetime).toLocaleString()}</div></div>
            <div><div className="muted">Interviewer: {iv.interviewer?.name}</div><div className="pass">Passcode: <b>{iv.passcode}</b></div></div>
          </div>
        ))}
      </section>

      <section className="panel">
        <h3>Past Interviews</h3>
        {list.filter(i=>i.status==='completed').map(iv=>(
          <div className="iv" key={iv._id}>
            <div><strong>{iv.position}</strong><div className="muted">{new Date(iv.datetime).toLocaleString()}</div></div>
            <div>
              {iv.feedback?.map(f=> <div key={f._id}><b>{f.rating}</b> — {f.comments}</div>)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
