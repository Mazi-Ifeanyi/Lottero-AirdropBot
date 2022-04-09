var ABI = require("./ABI");
var Web3 = require("web3");

//These are the supported pair addresses.
let WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
let BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
let SUPPORTED_PAIRS = [BUSD, WBNB];
let DEAD_ADDRESS, ZERO_ADDRESS, PANCAKESWAP_ROUTER_ADDRESS, PANCAKESWAP_FACTORY_ADDRESS;
let UNISWAP_ROUTER_ADDRESS, UNISWAP_FACTORY_ADDRESS;

DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
PANCAKESWAP_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
PANCAKESWAP_FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';
UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

let bscHttpProvider ="https://speedy-nodes-nyc.moralis.io/ed9f138d147bda1f628ffdc1/bsc/mainnet";
var web3ProviderBscHttp = new Web3.providers.HttpProvider(bscHttpProvider);
let web3 = new Web3(web3ProviderBscHttp);

async function getMarketDetail(contractAddress, coinQty) {

      let tokenPairAddress,pair, decimal, weiConverter, circSupply;
      const pcsFactoryAbi = ABI.pcsFactoryAbi;
      let biggest =0, biggestPair, biggestTokenPairAddress;
      let detectedPairs =[];
    
     for (let i = 0; i < SUPPORTED_PAIRS.length; i++) {
       
        pair = SUPPORTED_PAIRS[i];
          try{
              let pcsFactoryRouter = new web3.eth.Contract(pcsFactoryAbi,PANCAKESWAP_FACTORY_ADDRESS);
              tokenPairAddress = await pcsFactoryRouter.methods.getPair(pair, contractAddress).call();
              if (
                tokenPairAddress !== null &&
                tokenPairAddress !== ZERO_ADDRESS &&
                tokenPairAddress !== DEAD_ADDRESS
              ) {      
                //if we see any pair, we get the token paired with and save
          
                let worth_in_$ = await getPairWorthInThePool(pair, tokenPairAddress, contractAddress);
                
                detectedPairs.push({'tokenPairAddress' : tokenPairAddress, 'dollar' : worth_in_$, 'pair': pair}); 
              }
          }catch(err){}
          }
       
    if(detectedPairs.length >0){
              detectedPairs.forEach(function(data){
               let worth = data.dollar;
                 if(worth > biggest){
                   biggest = worth;
                   biggestTokenPairAddress =data.tokenPairAddress;
                   biggestPair = data.pair;
                 }
             });
         
          let data = await getTokenDetails(contractAddress);
          decimal = data[1];
          weiConverter = data[4];
          circSupply = data[3];

          let data2 = await getPriceAndMcap(contractAddress,biggestPair,biggestTokenPairAddress, getSupportedChainDecimal(biggestPair),circSupply,weiConverter);
          const mcap = data2[0];
          const price = data2[1];
          const dollar = data2[2];
          //conversions
          let worthInDollar = coinQty * price * dollar;
             return [mcap,price * dollar,coinQty,worthInDollar,circSupply];
           }      
           return [0,0,coinQty,0,0];
    }

    async function getPairWorthInThePool(pairWBNB_ETH, tokenPairAddress, contractAddress){
        let worth;
      
        //make sure the pair is not busd, usdt etc
        let isBUSD = (pairWBNB_ETH === BUSD)? true : false;
              
        const tokenPairCa = new web3.eth.Contract(ABI.pcsTokenPairAbi, tokenPairAddress);
      
        const balanceReserves = await tokenPairCa.methods.getReserves().call();
        const reserve1 = balanceReserves[0];
        const reserve2 = balanceReserves[1];
      
          let poolTokenBQty;
          if (pairWBNB_ETH.toLowerCase() > contractAddress.toLowerCase()) {
            poolTokenBQty = reserve2;
          } else {
            poolTokenBQty = reserve1;  
          }
          //convert from wei
          poolTokenBQty  = poolTokenBQty / getSupportedChainDecimal(pairWBNB_ETH);
      
         if(!isBUSD){
           let dollar;
          if(pairWBNB_ETH === WBNB){
            dollar = await getNativeCoinPrice(WBNB, BUSD, PANCAKESWAP_ROUTER_ADDRESS);
         }
          worth = poolTokenBQty * dollar;
         }
      
      
        return (isBUSD) ? poolTokenBQty : worth;
       }
      
       /**
        * Based on the supported standard chains, this function should get us the decimal 
        */
        function getSupportedChainDecimal(chainContractAddress){
      
          if(
            chainContractAddress == WBNB || 
            chainContractAddress == BUSD || chainContractAddress == WETH) return 10**18;
      
          if(chainContractAddress == USDT) return 10**6;
        }
      
       function getNetwork(ca){
        if(ca == WBNB || ca == BUSD ) return 'bsc';
      
        if(ca == USDT || ca == WETH) return 'eth';
      
        return '';
       } 
      
       async function getNativeCoinPrice(nativeCoinContract, NATIVE_DOLLAR_PEG, router_address){
        
        const pscRouter = new web3.eth.Contract(ABI.pcsRouterAbi, router_address);
      
          const oneToken = web3.utils.toWei("1", "Ether");
      
          let priceOfBUSDPerNativeCoin = await pscRouter.methods
          .getAmountsOut(oneToken, [nativeCoinContract, NATIVE_DOLLAR_PEG]).call();
          priceOfBUSDPerNativeCoin = web3.utils.fromWei(priceOfBUSDPerNativeCoin[1], "Ether");
      
      
          return priceOfBUSDPerNativeCoin;
      }

