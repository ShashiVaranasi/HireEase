// Run: npm run seed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/interview_manager';
mongoose.connect(MONGO, {useNewUrlParser:true, useUnifiedTopology:true}).then(async ()=>{
  console.log('connected');
  const userSchema = new mongoose.Schema({name:String,username:{type:String,unique:true},password:String,role:String});
  const User = mongoose.model('User', userSchema);
  await User.deleteMany({});
  const pw = await bcrypt.hash('password123',10);
  const hr = new User({name:'Sarah Johnson', username:'hr1', password: pw, role:'hr'});
  const interviewer = new User({name:'Michael Chen', username:'inter1', password: pw, role:'interviewer'});
  const candidate1 = new User({name:'John Smith', username:'cand1', password: pw, role:'candidate'});
  const candidate2 = new User({name:'Alice Brown', username:'cand2', password: pw, role:'candidate'});
  await Promise.all([hr.save(), interviewer.save(), candidate1.save(), candidate2.save()]);
  console.log('seeded users');
  process.exit(0);
}).catch(e=>{console.error(e); process.exit(1);});
