"use strict";

var crypto = require("crypto-js");
var signalR = require('signalr-client');
var cloudscraper = require('cloudscraper');
var WebSocket = require('ws');
var https = require('https');
/**
   * CryptoBot constructor.
   * @method CryptoBot
   * @parm {Object} A config.json file
   */
function CryptoBot(Settings){	
	this.email = require("emailjs");
	this.https = require('https');
	this.MongoClient = require('mongodb').MongoClient;
	this.balance = {}
	this.bittrexInProcess = false;
	this.bittrexProcessTime = 0;
	this.bittrexSocketConnection = Settings.Config ? Settings.Config.enabled : false;
	this.bittrexSocketStatus = false;
	this.rate = Settings.Config ? Settings.Config.polling : 60000;
	this.swingRate = Settings.Config ? Settings.Swing.rate : 60000;
	this.saneTrades = Settings.Config ? Settings.Config.saneTrades : true;
	this.Settings = Settings;
	this.liquidTrades = Settings.Config ? Settings.Config.liquidTrades : true;
	this.vibrate = Settings.Config ? Settings.Swing.swingTrade : false;
	this.viewBittrexBook = Settings.Config.viewBook;
	this.lowerLimit = Settings.Config ? Settings.Config.lowerLimit : 89;
	this.upperLimit = Settings.Config ? Settings.Config.upperLimit : 101.79;
	this.swingPercentage = Settings.Config ? Settings.Swing.swing : 0.02;
	this.logLevel = Settings.Config.logs;
	this.p1 = Settings.Config.percentage1;
	this.p2 = Settings.Config.percentage2;
	//Binance Settings
	this.binanceApiKey = Settings.Binance.apikey;
	this.binanceApiSecret = Settings.Binance.secretkey;
	this.binanceMarket = 'wss://stream.binance.com:9443/ws/xxx@depth';
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

/**
   * Get Binance Account Balance.
   * @method binanceAccount
   * @return {Promise} Should resolve with binanceBalance object
	**/
CryptoBot.prototype.binanceAccount = function(){
	return new Promise((resolve,reject) => {	
		var date = new Date().getTime();
		var hash = crypto.SHA256(this.binanceApiSecret+"|timestamp="+date);
	    const req = this.https.request({
				host: "www.binance.com",
				path: '/api/v1/account?timestamp='+date+"&signature="+hash,
				method:"GET",
				headers:{
					"X-MBX-APIKEY":this.binanceApiKey,
				}
			},
			(response)=> {
	        var body = '';
	        response.on('data',(d)=> {
	            body += d;
	        });
	        response.on('end',()=> {
				var parsed;
				try{
					parsed = JSON.parse(body);
					for(var i=0;i<parsed.balances.length;i++){
						this.binanceBalance[parsed.balances[i].asset.toLowerCase()] = Number(parsed.balances[i].free) > 0 ? Number(parsed.balances[i].free) : 0;
					}
					this.broadcastMessage({type:"balanceBinance",balance:this.binanceBalance});
					return resolve(this.binanceBalance);
				}
				catch(e){
					this.log("Error Getting Binance Balance:",e);
					return reject(e);
				}		
	        });
	    }).on('error',(e)=>{
			return reject(e);
		})
	    req.write("");
	    req.end();
	});		
}

/**
   * Perform Binance Arbitrage.
   * @method binanceArbitrage
   * @param {String} Base currency pair
   * @param {Array} Currency pair array ie ['ltcbtc','btcusdt','ltcusdt']
   * @param {Obect} E1 pair object
   * @param {Obect} B1 pair object
   * @param {Obect} U1 pair object
   * @return {Boolean} Return boolean
   */
CryptoBot.prototype.binanceArbitrage = function(base,pairs,e1,b1,u1,index,messageData){	
	this.binanceGenerateStrategy(base,index,messageData)
	var percentage = (this.binanceStrategy[base].one.a * this.binanceStrategy[base].one.b/this.binanceStrategy[base].one.c)*100;	
	if(!Number(percentage)){return false;}
	var _orders = {}
	var message = "Binance Bot: ";
	var percentage;
	var Transform_B1;
	var Transform_E1;
	var Transactions = {}
	if(percentage > 100){
		percentage = (this.binanceStrategy[base].two.a * this.binanceStrategy[base].two.b/this.binanceStrategy[base].two.c)*100;
		this.broadcastMessage({"type":"binancePercent","percentage":percentage,"info":this.binanceStrategy});
		if(percentage < this.binanceLimits[base].over.lowerLimit || percentage > this.binanceLimits[base].over.upperLimit){return false}
		Transform_B1 = this.utilities.solveOver(this.binanceB1Min[base],this.binancePrec[base][4],this.binancePrec[base][3],this.binanceStrategy[base].two.a,this.binanceStrategy[base].two.b,this.binanceStrategy[base].two.c);
		Transactions[b1[base]] = Transform_B1;
		Transactions[u1[base]] = (Transactions[b1[base]] * this.binanceStrategy[base].two.b)
		Transactions[e1[base]] = Number((Transactions[u1[base]]/this.binanceStrategy[base].two.c).toFixed(this.binancePrec[base][5]));
		message += this.binanceArbitrageMessageFormat(Transactions,b1[base],u1[base],this.binanceStrategy[base].two.b,e1[base],this.binanceStrategy[base].two.c,this.binancePrec[base][3],this.binanceStrategy[base].two.a,this.binancePrec[base][0],percentage);
		if( Number((Number(Transactions[e1[base]].toFixed(this.binancePrec[base][3]))*this.binanceStrategy[base].two.a).toFixed(this.binancePrec[base][0])) >= Transform_B1 && (Number(Transactions[e1[base]].toFixed(this.binancePrec[base][3])) <= Transactions[e1[base]])){
			this.log(message);
			if(!this.binanceCheckConditions(Transactions,percentage,base,e1[base],b1[base],u1[base],this.binanceStrategy[base].two.c,this.binanceStrategy[base].two.c,this.binanceStrategy[base].two.a_amount,this.binanceStrategy[base].two.b_amount)){
				return false;
			}
			this.binanceBeginArbitrage(base,percentage,message,Transactions,e1,b1,u1,[
				this.binanceTrade(pairs[1].toUpperCase(),"SELL",Transactions[b1[base]],this.binanceStrategy[base].two.b,"GTC"),
				this.binanceTrade(pairs[2].toUpperCase(),"BUY",Transactions[e1[base]],this.binanceStrategy[base].two.c,"GTC"),
				this.binanceTrade(pairs[0].toUpperCase(),"SELL",Number(Transactions[e1[base]].toFixed(this.binancePrec[base][3])),this.binanceStrategy[base].two.a,"GTC")
			])
		}
		else{
			this.log("Sub-Optimal Trade:",message);
			return false;
		}
	}
	else{
		this.broadcastMessage({"type":"binancePercent","percentage":percentage,"info":this.binanceStrategy});		
		if(percentage < this.binanceLimits[base].under.lowerLimit || percentage > this.binanceLimits[base].under.upperLimit){return false}			
		Transform_E1 = this.utilities.solveUnder(this.binancePrec[base][3],this.binanceStrategy[base].one.a,this.binanceStrategy[base].one.b,this.binanceStrategy[base].one.c);
		Transactions[e1[base]] = Transform_E1;					
		Transactions[u1[base]] = this.binanceStrategy[base].one.c * Transactions[e1[base]];
		Transactions[b1[base]] = Number((Transactions[u1[base]]/this.binanceStrategy[base].one.b).toFixed(this.binancePrec[base][4]))			
		message += this.binanceArbitrageMessageFormat(Transactions,e1[base],u1[base],this.binanceStrategy[base].one.c,b1[base],this.binanceStrategy[base].one.b,Transform_E1,this.binanceStrategy[base].one.a,this.binancePrec[base][3],percentage);	
		if((Transactions[b1[base]] >= (Number((Transactions[b1[base]]/this.binanceStrategy[base].one.a).toFixed(this.binancePrec[base][3])) * this.binanceStrategy[base].one.a)) && (Number((Transactions[b1[base]]/this.binanceStrategy[base].one.a).toFixed(this.binancePrec[base][3])) >= Transactions[e1[base]])){
			this.log(message);
			if(!this.binanceCheckConditions(Transactions,percentage,base,e1[base],b1[base],u1[base],this.binanceStrategy[base].one.b,this.binanceStrategy[base].one.c,this.binanceStrategy[base].one.a_amount,this.binanceStrategy[base].one.b_amount)){
				return false;
			}
			this.binanceBeginArbitrage(base,percentage,message,Transactions,e1,b1,u1,[
					this.binanceTrade(pairs[2].toUpperCase(),"SELL",Transactions[e1[base]],this.binanceStrategy[base].one.c,"GTC"),
					this.binanceTrade(pairs[1].toUpperCase(),"BUY",Transactions[b1[base]],this.binanceStrategy[base].one.b,"GTC"),
					this.binanceTrade(pairs[0].toUpperCase(),"BUY",(Transactions[b1[base]]/this.binanceStrategy[base].one.a).toFixed(this.binancePrec[base][3]),this.binanceStrategy[base].one.a,"GTC")
			])
		}
		else{
			this.log("Sub-Optimal Trade:",message);
			return false;
		}
	}
	return true;
}


/**
   * Format message sent to the user
   * @method binanceArbitrageMessageFormat
   * @param {Object} Transactions object
   * @param {String} a currency ie 'ltc'
   * @param {String} b currency ie 'usdt'
   * @param {Number} a/b currency rate 
   * @param {String} d currency ie 'btc'
   * @param {Number} e d/b currency rate
   * @param {Number} f Transactions[a] / Price precision of 'a' currency
   * @param {Number} g a/d currency rate
   * @param {Number} h Price precision of 'a' currency / Price precision of 'd' currency
   * @param {Number} Percentage
   * @return {String} Return formatted message
   */
CryptoBot.prototype.binanceArbitrageMessageFormat = function(Transactions,a,b,c,d,e,f,g,h,percentage){	
	var message = percentage.toFixed(3)+"% "+new Date().toString().split('GMT')[0]+"\n"+ Transactions[a] + a+" => "+Transactions[b]+" "+b+" @" + c + '\n' + (Transactions[d] * e) + b+" => " + Transactions[d] + " "+d+" @"+e +'\n'
	message += percentage < 100 ? (f * g).toFixed(8) + d+" => " + (Transactions[d]/g).toFixed(h) + " "+a+" @"+g +'\n' : Transactions[d].toFixed(f) + d+" => " + (Number(Transactions[d].toFixed(f))*g).toFixed(h) + " "+a+" @"+g +'\n';	
	return message;
}

/**
   * Start Binance arbitrage trades.
   * @method binanceBeginArbitrage
   * @param {String} Base pair ie 'ltcbtc'
   * @param {Number} Binance percentage
   * @param {Object} Transactions object
   * @param {String} Message to send to user
   * @param {Object} E1 object
   * @param {Object} B1 object
   * @param {Object} U1 object
   * @param {Array} An array with 3 Binance trade promises 
   * @return {Promise} Should resolve to a boolean
   */
CryptoBot.prototype.binanceBeginArbitrage = function(base,percentage,message,Transactions,e1,b1,u1,promiseArray){
	this.binanceInProcess[base] = true;
	this.binanceProcessTime[base] = new Date().getTime();
	this.binanceTradesMade[base] = 0;
	this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
	this.notify(message);
	return Promise.all(promiseArray).then((values)=>{
			return this.binanceSaveOrders(values,base,percentage,Transactions,e1,b1,u1);
	}).catch((e)=>{
		this.binanceReset(base);
		this.log("Error:",e,new Date());
		this.notify(e.toString());
		return false;
	});
}

/**
   * Cancel a Binance order.
   * @method binanceCancelOrder
   * @return {Promise} Should resolves with req response
   */
CryptoBot.prototype.binanceCancelOrder = function(pair,id){	
	return new Promise((resolve,reject) => {	
		var date = new Date().getTime();
		var hash = crypto.SHA256(this.binanceApiSecret+"|symbol="+pair+"&orderId="+id+"&timestamp="+date+"&recvWindow="+5000);
	    const req = this.https.request({
				host: "www.binance.com",
				path: '/api/v1/order?symbol='+pair+"&orderId="+id+"&timestamp="+date+"&recvWindow="+5000+"&signature="+hash,
				method:"DELETE",
				headers:{
					"X-MBX-APIKEY":this.binanceApiKey,
				}
			},
			(response)=> {
	        var body = '';
	        response.on('data',function(d){
	            body += d;
	        });
	        response.on('end',()=>{
				var parsed;
				try{
					parsed = JSON.parse(body);
					if(parsed.length < 1){
						return resolve([]);
					}
				}
				catch(e){
					this.log("Error:",e);
					return reject(e);
				}		
	            return resolve(parsed);
	        });
	    }).on('error',(e)=>{
			return reject(e);
		});
	    req.write("");
	    req.end();
	});			
}


/**
   * Check Binance arbirage conditions
   * @method binanceCheckConditions
   * @param {Object} Transactions object
   * @param {Number} Percentage 
   * @param {String} Base currency ie 'ltc'
   * @param {String} Currency ie 'ltc'
   * @param {String} Currency ie 'btc'
   * @param {String} Currency ie 'usdt'
   * @param {Number} (b1/u1 || e1/ul) currency rate
   * @param {Number} e1/u1 currency Rate 
   * @param {Number} Amount of currency e1 the order book
   * @param {Number} Amount of currency b1 the order book
   * @return {Boolean} Return boolean
   */
CryptoBot.prototype.binanceCheckConditions = function(Transactions,percentage,base,e1,b1,u1,b,c,amount1,amount2){	
	if(Number(this.binanceBalance[e1]) < Transactions[e1] || Number(this.binanceBalance[b1]) < Transactions[b1] || Number(this.binanceBalance[u1]) < Transactions[u1]){
		this.log("Wallet Balance Low:",new Date());
		return false
	}
	if(this.liquidTradesBinance[base] && (Transactions[e1] > amount1 || Transactions[b1] > amount2)){
		this.log("Illiquid trade");
		return false;
	}
	if((Transactions[e1] * c) < this.binanceU1Min[base]){
		this.log("Minimum "+u1+ " order not satisfied",new Date());
		return false;
	}		
	if (percentage < 100 && Transactions[b1] < this.binanceB1Min[base]){
		this.log("Minimum "+b1+ " order not satisfied",new Date());
		return false;
	}	
	if(percentage < 100 && ((Transactions[u1] - (Transactions[b1] * b)) < 0) && this.binanceOptimalTrades[base]){
		this.log("Optimal Trade Not Found:",new Date());
		return false
	}	
	if(percentage > 100 && (Transactions[u1] - (Transactions[e1] * c)) < 0 && this.binanceOptimalTrades[base]){
		this.log("Optimal Trade Not Found:",new Date());
		return false;
	}		
	return true;

}


/**
   * Check if Binance arbitrage was completed in time.
   * @method binanceCheckTrade
   * @return {Boolean} Return a boolean
   */
CryptoBot.prototype.binanceCheckTrade = function(base,orders){
	this.log("Checking:",Object.keys(orders),new Date());
	if((new Date().getTime() - this.binanceProcessTime[base]) > 480000 && this.binanceInProcess[base] === true) {
			this.log("Binance Arbitrage timeout.....",new Date());
			this.binanceReset(base);
			return false;
		}
	return true
}		

/**
   * Get Binance Exchange information.
   * @method binanceExchangeInfo
   * @return {Promise} Should resolve with req response
   */
CryptoBot.prototype.binanceExchangeInfo = function(){
	return new Promise((resolve,reject) => {	
		const req = this.https.request({
			host: "www.binance.com",
			path: "/api/v1/exchangeInfo",
			method: "GET"
			},
			(response)=> {
	        var body = '';
	        response.on('data',(d)=> {body += d;});
	        response.on('end',()=> {
				var parsed;
				try{
					parsed = JSON.parse(body);
				}
				catch(e){
					this.log("Exchange Info Error:",e,new Date());
					return reject(e);
				}		
	            return resolve(parsed);
	        });
	    }).on('error',(e)=>{
			return reject(e);
		});
	    req.write("");
	    req.end();
	});
}   

/**
   * Formulate Binance Bid/Sell Prices for a base currency pair.
   * @method binanceGenerateStrategy
   * @param {String} Base currency pair
   * @param {String} Index of current currency pair
   * @param {String} Binance message data
   */
CryptoBot.prototype.binanceGenerateStrategy = function(base,index,message){
	if(index === 0){
		this.binanceStrategy[base]['one']['a'] = Number((Number(message.a[0][0])).toFixed(this.binancePrec[base][0]));
		this.binanceStrategy[base]['one']['a_amount'] = Number(message.a[0][1]);
		this.binanceStrategy[base]['two']['a'] = Number((Number(message.b[0][0])).toFixed(this.binancePrec[base][0]));
		this.binanceStrategy[base]['two']['a_amount'] = Number(message.b[0][1]);
	}
	if(index === 1){
		this.binanceStrategy[base]['one']['b'] =  Number((Number(message.a[0][0])).toFixed(this.binancePrec[base][1]));
		this.binanceStrategy[base]['one']['b_amount'] = Number(message.a[0][1]);
		this.binanceStrategy[base]['two']['b'] = Number((Number(message.b[0][0])).toFixed(this.binancePrec[base][1]));					
		this.binanceStrategy[base]['two']['b_amount'] = Number(message.b[0][1]);
	}
	if(index === 2){
		this.binanceStrategy[base]['one']['c'] =  Number((Number(message.b[0][0])).toFixed(this.binancePrec[base][2]));
		this.binanceStrategy[base]['one']['c_amount'] =  Number(message.b[0][1]);
		this.binanceStrategy[base]['two']['c']  = Number((Number(message.a[0][0])).toFixed(this.binancePrec[base][2]));
		this.binanceStrategy[base]['two']['c_amount'] = Number(message.a[0][1]);
	}
}

/**
   * Send heartbeat to keep Binance user stream alive.
   * @method binanceListenBeat
   * @param {String} Binance listen key
   * @return {Promise} Should resolve with req response
   */
CryptoBot.prototype.binanceListenBeat = function(listenkey){
	return new Promise((resolve,reject) => {	
	    const req = this.https.request({
			host: "www.binance.com",
			path: "/api/v1/userDataStream?listenKey="+listenkey,
			method: "PUT",
			headers:{
				"X-MBX-APIKEY":this.binanceApiKey,
			}},
			(response)=> {
	        var body = '';
	        response.on('data',(d)=> {body += d;});
	        response.on('end',()=> {
				if(body != "{}"){
					return reject(body)
				}
				return resolve(body)
	        });
	    }).on('error',(e)=>{
			return reject(e);
		});
	    req.write("");
	    req.end();
	});			
}

/**
   * Get Binance listen key.
   * @method binanceListenKey
   * @return {Promise} Should resolve with binance listen key
   */
CryptoBot.prototype.binanceListenKey = function(){
	return new Promise((resolve,reject) => {	
	    const req = this.https.request({
				host: "www.binance.com",
				path: "/api/v1/userDataStream",
				method: "POST",
				headers:{
					"X-MBX-APIKEY":this.binanceApiKey,
				}
			},
			(response)=> {
	        var body = '';
	        response.on('data',(d)=> {
				body += d;
			});
	        response.on('end',()=> {
				var parsed;
				try{
					parsed = JSON.parse(body);
					if(!parsed.listenKey){
						return reject(new Error("Error Getting Binance Listen Key"));
					}
					else{
						return resolve(parsed.listenKey);
					}
				}
				catch(e){
					this.log("Error:",e);
					return reject(e);
				}		
	        });
	    }).on('error',(e)=>{
			this.log(e);
			return reject(e);
		});
	    req.write("");
	    req.end();
	});			
}

/**
   * Listen to Binance user account.
   * @method binanceListenUser
   * @return {Promise} Should resolve with websocket client
   */
CryptoBot.prototype.binanceListenUser = function(){
	return new Promise((resolve,reject) => {	
		this.binanceListenKey()
		.then((key)=>{
			setInterval(()=>{return this.binanceListenBeat(key).catch((e)=>{this.log(e);});},120000);
			return resolve(this.binanceUserStream(key));
		}).catch((e)=>{
			this.log(e);
			return reject(e);
		});
	})
}

/**
   * Stream all configured Binance currency pairs market depth.
   * @method binanceMonitor
   * @param {Array} Array of pair data information
   * @return {Array} An array of websocket clients
   */
CryptoBot.prototype.binanceMonitor = function(pairData){
	var _list = [];
	for(var i=0;i< pairData.length;i++){
		_list.push(this.binanceStream(pairData[i].pair1,pairData[i].pair1));
		_list.push(this.binanceStream(pairData[i].pair1,pairData[i].pair2));
		_list.push(this.binanceStream(pairData[i].pair1,pairData[i].pair3));
	}	
	this.binanceSocketConnections = _list;
	return _list;
}


/**
   * Get Binance open orders for a currency pair.
   * @method binanceOpenOrders
   * @param {String} Binance currency pair
   * @return {Promise} Should resolve with Binance exchange data 
   */
CryptoBot.prototype.binanceOpenOrders = function(pair){	
	return new Promise((resolve,reject) => {	
		var date = new Date().getTime();
		var hash = crypto.SHA256(this.binanceApiSecret+"|symbol="+pair+"&timestamp="+date+"&recvWindow="+5000);
	    const req = this.https.request({
				host: "www.binance.com",
				path: '/api/v1/openOrders?symbol='+pair+"&timestamp="+date+"&recvWindow="+5000+"&signature="+hash,
				method:"GET",
				headers:{
					"X-MBX-APIKEY":this.binanceApiKey,
				}
			},
			(response)=> {
	        var body = '';
	        response.on('data',function(d){
	            body += d;
	        });
	        response.on('end',()=>{
				var parsed;
				try{
					parsed = JSON.parse(body);
					if(parsed.length < 1){
						return resolve([]);
					}
					else{
						resolve(parsed);
					}
				}
				catch(e){
					this.log("Error:",e);
					return reject(e);
				}		
	            return resolve(parsed);
	        });
	    }).on('error',(e)=>{
			return reject(e);
		});
	    req.write("");
	    req.end();
	});			
}

/**
   * Parse a Binance user event.
   * @method binanceParseUserEvent
   * @return {Promise} Should resolve with Binance exchange data
	**/
CryptoBot.prototype.binanceParseUserEvent = function(message,pairs){
	if (message.type === 'message') {
		var base;
		var data;
		try{
			data = JSON.parse(message.data);
			if(data.e == "executionReport"){
				if(data.x == "NEW"){
					for(key in pairs){
						if(pairs[key].indexOf(data.s.toLowerCase()) > -1){
							base = key;
							break;
						}
					}
					if(this.binanceOrders[base] && this.binanceInProcess[base]){
						var _key= "Orders."+data.c;
						var _set = {}
						_set[_key] = false;
						this.saveDB("trade",{},{extra:{"w":1,"upsert":true},method:"update",query:{"Time":this.binanceProcessTime[base]},modifier:{"$set":_set}});
						this.binanceOrders[base].push(data.c);
						this.binanceTradesMade[base]++;
						var order = {type:"order","exchange":"Binance","otype":data.S,"order_id":data.c,"amount":data.q,"pair":data.s,"status":data.x,"rate":data.p,"timestamp_created":data.E}
						this.broadcastMessage(order);
						this.log("Binance Order Added:",data.c,new Date());
					}
				}
				if(data.x == "CANCELED" || data.X === "FILLED"){
					for(key in pairs){
						if(pairs[key].indexOf(data.s.toLowerCase()) > -1){
							base = key;
							break;
						}
					}
					if(this.binanceOrders[base]){
						var key= "Orders."+data.c;
						var update = {key:true}
						var lookupOrder = {}
						var _set = {}
						lookupOrder[key] = false;
						_set[key] = true;
						_set['Filled'] = new Date().getTime();
						this.saveDB("trade",{},{extra:{"w":1},method:"update",query:lookupOrder,modifier:{"$set":_set,"$inc":{"OrdersFilled":1}}});
						if(this.binanceOrders[base].indexOf(data.c) > -1){
							if(this.binanceOrders[base][0] === data.c){
								this.binanceOrders[base].shift();
							}
							else if(this.binanceOrders[base][this.binanceOrders[base].length - 1] === data.c){
								this.binanceOrders[base].pop();
							}
							else{
								this.binanceOrders[base] = [this.binanceOrders[base][0],this.binanceOrders[base][2]];
							}
						}
						this.log("Binance Order Removed:",data.c,new Date().toString()+":"+this.binanceOrders[base].length+"/"+this.binanceTradesMade[base]);
						this.broadcastMessage({type:"orderRemove",order_id:data.c});
						if(this.binanceOrders[base].length === 0 && this.binanceTradesMade[base] === 3){
							this.binanceStrategy[base] = {one:{},two:{}}
							this.binanceTradesMade[base] = false;
							this.binanceInProcess[base] = false;	
							this.binanceProcessTime[base] = 0;	
							this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
						}
					} 
				}
			}
			else if(data.e === "outboundAccountInfo"){
				for(var i=0;i<data.B.length;i++){
					this.binanceBalance[data.B[i].a.toLowerCase()] = Number(data.B[i].f) > 0 ? Number(data.B[i].f) : 0;
				}
				this.broadcastMessage({type:"balanceBinance",balance:this.binanceBalance});
			}
			return true;									
		}
		catch(e){
			this.log("Error parsing user event:",e,new Date());
			return false;
		}
	}
}

/**
   * Get Binance precision.
   * @method binancePrecision
   * @return {Promise} Should resolve with Binance exchange data
	**/
CryptoBot.prototype.binancePrecision = function(pairData){
	return new Promise((resolve,reject)=>{
		var allPairs = [];
		for(var i= 0;i < pairData.length;i++){
			allPairs.push(pairData[i].pair1.toUpperCase())
			allPairs.push(pairData[i].pair2.toUpperCase())
			allPairs.push(pairData[i].pair3.toUpperCase())
		} 
		this.binanceExchangeInfo().then((info)=>{
			var exchangeData = {}
			var index;
			var filter;
			function getPrec(textNumber){
				var number = textNumber.split("1")[0].length - 1;
				return number;
			}
			for(var i = 0;i <info.symbols.length;i++){
				if(allPairs.indexOf(info.symbols[i].symbol) > -1 ){
					index = info.symbols[i].symbol;
					filter = info.symbols[i];
					exchangeData[index] = [getPrec(filter.filters[0].minPrice),getPrec(filter.filters[1].minQty),Number(filter.filters[2].minNotional)]			
				}
			}		
			return resolve(exchangeData); 
		}).catch((e)=>{
			this.log(e);
			return reject(false)
		});
	})
}

/**
   * Format Binance pairs precision.
   * @method binanceFormatPairs
   * @param {Object} Object with Binance exchange data
	**/
CryptoBot.prototype.binanceFormatPairs = function(exchangeData){
	for(var i= 0;i < this.Settings.Binance.pairs.length;i++){
		var prec = [0,0,0,0,0,0];
		var minb1;
		var minc1;
		var minu1;
		prec[0] = exchangeData[this.Settings.Binance.pairs[i].pair1.toUpperCase()][0]
		prec[3] = exchangeData[this.Settings.Binance.pairs[i].pair1.toUpperCase()][1]
		minb1 = exchangeData[this.Settings.Binance.pairs[i].pair1.toUpperCase()][2]
		prec[1] = exchangeData[this.Settings.Binance.pairs[i].pair2.toUpperCase()][0]
		prec[4] = exchangeData[this.Settings.Binance.pairs[i].pair2.toUpperCase()][1]
		prec[2] = exchangeData[this.Settings.Binance.pairs[i].pair3.toUpperCase()][0]
		prec[5] = exchangeData[this.Settings.Binance.pairs[i].pair3.toUpperCase()][1]
		minu1 = exchangeData[this.Settings.Binance.pairs[i].pair3.toUpperCase()][2]
		minc1 = minu1 * minb1;
		this.Settings.Binance.pairs[i].prec = prec;
		this.Settings.Binance.pairs[i].minimumB1 = minb1;
		this.Settings.Binance.pairs[i].minimumC1 = minc1;
		this.Settings.Binance.pairs[i].minimumU1 = minu1;
	}
	return;
}
/**
   * Reset Binance Currency Pair arbitrage fields.
   * @method binanceReset
   * @param {String} Base Binance currency pair
   * @return {Boolean} Return true
   */
CryptoBot.prototype.binanceReset = function(base){
	this.binanceInProcess[base] = false;
	this.binanceOrders[base] = [];
	this.binanceProcessTime[base] = 0;
	this.binanceStrategy[base] = {one:{},two:{}}		
	this.binanceTradesMade[base] = 0;
	this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});	
	return true;							
}

