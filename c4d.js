"use strict";

var crypto = require("crypto-js");
var signalR = require('signalr-client-kg');
var WebSocket = require('ws');
var https = require('https');

var binanceEngine = require('./engines/binance.js')
const jsonic = require('jsonic');
const zlib = require('zlib');

//load Wasm code
var UnderwasmCode = new Uint8Array([0,97,115,109,1,0,0,0,1,148,128,128,128,0,3,96,1,127,1,127,96,2,125,127,1,124,96,4,127,125,125,125,1,124,3,132,128,128,128,0,3,0,1,2,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,159,128,128,128,0,4,6,109,101,109,111,114,121,2,0,5,112,111,119,101,114,0,0,2,103,80,0,1,5,117,110,100,101,114,0,2,10,159,130,128,128,0,3,171,128,128,128,0,1,1,127,65,1,33,1,2,64,32,0,65,1,72,13,0,65,1,33,1,3,64,32,1,65,10,108,33,1,32,0,65,127,106,34,0,13,0,11,11,32,1,11,199,128,128,128,0,2,1,127,1,124,65,1,33,2,2,64,2,64,32,1,65,1,72,13,0,3,64,32,2,65,10,108,33,2,32,1,65,127,106,34,1,13,0,11,32,2,183,33,3,12,1,11,68,0,0,0,0,0,0,240,63,33,3,11,32,3,32,0,187,162,170,183,32,3,163,11,157,129,128,128,0,2,2,127,2,124,68,0,0,0,0,0,0,240,63,33,7,68,0,0,0,0,0,0,240,63,33,6,2,64,32,0,65,1,106,34,4,65,1,72,13,0,65,1,33,5,3,64,32,5,65,10,108,33,5,32,4,65,127,106,34,4,13,0,11,32,5,183,33,6,11,68,0,0,0,0,0,136,141,64,32,6,163,32,3,32,1,32,2,148,149,34,1,32,1,148,32,1,147,187,163,32,3,187,163,182,33,3,2,64,32,0,65,1,72,13,0,65,1,33,5,3,64,32,5,65,10,108,33,5,32,0,65,127,106,34,0,13,0,11,32,5,183,33,7,11,32,7,32,3,187,162,170,183,32,7,163,11]);
var UnderwasmModule = new WebAssembly.Module(UnderwasmCode);
var UnderwasmInstance = new WebAssembly.Instance(UnderwasmModule, {});
var OverwasmCode =  new Uint8Array([0,97,115,109,1,0,0,0,1,150,128,128,128,0,3,96,1,127,1,127,96,2,125,127,1,124,96,6,125,127,127,125,125,125,1,124,3,132,128,128,128,0,3,0,1,2,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,158,128,128,128,0,4,6,109,101,109,111,114,121,2,0,5,112,111,119,101,114,0,0,2,103,80,0,1,4,111,118,101,114,0,2,10,215,131,128,128,0,3,171,128,128,128,0,1,1,127,65,1,33,1,2,64,32,0,65,1,72,13,0,65,1,33,1,3,64,32,1,65,10,108,33,1,32,0,65,127,106,34,0,13,0,11,11,32,1,11,198,128,128,128,0,2,1,127,1,124,65,1,33,2,2,64,2,64,32,1,65,1,72,13,0,3,64,32,2,65,10,108,33,2,32,1,65,127,106,34,1,13,0,11,32,2,183,33,3,12,1,11,68,0,0,0,0,0,0,240,63,33,3,11,32,3,32,0,187,162,155,32,3,163,11,214,130,128,128,0,5,1,124,1,125,1,124,3,127,1,124,65,1,33,11,68,0,0,0,0,0,0,240,63,33,12,68,0,0,0,0,0,0,240,63,33,8,2,64,32,1,65,1,72,34,9,13,0,32,1,33,10,3,64,32,11,65,10,108,33,11,32,10,65,127,106,34,10,13,0,11,32,11,183,33,8,11,68,0,0,0,0,0,0,240,63,32,8,163,182,187,34,6,32,3,32,4,148,32,5,149,187,68,0,0,0,0,0,0,240,191,160,163,182,33,7,2,64,32,9,13,0,65,1,33,11,32,1,33,10,3,64,32,11,65,10,108,33,11,32,10,65,127,106,34,10,13,0,11,32,11,183,33,12,11,2,64,32,12,32,7,187,162,155,32,12,163,34,12,32,0,187,34,8,102,32,12,32,12,98,32,8,32,8,98,114,114,13,0,32,12,32,8,32,12,163,155,162,32,4,32,5,149,187,162,182,33,4,68,0,0,0,0,0,0,240,63,33,12,68,0,0,0,0,0,0,240,63,33,8,2,64,32,2,65,1,72,13,0,65,1,33,11,3,64,32,11,65,10,108,33,11,32,2,65,127,106,34,2,13,0,11,32,11,183,33,8,11,32,8,32,4,187,162,155,32,8,163,32,3,187,162,32,6,161,182,33,3,2,64,32,1,65,1,72,13,0,65,1,33,11,3,64,32,11,65,10,108,33,11,32,1,65,127,106,34,1,13,0,11,32,11,183,33,12,11,32,12,32,3,187,162,155,32,12,163,33,12,11,32,12,11]);
var OverwasmModule = new WebAssembly.Module(OverwasmCode);
var OverwasmInstance = new WebAssembly.Instance(OverwasmModule, {});



/**
   * CryptoBot constructor.
   * @method CryptoBot
   * @parm {Object} A config.json file
   */
function CryptoBot(Settings){	
	this.email = require("emailjs");
	this.https = require('https');
	this.MongoClient = require('mongodb').MongoClient;
	this.Settings = Settings;
	this.logLevel = Settings.Config.logs;
	//Bittrex Settings
	this.balance = {}
	this.bittrexInProcess = false;
	this.bittrexOrders = []
	this.bittrexProcessTime = 0;
	this.bittrexSocketConnection = Settings.Config.enabled;
	this.bittrexSocketStatus = false;
	this.bittrexTradesMade = 0;
	this.swingRate = Settings.Swing.rate;
	this.saneTrades =  Settings.Bittrex.saneTrades;
	this.liquidTrades = Settings.Bittrex.liquidTrades;
	this.vibrate = Settings.Swing.swingTrade;
	this.viewBittrexBook = Settings.Bittrex.viewBook;
	this.lowerLimit = Settings.Bittrex.lowerLimit
	this.upperLimit = Settings.Bittrex.upperLimit;
	this.swingPercentage = Settings.Swing.swing;
	this.p1 = Settings.Bittrex.xxxAmount;
	this.p2 = Settings.Bittrex.btcAmount;
	//Binance Settings
	this.binanceApiKey = Settings.Binance.apikey;
	this.binanceApiSecret = Settings.Binance.secretkey;
	this.binanceMarket = 'wss://stream.binance.com:9443/ws/xxx@ticker';
	this.binanceUserStreamString = 'wss://stream.binance.com:9443/ws/';
	this.binanceBalance = {account:"Binance"}	
	this.binanceB1Min = {}
	this.binanceC1Min = {}
	this.binanceU1Min = {}
	this.binanceInProcess = {}
	this.binanceLimits = {}
	this.binanceOptimalTrades = {}
	this.binanceOrders = {}
	this.binancePrec = {}
	this.binanceProcessTime = {}
	this.binanceKill = false;
	this.binanceSocketConnections = [];
	this.binanceStrategy = {}
	this.liquidTradesBinance = {}
	this.binanceTradesMade = {}
	this.binanceUserStreamStatus = false;
	//format Binance pairs for general usage
	this.Settings.Binance.formatPairs = Settings.Binance.pairs;
	this.Settings.Binance.pairs = JSON.parse(JSON.stringify(Settings.Binance.pairs).replace(new RegExp("_", 'g'),""));
	//wasmCode
	if(this.Settings.Config.useWasm){
		this.utilities.solveOver = OverwasmInstance.exports.over;
		this.utilities.solveUnder = UnderwasmInstance.exports.under;
	}
	//Get Exchange Information
	this.binancePrecision(this.Settings.Binance.pairs).then((exchangeData)=>{
		this.binanceFormatPairs(exchangeData);
		for(var i=0;i< this.Settings.Binance.pairs.length;i++){
			this.binanceB1Min[this.Settings.Binance.pairs[i].pair1] = this.Settings.Binance.pairs[i].minimumB1;
			this.binanceC1Min[this.Settings.Binance.pairs[i].pair1] = this.Settings.Binance.pairs[i].minimumC1;
			this.binanceU1Min[this.Settings.Binance.pairs[i].pair1] = this.Settings.Binance.pairs[i].minimumU1;
			this.binanceInProcess[this.Settings.Binance.pairs[i].pair1] = false;
			this.binanceLimits[this.Settings.Binance.pairs[i].pair1] = {
				"over":{"lowerLimit":this.Settings.Binance.pairs[i].lowerLimit1,"upperLimit":this.Settings.Binance.pairs[i].upperLimit1},
				"under":{"lowerLimit":this.Settings.Binance.pairs[i].lowerLimit2,"upperLimit":this.Settings.Binance.pairs[i].upperLimit2}
			}
			this.binanceOptimalTrades[this.Settings.Binance.pairs[i].pair1] = this.Settings.Binance.pairs[i].optimalTrades;
			this.binanceOrders[this.Settings.Binance.pairs[i].pair1] = [];
			this.binancePrec[this.Settings.Binance.pairs[i].pair1] = this.Settings.Binance.pairs[i].prec;
			this.binanceProcessTime[this.Settings.Binance.pairs[i].pair1] = false;
			this.binanceStrategy[this.Settings.Binance.pairs[i].pair1] = {one:{},two:{}}
			this.liquidTradesBinance[this.Settings.Binance.pairs[i].pair1] = this.Settings.Binance.pairs[i].liquidTrades;		
			this.binanceTradesMade[this.Settings.Binance.pairs[i].pair1] = false;
		}	
	}).catch((e)=>{this.log(e);})
	//transactions
	this.Transactions = {};
}

