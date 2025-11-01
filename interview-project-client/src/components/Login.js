import React, {useState} from 'react';
import axios from 'axios';
import { useAuth } from '../utils/auth';
export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const api = (process.env.REACT_APP_API||'http://localhost:5000') + '/api/auth/login';
  const [err, setErr] = useState('');
   const API_BASE = process.env.REACT_APP_API || 'http://localhost:5000';
  const submit = async (e)=>{
    e.preventDefault();
    try{
      
      const res = await axios.post(`${API_BASE}/api/auth/login`, { username, password });
      login(res.data.user, res.data.token);
      if(res.data.user.role === 'hr') window.location = '/hr';
      else if(res.data.user.role === 'interviewer') window.location = '/interviewer';
      else window.location = '/candidate';
    }catch(e){
      setErr(e.response?.data?.message || 'Login failed');
    }
  };
return (
  <div className="center">
    <div className="login-card">
      <h2>Interview Manager</h2>
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="primary">Sign in</button>
        {err && <div className="error">{err}</div>}
      </form>

      <div className="footer-text">
        Don’t have an account? <a href="/register">Create one</a><br />
        <span>Try credentials: <b>hr1/password123</b> or <b>inter1/password123</b> or <b>cand1/password123</b></span>
      </div>
    </div>
  </div>
);

}
