var db = require('./Schema');
var util = require('../util/Utils');

const options= {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
}

const addStep = async(username, position) =>{
    let done = false;
    const options = {
        new: true,
        setDefaultsOnInsert: true,
        upsert: true,

    }
  if(db.connectToDb()){
      let dataToAdd = await db.userTable.findOneAndUpdate({user_name: util.smallCase(username)},{$addToSet: {user_array: util.smallCase(position)}}, options);
      let inserted = await dataToAdd.save();
      if(inserted){
          done = true;
      }
  }
  return done;
}

const deleteUserStep = async(username) =>{
    let doneDeleting = false;
  if(db.connectToDb()){
      const deleted = await db.userTable.deleteOne({user_name: util.smallCase(username)});
      if(deleted.acknowledged && deleted.deletedCount > 0){
          doneDeleting = true;
      }
  }

  return doneDeleting;
}

const getUserStep = async(username) =>{
    if(db.connectToDb()){
        const data = await db.userTable.find({user_name: util.smallCase(username)}).lean();
        const userArray = data[0];
        if(util.isEmpty(userArray)) return null;
        return userArray.user_array;
    }
    return null;
}

const getInvitedBy = async(username) =>{
    if(db.connectToDb()){
        const data = await db.userTable.find({user_name: util.smallCase(username)}).lean();
        const userArray = data[0];
        if(util.isEmpty(userArray)) return null;
        return userArray.invited_by;
    }
    return null;
}

const getUserStepInformation = async(username) =>{
    if(db.connectToDb()){
        const data = await db.userTable.find({user_name: util.smallCase(username)}).lean();
        const userArray = data[0];
        if(util.isEmpty(userArray)) return null;
        return userArray;
    }
    return null;
}

const addTwitter = async (username, twitter) =>{
    let done = false;
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }
    const existingData = {
        user_name: util.smallCase(username)
    }

    const updatedData = {
        twitter: twitter
    }

    if(db.connectToDb()){
        const dataToAdd = await db.userTable.findOneAndUpdate(existingData, {$set : updatedData}, options);
        const saved = await dataToAdd.save();
     if(saved) {
         done = true;
  }
    }

    return done;
}

const addBep20Wallet = async (username, wallet) =>{
    let done = false;
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }
    const existingData = {
       user_name: util.smallCase(username)
    }
    const updatedData = {
        bep20_wallet: wallet
    }

    if(db.connectToDb()){
        const dataToAdd = await db.userTable.findOneAndUpdate(existingData, {$set: updatedData}, options);
        const saved = await dataToAdd.save();
        if(saved){
            done = true;
        }
    }

    return done;
}



const addInvitedBy = async (username, invitedBy) =>{
    let done = false;
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }
    const existingData = {
       user_name: util.smallCase(username)
    }
    const updatedData = {
        invited_by: util.smallCase(invitedBy)
    }

    if(db.connectToDb()){
        const dataToAdd = await db.userTable.findOneAndUpdate(existingData, {$set: updatedData}, options);
        const saved = await dataToAdd.save();
        if(saved){
            done = true;
        }
    }

    return done;
}


const addCaptcha = async (username, captcha) =>{
    let done = false;
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }
    const existingData = {
       user_name: util.smallCase(username)
    }
    const updatedData = {
        captcha_solution: captcha
    }

    if(db.connectToDb()){
        const dataToAdd = await db.userTable.findOneAndUpdate(existingData, {$set: updatedData}, options);
        const saved = await dataToAdd.save();
        if(saved){
            done = true;
        }
    }

    return done;
}
const getCaptcha = async(username) =>{
    if(db.connectToDb()){
        const data = await db.userTable.find({user_name: util.smallCase(username)}).lean();
        const userArray = data[0];
        if(util.isEmpty(userArray)) return null;
        return userArray.captcha_solution;
    }
    return null;
}
const saveToGiveAway = async(username, rbalance, referrals, referralCode)=>{
    const newDocument = {
      user_name: util.smallCase(username),
      balance: rbalance,
      referral_count: referrals,
      my_referral_code:  util.smallCase(referralCode)
    }
    if(db.connectToDb()){
        const dataToAdd = await new db.giveAwayTable(newDocument);
        const saved = await dataToAdd.save();
        //console.log(saved)
        if(!util.isEmpty(saved)){
            return true;
        }
    }

    return false;
}

const updateReferral = async (refCode) => {
    if(db.connectToDb()){
        const found = await db.giveAwayTable.findOne({my_referral_code: util.smallCase(refCode)}).lean();
        if(!util.isEmpty(found)){
          const referralCount = found.referral_count;
          const newRefCount = referralCount + 1;
          //update the referral count for a user
          const dataToUpdate = await db.giveAwayTable.findOneAndUpdate({my_referral_code: util.smallCase(refCode)}, {$set: {referral_count: newRefCount}});
          const saved = await dataToUpdate.save();
          if(saved) return true;
        }
    }

    return false;
}