//Binance Engine
CryptoBot.prototype.binanceAccount = binanceEngine.Account;

CryptoBot.prototype.binanceArbitrage = binanceEngine.Arbitrage;

CryptoBot.prototype.binanceArbitrageMessageFormat = binanceEngine.ArbitrageMessageFormat;

CryptoBot.prototype.binanceBeginArbitrage = binanceEngine.beginArbitrage;

CryptoBot.prototype.binanceCancelOrder = binanceEngine.cancelOrder;

CryptoBot.prototype.binanceCheckConditions = binanceEngine.checkConditions;

CryptoBot.prototype.binanceCheckTrade = binanceEngine.checkTrade;

CryptoBot.prototype.binanceExchangeInfo = binanceEngine.exchangeInfo;

CryptoBot.prototype.binanceGenerateStrategy = binanceEngine.generateStrategy;

CryptoBot.prototype.binanceListenBeat = binanceEngine.listenBeat;

CryptoBot.prototype.binanceListenKey = binanceEngine.listenKey;

CryptoBot.prototype.binanceListenUser = binanceEngine.listenUser;

CryptoBot.prototype.binanceMonitor = binanceEngine.monitor;

CryptoBot.prototype.binanceOpenOrders = binanceEngine.openOrders;

CryptoBot.prototype.binanceParseUserEvent = binanceEngine.parseUserEvent;

CryptoBot.prototype.binancePrecision = binanceEngine.precision;

CryptoBot.prototype.binanceFormatPairs = binanceEngine.formatPairs;

CryptoBot.prototype.binanceReset = binanceEngine.reset;

CryptoBot.prototype.binanceSaveOrders = binanceEngine.saveOrders;
 
CryptoBot.prototype.binanceStream = binanceEngine.stream;

CryptoBot.prototype.binanceUserStream = binanceEngine.userStream;

CryptoBot.prototype.binanceTrade = binanceEngine.trade;

//Bittrex Engine

/**
   * Bittrex API base template.
   * @method bittrexAPI
   * @param {String} Bittrex api path
   * @param {String} Bittrex api query options
   * @return {Promise} Should resolve with req response
   */
CryptoBot.prototype.bittrexAPI = function(path,options){
	return new Promise((resolve,reject) =>{	
		var hmac;
		var nonce;
		var postData;
		var req;
		var shaObj;
		nonce = Math.floor(new Date().getTime()/1000);
		postData ="https://bittrex.com/api/v1.1/"+path+"?apikey="+this.Settings.Bittrex.apikey+"&nonce="+nonce;
		if(options && options.length > 0){
			postData = postData + options;
		}
		hmac = crypto.HmacSHA512(postData,this.Settings.Bittrex.secret).toString();
		req = this.https.request(
		    {
				host:"bittrex.com",
				path:postData.replace("https://bittrex.com",""),
				method:"Get",
				headers:{"apisign":hmac}
			},
			(response)=>{
		        var body = "";
		        response.on("data",(d)=>{
					body += d;
				});
		        response.on("end",()=>{
					var parsed;
					try{
						parsed = JSON.parse(body);
						parsed.result = postData.search("market/cancel") > -1 ? parsed : parsed.result;
						return resolve(parsed.result);		
					}
					catch(e){
						this.log("Body:",body,new Date());
						this.log("Bittrex API Error:",e);
						return reject(e);
					}		
			    });
		        response.on('error',(e)=>{
					this.log("Bittrex API Error => ",e,new Date());
					return reject(e);
				})
			}
	    );
	   return req.end();
	});
}	
	
/**
   * Get Bittrex balance.
   * @method bittrexAccount
   * @return {Promise} Should resolve with Bittrex balance object
   */	
CryptoBot.prototype.bittrexAccount = function(){
	return new Promise((resolve,reject)=>{
		return this.bittrexAPI("account/getbalances",null).then((list)=>{
			if(!list){
				this.log("Error getting Bittrex account info");
				return reject(new Error("Error getting Bittrex account info"));
			}
			list.forEach((asset)=>{
				return this.balance[asset.Currency.toLowerCase()] = asset.Available;
			});
			this.balance.account = "BITTREX";
			this.broadcastMessage({"type":"balance","balance":this.balance,"p1":this.p1,"p2":this.p2});
			return resolve(this.balance);				
		}).catch((e)=>{
			this.log("Error Getting Bittrex balance:",e);
			return reject(e);
		});
	});
}

/**
   * Conduct Bittrex arbitrage.
   * @method bittrexArbitrage
   * @param {Object} Bittrex socket message
   * @param {Object} Local order book
   * @param {Object} Transactions object
   * @param {Object} Arbitrage strategy
   * @param {String} Bittrex currency pair ie 'BTC-LTC'
   * @param {String} Bittrex currency pair
   * @param {String} Bittrex currency pair
   * @param {String} Bittrex currency ie ltc
   * @param {String} Bittrex currency underscore ie _ltc
   * @param {String} Bittrex currency
   * @param {String} Bittrex currency
   * @param {String} Bittrex currency underscore ie _btc
   * @return {Array} Returns an array [trades,[percentage,Transactions,a,e1,_e1,b3,pair1]]
   */	
CryptoBot.prototype.bittrexArbitrage = function(localMarket,Transactions,strategy,pair1,pair2,pair3,e1,_e1,u2,b3,_b3){
	if(this.bittrexInProcess === true){return [0];}
	var a,b,c;
	var data;
	var message;
	var orders = {}
	var pair;
	var percentage;
	var trading_pairs;
	var trades = [];
	try{
		a =  strategy[pair1].strat1,b = strategy[pair2].strat1,c = strategy[pair3].strat1;
		percentage = a * b/c * 100;
		if(!Number(percentage)){return []}		
		if(percentage < 100){
			trading_pairs = {"type":"percentage","exchange":"bittrex","percentage":percentage,"strategy":1}
			message = this.bittrexFormatMessage(e1,u2,b3,_e1,a,c,b,percentage,Transactions);					
			trades = [["sell",pair3,Transactions[e1],c],["buy",pair2,Number(Transactions[b3].toFixed(8)),b],["buy",pair1,Transactions[_e1].toFixed(8),a]]
		}
		else {
			a =  strategy[pair1].strat2,b = strategy[pair2].strat2,c = strategy[pair3].strat2;
			percentage = a * b/c * 100;
			if(!Number(percentage)){return []}	
			trading_pairs = {"type":"percentage","exchange":"bittrex","percentage":percentage,"strategy":2}
			message = percentage > 100 ? this.bittrexFormatMessage(b3,u2,e1,_b3,a,b,c,percentage,Transactions) : this.bittrexFormatMessage(e1,u2,b3,_e1,a,c,b,percentage,Transactions);					
			trades = [["sell",pair2,Transactions[b3],b],["buy",pair3,Transactions[e1].toFixed(8),c],["sell",pair1,Transactions[e1].toFixed(8),a]]
		}
		trading_pairs[pair1] = a,trading_pairs[pair2] = b,trading_pairs[pair3] = c;
		this.broadcastMessage(trading_pairs)
		if(!this.bittrexCheckConditions(Transactions,percentage,e1,b3,u2,message)){return [];}	
		this.log(message);
		this.notify(message +"\r\n"+JSON.stringify(localMarket).replace(new RegExp('"', 'g'),""));
		this.bittrexInProcess = true;
		this.bittrexProcessTime = new Date().getTime();
		this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
		return [trades,[percentage,Transactions,a,e1,_e1,b3,pair1]];				
	}
	catch(e){
		this.log("Bittrex Arbitrage Error:",e);
		return [];
	}
}
/**
   * Cancel Bittrex order.
   * @method bittrexCancelOrder
   * @param {String} Bittrex order id
   * @return {Promise} Should resolve with req response
   */	
CryptoBot.prototype.bittrexCancelOrder = function(orderid){
	return new Promise((resolve,reject)=>{
		return this.bittrexAPI("market/cancel","&uuid="+orderid).then((res)=>{
			if(res.success){
				return resolve(res);
			}	
			else{
				this.log("Error Canceling Bittrex Order:",orderid);
				return reject(false);
			}
		}).catch((e)=>{
			this.log("Error Canceling Bittrex Order:",e,orderid);
			return reject(false);
		});
	});
}	
	
