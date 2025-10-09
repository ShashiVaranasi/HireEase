const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/interview_manager';

// Models
const UserSchema = new mongoose.Schema({
  name: String,
  username: {type: String, unique: true},
  password: String,
  role: {type: String, enum: ['hr','interviewer','candidate']},
}, {timestamps:true});
const User = mongoose.model('User', UserSchema);

const InterviewSchema = new mongoose.Schema({
  candidate: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  interviewer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  position: String,
  datetime: Date,
  status: {type:String, enum:['scheduled','completed','cancelled'], default:'scheduled'},
  passcode: String,
  feedback: [{
    interviewer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    rating: String,
    comments: String,
    createdAt: {type: Date, default: Date.now}
  }]
}, {timestamps:true});
const Interview = mongoose.model('Interview', InterviewSchema);

// Simple auth (login) route
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'verysecret';


// Registration route - create new account with role
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if(!name || !username || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    if(!['hr','interviewer','candidate'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const existing = await User.findOne({ username });
    if(existing) return res.status(409).json({ message: 'Username already taken' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, password: hashed, role });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, role: newUser.role, username: newUser.username } });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/auth/login', async (req,res)=>{
  const {username,password} = req.body;
  const user = await User.findOne({username});
  if(!user) return res.status(401).json({message:'Invalid credentials'});
  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.status(401).json({message:'Invalid credentials'});
  const token = jwt.sign({id:user._id, role:user.role}, JWT_SECRET, {expiresIn:'8h'});
  res.json({token, user:{id:user._id,name:user.name,role:user.role,username:user.username}});
});

// auth middleware
function auth(req,res,next){
  const header = req.headers.authorization;
  if(!header) return res.status(401).json({message:'Missing token'});
  const token = header.split(' ')[1];
  try{
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  }catch(e){
    return res.status(401).json({message:'Invalid token'});
  }
}

// HR-only: create interview
app.post('/api/interviews', auth, async (req,res)=>{
  if(req.user.role !== 'hr') return res.status(403).json({message:'Forbidden'});
  const {candidateId, interviewerId, datetime, position} = req.body;
  const passcode = Math.random().toString(36).slice(2,8).toUpperCase();
  const iv = new Interview({
    candidate: candidateId, interviewer: interviewerId,
    datetime, position, passcode
  });
  await iv.save();
  const full = await Interview.findById(iv._id).populate('candidate interviewer','name username role');
  res.json(full);
});

// get interviews (role-aware)
app.get('/api/interviews', auth, async (req,res)=>{
  const role = req.user.role;
  let q = {};
  if(role === 'candidate') q = {candidate: req.user.id};
  else if(role === 'interviewer') q = {interviewer: req.user.id};
  const list = await Interview.find(q).populate('candidate interviewer','name username role').sort({datetime:1});
  res.json(list);
});

// mark complete and add feedback (interviewer)
app.post('/api/interviews/:id/feedback', auth, async (req,res)=>{
  if(req.user.role !== 'interviewer') return res.status(403).json({message:'Forbidden'});
  const {rating, comments} = req.body;
  const iv = await Interview.findById(req.params.id);
  if(!iv) return res.status(404).json({message:'Not found'});
  iv.feedback.push({interviewer: req.user.id, rating, comments});
  iv.status = 'completed';
  await iv.save();
  const full = await Interview.findById(iv._id).populate('candidate interviewer','name username role');
  res.json(full);
});

// HR can get all interviews
app.get('/api/interviews/all', auth, async (req,res)=>{
  if(req.user.role !== 'hr') return res.status(403).json({message:'Forbidden'});
  const all = await Interview.find().populate('candidate interviewer','name username role').sort({datetime:1});
  res.json(all);
});

// simple user list (HR)
app.get('/api/users', auth, async (req,res)=>{
  if(req.user.role !== 'hr') return res.status(403).json({message:'Forbidden'});
  const u = await User.find().select('-password');
  res.json(u);
});

// connect and start
mongoose.connect(MONGO, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(()=> {
    console.log('Mongo connected');
    app.listen(PORT, ()=> console.log('Server running on',PORT));
  })
  .catch(err=> console.error(err));