/**
   * Save Binance Orders.
   * @method binanceSaveOrders
   * @param {Array} An array of Binance Orders
   * @param {String} Base pair ie 'ltcbtc'
   * @param {Number} Percentage
   * @param {Object} Transactions object
   * @param {Object} E1 object
   * @param {Object} B1 object
   * @param {Object} U1 object
   * @return {Object} Return setTimeout object
   */
CryptoBot.prototype.binanceSaveOrders = function(values,base,percentage,Transactions,e1,b1,u1){
	var _orders = {}
	var profit1;
	var profit2;
	var profit3;
	_orders[values[0].clientOrderId] = false;
	_orders[values[1].clientOrderId] = false;
	_orders[values[2].clientOrderId] = false;
	if(percentage > 100){
		profit1 = Number((Number(Transactions[e1[base]].toFixed(this.binancePrec[base][3]))*this.binanceStrategy[base].two.a).toFixed(this.binancePrec[base][4])) - Transactions[b1[base]];
		profit2 = Transactions[e1[base]] - Number(Transactions[e1[base]].toFixed(this.binancePrec[base][3]));
		profit3 = Transactions[u1[base]] - (Transactions[e1[base]] * this.binanceStrategy[base].two.c);
	}
	else{
		profit1 = Transactions[b1[base]] - (Transactions[e1[base]] * this.binanceStrategy[base].one.a); 
		profit2 = Number((Transactions[b1[base]]/this.binanceStrategy[base].one.a).toFixed(this.binancePrec[base][3])) - Transactions[e1[base]];
		profit3 = Transactions[u1[base]] - (Transactions[b1[base]] * this.binanceStrategy[base].one.b);
	}
	this.saveDB("trade",{},{extra:{"w":1,"upsert":true},method:"update",query:{"Time":this.binanceProcessTime[base]},modifier:{"$set":{"Time":this.binanceProcessTime[base],"Percent":percentage,"Exchange":"Binance","Profit":profit1,"Profit2":profit2,"Profit3":profit3,"Pair":base}}});
	return setTimeout(()=>{this.binanceCheckTrade(base,_orders)},480005)
}