/**
   * Check Bittrex conditions.
   * @method bittrexCheckConditions
   * @param {Object} Transactions
   * @param {Number} Percentage
   * @param {String} Currency ie 'ltc'
   * @param {String} Currency ie 'btc'
   * @param {String} Currency ie 'usdt'
   * @return {Boolean} Returns a boolean
   */	
CryptoBot.prototype.bittrexCheckConditions = function(Transactions,percentage,e1,b3,u2,message){
	if(!Number(Transactions[e1]) || !Number(Transactions[u2]) || !Number(Transactions[b3]) ){
		return false;
	}	
	if(this.saneTrades && percentage < 100 && (percentage < this.lowerLimit || percentage > 99.25)){
		//this.log("Insane Trade:",message);
		return false
	}
	if(this.saneTrades && percentage > 100 && (percentage < 100.7524 || percentage > this.upperLimit)){
		//this.log("Insane Trade:",message);
		return false
	}	
	if(this.liquidTrades && percentage > 100 && (Transactions[u2+'_amount2'] < Transactions[u2] || Transactions[b3+'_amount2'] < Transactions[b3] || Transactions[e1+'_amount2'] < Transactions[e1])){
		//this.log("Illiquid Trade:",new Date());
		return false;
	}	
	if(this.liquidTrades && percentage < 100 && (Transactions[u2+'_amount1'] < Transactions[u2] || Transactions[b3+'_amount1'] < Transactions[b3] || Transactions[e1+'_amount1'] < Transactions[e1])){
		//this.log("Illiquid Trade:",message,new Date());
		return false;
	}
	if(Number(this.balance[e1]) < Transactions[e1]  ||  Number(this.balance[b3]) < Transactions[b3] || Number(this.balance[u2]) < Transactions[u2]){
		//this.log("Wallet balance not enough to place order:",message,new Date());
		return false;
	}
	if(Transactions.btc < this.Settings.Bittrex.minimum){
		//this.log("Minimum btc order not met:",message);
		return false;
	}
	return true
}		
	

/**
   * Check if Bittrex arbitrage was completed in time.
   * @method bittrexCheckTrade
   * @return {Boolean} Return a boolean
   */
CryptoBot.prototype.bittrexCheckTrade = function(){
	this.log("Timing out Bittrex orders:",this.bittrexOrders,new Date());
	if((new Date().getTime() - this.bittrexProcessTime) > 480000 && this.bittrexInProcess === true) {
			this.log("Bittrex Arbitrage timeout.....",new Date());
			this.bittrexReset();
			return false;
		}
	return true
}	


/**
   * Create local Bittrex order book.
   * @method bittrexCreateBook
   * @param {Object} Bittrex message data
   * @param {Object} Current local order book
   * @return {Boolean} Should return true
   */	
CryptoBot.prototype.bittrexCreateBook = function(data,localMarket){
	var pair = data.M;
	this.bittrexUpdateMarket(pair,data,localMarket)
	this.bittrexSortBook(localMarket[pair]);
	if(this.viewBittrexBook){
		var rand = Math.floor(100 * Math.random(0,1));
		if(rand % 3 === 0){
			this.broadcastMessage({type:"bittrexBook",book:localMarket});
		}	
	}
	return true;
}
/**
   * Get Bittrex pair depth.
   * @method bittrexDepthPure
   * @param {String} Bittrex pair
   * @return {Promise} Should resolve {Object} with currency pair depth data
   */	
CryptoBot.prototype.bittrexDepthPure = function(pair){
	return new Promise((resolve,reject) =>{	
	    var req = this.https.request({
			host: "bittrex.com",
			path: "/api/v1.1/public/getorderbook?market="+pair+"&type=both",
			method: "GET"
		},(response)=>{
	        var body = '';
	        response.on('data',(d)=> {
				body += d;
			});
	        response.on('end',()=> {	
				var parsed;
				try{
		            parsed = JSON.parse(body);
		            if(!parsed || !parsed.success){
						return reject("Error:"+body);
					}
					return resolve({"sell":Number(parsed['result'].sell[0].Rate),"buy":Number(parsed['result'].buy[0].Rate)});
				}
				catch(e){
					return reject(false);
				}
		    });
		    response.on('error',(e)=>{
				this.log(e);
				return reject(e);
			});
		});
		req.write("");
		req.end();
	});
}
/**
   * Format Bittrex Message and Transaction object.
   * @method bittrexFormatMessage
   * @param {String} A currency ie 'ltc'
   * @param {String} A currency ie 'btc'
   * @param {String} A currency ie 'usdt'
   * @param {String} A currency ie '_ltc'
   * @param {Number} Currency rate  
   * @param {Number} Currency rate 
   * @param {Number} Currency rate 
   * @param {Number} Percentage
   * @param {Object} Transactions object
   * @return {String} Returns a string message
   */
CryptoBot.prototype.bittrexFormatMessage = function(e1,u2,b3,_e1,a,b,c,percentage,Transactions){
	Transactions[e1] = percentage < 100 ? Number((this.p1).toFixed(8)) : Number((this.p2).toFixed(8))
	Transactions[u2] = 0.9975*Transactions[e1] * b;
	Transactions[b3] = 0.9975*(Transactions[u2]/c);	
	Transactions[_e1] =  percentage < 100 ? Number(((Transactions[b3]/a) * 0.9975).toFixed(8)) : Number(((Transactions[b3]*a) * 0.9975).toFixed(8));
	Transactions[u2] = Number((Transactions[u2]).toFixed(8));
	Transactions[b3] = Number((Transactions[b3]).toFixed(8));
	Transactions.percentage = percentage;
	Transactions.before = Transactions[e1];
	Transactions.after = Transactions[_e1];
	Transactions.profit = Transactions[_e1]/Transactions[e1];
	var message = "Bittrex Bot:"+percentage.toFixed(3) +"%\n";
	message += Transactions[e1] + e1 +" => "+Transactions[u2] +u2+" @" + b + '\n';
	message += Transactions[u2] + u2+" => " + Transactions[b3] + b3+" @"+c +'\n';
	message += Transactions[b3] + b3+" => " + Transactions[_e1] +e1+" @"+a;		
	return message;
}

/**
   * Generate Bittrex trading strategy.
   * @method bittrexGenerateStrategy
   * @param {String} Bittrex currency pair ie USDT-BTC
   * @param {Object} Local Bittrex order book
   * @param {Object} Strategy object
   * @param {Object} Transactions object
   * @param {String} Bittrex currency ie LTC  
   * @param {String} Bittrex currency  
   * @param {String} Bittrex currency 
   * @return {Boolean} Returns a boolean
   */
CryptoBot.prototype.bittrexGenerateStrategy = function(pair,localMarket,strategy,Transactions,e1,u2,b3){
	try{
		if(pair === this.Settings.Bittrex.pair3){
			strategy[this.Settings.Bittrex.pair3]["strat1"] = Number(localMarket[pair]["Sorted"][1][0]);
			strategy[this.Settings.Bittrex.pair3]["strat2"] = Number(localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]);
			//If lowest Ask < highest bid delete
			if(strategy[this.Settings.Bittrex.pair3]["strat2"] < strategy[this.Settings.Bittrex.pair3]["strat1"]){
				delete localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
				return false
			}
			Transactions[e1+'_amount1'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
			Transactions[e1+'_amount2'] = localMarket[pair]["Asks"][localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]];
		}
		else if(pair === this.Settings.Bittrex.pair2){
			strategy[this.Settings.Bittrex.pair2]["strat1"] = Number(localMarket[pair]["Sorted"][1][0]);
			strategy[this.Settings.Bittrex.pair2]["strat2"] = Number(localMarket[pair]["Sorted"][1][0]);
			if(strategy[this.Settings.Bittrex.pair2]["strat1"] > Number(localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1])){
				delete localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
				return false
			}
			Transactions[b3+'_amount1'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
			Transactions[b3+'_amount2'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
		}
		else{
			strategy[this.Settings.Bittrex.pair1]["strat1"] = Number(localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]);
			strategy[this.Settings.Bittrex.pair1]["strat2"] = Number(localMarket[pair]["Sorted"][1][0]);
			if(strategy[this.Settings.Bittrex.pair1]["strat1"] < strategy[this.Settings.Bittrex.pair1]["strat2"]){
				delete localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
				return false;
			}
			Transactions[u2+'_amount1'] = localMarket[pair]["Asks"][localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]];
			Transactions[u2+'_amount2'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
		}
	}
	catch(e){
		this.log(e);
		return false;
	}
	return true;
}

/**
   * Get Bittrex orders.
   * @method bittrexGetOrders
   * @return {Promise} Should resolve {Array} with Bittrex orders
   */
CryptoBot.prototype.bittrexGetOrders = function(){
	return new Promise((resolve,reject) => {	
		return this.bittrexAPI("market/getopenorders",null).then((orders)=>{
			if(orders && orders.length > 0){
				for(var i = 0;i < orders.length;i++){
					this.saveDB("order",{},{extra:{"w":1},method:"update",query:{"uuid":orders[i].OrderUuid},modifier:{"$set":{"open":true}}});
				}
			}
			return resolve(orders);
		}).catch((e)=>{
			this.log(e);
			return reject(e);
		});	
	})
}	

