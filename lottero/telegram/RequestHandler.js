
const SmartQueue = require('smart-request-balancer');
var TelegramBot = require('node-telegram-bot-api');
var util = require('../util/Utils');
var db = require('../database/MongooseDb');
var token = require('../web3/TokenDetails');


const queue = new SmartQueue(util.config);
const TOKEN = '5272442081:AAHRYQ8YDLMUEWICYc6-dkxaDhNQi47fKIk';
//const TOKEN = '5251142526:AAGAbhROEv-2wMWRXy-GzNcdVvZ5sh2att0';
let bot;


function startAirdrop(){
  bot = new TelegramBot(TOKEN, { polling: true});
 
  bot.onText(/\/channel(.+)/, async(msg, match)=>{ 
    whatToDo( '/channel', msg, match[1]);
  });
  bot.onText(/\/group(.+)/, async(msg, match)=>{ 
    whatToDo( '/group', msg, match[1]);
 });
 bot.onText(/\/airdrop(.+)/, async(msg, match)=>{ 
  whatToDo( '/airdrop', msg, match[1]);
});
bot.onText(/\/ref(.+)/, async(msg, match)=>{ 
  whatToDo( '/ref', msg, match[1]);
});
bot.onText(/\/maxwallet(.+)/, async(msg, match)=>{ 
  whatToDo( '/maxwallet', msg, match[1]);
});
bot.onText(/\/date(.+)/, async(msg, match)=>{ 
  whatToDo( '/date', msg, match[1]);
});
bot.onText(/\/contract(.+)/, async(msg, match)=>{ 
  whatToDo( '/contract', msg, match[1]);
});
bot.onText(/\/raise(.+)/, async(msg, match)=>{ 
  whatToDo( '/raise', msg, match[1]);
});
  bot.on('message', async(msg)=>{
    console.log("RESP: ", msg);
    let content ='';
    if(!util.isEmpty(msg.text)){
    let command = msg.text;
    try{
      command  = command .replaceAll('\"', '')
      if(util.smallCase(command).startsWith("/start")){
        let splitValue = command.split(" ");
        content = splitValue[1];
        command = splitValue[0].trim();
      }
    }catch(err){ 
      console.log(err);
      return;
    }

    whatToDo( util.smallCase(command), msg,content);
    }
  });

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    whatToCallBack( action, msg);
    //bot.editMessageText(text, opts);
  });
  }
  
  async function whatToDo(command, msg, content){
  //get details about the sender 
  let usrUsername, usrFirstName,usrIsBot,usrId, msgCount,chatId,type,username;
  let title;
  let options = {parse_mode: 'HTML', disable_web_page_preview: true, link_preview:false};

  usrUsername= msg.from.username;
  usrFirstName = msg.from.first_name;
  usrIsBot = msg.from.is_bot;
  usrId = msg.from.id;
  msgCount = msg.message_id;
  chatId = msg.chat.id;//group | user id
  type = msg.chat.type; // private | supergroup
  username = msg.chat.username;//username of sender | group
  title = msg.chat.title;//group name empty for private
  if(usrIsBot){
    replyChat(chatId, "Only a human can use the service ", false, options );
    return;
  }

  if(util.isEmpty(username)){
    replyChat(chatId, util.errorNoUsername(), false, options );
    return;
  }
try{
  //SOME ADMIN LEVEL TASKS
if(command == '/channel' &&  isPermitted(username)){
    if(await db.updateChannel(content.trim())){
      //console.log("chan: ", command);
     await replyChat(chatId, "Channel has been added", false, options );
    }
    //console.log("chan: ", '2');
    return;
 }
 if(command == '/group' &&  isPermitted(username)){
  if(await db.updateGroup(content.trim())){
   await replyChat(chatId, "Group has been added", false, options );
  }
  return;
}
if(command == '/airdrop' &&  isPermitted(username)){
  if(await db.updateAirdropToken(content)){
   await replyChat(chatId, `User will now receive ${content} amount of tokens`, false, options );
  }
  return;
}
if(command == '/ref' &&  isPermitted(username)){
  if(await db.updateReferralToken(content)){
   await replyChat(chatId, `User will now receive ${content} amount of tokens for referrals`, false, options );
  }
  return;
}
if(command == '/maxwallet' &&  isPermitted(username)){
  if(await db.updateMaxWallet(content)){
  await replyChat(chatId, `Max wallet is: ${content}`, false, options );
  }
  
  return;
}
if(command == '/date' &&  isPermitted(username)){
  if(await db.updateAirdropDate(content)){
   await replyChat(chatId, `Airdrop distribution data: ${content}`, false, options );
  }
  return;
}
if(command == '/contract' &&  isPermitted(username)){
  if(await db.updateTokenContract(content)){
   await replyChat(chatId, `Token contract updated with: ${content}`, false, options );
  }
  return;
}  
if(command == '/raise' &&  isPermitted(username)){
  if(await db.updateAndRaiseBalanceAdmin(content.trim())){
   await replyChat(chatId, `Airdrop balance has been topped with: ${content}`, false, options );
  }
  return;
}  
//SOME USER CHECKS
if(command === '/start'){  
  //console.log("RESP: ", '5');
  startCommand(chatId,username, content);
  return;
}

let data = await db.getUserStep(chatId);
if(!util.isEmpty(data)){
      let currStep = data[data.length-1];
      let error = util.errorMsg();
      if(command === util.smallCase('🚫 Exit')){
        startCommand(chatId,username, content);
        //console.log("RESP: ", '1');

        return;
        }
      if(currStep === 'start' && command !=='✅ join airdrop'){
        await replyChat(chatId, error, false, options );
        //console.log("RESP: ", '2');
        return;
      } 
      if(currStep === 'join_airdrop' && command !=='✅ done' && command !=='🚫 Exit'){
        //console.log("RESP: ", '3');

        await replyChat(chatId, error, false, options );
        return;
     }
     if(currStep === 'twitter' && command !=='🚫 Exit'){
        //insert command to database as their twitter link or username
          submitTwitter(command, msg);  
          return;      
     }
     if(currStep === 'wallet' && command !=='🚫 Exit'){
      //insert command to database as their twitter link or username
        submitWallet(command,  msg);   
        return;     
    }
    }
  //PERFORM USER TASK   
  if(command === util.smallCase('✅ Join Airdrop')){
    //console.log("RESP: ", '6');

    joinAirdrop(msg);
  }
  if(command === util.smallCase('✅ Done')){
    //console.log("RESP: ", '7');

    searchGroup(usrId,msg);
 }

  if(command === util.smallCase('🚫 Exit')){
    //console.log("RESP: ", '8');

    startCommand(chatId,username, content);
    }

  if(command === util.smallCase('💰Balance')){
        myBalance(msg);
      }  
  if(command === util.smallCase('💳 Withdraw')){
        withdraw(msg);
      }        
  if(command === util.smallCase('🌐 Useful Links')){
        usefulLinks(msg);
      }  
  if(command === util.smallCase('📎Referral Link')){
        myReferralLink(msg);
      }      
  if(command === util.smallCase('🔝Update Information')){
      startCommand(chatId,username, content);
      }      
    /*
         ['💰Balance','💳 Withdraw'],
      ['📎Referral Link','🌐 Useful Links'],
      ['🔝Home']*/
  }catch(err){console.log(err)}
  }
  
   function isPermitted(username){
    let usrs = [ 'jhavaguy','bscchairman'];
    if(usrs.indexOf(util.smallCase(username)) == -1) return false;
    return true;
  }
  

    
  async function whatToCallBack(command, msg){
    //get details about the sender 
    let usrUsername, usrFirstName,usrIsBot,usrId, msgCount,chatId,type,username;
    let title, messageId;
    messageId = msg.message_id;
    usrUsername= msg.from.username;
    usrFirstName = msg.from.first_name;
    usrIsBot = msg.from.is_bot;
    usrId = msg.from.id;
    msgCount = msg.message_id;
    chatId = msg.chat.id;//group | user id
    type = msg.chat.type; // private | supergroup
    username = msg.chat.username;//username of sender | group

    title = msg.chat.title;//group name empty for private

    let spli_ = command.split("_");
    let s1 = spli_[0];
    let s2 = spli_[1];
    if(util.smallCase(s1) === 'captcha'){  
      solveCaptcha(msg, s2);      
    }
    }