async function getTokenDetails(contractAddress) {
    let tName, tDecimal, tTotalSupply, tCircSupply, weiConverter;
  
    //Call the smart contract
    let smartContract = new web3.eth.Contract(
      ABI.smartContractAbi,
      contractAddress
    );
    tName = await smartContract.methods.name().call();
    tDecimal = await smartContract.methods.decimals().call();
    weiConverter = 10 ** tDecimal;
  
    tTotalSupply =
      (await smartContract.methods.totalSupply().call()) / weiConverter;
  
    let deadBal = await smartContract.methods.balanceOf(DEAD_ADDRESS).call()/ weiConverter;
    tCircSupply = (tTotalSupply - deadBal);
  
    return [tName, tDecimal, tTotalSupply, tCircSupply, weiConverter];
  }

  
async function getPriceAndMcap(contractAddress, token_b, pair_address, token_b_converter,token_a_circ_supply,token_a_wei_converter) {
    let tokenB = token_b;
    let pair = pair_address; 
    let tokenBConverter = token_b_converter;   
    let tokenACircSupp = token_a_circ_supply;
    let tokenAWeiConverter = token_a_wei_converter; 
    let dollar;
 
 //get price of token
 const tokenPairContract = new web3.eth.Contract(ABI.pcsTokenPairAbi, pair);

 const balanceReserves = await tokenPairContract.methods.getReserves().call();
 const reserve1 = balanceReserves[0];
 const reserve2 = balanceReserves[1];

 let resultOfDiv;
 let liquidityBNB, liquidityTokens;
 if (tokenB.toLowerCase() > contractAddress.toLowerCase()) {
   resultOfDiv = ( (reserve2 / tokenBConverter) / (reserve1 / tokenAWeiConverter));
   liquidityBNB = (reserve2 / tokenBConverter);
   liquidityTokens / (reserve1 / tokenAWeiConverter);
 } else {
  resultOfDiv = ( (reserve1 / tokenBConverter) / (reserve2 / tokenAWeiConverter)); 
  liquidityBNB = (reserve1 / tokenBConverter);
  liquidityTokens / (reserve2 / tokenAWeiConverter);
 }

 if(tokenB.toLowerCase() == BUSD.toLowerCase()){
    dollar = 1;
  }else {
     if(tokenB.toLowerCase() == WBNB.toLowerCase()){
        dollar = await getNativeCoinPrice(WBNB, BUSD, PANCAKESWAP_ROUTER_ADDRESS);
     }       
 }
 return [(tokenACircSupp * resultOfDiv * dollar), (resultOfDiv), dollar];
}

module.exports = {
    getMarketDetail
    }