/**
   * Parse a Bittrex user event.
   * @method bittrexParseUserEvent
   * @param {Object} Bittrex Order Data
   * @return {Promise} Should resolve with Binance exchange data
	**/
CryptoBot.prototype.bittrexParseUserEvent = function(data){
	try{
		if(data.o){
			if(data.TY === 0){
				if(this.bittrexInProcess){					
					var order = {type:"order","exchange":"Bittrex","otype":data.o.OT,"order_id":data.o.OU,"amount":data.o.Q,"pair":data.o.E,"status":data.o.IsOpen,"rate":data.o.P,"timestamp_created":data.o.Y}
					this.broadcastMessage(order);
				}
			}
			if(data.TY === 2 || data.TY === 3){
				var key= "Orders."+data.o.OU;
				var update = {key:true}
				var lookupOrder = {}
				var _set = {}
				lookupOrder[key] = false;
				_set[key] = true;
				_set['Filled'] = new Date().getTime();
				this.saveDB("trade",{},{extra:{"w":1},method:"update",query:lookupOrder,modifier:{"$set":_set,"$inc":{"OrdersFilled":1}}});
				if(this.bittrexOrders.indexOf(data.o.OU) > -1){
					if(this.bittrexOrders[0] === data.o.OU){
						this.bittrexOrders.shift();
					}
					else if(this.bittrexOrders[this.bittrexOrders.length - 1] === data.o.OU){
						this.bittrexOrders.pop();
					}
					else{
						this.bittrexOrders = [this.bittrexOrders[0],this.bittrexOrders[2]];
					}
				}
				this.log("Bittrex Order Removed:",data.o.OU,new Date(),":",this.bittrexOrders.length+"/"+this.bittrexTradesMade);
				this.broadcastMessage({type:"orderRemove",order_id:data.o.OU});
				if(this.bittrexOrders.length === 0 && this.bittrexTradesMade === 3){
					this.bittrexInProcess = false;	
					this.bittrexOrders = [];
					this.bittrexProcessTime = 0;
					this.bittrexTradesMade = 0;
					this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});							
				}
			}
		}
		else if(data.d){
			this.binanceBalance[data.d.c.toLowerCase()] = data.d.a;
			this.broadcastMessage({"type":"balance","balance":this.balance,"p1":this.p1,"p2":this.p2});
			this.log("Bittrex Balance Updated:",data.d.c,":",data.d.a);
		}
		return true;									
	}
	catch(e){
		this.log("Error parsing user event:",e,new Date());
		return false;
	}

}



/**
   * Reset Bittrex status.
   * @method bittrexReset
   * @return {Boolean} Returns true
   */
CryptoBot.prototype.bittrexReset = function(){
	this.bittrexAccount().catch(e=>{this.log(e)});
	this.bittrexInProcess = false;	
	this.bittrexOrders = [];
	this.bittrexProcessTime = 0;
	this.bittrexTradesMade = 0;
	this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
	return true;
}

/**
   * Save Bittrex Orders.
   * @method bittrexSaveOrders
   * @param {Number} Percentage
   * @param {Object} Transactions object
   * @param {Number} Currency pair rate
   * @param {String} Transactions object
   * @param {String} e1 currency string
   * @param {String} _e1 currency string
   * @param {String} b3 currency string
   * @param {String} b3-e1 market string
   * @return {Object} Return setTimeout object
   */
CryptoBot.prototype.bittrexSaveOrders = function(percentage,Transactions,a,e1,_e1,b3,basePair){
	var profit1 = percentage < 100 ? 0 :(Transactions[e1]*a) - Transactions[b3];
	var profit2 =  percentage < 100 ? Transactions[_e1] - Transactions[e1] : 0 ;
	var profit3 =  0 ;
	this.saveDB("trade",{},{extra:{"w":1,"upsert":true},method:"update",query:{"Time":this.bittrexProcessTime},modifier:{"$set":{"T":Transactions,"Time":this.bittrexProcessTime,"Percent":percentage,"Exchange":"Bittrex","Profit":profit1,"Profit2":profit2,"Profit3":profit3,"Pair":basePair}}});
	return setTimeout(()=>{this.bittrexCheckTrade()},480005);
}

/**
   * Sort Bittrex order book
   * @method bittrexSortBook
   * @param {Object} {Bids:[],Ask:[]}
   * @return {Object} Return sorted order book
   */
CryptoBot.prototype.bittrexSortBook = function(obj){
	var keys1 = Object.keys(obj["Asks"]);
	var keys2 = Object.keys(obj["Bids"]);
	keys2 = this.utilities.BubbleSort(keys2);
	keys1 = this.utilities.BubbleSort(keys1,Number(keys2[0]));
	if(keys1.length > 25){
		for(var i = 0;i < 5;i++){
			delete obj["Asks"][keys1[i]];
		}
		keys1 = keys1.slice(5);
	}
	if(keys2.length > 25){
		for(var i = 20;i < 25;i++){
			delete obj["Bids"][keys2[i]];
		}
		keys2 = keys2.slice(0,20);
	}	
	obj["Sorted"] = [keys1,keys2];
	return obj;
}

/**
   * Start Bittrex Arbitrage.
   * @method bittrexStartArbitrage
   * @param {Array} Array of Bittrex trades
   * @param {Object} Local order book
   * @return {Promise} Returns false or niceOrderChain promise which resolves an object with Bittrex orders 
   */
CryptoBot.prototype.bittrexStartArbitrage = function(trades,localMarket){
	if(!trades[0] || trades[0].length < 3){
		return false;	
	}
	this.log("Starting Trades:",new Date());
	var percentage,Transactions,a,e1,_e1,b3,pair1;
	[percentage,Transactions,a,e1,_e1,b3,pair1] = trades[1];
	this.bittrexSaveOrders(percentage,Transactions,a,e1,_e1,b3,pair1);
	return Promise.all([this.bittrexTrade(...trades[0][0]),this.bittrexTrade(...trades[0][1]),this.bittrexTrade(...trades[0][2])]).then((values)=>{
		this.log("Bittrex Orders Made:",values);
		return true;
	}).catch((e)=>{
		this.log(e);
		this.notify(e.toString());
		this.bittrexReset();
		return false;
	});	
}

/**
   * Monitor Bittrex pairs for arbitrage opportunities.
   * @method bittrexStream
   * @return Should return signalr-client
   */
CryptoBot.prototype.bittrexStream = function(){
	var a;
	var b;
	var c;
	var client;
	var localMarket = {}
	var pair1 = this.Settings.Bittrex.pair1;
	var pair2 = this.Settings.Bittrex.pair2;
	var pair3 = this.Settings.Bittrex.pair3;
	var strategy = {};	
	var Transactions = this.Transactions;
	var e1;
	var _e1;
	var u2;
	var b3;
	var _b3;
	e1 = pair1.split('-')[1].toLowerCase();
	_e1 = "_" + pair1.split('-')[1].toLowerCase();
	b3 = pair1.split('-')[0].toLowerCase();
	_b3 = "_"+pair1.split('-')[0].toLowerCase();
	u2 = pair2.split('-')[0].toLowerCase();		
	localMarket[this.Settings.Bittrex.pair1] = {Bids:{},Asks:{}}
	localMarket[this.Settings.Bittrex.pair2] = {Bids:{},Asks:{}}
	localMarket[this.Settings.Bittrex.pair3] = {Bids:{},Asks:{}}
	strategy[pair1] = {}
	strategy[pair2] = {}
	strategy[pair3] = {}
	client = new signalR.client("wss://socket.bittrex.com/signalr",['c2']);	
	client.serviceHandlers = {
		connected: (connection)=> {
			if(!this.bittrexSocketStatus){
				this.updateBittrexSocketStatus("Bittrex Websocket connected:",true);
				this.bittrexSubscribe(client,[this.Settings.Bittrex.pair1,this.Settings.Bittrex.pair2,this.Settings.Bittrex.pair3]);
				this.bittrexSocketConnection = connection;
				return;
			}
		},
		disconnected: ()=> { 
			this.updateBittrexSocketStatus("Bittrex Websocket disconnected",false);
			if(this.bittrexKill){
				this.bittrexSocketConnection = null;
				client.end();
				return this.log("Bittrex Connection closed by user",new Date());
			}
			else{
				this.log("Restarting Bittrex Websocket:",new Date());
				if(!this.bittrexSocketStatus){
					this.bittrexSocketConnection = null;
					return this.bittrexStream();
				}
			}
		},
		onerror:(e)=> { 
			return this.log("Bittrex Connection Error:",e.message,new Date())
		},
		messageReceived: (message)=> {
			var b64;
			var data;
			var json;
			var raw;
			try{
				data = jsonic(message.utf8Data);
				if (data.hasOwnProperty ('M')) {
					if (data.M[0]) {
						if (data.M[0].hasOwnProperty ('A')) {
							if (data.M[0].A[0]) {
							/**
							*  handling the GZip and base64 compression
							*  https://github.com/Bittrex/beta#response-handling
							*/
								b64 = data.M[0].A[0];
								raw = new Buffer.from(b64, 'base64');
								json = JSON.parse(zlib.inflateRawSync(raw).toString('utf8')) 
								if (data.M[0].M === 'uE'){
									this.bittrexCreateBook(json,localMarket);
									if(!this.bittrexGenerateStrategy(json.M,localMarket,strategy,Transactions,e1,u2,b3)){return [];}
									var trades = this.bittrexArbitrage(localMarket,Transactions,strategy,pair1,pair2,pair3,e1,_e1,u2,b3,_b3);
									return this.bittrexStartArbitrage(trades,localMarket);
								}
								if(data.M[0].M === 'uO' || data.M[0].M === 'uB'){
									return this.bittrexParseUserEvent(json);
								}
								/*Placeholder
								 * For when Bittrex does the right thing and put Amounts in summary delta
									if(data.M[0].M === 'uS'){}	
								* */						
							}
						}
					}
				}
				else{
					return false;
				}
			}
			catch(e){
				this.log("Error processing Bittrex message:",e);
				return false;
			}
		}
	};
	return client;
}

