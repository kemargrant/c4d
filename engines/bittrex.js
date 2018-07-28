var engine = {}
var https = require('https');
var crypto = require("crypto-js");
var WebSocket = require('ws');
var signalR = require('signalr-client-kg');
const jsonic = require('jsonic');
const zlib = require('zlib');

//Bittrex Engine

/**
   * Bittrex API base template.
   * @method bittrexAPI
   * @param {String} Bittrex api path
   * @param {String} Bittrex api query options
   * @return {Promise} Should resolve with req response
   */
engine.api = function(path,options){
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
engine.account = function(){
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
engine.arbitrage = function(localMarket,Transactions,strategy,pair1,pair2,pair3,e1,_e1,u2,b3,_b3){
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
engine.cancelOrder = function(orderid){
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
engine.checkConditions = function(Transactions,percentage,e1,b3,u2,message){
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
engine.checkTrade = function(){
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
engine.createBook = function(data,localMarket){
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
engine.depthPure = function(pair){
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
engine.formatMessage = function(e1,u2,b3,_e1,a,b,c,percentage,Transactions){
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
engine.generateStrategy = function(pair,localMarket,strategy,Transactions,e1,u2,b3){
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
engine.getOrders = function(){
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
engine.parseUserEvent = function(data){
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
engine.reset = function(){
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
engine.saveOrders = function(percentage,Transactions,a,e1,_e1,b3,basePair){
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
engine.sortBook = function(obj){
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
engine.startArbitrage = function(trades,localMarket){
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
engine.stream = function(){
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
engine.resetSwingOrder = function(){
	return this.saveDB("swing",{},{extra:{"w":1},method:"remove",query:{"swing":1},modifier:{}});
}

/**
   * Subscribe to Bittrex websocket data.
   * @method bittrexSubscribe
   * @param {Object} Signal-r Client
   * @param {Array} Array of Bittrex pairs
   * @return {Promise} Returns a  promise that resolves to a boolean
   */
engine.subscribe= function(client,pairs){
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
engine.createSwingOrder = function(type,pair,amount,price){
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
engine.swing = function(){
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
engine.swingOrder = function(uuid){
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
engine.swingSupervisor = function (trade){
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
engine.trade = function(type,pair,quantity,rate,options){
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
engine.updateMarket = function(pair,data,localMarket){
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
   * Update status of Bittrex socket connection.
   * @method updateBittrexSocketStatus
   * @param {Boolean} New Bittrex Socket Status
   *  @return {Boolean} Return new Bittrex socket status
   */
engine.updateSocketStatus = function(message,bool){
	this.log(message,new Date());
	this.bittrexSocketStatus = bool;
	this.broadcastMessage({type:"bittrexStatus",value:this.bittrexInProcess,time:this.bittrexProcessTime,wsStatus:this.bittrexSocketStatus});
	return this.bittrexSocketStatus;
}

module.exports = engine;