const updateBalance = async (refCode, balance,maxWallet) => {
    if(db.connectToDb()){
        const found = await db.giveAwayTable.findOne({my_referral_code: util.smallCase(refCode)}).lean();
        if(!util.isEmpty(found)){
          const oldBalance = found.balance;
          const newBalance = oldBalance + balance;
           // console.log("I was here for balance updating for my inviter: ", found);
          if(newBalance >= maxWallet) return false;
          //update the balance for a user
          const dataToUpdate = await db.giveAwayTable.findOneAndUpdate({my_referral_code: util.smallCase(refCode)}, {$set: {balance: newBalance}});
          const saved = await dataToUpdate.save();
          //console.log("I was here to save balance: ", saved);

          if(saved) return true;
        }
    }

    return false;
}

const fetchGiveaway = async(username) =>{
  if(db.connectToDb()){
      const found = await db.giveAwayTable.findOne({user_name: util.smallCase(username)}).lean();
      if(!util.isEmpty(found)){
          return found;
      }
  }

  return null;
}

const isDuplicateLink = async(refCode) =>{
    if(db.connectToDb()){
        const found = await db.giveAwayTable.findOne({my_referral_code: refCode}).lean();
        //console.log("database: ",found);
        if(util.isEmpty(found)) return false;
    }

    return true;
}

//Admin functions 
const updateGroup = async(groupLink) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{$addToSet: {groups: groupLink}}, options);
       // console.log(dataToUpdate)
        if(dataToUpdate.acknowledged) return true;
    }

    return false;
}

const updateChannel = async(channelLink) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{$addToSet: {channels: channelLink}}, options);
        if(dataToUpdate.acknowledged) return true;
    }

    return false;
}

const updateBalanceAdmin = async (val) =>{
    if(db.connectToDb()){
        const found = await db.adminTable.findOne({}).lean();
        if(!util.isEmpty(found)){
          const oldBalance = found.balance;
          if(val > oldBalance){
              return false;
          }
          const newBalance = oldBalance - val;
          //update the balance for a admin table
          const dataToUpdate = await db.adminTable.findOneAndUpdate({}, {$set: { balance: newBalance}}, options);
          const saved = await dataToUpdate.save();
          if(saved) return true;
        }
    }

    return false;
}

const updateAirdropToken = async(airdropToken) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{airdrop_token: airdropToken}, options);
        if(dataToUpdate.acknowledged) return true;
    }

    return false;
}

const updateReferralToken = async(refToken) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{referral_token: refToken}, options);
        if(dataToUpdate.acknowledged) return true;
    }

    return false;
}

const updateMaxWallet = async(maxWallet) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{max_wallet: maxWallet}, options);
        if(dataToUpdate.acknowledged) return true;
    }

    return false;
}

const updateAirdropDate = async(airdropDate) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{airdrop_date: airdropDate}, options);
        if(dataToUpdate.acknowledged) return true;
    }

    return false;
}

const updateTokenContract = async(contract) =>{
    if(db.connectToDb()){
        const dataToUpdate = await db.adminTable.updateOne({},{token_contract: contract}, options);
        if(dataToUpdate.acknowledged) return true;
    }
    return false;
}

const updateAndRaiseBalanceAdmin = async (val) =>{
    if(db.connectToDb()){
        const found = await db.adminTable.findOne({}).lean();
        if(!util.isEmpty(found)){
          const oldBalance = found.balance;

          if(val <= 0){
              return false;//dont accept 0 and negative numbers
          }
        
          const newBalance = (+oldBalance) + (+val);
          //update the balance for a admin table
          const dataToUpdate = await db.adminTable.findOneAndUpdate({}, {$set: { balance: newBalance}}, options);
          const saved = await dataToUpdate.save();
          if(saved) return true;
        }
    }

    return false;
}

const fetchAdminData = async() =>{
    if(db.connectToDb()){
        const found = await db.adminTable.findOne({}).lean();
        if(!util.isEmpty(found)){
            return found;
        }
    }

    return null;
}


module.exports = {
    addStep,
    deleteUserStep,
    getUserStep,
    getUserStepInformation,
    getInvitedBy,
    addTwitter,
    addBep20Wallet,
    addInvitedBy,
    addBep20Wallet,
    getCaptcha,
    addCaptcha,
    saveToGiveAway,
    updateReferral,
    updateBalance,
    fetchGiveaway,
    isDuplicateLink,
    updateGroup,
    updateChannel,
    updateBalanceAdmin,
    updateAirdropToken,
    updateReferralToken,
    updateMaxWallet,
    updateAirdropDate,
    updateTokenContract,
    updateAndRaiseBalanceAdmin,
    fetchAdminData
}