/**
   * Remove swing order document.
   * @method bittrexResetSwingOrder
   * @return {Promise} Should resolve with boolean
   */
CryptoBot.prototype.bittrexResetSwingOrder = function(){
	return this.saveDB("swing",{},{extra:{"w":1},method:"remove",query:{"swing":1},modifier:{}});
}

/**
   * Subscribe to Bittrex websocket data.
   * @method bittrexSubscribe
   * @param {Object} Signal-r Client
   * @param {Array} Array of Bittrex pairs
   * @return {Promise} Returns a  promise that resolves to a boolean
   */
CryptoBot.prototype.bittrexSubscribe= function(client,pairs){
	return new Promise((resolve,reject)=>{
		var count = 0;
		client.call('c2','GetAuthContext',this.Settings.Bittrex.apikey).done((err, result)=> {
			if (!err) {
				var hmac = crypto.HmacSHA512(result,this.Settings.Bittrex.secret).toString();
				client.call('c2', 'Authenticate',this.Settings.Bittrex.apikey,hmac).done((err, result)=> {
					if (!err) {
						this.log('Subscribed to Bittrex Account Data:' + result,new Date());
					}
					else{
						this.log("Bittrex Authenticate Error:",err,new Date());
					}
				})
			}
			else{
				this.log("Bittrex AuthContext Error:",err,new Date());
			}
		});
		/*Placeholder
		* For when Bittrex does the right thing and puts quantity in summary delta
			client.invoke('c2','SubscribeToSummaryDeltas');
		* */
		pairs.forEach((market)=> {	
			client.call('c2', 'SubscribeToExchangeDeltas', market).done((err, result)=> {
				count++;
				if (result === true) {
					this.log('Subscribed to Bittrex market:' + market,new Date());
				}
				if(count > 2){
					return resolve(true)
				}
			});
		});
	})
}

/**
   * Create Bittrex swing order.
   * @method bittrexCreateSwingOrder
   * @param {String} Bittrex trade type
   * @param {String} Bittrex trade pair
   * @param {Number} Trade amount
   * @param {Number} Trade price
   * @return {Promise} Returns a promise that resolves to an object {status:Number,Timeout:object}
   */
CryptoBot.prototype.bittrexCreateSwingOrder = function(type,pair,amount,price){
	var timeout;
	return this.bittrexTrade(type,pair,amount,price,{"swing":true})
		.then((order)=>{
			if(!order){
				this.notify("Bittrex swing order error");
				timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				return {status:2,Timeout:timeout}
			}
			this.swingTrade = false;
			this.bittrexAccount();
			this.saveDB("swing",{},{extra:{"w":1,"upsert":true},method:"update",query:{"swing":1},modifier:{"$set":{"swing":1,"order":order,"filled":false}}});
			timeout = this.bittrexSwingOrder(order.uuid);
			return {status:2,Timeout:timeout}
		}).catch((e)=>{
			this.log(e);
			timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
			return {status:2,Timeout:timeout}
		});
}

/**
   * Buy/Sell Bittrex swing pair.
   * @method bittrexSwing
   * @return {Object} Returns a object {status:Number,Timeout:object} Status(0:"Inactive",1:"Trading",2:"Waiting",3:"Wallet Balance Low")
   */
CryptoBot.prototype.bittrexSwing = function(){
	if(!this.vibrate){
		return {status:0,Timeout:null}
	}
	var timeout;
	if(!this.swingTrade){
		return this.retrieveDB("swing").then((trades)=>{
			this.swingTrade = trades[0];
			this.swingTrade.swing = this.Settings.Swing.swing;
			this.broadcastMessage({"type":"swingOrder","order":this.swingTrade});
			return this.bittrexSwingSupervisor(this.swingTrade);
		}).catch((e)=>{
				this.log(e);
				timeout = setTimeout(this.bittrexSwing,this.swingRate);
				return {status:2,Timeout:timeout}
			});
	}
	else{
		return this.bittrexSwingSupervisor(this.swingTrade);
	}
			
}

/**
   * Monitor Bittrex swing order.
   * @method bittrexSwingOrder
   * @param {String} Bittrex swing order uuid
   * @return {Promise} Should resolve setTimeout id
   */
CryptoBot.prototype.bittrexSwingOrder = function(uuid){
	return new Promise((resolve,reject) => {	
		return this.bittrexAPI("account/getorder","&uuid="+uuid).then((order)=>{
			if(order){
				this.saveDB("swing",{},{extra:{"w":1},method:"update",query:{"swing":1},modifier:{"$set":{"swing":1,"order":order,"filled":!order.IsOpen}}});
				if(order.IsOpen !== true){
					this.notify("Order:"+uuid+" Filled");
					this.bittrexAccount();
					return resolve(setTimeout(()=>{this.bittrexSwing()},this.swingRate));
				}		
				return resolve(setTimeout(()=>{this.bittrexSwingOrder(uuid);},this.swingRate));		
			}
			else{
				this.log("Unable to find order:"+uuid);
				this.notify("Swing Error. Unable to find:"+uuid);
				return resolve(setTimeout(()=>{this.bittrexSwingOrder(uuid);},this.swingRate));
			}
		}).catch((e)=>{
			this.log(e);
			return resolve(setTimeout(()=>{this.bittrexSwingOrder(uuid);},this.swingRate));
		});	
	})
}	

/**
   * Supervise swing trade.
   * @method bittrexSwingSupervisor
   * @param {Object} Current swing order object
   * @return {Object} Returns a object {status:Number,Timeout:object} Status(0:"Inactive",1:"Trading",2:"Waiting",3:"Wallet Balance Low")
   */
CryptoBot.prototype.bittrexSwingSupervisor = function (trade){
	var timeout;
	if(trade){
		if(trade.filled !== true){
			timeout = this.bittrexSwingOrder(trade.order.OrderUuid);
			return {status:2,Timeout:timeout}
		}
		var newTrade = trade.order.Type === "LIMIT_SELL" ? "buy" : "sell";
		return this.bittrexDepthPure(this.Settings.Swing.pair).then((val)=>{
			if(newTrade === "buy"){
				var target =(1 - this.swingPercentage) * trade.order.Limit;
				this.log("Buying (Target/Price):",target+"/"+val.sell);
				this.broadcastMessage({"type":"swing","target":target,"price":val.sell,"trade":"bid"});
				if (val.sell < target){
					this.notify(this.Settings.Swing.pair+" Buying "+trade.order.Quantity+" @"+val.sell);
					timeout = this.bittrexCreateSwingOrder("buy",this.Settings.Swing.pair,trade.order.Quantity,val.sell);
					return {status:1,Timeout:timeout}
				}
				else{
					timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
					return {status:2,Timeout:timeout}
				}
			}
			else{
				var target = (1 + this.swingPercentage) * trade.order.Limit;
				this.log("Selling (Target/Price):",target+"/"+val.buy);
				this.broadcastMessage({"type":"swing","target":target,"price":val.buy,"trade":"ask"});
				if (val.buy > target){
					this.notify(this.Settings.Swing.pair+" Selling "+trade.order.Quantity+" @"+val.buy);
					timeout = this.bittrexCreateSwingOrder("sell",this.Settings.Swing.pair,trade.order.Quantity,val.buy);
					return {status:1,Timeout:timeout}
				}
				else{
					timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
					return {status:2,Timeout:timeout}
				}
			}
		}).catch((e)=>{
				this.log(e);
				timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				return {status:2,Timeout:timeout}
			});								
	}
	else{	
		if(this.balance.btc < this.Settings.Swing.amount){
			timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
			return {status:2,Timeout:timeout}
		}
		return this.bittrexDepthPure(this.Settings.Swing.pair).then((val)=>{
			var amount = (this.Settings.Swing.amount/val.sell).toFixed(8)
			timeout = this.bittrexCreateSwingOrder("buy",this.Settings.Swing.pair,amount,val.sell);
			return {status:1,Timeout:timeout}
		}).catch((e)=>{
				this.log(e);
				timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				return {status:2,Timeout:timeout}
			});
	}	
}