/**
   * Websocket stream Binance currency pair market depth.
   * @method binanceStream
   * @param {String} Base Binance currency pair
   * @param {String} Binance currency pair
   * @return {Object} Websocket client
   */
CryptoBot.prototype.binanceStream = function(base,pair){
	var client;
	try{
		client = new WebSocket(this.binanceMarket.replace("xxx",pair));
	}
	catch(e){
		this.log(e,new Date());
		return client;
	}
	var e1 = {}
	var b1 = {}
	var u1 = {}
	var pairs;
	for(var i=0;i< this.Settings.Binance.pairs.length;i++){
		if(this.Settings.Binance.pairs[i].pair1 === base){
			e1[base] = this.Settings.Binance.formatPairs[i].pair1.split("_")[0];
			b1[base] = this.Settings.Binance.formatPairs[i].pair1.split("_")[1];
			u1[base] = this.Settings.Binance.formatPairs[i].pair2.split("_")[1];
			pairs = [this.Settings.Binance.pairs[i].pair1,this.Settings.Binance.pairs[i].pair2,this.Settings.Binance.pairs[i].pair3];
			break;
		}
	}	
	client.onclose = ()=> {
	    this.log(pair+'- Binance Connection Closed:',new Date());
	        return setTimeout(()=>{
				if(!this.binanceKill){
					client = this.binanceStream(base,pair);
				}
			},1000);
	}
	
	client.onopen = ()=> {
	    this.log(pair+' - Binance WebSocket Client Connected:',new Date());
	};
	client.onmessage = (message) => {
		if(this.binanceInProcess[base]){return}
		if(this.binanceBalance.bnb < 0.009){return}			
		try{ 
	        if (message.type === 'message' && JSON.parse(message.data).b[0] && JSON.parse(message.data).a[0]){
				this.binanceArbitrage(base,pairs,e1,b1,u1,pairs.indexOf(pair),JSON.parse(message.data));
			}
		}
		 catch(e){
			return this.log(e);
        }
	};		
	return client;
}

