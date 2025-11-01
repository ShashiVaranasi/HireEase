import React, {useState} from 'react';
import axios from 'axios';
import { useAuth } from '../utils/auth';

export default function Register(){
  const [name,setName] = useState('');
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState('candidate');
  const { login } = useAuth();
  const [err,setErr] = useState('');
  const api = (process.env.REACT_APP_API||'http://localhost:5000') + '/api/auth/register';
   const API_BASE = process.env.REACT_APP_API || 'http://localhost:5000';
  const submit = async (e)=>{
    e.preventDefault();
    try{
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        name,
        username,
        password,
        role,
      });
      login(res.data.user, res.data.token);
      if(res.data.user.role === 'hr') window.location = '/hr';
      else if(res.data.user.role === 'interviewer') window.location = '/interviewer';
      else window.location = '/candidate';
    }catch(e){
      setErr(e.response?.data?.message || 'Registration failed');
    }
  };
  return (
    <div className="login-wrap">
      <div className="card">
        <h2>Create Account</h2>
        <form onSubmit={submit}>
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} required/>
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} required/>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          <label>Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="candidate">Candidate</option>
            <option value="interviewer">Interviewer</option>
            <option value="hr">HR Manager</option>
          </select>
          <button className="primary">Create account</button>
          {err && <div className="error">{err}</div>}
        </form>
      </div>
    </div>
  );
}