/**
   * Conduct Bittrex trade.
   * @method bittrexTrade
   * @param {String} Order type ie 'buy'/'sell'
   * @param {String} order pair
   * @param {Number} Order quantity
   * @param {Number} Order price
   * @param {Object} Options object ie {swing:true}(optional)
   * @return {Promise} Should resolve Bittrex order object
   */
CryptoBot.prototype.bittrexTrade = function(type,pair,quantity,rate,options){
	return new Promise((resolve,reject) => {	
		return this.bittrexAPI("market/"+type+"limit","&rate="+rate+"&market="+pair+"&quantity="+quantity).then((result)=>{
			this.log("Order:"+type+","+pair+" "+quantity+"@"+rate,result,new Date());
			if(result && result.uuid){
				if(this.bittrexProcessTime > 0){
					this.bittrexOrders.push(result.uuid);
					this.bittrexTradesMade++;
					var _set = {}
					_set["Orders."+result.uuid] = false;
					this.saveDB("trade",{},{extra:{"w":1,"upsert":true},method:"update",query:{"Time":this.bittrexProcessTime},modifier:{"$set":_set}});
				}
				this.bittrexAPI("account/getorder","&uuid="+result.uuid).then((order)=>{
					if(!options){
						this.saveDB("order",{"uuid":result.uuid,"order":order});
					}
				})	
				return resolve(result);	
			}
			else{
				this.log("Error Placing Order:",new Date());
				this.notify("Trade Error:"+type+"/"+pair+"/"+quantity+"/"+rate);
				return reject(new Error("Error Placing Order",new Date()))
			}
		}).catch((e)=>{
			this.log("Error Placing Order:",e,new Date());
			this.notify("Trade Error:"+type+"/"+pair+"/"+quantity+"/"+rate);
			return reject(e);
			
		});
	})
}

/**
   * Update Local order book.
   * @method bittrexUpdateMarket
   * @param {String} Currency pair ie 'BTC-LTC'
   * @param {Object} Bittrex update data
   * @param {Object} Local order book 
   * @return {Object} Updated local order book
   */
CryptoBot.prototype.bittrexUpdateMarket = function(pair,data,localMarket){
	var rate;
	for(var i = 0; i< data.Z.length;i++){
		rate = data.Z[i].R.toString();
		if(data.Z[i].TY === 0 || data.Z[i].TY === 2){
			localMarket[pair]["Bids"][rate] = data.Z[i].Q;
		}
		else{
			delete localMarket[pair]["Bids"][rate];
		}
	}
	for(var i = 0; i< data.S.length;i++){
		rate = data.S[i].R.toString();
		if(data.S[i].TY === 0 || data.S[i].TY === 2){
			localMarket[pair]["Asks"][rate] = data.S[i].Q;
		}
		else{
			delete localMarket[pair]["Asks"][rate];
		}
	}	
	return localMarket;
}

/**
   * Send message to all connected websocket clients.
   * @method broadcastMessage
   * @param {String} Message to send to clients 
   */
CryptoBot.prototype.broadcastMessage = function(data){
	try{
		if(!this.wss || !this.wss.clients){
			return;
		}
		return this.wss.clients.forEach((client)=> {
		    if (client.readyState === WebSocket.OPEN){
				try{
					var encrypted = typeof data === "string" ? crypto.AES.encrypt(data,this.Settings.Config.key).toString() : crypto.AES.encrypt(JSON.stringify(data),this.Settings.Config.key).toString();
					return client.send(encrypted);
				}
				catch(e){
					return this.log(e);
				}
			}
		});
	}
	catch(e){
		this.log(e);
		return e
	}
}	

/**
   * Connect to mongodb database.
   * @method database
   * @return {Object} Return database object
   */
CryptoBot.prototype.database = function(){
	var DB = {}
	if(this.Settings.MongoDB.connect){
		try{
			this.MongoClient.connect(this.Settings.MongoDB.db_string, (err, client)=>{
				var db = client.db(this.Settings.MongoDB.db_string.split("/")[this.Settings.MongoDB.db_string.split("/").length - 1]);
				if(err) { 
					this.log("Unable to connect to the database:",err); 
				}
				else{
					db.createCollection('bittrexBalance',{strict:true},(err,collection)=>{ 
						if(!err){
							db.collection('bittrexBalance').createIndex( { "Time": 1 }, { unique: true } )
						}
						return DB.balance = db.collection('bittrexBalance');
					});	
					db.createCollection('bittrexTrade',{strict:true},(err,collection)=>{ 
						if(!err){
							db.collection('bittrexTrade').createIndex( { "Time": 1 }, { unique: true } )
						}
						return DB.trade = db.collection('bittrexTrade');	
					});	
					db.createCollection('bittrexOrder',{strict:true},(err,collection)=>{ 
						if(!err){
							db.collection('bittrexOrder').createIndex( { "uuid": 1 }, { unique: true } )
						}
						return DB.order = db.collection('bittrexOrder');	
					});	
					db.createCollection('bittrexSwing',{strict:true},(err,collection)=>{ 
						if(!err){
							db.collection('bittrexSwing').createIndex( { "swing": 1 }, { unique: true } )
						}
						return DB.swing = db.collection('bittrexSwing');	
					});													
				}
			});			
		}
		catch(e){
			this.log("Database Error:",e);
		}	
	}
	else{
		this.log("Database Not Found");
	}
	return DB;
}

/**
   * Log messages.
   * @method log
   * @return {Boolean} Should return boolean
   */
CryptoBot.prototype.log = function(){
	if(this.logLevel === 0){
		return;
	}
	var args = [];
	for(var i=0;i < Object.keys(arguments).length;i++){
		if(typeof arguments[i.toString()] === "object"){
			args.push(JSON.stringify(arguments[i.toString()]));
		}
		else{
			args.push(arguments[i.toString()]);
		}
	}		
	if(this.logLevel === 1){
		console.log.apply(null,arguments);
	}
	else if(this.logLevel === 2){
		this.broadcastMessage({"type":"log","log":args.join('')});
	}
	else{
		console.log.apply(null,arguments);
		this.broadcastMessage({"type":"log","log":args.join('')});
	}
	return true;
}

/**
   * Chain functions with a delay of 2 seconds.
   * @method niceOrderChain
   * @param {Array} An array of promise functions and an object to modify with the results [[func1,func2,func3],ob]
   * @param {Object} An object to modify with the result of function calls
   * @return {Object} Return object with 'chain' Promise function; Finally resolves to the modified object
   */
CryptoBot.prototype.niceOrderChain = function(functions,obj){
	return{	
		chain:(array)=>{
			return new Promise((resolve,reject)=>{
				if(functions.length == 2){
					return functions[0].apply(this,array[0]).then((val)=>{
						obj[new Date().getTime()]= val;
						functions[1].call(this,obj);
						return resolve(obj);
					}).catch((e)=>{
						this.log(e);
						return reject(e);
						})
				}
				else{
					return functions[0].apply(this,array[0]).then((val)=>{
						functions.shift();
						array.shift();
						obj[new Date().getTime()] = val;
						return setTimeout(()=>{return resolve((this.niceOrderChain(functions,obj)).chain(array))},2000);
					}).catch((e)=>{
						this.log(e);
						return reject(e);
					})
					
				}
			});
		}
	}
}

/**
   * Send slack and/or email message.
   * @method notify
   * @param {String} Message to send
   */	
CryptoBot.prototype.notify = function(message){
	if(this.Settings.Email.use){
		try{ 
			this.sendEmail(message);
		}
		catch(e){
			this.log(e);
		}
	}
	if(this.Settings.Slack.use){
		try{
			this.slackMessage(message);
		}
		catch(e){
			this.log(e);
		}
	}
	return true;
}

/**
   * Retrieve information from mongodb.
   * @method retrieveDB
   * @param {String} Mongodb collection name
   * @param {Object} Options object ie 	{query:{}}	
   * @return {Promise} Should resolve with boolean
   */	
CryptoBot.prototype.retrieveDB = function(type,options){
	return new Promise((resolve,reject) => {
		try{
			if(!this.DB || !this.DB[type]){
				this.DB = this.database();
			}
			if(!options){
				return this.DB[type].find({}).toArray((err, items)=>{
					if(err){
						this.log(err);
						return resolve(err);
					}
					else{
						return resolve(items);
					}
				});	
			}
			else{
				return this.DB[type].find(options.query).toArray((err, items)=>{
					if(err){
						this.log(err);
						return resolve(err);
					}
					else{
						return resolve(items);
					}
				});					
			}								
		}
		catch(e){
			this.log(e);
			return resolve(e);
		}
	})
}	

/**
   * Save information to mongodb.
   * @method saveDB
   * @param {String} Mongodb collection name
   * @param {Object} Document to insert in collection
   * @param {Object} Options object ie 	{method:"update",extra:{"w":1,"upsert":true},query:{},modifier:{"$set":{}}}	
   * @return {Promise} Should resolve with boolean
   */						