/**
   * Stream Binance user account information.
   * @method binanceUserStream
   * @param {String} Binance listen key
   * @return {Object} Websocket client
   */
CryptoBot.prototype.binanceUserStream = function(key){
	if(this.binanceUserStreamStatus)return
	var client = new WebSocket(this.binanceUserStreamString+key);		
	var pairs ={}
	for(var i=0;i< this.Settings.Binance.pairs.length;i++){
		pairs[this.Settings.Binance.pairs[i].pair1] = [this.Settings.Binance.pairs[i].pair1,this.Settings.Binance.pairs[i].pair2,this.Settings.Binance.pairs[i].pair3];
	}	 
	client.onclose = (error)=> {
		if(this.binanceUserStreamStatus){
			this.binanceUserStreamStatus = false;
		    this.log('Binance User Account Connect Error: ' + error.toString(),new Date());
			this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
			return setTimeout(()=>{this.binanceUserStream(key)},10000);
		}
	};
	client.onerror = client.onclose;
	client.onopen = ()=> {
	    this.log('WebSocket Client Connected:Listening to Binance User Account:',new Date());
	    this.binanceUserStreamStatus = true;
	    this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
	};		
	client.onmessage = (message)=> {
		this.binanceParseUserEvent(message,pairs);
	 };
	return client;
}	

