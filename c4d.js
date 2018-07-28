"use strict";

var crypto = require("crypto-js");
var WebSocket = require('ws');
var https = require('https');

var binanceEngine = require('./engines/binance.js');
var bittrexEngine = require('./engines/bittrex.js')


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
CryptoBot.prototype.bittrexAPI = bittrexEngine.api

CryptoBot.prototype.bittrexAccount = bittrexEngine.account;

CryptoBot.prototype.bittrexArbitrage = bittrexEngine.arbitrage;

CryptoBot.prototype.bittrexCancelOrder = bittrexEngine.cancelOrder;

CryptoBot.prototype.bittrexCheckConditions = bittrexEngine.checkConditions;

CryptoBot.prototype.bittrexCheckTrade = bittrexEngine.checkTrade;

CryptoBot.prototype.bittrexCreateBook = bittrexEngine.createBook;

CryptoBot.prototype.bittrexDepthPure = bittrexEngine.depthPure;

CryptoBot.prototype.bittrexFormatMessage = bittrexEngine.formatMessage;

CryptoBot.prototype.bittrexGenerateStrategy = bittrexEngine.generateStrategy;

CryptoBot.prototype.bittrexGetOrders = bittrexEngine.getOrders;

CryptoBot.prototype.bittrexParseUserEvent = bittrexEngine.parseUserEvent;

CryptoBot.prototype.bittrexReset = bittrexEngine.reset;

CryptoBot.prototype.bittrexSaveOrders = bittrexEngine.saveOrders;

CryptoBot.prototype.bittrexSortBook = bittrexEngine.sortBook;

CryptoBot.prototype.bittrexStartArbitrage = bittrexEngine.startArbitrage;

CryptoBot.prototype.bittrexStream = bittrexEngine.stream;

CryptoBot.prototype.bittrexResetSwingOrder = bittrexEngine.resetSwingOrder;

CryptoBot.prototype.bittrexSubscribe = bittrexEngine.subscribe;

CryptoBot.prototype.bittrexCreateSwingOrder = bittrexEngine.createSwingOrder;

CryptoBot.prototype.bittrexSwing = bittrexEngine.swing;

CryptoBot.prototype.bittrexSwingOrder = bittrexEngine.swingOrder;

CryptoBot.prototype.bittrexSwingSupervisor = bittrexEngine.swingSupervisor;

CryptoBot.prototype.bittrexTrade = bittrexEngine.trade;

CryptoBot.prototype.bittrexUpdateMarket = bittrexEngine.updateMarket;

CryptoBot.prototype.updateBittrexSocketStatus = bittrexEngine.updateSocketStatus;

//General Functions
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

module.exports = {bot:CryptoBot}