CryptoBot.prototype.saveDB = function(type,doc,options){
	return new Promise((resolve,reject) =>{		
		try{
			if(!this.Settings.MongoDB.connect){
				this.log("MongoDB setting error");
				return reject(new Error("MongoDB setting error"));
			}
			if(!this.DB || !this.DB[type]){
				this.DB = this.database();
			}
			if(!options){
				return this.DB[type].insert(doc, {w:1},(err, result)=> {
					if(err){
						this.log("Error adding "+type+" to DB:",err);
						return resolve(err);
					}
					else{
						this.log(type+" added to DB:",new Date());
						return resolve(true);
					}
				});	
			}
			else{
				if(options.method ==="remove"){
					return this.DB[type][options.method](options.query,(err, result)=> {
						if(err){
							this.log("Error Removing "+type+" in DB:",err);
							return resolve(err);
						}
						else{
							this.log(type+" removed from DB");
							return resolve(true);
						}	
					})
				}
				return this.DB[type][options.method](options.query,options.modifier,options.extra,(err, result)=> {
					if(err){
						this.log("Error updating "+type+" in DB:",err);
						return resolve(err);
					}
					else{
						this.log(type+" updated in DB");
						return resolve(true);
					}
				});	
			}										
		}
		catch(e){
			this.log(e);
			return resolve(e);
		}
	})
}

/**
   * Send an email.
   * @method sendEmail
   * @param {String} Email message
   * @return {Promise} Should resolve with boolean
   */
CryptoBot.prototype.sendEmail = function(email_message){
	return new Promise((resolve,reject)=>{
		var message;
		var server;		
		server = this.email.server.connect({
		   user: this.Settings.Email.usr, 
		   password: this.Settings.Email.pwd, 
		   host: this.Settings.Email.host_smtp, 
		   tls: true,
		   port: 587
		}); 
		message	= {
			   text:email_message, 
			   from: this.Settings.Email.usr, 
			   to: this.Settings.Email.addr,
			   subject:"C4D",
			   attachment:[{data:"<html>"+email_message+"</html>",alternative:true,inline:true}]			   
		};		
		return server.send(message,(err, message)=>{
			var bool = err ? false: true;
			if(err){
				this.log("Error Sending Email:",err);
				bool = false;
			}
			return resolve(bool)
		});
	})
}

/**
   * Available Webserver commands.
   * @method serverCommand
   * @return {Boolean} returns a boolean || {Promise} returns a promise that resolves to a boolean
   */
CryptoBot.prototype.serverCommand = function(message,ws){
	try{
		message = JSON.parse(crypto.AES.decrypt(message,this.Settings.Config.key).toString(crypto.enc.Utf8));												
		if(message.command === "binance_balance"){
			this.binanceAccount();
		}					
		if(message.command === "binance_orders"){
			var check = [];
			return new Promise((resolve,reject)=>{
				this.Settings.Binance.pairs.forEach((i,v)=>{
					this.binanceOpenOrders(this.Settings.Binance.pairs[v].pair1.toUpperCase())
					.then(_orders=>{
						check = check.concat(_orders);
					})
					.then(()=>{
						this.binanceOpenOrders(this.Settings.Binance.pairs[v].pair2.toUpperCase())
						.then(_orders2=>{
							check = check.concat(_orders2);
						})
						.then(()=>{
							this.binanceOpenOrders(this.Settings.Binance.pairs[v].pair3.toUpperCase())
							.then(_orders3=>{
								check = check.concat(_orders3);
							})
							.then(()=>{					
								check.forEach((order)=>{
									ws.send(crypto.AES.encrypt(JSON.stringify({"type":'order',"exchange":"Binance","otype":order.side,"timestamp_created":order.time,"rate":order.price,"status":order.status,"pair":order.symbol,"filled":order.origQty - order.executedQty,"amount":order.origQty,"order_id":order.clientOrderId}),this.Settings.Config.key).toString());
									return resolve(true)
								});
							}).catch((e)=>{
								this.log(e);
								return reject(e);
							})
						})	
					})
					.catch((e)=>{
						this.log(e);
						return reject(e);
					})
				});
			})
		}	
		if(message.command === "binanceB1Minimum"){
			this.binanceB1Min[message.pair] = Number(message.min);
			this.log("Minimum Binance B1 Order:",message.pair,this.binanceB1Min[message.pair]);
		}	
		if(message.command === "binanceC1Minimum"){
			this.binanceC1Min[message.pair] = Number(message.min);
			this.log("Minimum Binance "+message.pair+" Order:",this.binanceC1Min[message.pair]);
		}	
		if(message.command === "binanceLimits"){
			var key = message.selection.split(".")
			this.binanceLimits[message.pair][key[0]][key[1]] =  message.value;
			this.log("Binance Limits ("+message.pair+") Order:",this.binanceLimits[message.pair]);
		}	
		if(message.command === "binanceOptimal"){
			this.binanceOptimalTrades[message.pair] =  message.bool
			this.log("Binance Optimal Trades ("+message.pair+") Order:",this.binanceOptimalTrades[message.pair]);
		}	
		if(message.command === "binanceMonitor"){
			this.binanceInProcess[message.pair] = message.bool;
			this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,time:this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
			this.log("Binance Monitor Status:",this.binanceInProcess);
		}	
		if(message.command === "bittrexMonitor"){
			this.bittrexInProcess = message.bool;
			this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});		
			this.log("Bittrex Monitor Status:",this.bittrexInProcess);								
		}											
		if(message.command === "bittrex_orders"){
			return new Promise((resolve,reject)=>{
				this.bittrexGetOrders().then((orders)=>{
					orders.forEach((order)=>{
						ws.send(crypto.AES.encrypt(JSON.stringify({"type":'order',"exchange":"Bittrex","otype":order.OrderType,"timestamp_created":order.Opened,"rate":order.Limit,"status":order.Closed,"pair":order.Exchange,"filled":order.QuantityRemaining,"amount":order.Quantity,"order_id":order.OrderUuid}),this.Settings.Config.key).toString());
					});
					return resolve(true);
				}).catch((e)=>{
					this.log(e);
					return resolve(false)
				});
			})
		}	
		if(message.command === "bittrex_db"){
			return new Promise((resolve,reject)=>{
				this.retrieveDB(message.db).then((que)=>{
					ws.send(crypto.AES.encrypt(JSON.stringify({"type":'db_'+message.db,"info":que}),this.Settings.Config.key).toString());	
					return resolve(true);													
				}).catch((e)=>{
					this.log(e);
					return resolve(false);
				});			
			})					
		}						
		if(message.command === "connect"){
			ws.send(crypto.AES.encrypt(JSON.stringify({"type":'balance',"balance":this.balance,"p1":this.p1,"p2":this.p2}),this.Settings.Config.key).toString());
			ws.send(crypto.AES.encrypt(JSON.stringify({"type":'config',"logLevel":this.logLevel,"swingPercentage":this.swingPercentage,"swingRate":this.swingRate,"sanity":this.saneTrades,"liquid":this.liquidTrades,"vibrate":this.vibrate,"upperLimit":this.upperLimit,"lowerLimit":this.lowerLimit,"status":this.bittrexInProcess,"time":this.bittrexProcessTime,"wsStatus":this.bittrexSocketStatus,"viewBook":this.viewBittrexBook}),this.Settings.Config.key).toString());
			ws.send(crypto.AES.encrypt(JSON.stringify({"type":'swingStatus',"amount":this.Settings.Swing.amount,"pair":this.Settings.Swing.pair,"order":this.swingTrade,"swing":this.Settings.Swing.swing,"on":this.Settings.Swing.swingTrade}),this.Settings.Config.key).toString());
			ws.send(crypto.AES.encrypt(JSON.stringify({"type":'configBinance',
				"balance":this.binanceBalance,
				"status":this.binanceInProcess,
				"time":this.binanceProcessTime,
				"ustream":this.binanceUserStreamStatus,
				"optimal":this.binanceOptimalTrades,
				"minB1":this.binanceB1Min,
				"minC1":this.binanceC1Min,
				"limits":this.binanceLimits,
				"liquid":this.liquidTradesBinance,
				"connections":this.binanceSocketConnections.length,
				"pairs":this.Settings.Binance.formatPairs}),this.Settings.Config.key).toString());
		}			
		if(message.command === "logs"){
			this.logLevel = Number(message.logLevel);
			this.log("LogLevel:",this.logLevel);
		}						
		if(message.command === "lowerLimit"){
			this.lowerLimit = message.limit;
			return this.log("Lower Limit:",this.lowerLimit);
		}																									
		if(message.command === "bittrex_balance"){
			return new Promise((resolve,reject)=>{return this.bittrexAccount(resolve(true)).catch(e=>{this.log(e);reject(false);});})
		}	
		if(message.command === "bittrex_book"){
			this.viewBittrexBook = message.bool;
			this.log("View Bittrex Book:",this.viewBittrexBook);
		}
		if(message.command === "binance_control"){
			this.binanceKill = !message.bool;
			if(this.binanceKill === true){
				for(var i = 0; i < this.binanceSocketConnections.length;i++){
					this.binanceSocketConnections[i].close();
				}
				for(var key in this.binanceInProcess){
					this.binanceInProcess[key] = "killed";
				} 
				this.binanceSocketConnections = [];
				this.broadcastMessage({type:"binanceStatus",connections:0,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
				this.log("Binance Socket Connections Closed:",this.binanceSocketConnections);									
			}
			else if(this.binanceKill === false){
				for(var key in this.binanceInProcess){
					this.binanceInProcess[key] = false;
				} 
				this.binanceSocketConnections = [];
				this.binanceMonitor(this.Settings.Binance.pairs);
				this.binanceListenUser();
				this.log("Starting Binance Socket Connections");
			}
		}
		if(message.command === "bittrex_control"){
			this.bittrexKill = !message.bool;
			if(this.bittrexKill && this.bittrexSocketConnection){
				this.bittrexSocketConnection.terminate();
				this.log("Bittrex Stream Closed:",new Date());
			}
			else if(!this.bittrexKill && !this.bittrexSocketStatus){
				this.log("Starting Bittrex Stream",new Date());
				return this.bittrexStream()
			}
		}						
		if(message.command === "liquidTrade"){
			this.liquidTrades = message.bool;
			this.log("liquidTrades:",this.liquidTrades);
		}	
		if(message.command === "liquidTradeBinance"){
			this.liquidTradesBinance[message.pair] = message.bool;
			this.log("liquidTradesBinance:",message.pair,this.liquidTradesBinance[message.pair]);
		}					
		if(message.command === "sanity"){
			this.saneTrades = message.bool;
			this.log("saneTrades:",this.saneTrades);
		}
		if(message.command === "swingPercentage"){
			this.swingPercentage = message.percentage/100;
			this.log("Swing Percentage:",this.swingPercentage);
		}												
		if(message.command === "swingPoll"){
			if(Number(message.rate)){this.swingRate = message.rate * 1000;}
			this.log("poll_rate:",this.swingRate/1000 +" seconds");
		}	
		if(message.command === "swingReset"){
			this.bittrexResetSwingOrder();
			this.log("swingTrading has been reset");
		}	
		if(message.command === "swingTrade"){
			if(message.bool === true && this.vibrate === false){
				this.bittrexSwing();
			}
			this.vibrate = message.bool;
			this.log("Swing Trade:",this.vibrate);
		}		
		if(message.command === "update_amount"){
			this.p1 = message.xxxAmount;
			this.p2 = message.btcAmount;
		}
		if(message.command === "upperLimit"){
			this.upperLimit = message.limit;
			this.log("Upper Limit:",this.upperLimit);
		}	
	}
	catch(e){
		this.log(e);
		return false
	}	
	return true;		
}