/**
   * Conduct a Binance trade.
   * @method binanceTrade
   * @param {String} Binance currency pair ie 'ETHBTC'
   * @param {String} Trade side 'BUY'/'SELL'
   * @param {Number} Trade amount
   * @param {Number} Trade price
   * @param {String} Trade time parameter 'GTC' 
   * @return {Promise} Should resolve with req response
   */
CryptoBot.prototype.binanceTrade = function(pair,side,amount,price,timeInForce){
	return new Promise((resolve,reject) => {	
		var date = new Date().getTime();
		var hash = crypto.SHA256(this.binanceApiSecret+"|symbol="+pair+"&timestamp="+date+"&timeInForce="+timeInForce+"&side="+side+"&type=LIMIT&quantity="+amount+"&price="+price+"&recvWindow="+6000);
	    const req = this.https.request({
				host: "www.binance.com",
				path: '/api/v1/order?symbol='+pair+"&timestamp="+date+"&timeInForce="+timeInForce+"&side="+side+"&type=LIMIT&quantity="+amount+"&price="+price+"&recvWindow="+6000+"&signature="+hash,
				method:"POST",
				headers:{
					"X-MBX-APIKEY":this.binanceApiKey,
				}
			},
			(response)=> {
	        var body = '';
	        response.on('data',function(d) {
	            body += d;
	        });
	        response.on('end',()=> {
				var parsed;
				try{
					parsed = JSON.parse(body);
					if(!parsed.orderId){
						this.notify("Error trading:"+pair+","+side+","+amount+","+price+","+new Date().toString());
						this.log("Error trading:",pair,side,amount,price,new Date());
						return reject(new Error("Error trading",pair,side,amount,price,new Date()));
					}
				}
				catch(e){
					this.log("Error:",e);
					return reject(e);
				}		
	            return resolve(parsed);
	        });
	    }).on('error',(e)=>{
			return reject(e);
		})
	    req.write("");
	    req.end();
	});					
}

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
   * @return {Array} Returns a array of trades to make
   */	