async function startCommand(chatId, username, content){
  try{
    let welcomeMessage = util.welcomeMsg(); 
    let reply ='CgACAgQAAxkBAANiYieyrAH-EOm_ZFf6_11RGPk1Kc0AAhSgAALwHGQHCKmcMCL5_BwjBA'; 
    reply     ='AgACAgQAAxkBAAEFfUJiOBcZnmUiMKIPeOwsQsmeGhSP5wACvbcxG1lNuVFRi13P06cYBQEAAwIAA3kAAyME';
    //    let btn = JSON.stringify({
    //       inline_keyboard: [
    //         [{ text: '✅ I Agree', callback_data: 'i_agree' }]
    //       ]
    //     })
    //format the table clean
    await db.deleteUserStep(chatId);
    await db.addStep(chatId,'start');
    if(!util.isEmpty(content)){
    await db.addInvitedBy(chatId, content);
    }
    let btn = JSON.stringify({
        keyboard: [
          ['✅ Join Airdrop']
        ],
        one_time_keyboard: true,
        resize_keyboard: true,
        remove_keyboard: true
      });
    let options1;
    options1 = {caption: welcomeMessage,parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false, reply_markup:btn}
    await replyChat(chatId, reply, true, options1 );
  }catch(err){console.log(err)}
}  

