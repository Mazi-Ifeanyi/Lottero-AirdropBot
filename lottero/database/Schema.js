var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const connectToDb = async() =>{
  try{
     //await mongoose.connect('mongodb://localhost:27017/pi_bot_db');
     await mongoose.connect('mongodb://127.0.0.1:27017/lottero_bot_db');
      return true;
  }catch(err){}

  return false;
}


const stepSchema = new Schema({
    user_name: { type: String, required: true},
    user_array: { type: Array, required: false, default: []},
    twitter: { type: String, required: false, default: ""},
    bep20_wallet: { type: String, required: false, default: ""},
    invited_by: { type: String, required: false, default: ""},
    captcha_solution: { type: String, required: false, default: ""}
}, { strict: false });

const giveAwaySchema = new Schema ({
    user_name: { type: String, required: true},
    balance: { type: Number, required: false, default: 0},
    referral_count: { type: Number, required: false, default: 0},
    my_referral_code: { type: String, required: true, default: '', unique: true}
}, { strict: false });

const adminSchema = new Schema({
    groups: { type: Array, required: false, default: ['@LotteroChat','@bscchairmanchat']},
    channels: { type: Array, required: false, default: ['@LotteroChannel']},
    balance: { type: Number, required: false, default: 25_000_000},//5%
    airdrop_token: { type: Number, required: false, default: 1000},
    referral_token: { type: Number, required: false, default: 2000},
    max_wallet: { type: Number, required: false, default: 201_000},
    token_contract: { type: String, required: false, default: ''},
    airdrop_date: { type: String, required: false, default: ''}
}, { strict: false});


const userTable = mongoose.model('step', stepSchema);
const giveAwayTable = mongoose.model('give_away', giveAwaySchema);
const adminTable = mongoose.model('admin_table', adminSchema);

module.exports = {
    connectToDb,
    userTable,
    giveAwayTable,
    adminTable
}