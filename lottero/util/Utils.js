

function isEmpty(value){
    if(value == undefined) return true;
    if(value == null) return true;
    if(value.length ==0) return true;
    return false;
}


function smallCase(value){

  if(isNaN(value)) return value.toLowerCase();
  else return value;
    
}

const config = {
    rules: {
      individual: {
        rate: 1,
        limit: 1,
        priority: 1
      },
      group: {
        rate: 20,
        limit: 60,
        priority: 1
      },
      broadcast: {
        rate: 20,
        limit: 1,
        priority: 2
      }
    },
    overall: {
      rate: 20,
      limit: 1
    }
  }


  function welcomeMsg(){
      let msg;
      msg = `🃏Empower yourself with <b>Lottero Airdrop.</b>\n\n🔥Our aim is to create a quick and a fair opportunity lottery game for all crypto lovers.\n\n ⛱Lottero is community driven, meaning we all are the owners.\n\n<b>Airdrop information:</b>\n💰300 for joining\n💰600 for referral\n👥100 max referral`;

      return msg;
  }

  function joinMessage(value){
    let msg;
    msg = `Do you love crypto & lottery, ${value}?\n\n👉 Complete all the required tasks to be eligible for Lottero airdrop.\n👉 This is free. Don't pay anything to anyone.\n\n✅ Click "<b>Join Airdrop</b>" to proceed.`;
    return msg;
  };

  function joinAirdrop(value){
//<a href='${viewTx}'>TX</a> | <a href='${swapToken}'>Buy</a> ${adStyle}`;
    let msg;
    msg =`<b>Hello ${value},</b> 🎳\n\n👉 Join our <a href='t.me/LotteroChannel'>LotteroChannel</a>\n\n👉 Join our <a href='t.me/LotteroChat'>LotteroChat</a>\n\n👉 Follow our <a href='t.me/bscchairmanchat'>Influencer</a>\n\n👉After joined, click '✅ <b>Done</b>'`;
    return msg;
  }

  function errorJoinGrp(value){
    return `<b>Oops!, ${value}.\n\n🚫 Please join the groups and channels above to continue.</b>`;
  }
  function errorMsg(){
    return `<b>❗️Invalid input. Please follow the command carefully .🔄 Try again.</b>`;
  }

  function errorTimeout(){
    return `<b>❗️Request timeout, server is busy.🔄 Try again.</b>`;
  }

  function errorNoUsername(){
    return `<b>❗️No username found. Create a telegram username before you continue</b>`;
  }

  function followTwitter(value){
const link ='https://twitter.com/OfficialLottero';      
return `<b>Almost there, ${value}.</b> 🎲\n\n👉 Go follow our <a href='${link}'>Twitter page and Retweet the Pin Post</a>\n\n👉 <b>Submit your Twitter profile link</b>(Example: https://www.twitter.com/yourusername)`;
  }

  function submitWallet(value){
    return `<b>Okay ${value}.</b> 🎲\n\n📌 <b>Submit Your BEP20 recieve Address (Binance Smart Chain)</b>\n\n👉 <i>You can find this wallet address on Metamask or Trustwallet\n\n(Don't submit bep20 from your CEX, like FTX, Kucoin, Binance, etc).</i>`;
  }

  function congrats(value,link){
    return `🥇<b>Congratulations, ${value}</b> 🎳\n\n👉 <i>If you submitted any wrong information. Click /start to resubmit correctly.</i>\n\n<b>Make sure you're following:</b>
       🔸<a href='t.me/LotteroChat'>LotteroChat</a>
       🔸<a href='t.me/LotteroChannel'>LotteroChannel</a>
       \n<b>Your referral link:</b> (${link})\n\n👉 To check Balance, Withdraw use the buttons below.`;
  }

  function usefulLinks(){
    const link ='https://twitter.com/OfficialLottero/';      

    return `🌐 <b>Useful Links</b>\n\n\👨‍✈️ Telegram Group: https://t.me/LotteroChat\n👨‍✈️ Telegram Channel: https://t.me/LotteroChannel\n🌐 Website: http://www.Lottero.finance/\n💬 Twitter:${link}\n📘 Partner: https://t.me/SmartApeBot\nPartner chat: https://t.me/smartapebotchat\n👤Influencer: https://t.me/BscChairManChat`;
  }

  function getUserBal(name,mcap,price,worth,circ,twitter,wallet,coinQty, refLink, refCount,contract){
    return `<b>Hi, ${name}</b> 🏅\n\n👥People invited: ${refCount}\n<b>Balance:</b> ${coinQty} Lottero\n\n<b>Your Referral link is:</b> (${refLink})\n\n💰<b>Market valuation:</b>\n<b>Mcap:</b> ${mcap}\n<b>Price:</b> ${price}\nYou have: ${worth}\n<b>Circ suppl:</b> ${circ}\n\n<b>Contract:</b> ${contract}\n🔖<b>Submitted:</b>\n🌐Twitter:${twitter}\n💳Wallet: ${wallet}\n👉 Follow: @LotteroChannel for more information.`;
  }

  function createInvitationLink(){
    //https://t.me/LotteroAirdropBot?start=r07363282590
    const rand =Math.floor(10000000000 + Math.random() * 90000000000);
   // console.log(rand);

   return `https://t.me/LotteroAirdropBot?start=r${rand}`;

  }
  function createInvitationLinkFromCode(refCode){
   return `https://t.me/LotteroAirdropBot?start=${refCode}`;
  }

  function getCaptchaString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function createCaptchaText(solution){
  return `🛡<b>Solve captcha:</b>\n\nProve you're a human. Click the button that has the word <b>${solution}</b>`;
}

function createCaptchaButtons(newAnswer){
         //generate 3 more random buttons
         let tempHolder = [{text: newAnswer, callback_data: 'captcha_'+newAnswer}];
         for(let i=1; i <=3; i++){
           let rBtn= getCaptchaString(4);
           let btn_ = {text: rBtn, callback_data: 'captcha_'+rBtn};
           tempHolder.push(btn_);
         }
         //now sort the items in the array randmly so they are mixed
         tempHolder.sort(() => Math.random() - 0.5);
         //console.log(" >3: ", tempHolder);
  
         //now remove them and create array for inline buttons
         let tray1 = [];
         let tray2 = [];
         for(let k=0; k <tempHolder.length; k++){
           let str = tempHolder[k];
             if(k ==0){
              tray1.push(tempHolder[k]);
             }else if(k ==1){
              tray1.push(str);
             }else if(k ==2){
              tray2.push(tempHolder[k]);
             }else if(k ==3){
              tray2.push(str);
             }
         }
         //console.log(" >4: ", tray1);
         //console.log(" >5: ", tray2);
  
         let btn = JSON.stringify({
          inline_keyboard: [
              //[{ text: '✅ Done', callback_data: 'joined_groups' }],
              //[{ text: '❌ Exit', callback_data: 'exit' }]
              tray1, tray2
            ],
          one_time_keyboard: true,
          resize_keyboard: true
        });
        return btn;
}
  module.exports = {isEmpty, config,smallCase, welcomeMsg, joinMessage, joinAirdrop,errorJoinGrp,followTwitter,errorMsg,errorTimeout,errorNoUsername, submitWallet, congrats, createInvitationLink,usefulLinks, getUserBal,createInvitationLinkFromCode,getCaptchaString, createCaptchaText,createCaptchaButtons}

