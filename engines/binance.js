var engine = {}
var https = require('https');
var crypto = require("crypto-js");
var WebSocket = require('ws');

/**
   * Get Binance Account Balance.
   * @method binanceAccount
   * @return {Promise} Should resolve with binanceBalance object
	**/
engine.Account = function(){
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
engine.Arbitrage = function(base,pairs,e1,b1,u1,index,messageData){	
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
engine.ArbitrageMessageFormat = function(Transactions,a,b,c,d,e,f,g,h,percentage){	
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
engine.beginArbitrage = function(base,percentage,message,Transactions,e1,b1,u1,promiseArray){
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
engine.cancelOrder = function(pair,id){	
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
   * Check Binance arbitrage conditions
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
engine.checkConditions = function(Transactions,percentage,base,e1,b1,u1,b,c,amount1,amount2){	
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
engine.checkTrade = function(base,orders){
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
engine.exchangeInfo = function(){
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
engine.generateStrategy = function(base,index,message){
	if(index === 0){
		this.binanceStrategy[base]['one']['a'] = Number(message.a);
		this.binanceStrategy[base]['one']['a_amount'] = Number(message.A);
		this.binanceStrategy[base]['two']['a'] = Number(message.b);
		this.binanceStrategy[base]['two']['a_amount'] = Number(message.B);
	}
	if(index === 1){
		this.binanceStrategy[base]['one']['b'] =  Number(message.a);
		this.binanceStrategy[base]['one']['b_amount'] = Number(message.A);
		this.binanceStrategy[base]['two']['b'] =  Number(message.b);					
		this.binanceStrategy[base]['two']['b_amount'] = Number(message.B);
	}
	if(index === 2){
		this.binanceStrategy[base]['one']['c'] =   Number(message.b);
		this.binanceStrategy[base]['one']['c_amount'] = Number(message.B);
		this.binanceStrategy[base]['two']['c']  = Number(message.a);
		this.binanceStrategy[base]['two']['c_amount'] = Number(message.A);
	}
}

/**
   * Send heartbeat to keep Binance user stream alive.
   * @method binanceListenBeat
   * @param {String} Binance listen key
   * @return {Promise} Should resolve with req response
   */
engine.listenBeat = function(listenkey){
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
engine.listenKey = function(){
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
engine.listenUser = function(){
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
engine.monitor = function(pairData){
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
engine.openOrders = function(pair){	
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
engine.parseUserEvent = function(message,pairs){
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
						this.log("Binance Order Removed:",data.c,new Date(),":",this.binanceOrders[base].length+"/"+this.binanceTradesMade[base]);
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
engine.precision = function(pairData){
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
					exchangeData[index] = [getPrec(filter.filters[0].tickSize),getPrec(filter.filters[2].minQty),Number(filter.filters[3].minNotional)]			
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
engine.formatPairs = function(exchangeData){
	for(var i= 0;i < this.Settings.Binance.pairs.length;i++){
		var prec = [0,0,0,0,0,0];
		var minb1;
		var minc1;
		var minu1;
		if(exchangeData[this.Settings.Binance.pairs[i].pair1.toUpperCase()]){
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
		else{
			return this.log("Binance Pair Error:",this.Settings.Binance.pair1)
		}
	}
	return;
}
/**
   * Reset Binance Currency Pair arbitrage fields.
   * @method binanceReset
   * @param {String} Base Binance currency pair
   * @return {Boolean} Return true
   */
engine.reset = function(base){
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
engine.saveOrders = function(values,base,percentage,Transactions,e1,b1,u1){
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
engine.stream = function(base,pair){
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
	    this.broadcastMessage({type:"binanceStatus",connections:this.binanceSocketConnections.length,value:this.binanceInProcess,"time":this.binanceProcessTime,ustream:this.binanceUserStreamStatus});										
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
engine.userStream = function(key){
	if(this.binanceUserStreamStatus)return
	var client = new WebSocket(this.binanceUserStreamString+key);		
	var pairs ={}
	for(var i=0;i< this.Settings.Binance.pairs.length;i++){
		pairs[this.Settings.Binance.pairs[i].pair1] = [this.Settings.Binance.pairs[i].pair1,this.Settings.Binance.pairs[i].pair2,this.Settings.Binance.pairs[i].pair3];
	}	 
	client.onclose = (error)=> {
		if(this.binanceUserStreamStatus){
			this.binanceUserStreamStatus = false;
		    this.log('Binance User Account Connect Error:',error.toString(),new Date());
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
engine.trade = function(pair,side,amount,price,timeInForce){
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

module.exports = engine;