async function joinAirdrop(msg){
  try{
    //console.log("Testing comamnd 2: ", true);
    await db.addStep(msg.chat.id,'join_airdrop');

    let btn = JSON.stringify({
        // inline_keyboard: [
        //     [{ text: '✅ Done', callback_data: 'joined_groups' }],
        //     [{ text: '❌ Exit', callback_data: 'exit' }]
        //   ],
        keyboard: [
            ['✅ Done'],
            [ '🚫 Exit']
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      });
      //callback_data: 'i_agree'
    let reply = util.joinAirdrop(msg.chat.first_name);
    let options;
    options = {parse_mode: 'HTML', reply_markup:btn, disable_web_page_preview: true, link_preview:false}
    //console.log("Testing comamnd 3: ", true);
    await replyChat(msg.chat.id, reply, false, options );
  }catch(err){console.log(err)}
   
}

async function searchGroup(user_id, msg){
  try{
    //ensure that the user is following all our channels and groups
    let settings = await db.fetchAdminData();
    let channels = settings.channels;
    let groups = settings.groups;
    let allGroups = groups; //['@PiBscNetwork'];
    let allChannels = channels //[ '@PiBscNetworkNews'];
    let isJoined = true;
    for(let i =0; i < allGroups.length; i++){
        let chatMem = await bot.getChatMember( allGroups[i], user_id);
        let status  = util.smallCase(chatMem.status);//'administrator' | creator | Left | member
        if(status == 'left'){
            isJoined = false;
        } 
    }
    for(let i =0; i < allChannels.length; i++){
        let chatMem = await bot.getChatMember( allChannels[i], user_id);
        let status  = util.smallCase(chatMem.status);//'administrator' | creator | Left | member
        if(status == 'left'){
            isJoined = false;
        } 
    }
    let reply ="Joined";
    let options;
    if(isJoined){
        await db.addStep(msg.chat.id,'twitter');
        let btn = JSON.stringify({
            keyboard: [
                [ '🚫 Exit']
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          });
        options = {parse_mode: 'HTML',reply_markup:btn, disable_web_page_preview: true, link_preview:false};
        reply  = util.followTwitter(msg.chat.first_name);
        await replyChat(user_id, reply, false, options);   
    }else{
        reply = util.errorJoinGrp(msg.chat.first_name);
        options = {parse_mode: 'HTML', disable_web_page_preview: true, link_preview:false};       
    await replyChat(user_id, reply, false, options);   
    joinAirdrop(msg);
   }
  }catch(err){console.log(err)
  }
}

async function submitTwitter(command, msg){
  try{
    let FILE_ID ='AgACAgQAAxkBAANFYjBXyZaiBkHHw9ACTVwK2-wud0sAAjy2MRseQ4lROxtGa8R4vE8BAAMCAAN5AAMjBA';
    await db.addTwitter(msg.chat.id, command);
        await db.addStep(msg.chat.id,'wallet');
        let reply = util.submitWallet(msg.from.first_name);
        //console.log("RESP: ", '4');
        let btn = JSON.stringify({
          keyboard: [
            ['🚫 Exit']
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
          remove_keyboard: true
        });
      let options1;
      options1 = {caption: reply,parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false, reply_markup:btn}
      await replyChat(msg.chat.id, FILE_ID, true, options1 );
  }catch(err){console.log(err)}
}

async function submitWallet(command, msg){
  try{
  await db.addBep20Wallet(msg.chat.id, command);
  await db.addStep(msg.chat.id,'captcha');
      //create a new set of solutions
      let newAnswer = util.getCaptchaString(4);
      //save to database
      let saved = await db.addCaptcha(msg.chat.id, newAnswer);
      //console.log(" >11: ", newAnswer);
      let options1;
      if(saved){
       // console.log(" >12: ", saved);
        let btn = util.createCaptchaButtons(newAnswer);
        options1 = {parse_mode: 'HTML', reply_markup:btn, disable_web_page_preview: true, link_preview:false}
        let reply = util.createCaptchaText(newAnswer);
      //  console.log(" >17: ", msg.chat.id);
        await replyChat(msg.chat.id, reply, false, options1 );
      }
  }catch(err){console.log(err)}
}

async function solveCaptcha(msg, input_solution){
  let step = await db.getUserStep(msg.chat.id);
  if(!util.isEmpty(step )){
      let currStep = step[step.length-1];
      if(currStep == 'finished') return;
  }
  //get the user captcha solution expected from input
  let options1 = {parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false};
  try{
  let expectedCaptcha = await db.getCaptcha(msg.chat.id);
  if(expectedCaptcha !== input_solution){
    //create a new set of solutions
    let newAnswer = util.getCaptchaString(4);
    //save to database
    let saved = await db.addCaptcha(msg.chat.id, newAnswer);
    //console.log(" >1: ", newAnswer);
    if(saved){
    //  console.log(" >2: ", saved);
      let btn = util.createCaptchaButtons(newAnswer);
      options1 = {chat_id:msg.chat.id,message_id:msg.message_id,parse_mode: 'HTML', reply_markup:btn, disable_web_page_preview: true, link_preview:false}
    }
    let reply = util.createCaptchaText(newAnswer);
    //console.log(" >7: ", msg);
    await editMessage( reply, options1 );
    return;
  }

  //user must have entered the correct input... just change it so they wont know it
 let changed = await db.addCaptcha(msg.chat.id, util.getCaptchaString(4));
if(changed){
let btn = JSON.stringify({
    keyboard: [
      ['💰Balance','💳 Withdraw'],
      ['📎Referral Link','🌐 Useful Links'],
      ['🔝Update Information']
    ],
    one_time_keyboard: true,
    resize_keyboard: true,
    remove_keyboard: true
  });
let FILE_ID ='AgACAgQAAxkBAANpYjBaQbbz3U1G1vt6__UhpGMRDJwAAn25MRsYHHhRgThHS0r80AoBAAMCAAN5AAMjBA';

let myRefLink = util.createInvitationLink();
let giveAwayData = await db.fetchGiveaway(msg.chat.id);
let reply;
if(!util.isEmpty(giveAwayData)){
  //this user has already done this before. Dont give them a new token
  myRefLink = giveAwayData.my_referral_code;
  reply = util.congrats(msg.from.first_name, myRefLink);
  //console.log("I have a link from before: ", myRefLink);
  options1 = {caption: reply,parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false, reply_markup:btn}
  await db.addStep(msg.chat.id,'finished');
  await replyChat(msg.chat.id, FILE_ID, true, options1 );
  //console.log("Oboy!");
  return;
}

if(util.isEmpty(giveAwayData)){
    //He is new indeed.
   // console.log("I dont have a link from before: ", myRefLink);

    let settings = await db.fetchAdminData();
    let airdropToGive = settings.airdrop_token;
    let airdropForInvitation = settings.referral_token;
    let maxWallet =settings.max_wallet;
    let rBalance = settings.balance;
    //let airdropDate = settings.airdrop_date;
    // let channels = settings.channels;
    // let groups = settings.groups;
    if(await db.isDuplicateLink(myRefLink)){
      reply = util.errorTimeout();
      options1 = {parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false}
      await replyChat(msg.chat.id, reply, false, options1 );
      return;   
    }    

    if(airdropToGive > rBalance){
      await replyChat(msg.chat.id, '<b>Insufficient admin balance. Sorry, airdrop has ended</b>', false, options1 );
      return;
    }

      //give the user some tokens
      let done = await db.saveToGiveAway(msg.chat.id, airdropToGive, 0, myRefLink);
      if(done){
     //deduct the admin token balance  
      let updated = await db.updateBalanceAdmin(airdropToGive);
      reply = util.congrats(msg.from.first_name, myRefLink);
      options1 = {caption: reply,parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false, reply_markup:btn}
      await db.addStep(msg.chat.id,'finished');
      await replyChat(msg.chat.id, FILE_ID, true, options1 );
      }
      //was he referred by anyone?
      let invitationCode_ = await db.getInvitedBy(msg.chat.id);
      if(!util.isEmpty(invitationCode_)){
        //give the inviter some rewards
        invitationCode_ = util.createInvitationLinkFromCode(invitationCode_);
        console.log("I was refered by: "+invitationCode_);
        let rewarded = await db.updateBalance(invitationCode_,airdropForInvitation,maxWallet);
        if(rewarded){
          console.log("I have rewwared my referer: ",rewarded);
          if(await db.updateReferral(invitationCode_)){
            //deduct the admin token balance  
            console.log("I was updating my referral: "+invitationCode_);
            let updated = await db.updateBalanceAdmin(airdropForInvitation);
          }
        }
      } 
    }
  }
  }catch(err){console.log(err)}
}


async function withdraw(msg){
  try{
    let settings = await db.fetchAdminData();
    let airdropDate = settings.airdrop_date;
    let options1 = {parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false}
    let reply  = `<b> ${airdropDate} </b>`;
    await replyChat(msg.chat.id, reply, false, options1 );
  }catch(err){console.log(err)}
}

async function usefulLinks(msg){
  try{
    let options1 = {parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false}
    let reply  = util.usefulLinks();
    await replyChat(msg.chat.id, reply, false, options1 );
  }catch(err){console.log(err)}
}

async function myReferralLink(msg){
  let myRefLink;
  let reply =`<b>No data found. Please /start airdrop</b>`;
  let FILE_ID ='AgACAgQAAxkBAANpYjBaQbbz3U1G1vt6__UhpGMRDJwAAn25MRsYHHhRgThHS0r80AoBAAMCAAN5AAMjBA';

  try{
  let giveAwayData = await db.fetchGiveaway(msg.chat.id); 
  if(!util.isEmpty(giveAwayData)){
    //this user has already done this before. Dont give them a new token
    myRefLink = giveAwayData.my_referral_code;
    reply = util.congrats(msg.from.first_name, myRefLink);
    console.log("Checking for my referral link: ", myRefLink);
  }
  let options1 = {caption: reply,parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false};
  await replyChat(msg.chat.id, FILE_ID, true, options1 );
  }catch(err){console.log(err)}
}

async function myBalance(msg){
  let reply;
  try{
    let giveAwayData = await db.fetchGiveaway(msg.chat.id);
    let balance = giveAwayData.balance;
    let refCount = giveAwayData.referral_count;
    let refLink = giveAwayData.my_referral_code;
 
    let resultStep = await db.getUserStepInformation(msg.chat.id);
    let twitter = resultStep.twitter;
    let wallet = resultStep.bep20_wallet;

    let settings = await db.fetchAdminData();
    let contract = settings.token_contract;
    if(!util.isEmpty(contract)) contract = contract.trim();
    let result = await token.getMarketDetail(contract, balance);

    let mcap =result[0];
    let price =result[1];
    let coinQty =result[2];
    let worthInDollar =result[3];
    let circSupply =result[4];

    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 7, 
      });

      coinQty = formatter.format(coinQty).replace('$','');
      if(worthInDollar >0 && mcap >0 && price >0 && circSupply >0){
      worthInDollar = formatter.format(worthInDollar.toFixed(0));
      mcap = formatter.format(mcap.toFixed(0));
      price = formatter.format(price.toFixed(8));
      circSupply = formatter.format(circSupply.toFixed(0)).replace('$','');
      }else{
        worthInDollar ="$Nan"
        mcap ="$Nan"
        price ="$Nan"
        circSupply ="$Nan"
        contract ="$Nan"
      }
      reply = util.getUserBal(msg.chat.first_name,mcap,price,worthInDollar,circSupply,twitter,wallet,coinQty, refLink, refCount,contract)
  }catch(err){console.log(err)}
  let options1 = {parse_mode: 'HTML',disable_web_page_preview: true, link_preview:false};
  await replyChat(msg.chat.id, reply, false, options1 );
}

async function replyChat(to, reply, isImageCaption, options){
    if(isImageCaption){
      queue.request(async (retry)=>{
         await bot.sendPhoto(to, reply,options).catch((err)=>{
          try{
          if (err.response.status === 429) {
             return retry(err.response.data.parameters.retry_after);
           }else if(err.response.status === 400){
              //Bot has been removed from the group
           }  
         }catch(error){console.log("Error-: ", error)}
       });
      },to, 'individual');  
    }
  
    if(!isImageCaption){
      await queue.request(async (retry)=>{
            bot.sendMessage(to, reply, options).catch((err)=>{
             try{
             if (err.response.status === 429) {
                return retry(err.response.data.parameters.retry_after);
              }else if(err.response.status === 400){
                 //bot has been removed from the group
              } 
            }catch(error){console.log("Error-: ", error)}
          });
      },to, 'individual');
    }
  
  }
  
  async function editCaption(welcomeMessage, options){
    bot.editMessageCaption( welcomeMessage,options).catch((err)=>{
        try{
        if (err.response.status === 429) {
           return retry(err.response.data.parameters.retry_after);
         }else if(err.response.status === 400){
            //bot has been removed from the group
         } 
       }catch(error){console.log("Error-: ", error)}
     });
  }

  async function editMessage(reply, options1 ){
    // bot.editMessageText("Choose!",{
    //   chat_id:chat_id,
    //   message_id:message_id,
    //   reply_markup:keyboard
    // });
    bot.editMessageText( reply ,options1).catch((err)=>{
      try{
      if (err.response.status === 429) {
         return retry(err.response.data.parameters.retry_after);
       }else if(err.response.status === 400){
          //bot has been removed from the group
       } 
     }catch(error){console.log("Error-: ", error)}
   });
  }

module.exports.startAirdrop = startAirdrop;