CryptoBot.prototype.bittrexArbitrage = function(bmessage,localMarket,Transactions,strategy,pair1,pair2,pair3,e1,_e1,u2,b3,_b3){
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
		var before = JSON.stringify({"bmessage:":bmessage,"localMarket":localMarket,"Transactions:":Transactions,"strategy":strategy})
		data = JSON.parse(bmessage.utf8Data);
		if(data.M && data.M[0] && data.M[0].M === "updateExchangeState"){
			pair = data.M[0].A[0].MarketName;
			this.bittrexUpdateMarket(pair,data.M[0].A[0],localMarket)
			this.bittrexSortBook(localMarket[pair]);
			if(!this.bittrexGenerateStrategy(pair,localMarket,strategy,Transactions,e1,u2,b3)){return [];}
			a =  strategy[pair1].strat1,b = strategy[pair2].strat1,c = strategy[pair3].strat1;
			percentage = a * b/c * 100;
			if(this.viewBittrexBook){
				var rand = Math.floor(100 * Math.random(0,1));
				if(rand % 3 === 0){
					this.broadcastMessage({type:"bittrexBook",book:localMarket});
				}	
			}
			if(percentage < 100){
				trading_pairs = {"type":"percentage","exchange":"bittrex","percentage":percentage,"strategy":1}
				message = this.bittrexFormatMessage(e1,u2,b3,_e1,a,c,b,percentage,Transactions);					
				trades = [["sell",pair3,Transactions[e1],c],["buy",pair2,Number(Transactions[b3].toFixed(8)),b],["buy",pair1,Transactions[_e1].toFixed(8),a]]
			}
			else {
				a =  strategy[pair1].strat2,b = strategy[pair2].strat2,c = strategy[pair3].strat2;
				percentage = a * b/c * 100;
				trading_pairs = {"type":"percentage","exchange":"bittrex","percentage":percentage,"strategy":2}
				message = this.bittrexFormatMessage(b3,u2,e1,_b3,a,b,c,percentage,Transactions);
				trades = [["sell",pair2,Transactions[b3],b],["buy",pair3,Transactions[e1].toFixed(8),c],["sell",pair1,Transactions[e1].toFixed(8),a]]
			}
			if(!Number(percentage)){
				return []
			}
			trading_pairs[pair1] = a,trading_pairs[pair2] = b,trading_pairs[pair3] = c;
			this.broadcastMessage(trading_pairs)
			if(!this.bittrexCheckConditions(Transactions,percentage,e1,b3,u2,message)){
				return [];
			}
			this.log("Starting Trades:",message,new Date());	
			try{
				for(var key in localMarket){
					for(var key2 in localMarket[key]){
						if(key2 !== "Sorted")delete localMarket[key][key2]
					}
				}	
			}catch(e){
				this.log(e)
			}	
			this.notify(message +"\r\n"+JSON.stringify(localMarket).replace(new RegExp('"', 'g'),""));
			this.bittrexInProcess = true;
			this.bittrexProcessTime = new Date().getTime();
			this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
			return trades;				
		}
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
		this.log("Insane Trade:",message);
		return false
	}
	if(this.saneTrades && percentage > 100 && (percentage < 100.7524 || percentage > this.upperLimit)){
		this.log("Insane Trade:",message);
		return false
	}	
	if(this.liquidTrades && percentage > 100 && (Transactions[u2+'_amount2'] < Transactions[u2] || Transactions[b3+'_amount2'] < Transactions[b3] || Transactions[e1+'_amount2'] < Transactions[e1])){
		this.log("Illiquid Trade:",new Date());
		return false;
	}	
	if(this.liquidTrades && percentage < 100 && (Transactions[u2+'_amount1'] < Transactions[u2] || Transactions[b3+'_amount1'] < Transactions[b3] || Transactions[e1+'_amount1'] < Transactions[e1])){
		this.log("Illiquid Trade:",message,new Date());
		return false;
	}
	if(Number(this.balance[e1]) < Transactions[e1]  ||  Number(this.balance[b3]) < Transactions[b3] || Number(this.balance[u2]) < Transactions[u2]){
		this.log("Wallet balance not enough to place order:",message,new Date());
		return false;
	}
	if(Transactions.btc < this.Settings.Bittrex.minimum){
		this.log("Minimum btc order not met");
		return false;
	}
	return true
}		
	
/**
   * Monitor Bittrex trades for completion.
   * @method bittrexCompleteArbitrage
   * @param {Object} Object with 3 Bittrex ids as keys
   */	