/**
   * Setup websocket server.
   * @method setupWebsocket
   * @return {Promise} Resolves when first websocket client connects
   */
CryptoBot.prototype.setupWebsocket = function(){
	this.wss = new WebSocket.Server({port:this.Settings.Config.port});
	return new Promise((resolve,reject) =>{			
		this.wss.on('connection',(ws)=>{
			this.log("Websocket connection created:",new Date());
			resolve(ws);
			ws.on('error',(e)=>{
				return this.log("WebSocket Error:",e,new Date());
			})
			ws.on('close',(e)=>{
				return this.log("WebSocket Closed:",e,new Date());
			})			
			ws.on('message',(message)=>{
				return this.serverCommand(message,ws);
			});				
		});	
	});				
}	

/**
   * Send Slack message.
   * @method slackeMessage
   * @param {String} Text to send to Slack channel
   * @return {Promise} Should resolve with req response
   */
CryptoBot.prototype.slackMessage = function(slack_message){
	return new Promise((resolve,reject)=>{
		var parameters;
		var message;
		var req;
		message = slack_message + " @"+this.Settings.Slack.usr;
		parameters = {};
		parameters.channel = this.Settings.Slack.channel;
		parameters.username = "Server_Message";
		parameters.attachments = [{
			"pretext":new Date().toString().split('GM')[0],
			"text":message,
			"actions": [{
                    "type": "button",
                    "name": "webview",
                    "text": "C4DC",
                    "url": "http://arbitrage.0trust.us",
                    "style": "primary",
            }]
		}];
		req = this.https.request(
		    {
				host:"hooks.slack.com",
				path: this.Settings.Slack.hook.replace("https://hooks.slack.com",""),
				method:"Post",
			},
			(response)=>{
		        var body = "";
		        response.on("data",(d)=>{
					body += d;
				});
		        response.on("end",()=>{
					var bool = body === "ok" ? true: false;
					return resolve(bool);

			    });
		        response.on('error',(e)=>{
					this.log("Slack Webhook Error:",e);
					return resolve(false);
				})
			}
	    );
	   req.write(JSON.stringify(parameters))
	   req.end();
	})
}		

/**
   * General utility functions.
   * @property utilities
   */
CryptoBot.prototype.utilities = {  
	/**
   * Sort an array.
   * @method BubbleSort
   * @param {Array} Unsorted arrray
   * @param {Number} ~Maximum value allowed in sorted array (optional)
   * @return {Array} Sorted array in decreasing order
   */ 
	BubbleSort: function (array,limitHigh){
		var temp;
		for(var j=0;j<array.length;j++){
			for(var i=0;i < array.length;i++){
				if(array[i+1] && Number(array[i]) < Number(array[i+1])){
					temp = array[i];
					array[i] = array[i+1];
					array[i+1] = temp;
				}
			}
		}
		if(limitHigh){
			var narray = [];
			array.forEach(function(v,i){
				if((Number(v) < limitHigh * 1.035) && (0.9907 * limitHigh < Number(v))){
					narray.push(v);
				}
			});
			array = narray;
		}
		return array
	},
	/**
   * Solve ideal arbitrage equation when ratio above 1.
   * @method solveOver
   * @param {Number} Qty precision allowed for pair 2
   * @param {Number} Qty precision allowed for pair 1
   * @param {Number} Price of asset A
   * @param {Number} Price of asset B
   * @param {Number} Price of asset C
   * @return {Number} Ideal number to start arbitrage
   */ 
	solveOver: function (min,prec,prec2,a,b,c) {
		 /* For reference
		  * var constant = (a*b)/c;
		  * var Inc = 1/Math.pow(10,prec);
		  * var suggested = Number(((Inc)/(constant - 1)).toFixed(prec));
		  * if(suggested < min){
		  *	suggested = suggested * Math.ceil(min/suggested);
		  *	suggested = Number((suggested * b/c).toFixed(prec2))*a ; 
		  *	suggested = Number((suggested- Inc).toFixed(prec));
		  * }
		  * return suggested;
		 */
		  var suggested = Number((((1/Math.pow(10,prec)))/(((a*b)/c) - 1)).toFixed(prec));
		  if(suggested < min){
		 	suggested = Number(((Number(((suggested * Math.ceil(min/suggested)) * b/c).toFixed(prec2))*a)- (1/Math.pow(10,prec))).toFixed(prec));
		  }
		 return suggested;
	},
	/**
   * Solve ideal arbitrage equation when ratio below 1.
   * @method solveUnder
   * @param {Number} Qty precision allowed for pair 1
   * @param {Number} Price of asset A
   * @param {Number} Price of asset B
   * @param {Number} Price of asset C
   * @return {Number} Ideal number to start arbitrage
   */ 
	solveUnder: function (prec,a,b,c) {
		/*For reference
		 *
		 * var constant = c/(b*a);
		 * var suggested = (945/Math.pow(10,prec+1))/(Math.pow(constant,2)-constant);
		 * suggested = Number((suggested/c).toFixed(prec));
		 * return suggested 
		* */
		return Number(((945/Math.pow(10,prec+1))/(Math.pow((c/(b*a)),2)-(c/(b*a)))/c).toFixed(prec));
	},
	/* Reference Code
	  int power(int expo){
	  int npow = 1;
	  for(int i =0;i < expo;i++){
	    npow *=10;
	  }
	  return npow;
	}
	double gP(float num,int prec){
	  double pre = power(prec);
	  return ((int)(num*pre))/pre;
	}
	double under(int prec,float a, float b,float c) { 
		return gP(((945.0/power(1.0+prec))/(((c/(b*a))*(c/(b*a)))-(c/(b*a)))/c),prec);
	}
	*/
	solveUnderWasm:UnderwasmInstance.exports.under,
	/*Reference Code
	  int power(int expo){
	  int npow = 1;
	  for(int i =0;i < expo;i++){
	    npow *=10;
	  }
	  return npow;
	}
	
	double gP(float num,int prec){
	  double pre = power(prec);
	  return (ceil(num*pre))/pre;
	}
	double over(float min,int prec,int prec2,float a, float b,float c) { 
	  float Inc = 1./power(prec);
	  double suggested = gP( Inc/(((a*b)/c)- 1.),prec);
		if(suggested < min){
		  return gP(((gP((suggested * ceil(min/suggested)) * (b/c),prec2)*a)- Inc),prec);
		}
		return suggested;
	} 
	 */
	solveOverWasm:OverwasmInstance.exports.over	
}	
/**
   * Update status of Bittrex socket connection.
   * @method updateBittrexSocketStatus
   * @param {Boolean} New Bittrex Socket Status
   *  @return {Boolean} Return new Bittrex socket status
   */
CryptoBot.prototype.updateBittrexSocketStatus = function(message,bool){
	this.log(message,new Date());
	this.bittrexSocketStatus = bool;
	this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
	return this.bittrexSocketStatus;
}

module.exports = {bot:CryptoBot}