CryptoBot.prototype.bittrexCompleteArbitrage = function(tracking){
	if(Object.keys(tracking).length === 0 && obj.constructor === Object){
		this.rate = 52000;
		this.broadcastMessage({"type":"poll_rate","polling":this.rate});
		return setTimeout(()=>{
			this.bittrexAccount();
			this.rate = this.Settings.Config.polling;
			this.bittrexInProcess = false;
			this.bittrexProcessTime = 0;
			this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
		},52000);
	}
	this.log("Monitoring Orders: ",tracking,new Date(),this.rate);
	var _checkFilled = (uuid) => {
		this.bittrexAPI("account/getorder","&uuid="+uuid).then((order)=>{
			if(order){
				if(order.IsOpen !== true){
					tracking[uuid] = true;
					this.log("Bittrex order removed:",uuid,tracking);
					this.broadcastMessage({type:"orderRemove",order_id:uuid});
					var key= "Orders."+uuid;
					var lookupOrder = {}
					lookupOrder[key] = false;
					try{
						this.saveDB("trade",{},{extra:{"w":1},method:"update",query:lookupOrder,modifier:{"$set":{"Orders":tracking},"$inc":{"OrdersFilled":1}}});	
					}
					catch(e){
						this.log(e);
					}							
					this.bittrexAccount().catch((e)=>{
						this.log(e);
					});
					
				}		
			}
			else{
				this.log("Unable to find order while completing arbitrage:"+uuid);
			}
		}).catch((e)=>{
				this.log(e);
			});	
	}
	var count = 0;
	for(var key in tracking){
		if(tracking[key] === false){
			_checkFilled(key);
		}
		else{
			count++;
		}
	}
	if(count !== 3 && this.rate < 1400000){
		this.rate = this.rate * 2.3;
		this.broadcastMessage({"type":"poll_rate","polling":this.rate});
		return setTimeout(()=>{return this.bittrexCompleteArbitrage(tracking);},this.rate);
	}
	else{
		this.log("Arbitrage Completed");
		this.broadcastMessage({"type":"alert","alert":"Arbitage Completed","polling":this.rate});
		return this.bittrexAccount().then(()=>{
			this.rate = this.Settings.Config.polling;
			this.bittrexInProcess = false;
			this.bittrexProcessTime = 0;
			this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});	
		}).catch((e)=>{
			this.log("Error Getting Balance:",e);
			this.notify(e.toString()+"\nError getting balance after arbitrage completed:"+new Date());
			return this.bittrexAccount().then(()=>{
				this.bittrexInProcess = false;
				this.bittrexProcessTime = 0;
				this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
			}).catch((e)=>{
				this.bittrexInProcess = false;
				this.bittrexProcessTime = 0;
				this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
			});
		})
	}	
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
	Transactions[e1] = percentage < 100 ? Number((this.balance[e1] * this.p1).toFixed(8)) : Number((this.balance[e1] * this.p2).toFixed(8))
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
	if(pair === this.Settings.Config.pair3){
		strategy[this.Settings.Config.pair3]["strat1"] = Number(localMarket[pair]["Sorted"][1][0]);
		strategy[this.Settings.Config.pair3]["strat2"] = Number(localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]);
		//If lowest Ask < highest bid delete
		if(strategy[this.Settings.Config.pair3]["strat2"] < strategy[this.Settings.Config.pair3]["strat1"]){
			delete localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
			return false
		}
		Transactions[e1+'_amount1'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
		Transactions[e1+'_amount2'] = localMarket[pair]["Asks"][localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]];
	}
	else if(pair === this.Settings.Config.pair2){
		strategy[this.Settings.Config.pair2]["strat1"] = Number(localMarket[pair]["Sorted"][1][0]);
		strategy[this.Settings.Config.pair2]["strat2"] = Number(localMarket[pair]["Sorted"][1][0]);
		if(strategy[this.Settings.Config.pair2]["strat1"] > Number(localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1])){
			delete localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
			return false
		}
		Transactions[b3+'_amount1'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
		Transactions[b3+'_amount2'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
	}
	else{
		strategy[this.Settings.Config.pair1]["strat1"] = Number(localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]);
		strategy[this.Settings.Config.pair1]["strat2"] = Number(localMarket[pair]["Sorted"][1][0]);
		if(strategy[this.Settings.Config.pair1]["strat1"] < strategy[this.Settings.Config.pair1]["strat2"]){
			delete localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
			return false;
		}
		Transactions[u2+'_amount1'] = localMarket[pair]["Asks"][localMarket[pair]["Sorted"][0][localMarket[pair]["Sorted"][0].length - 1]];
		Transactions[u2+'_amount2'] = localMarket[pair]["Bids"][localMarket[pair]["Sorted"][1][0]];
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
   * Get Bittrex cookie and user-agent.
   * @method bittrexPrepareStream
   * @return {Promise} Should resolve {Object} with Bittrex cookie and a user-agent
   */
CryptoBot.prototype.bittrexPrepareStream = function(cloudscraper){
	return new Promise((resolve,reject) =>{	
		cloudscraper.get('https://bittrex.com/',(error,response,body)=> {
			if (error) {
				this.log('Cloudscraper error occurred');
				return reject(error);
			} 
			else{  
				this.log('CloudFlare bypassed:',new Date());
				return resolve([response.request.headers["cookie"],response.request.headers["User-Agent"]]);
			}
		});
	});
}

/**
   * Reset Bittrex status.
   * @method bittrexReset
   * @param {e} Exception
   * @param {Number} Time in milliseconds to wait
   * @return {Object} Return SetTimeout object
   */
CryptoBot.prototype.bittrexReset = function(e,time){
	this.log(e,new Date());
	this.notify("Error completing arbitrage:"+e);
	return setTimeout(()=>{
		this.bittrexInProcess = false;	
		this.bittrexProcessTime = 0;
		this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
	},time);
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
	if(!trades || trades.length < 3){
		return false;	
	}
	return this.niceOrderChain([this.bittrexTrade,this.bittrexTrade,this.bittrexTrade,this.completedTrades],{})
		.chain(trades)
		.then(()=>{
			localMarket[this.Settings.Config.pair1] = {Bids:{},Asks:{}}
			localMarket[this.Settings.Config.pair2] = {Bids:{},Asks:{}}
			localMarket[this.Settings.Config.pair3] = {Bids:{},Asks:{}}
		})
		.catch((e)=>{
			return this.bittrexReset(e,216000000);
		});		
}

/**
   * Monitor Bittrex pairs for arbitrage opportunities.
   * @method bittrexStream
   * @param {String} Bittrex cookie
   * @param {String} A user-agent
   * @return Should return signalr-client
   */
CryptoBot.prototype.bittrexStream = function(cookie,agent){
	var a;
	var b;
	var c;
	var client;
	var localMarket = {}
	var pair1 = this.Settings.Config.pair1;
	var pair2 = this.Settings.Config.pair2;
	var pair3 = this.Settings.Config.pair3;
	var strategy = {};	
	var Transactions = this.Transactions;
	var e1;
	var _e1;
	var u2;
	var b3;
	var _b3;
	var timeout;
	e1 = pair1.split('-')[1].toLowerCase();
	_e1 = "_" + pair1.split('-')[1].toLowerCase();
	b3 = pair1.split('-')[0].toLowerCase();
	_b3 = "_"+pair1.split('-')[0].toLowerCase();
	u2 = pair2.split('-')[0].toLowerCase();		
	localMarket[this.Settings.Config.pair1] = {Bids:{},Asks:{}}
	localMarket[this.Settings.Config.pair2] = {Bids:{},Asks:{}}
	localMarket[this.Settings.Config.pair3] = {Bids:{},Asks:{}}
	strategy[pair1] = {}
	strategy[pair2] = {}
	strategy[pair3] = {}
	client = new signalR.client("wss://socket.bittrex.com/signalr",['CoreHub']);	
	client.headers['User-Agent'] = agent;
	client.headers['cookie'] = cookie;
	client.serviceHandlers = {
			bound: ()=> { 
			this.log("Bittrex Websocket bound"); 
		},
		connectFailed: (error)=> {this.updateBittrexSocketStatus(error,false);},
		connected: (connection)=> {
			this.bittrexSubscribe(client,[this.Settings.Config.pair1,this.Settings.Config.pair2,this.Settings.Config.pair3]);
			this.bittrexSocketConnection = connection;
			this.log("Bittrex Websocket connected:",new Date()); 
			this.updateBittrexSocketStatus(true);
			if(!this.bittrexKill){
				timeout = setTimeout(()=>{
					if(this.bittrexSocketConnection){
						this.log("Resetting Bittrex Connection:",new Date())
						this.bittrexSocketConnection.close();
						return this.bittrexStream(cookie,agent);
					}
				},1800000);
			}
		},
		disconnected: ()=> { 
			clearTimeout(timeout);
			if(this.bittrexKill){
				client.end()
				this.log("Connection closed by user");
			}
			return this.updateBittrexSocketStatus("Bittrex Websocket disconnected",false);
		},
		onerror:(error)=> { 
			clearTimeout(timeout);
			this.updateBittrexSocketStatus(error,false);
			if(!this.bittrexKill){
				return this.bittrexPrepareStream(cloudscraper).then((info2)=>{
					this.bittrexStream(info2[0],info2[1])
				}).catch((e)=>{
					this.log("Error connecting to Bittrex Websocket:",new Date());
				});
			}
			else{
				this.log("Connection closed by user");
				client.end()
			}
		},
		messageReceived: (message)=> {
			var trades = this.bittrexArbitrage(message,localMarket,Transactions,strategy,pair1,pair2,pair3,e1,_e1,u2,b3,_b3);
			this.bittrexStartArbitrage(trades,localMarket);
		},
		bindingError: (error)=> { this.updateBittrexSocketStatus(error,false);},
		connectionLost: (error)=> { 
			this.updateBittrexSocketStatus(error,false);
			if(!this.bittrexKill){
				return this.bittrexStream(cookie,agent);
			}
		},
		reconnecting: (retry)=> {return this.updateBittrexSocketStatus("Bittrex Websocket Retrying",false)}
	};
	client.start();
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
		pairs.forEach((market)=> {	
			client.call('CoreHub', 'SubscribeToExchangeDeltas', market).done((err, result)=> {
				count++;
				if (result === true) {
					this.log('Subscribed to Bittrex market:' + market);
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
				timeout = setTimeout(()=>{this.bittrexSwing()},this.swingRate);
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
		this.bittrexAPI("account/getorder","&uuid="+uuid).then((order)=>{
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
			return {status:2,Timeout:null}
		}
		var newTrade = trade.order.Type === "LIMIT_SELL" ? "buy" : "sell";
		return this.bittrexDepthPure(this.Settings.Swing.pair).then((val)=>{
			if(newTrade === "buy"){
				var target =(1 - this.swingPercentage) * trade.order.Limit;
				this.log("Buying (Target/Price):",target+"/"+val.sell);
				this.broadcastMessage({"type":"swing","target":target,"price":val.sell,"trade":"bid"});
				if (val.sell < target){
					this.notify(this.Settings.Swing.pair+" Buying "+trade.order.Quantity+" @"+val.sell);
					this.bittrexCreateSwingOrder("buy",this.Settings.Swing.pair,trade.order.Quantity,val.sell);
					return {status:1,Timeout:null}
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
					this.bittrexCreateSwingOrder("sell",this.Settings.Swing.pair,trade.order.Quantity,val.buy);
					return {status:1,Timeout:null}
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
			this.bittrexCreateSwingOrder("buy",this.Settings.Swing.pair,amount,val.sell);
			return {status:1,Timeout:null}
		}).catch((e)=>{
				this.log(e);
				setTimeout(()=>{this.bittrexSwing()},this.swingRate);
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
			this.log("Order:"+type+","+pair+" "+quantity+"@"+rate,result);
			if(result && result.uuid){
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
				return reject(new Error("Error Placing Order:",new Date()))
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
	for(var i = 0; i< data.Buys.length;i++){
		rate = data.Buys[i].Rate.toString();
		if(data.Buys[i].Type === 0 || data.Buys[i].Type === 2){
			localMarket[pair]["Bids"][rate] = data.Buys[i].Quantity;
		}
		else{
			delete localMarket[pair]["Bids"][rate];
		}
	}
	for(var i = 0; i< data.Sells.length;i++){
		rate = data.Sells[i].Rate.toString();
		if(data.Sells[i].Type === 0 || data.Sells[i].Type === 2){
			localMarket[pair]["Asks"][rate] = data.Sells[i].Quantity;
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
   * Prepare Bittrex arbitrage orders to be monitored.
   * @method completedTrades
   * @param {Object} Object with 3 Bittrex order uuids as keys
   * @return Returns a setTimeout object or false
   */
CryptoBot.prototype.completedTrades = function(_orders) {
	var orders = {}
	if(!_orders){
		this.log("Error Completing Trades");
		this.bittrexInProcess = false;
		this.bittrexProcessTime = 0;
		this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
		return false;
	}
	for(var key in _orders){
		orders[_orders[key]['uuid']] = false;
	}
	return setTimeout(()=>{this.bittrexCompleteArbitrage(orders);this.saveDB("trade",{"Exchange":"Bittrex","Time":new Date().getTime(),Orders:orders,"Percent":this.Transactions.percentage,"Before":this.Transactions.before,"After":this.Transactions.after,"Profit":this.Transactions.profit});},10000);
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
		return true;
	}
	else if(this.logLevel === 2){
		this.broadcastMessage({"type":"log","log":args.join('')});
		return true;
	}
	else{
		console.log.apply(null,arguments);
		this.broadcastMessage({"type":"log","log":args.join('')});
		return true;
	}
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
	return;
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
						return resolve(new Error("Error adding "+type+" to DB:",err));
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
							return resolve(new Error("Error Removing "+type+" in DB:",err));
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
						return resolve(false);
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
			var bool = true;
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
					return reject(e);
				});			
			})					
		}						
		if(message.command === "connect"){
			ws.send(crypto.AES.encrypt(JSON.stringify({"type":'balance',"balance":this.balance,"p1":this.p1,"p2":this.p2,"polling":this.rate}),this.Settings.Config.key).toString());
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
		if(message.command === "poll"){
			if(Number(message.rate)){this.rate = message.rate * 1000;}
			this.log("poll_rate:",this.rate/1000 +" seconds");
		}									
		if(message.command === "poll_rate"){
			this.broadcastMessage({"type":"poll_rate","polling":this.rate});
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
					this.binanceSocketConnections[i].terminate();
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
				this.bittrexSocketConnection.close();
				this.bittrexSocketConnection = undefined;
				this.log("Bittrex Stream Closed");
			}
			else if(!this.bittrexKill && !this.bittrexSocketConnection){
				return new Promise((resolve,reject)=>{
					this.log("Starting Bittrex Stream");
					this.bittrexPrepareStream(cloudscraper).then((info)=>{
						this.bittrexStream(info[0],info[1])
						return resolve(true)
					}).catch((e)=>{
						this.log("Error connecting to Bittrex Websocket:",e);
						return reject(e);
					});
				})
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
		if(message.command === "update_percentage"){
			this.p1 = message.percentage1;
			this.p2 = message.percentage2;
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
			resolve(this.log("Websocket connection created:",new Date()));
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
	}	
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
