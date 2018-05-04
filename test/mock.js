const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const userEvents = new MyEmitter();
var rhttps = require('https');
var WebSocket = require('ws');

var balance = {
  "makerCommission": 15,
  "takerCommission": 15,
  "buyerCommission": 0,
  "sellerCommission": 0,
  "canTrade": true,
  "canWithdraw": true,
  "canDeposit": true,
  "updateTime": 123456789,
  "balances": [
    {
      "asset": "BTC",
      "free": "4723846.89208129",
      "locked": "0.00000000"
    },
    {
      "asset": "LTC",
      "free": "4763368.68006011",
      "locked": "0.00000000"
    }
  ]
}
var _binanceMessages = [
{
  "e": "depthUpdate", 
  "E": 123456789,     
  "s": "LTCBTC",      
  "U": 157,           
  "u": 160,           
  "b":"0.018882",
  "B":"10",
  "a":"0.018881",
  "A":"100"
},
{
  "e": "depthUpdate", 
  "E": 123456789,     
  "s": "BTCUSDT",      
  "U": 157,           
  "u": 160,           
  "b": "9000",
  "B":"10",
  "a":"8500",
  "A":"100"
},
{
  "e": "depthUpdate", 
  "E": 123456789,     
  "s": "LTCUSDT",      
  "U": 157,           
  "u": 160,           
  "b":"170",
  "B":"10",
  "a":"164",
  "A":"100"
}
]
var userevent1 = {type:'message',
	data:JSON.stringify({
  "e": "outboundAccountInfo",   
  "E": 1499405658849,           
  "m": 0,                       
  "t": 0,                      
  "b": 0,                       
  "s": 0,                       
  "T": true,                    
  "W": true,                    
  "D": true,                    
  "u": 1499405658848,          
  "B": [                       
    {
      "a": "LTC",               
      "f": "17366.18538083",    
      "l": "0.00000000"        
    },
    {
      "a": "BTC",
      "f": "10537.85314051",
      "l": "2.19464093"
    },
    {
      "a": "ETH",
      "f": "17902.35190619",
      "l": "0.00000000"
    },
    {
      "a": "BNC",
      "f": "1114503.29769312",
      "l": "0.00000000"
    },
    {
      "a": "NEO",
      "f": "0.00000000",
      "l": "0.00000000"
    }
  ]
})
}
var userevent2 = {
	type:'message',
	data:JSON.stringify({
  "e": "executionReport",        
  "E": 1499405658658,            
  "s": "LTCBTC",                 
  "c": "mUvoqJxFIILMdfAW5iGSOW", 
  "S": "BUY",                    
  "o": "LIMIT",                  
  "f": "GTC",                    
  "q": "1.00000000",             
  "p": "0.10264410",            
  "P": "0.00000000",            
  "F": "0.00000000",            
  "g": -1,                       
  "C": "null",                   
  "x": "NEW",                    
  "X": "NEW",                   
  "r": "NONE",                   
  "i": 4293153,                  
  "l": "0.00000000",             
  "z": "0.00000000",            
  "L": "0.00000000",             
  "n": "0",                      
  "N": null,                     
  "T": 1499405658657,            
  "t": -1,                       
  "I": 8641984,             
  "w": true,                     
  "m": false,                   
  "M": false                    
})
}
var userevent3 = {
	type:'message',
	data:JSON.stringify({
  "e": "executionReport",        
  "E": 1499405658658,            
  "s": "LTCBTC",                 
  "c": "mUvoqJxFIILMdfAW5iGSOW", 
  "S": "BUY",                    
  "o": "LIMIT",                  
  "f": "GTC",                    
  "q": "1.00000000",             
  "p": "0.10264410",            
  "P": "0.00000000",            
  "F": "0.00000000",            
  "g": -1,                       
  "C": "null",                   
  "x": "FILLED",                    
  "X": "FILLED",                   
  "r": "NONE",                   
  "i": 4293153,                  
  "l": "0.00000000",             
  "z": "0.00000000",            
  "L": "0.00000000",             
  "n": "0",                      
  "N": null,                     
  "T": 1499405658657,            
  "t": -1,                       
  "I": 8641984,             
  "w": true,                     
  "m": false,                   
  "M": false                    
})
}

var bittrexUserEvent1 ={ 
   w: '',
  N: 6,
  TY: 0,
  o: 
   { U: 'fd15d-9eb60',
     I: 67874,
     OU: '49a95',
     E: 'BTC-LTC',
     OT: 'LIMIT_SELL',
     Q: 10,
     q: 10,
     X: 1,
     n: 0,
     P: 0,
     PU: null,
     Y: 11430,
     C: 152260,
     i: null,
     CI: true,
     K: false,
     k: false,
     J: 'NONE',
     j: null,
     u: null } 
 }
var bittrexUserEvent2 ={ 
   w: '',
  N: 6,
  TY: 2,
  o: 
   { U: 'fd15d-9eb60',
     I: 67874,
     OU: '49a95',
     E: 'BTC-LTC',
     OT: 'LIMIT_SELL',
     Q: 10,
     q: 10,
     X: 1,
     n: 0,
     P: 0,
     PU: null,
     Y: 11430,
     C: 152260,
     i: null,
     CI: true,
     K: false,
     k: false,
     J: 'NONE',
     j: null,
     u: null } 
 }
 
var _email ={
	server:{
		connect:function(){
			return{
				send:function(string,cb){
					return cb(null,true);
				}
			}
		}
	}
}
var orders = [
  {
    "symbol": "LTCBTC",
    "orderId": 1,
    "clientOrderId": "myOrder1",
    "price": "0.1",
    "origQty": "1.0",
    "executedQty": "0.0",
    "status": "NEW",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY",
    "stopPrice": "0.0",
    "icebergQty": "0.0",
    "time": 1499827319559,
    "isWorking": true
  }
]
var _https = {
	request:function(options,func){
		const events = new MyEmitter();
		var data = {};
		//Binance Proxies
		//console.log("proxy:",options.path);
		if(options.path.search("/api/v1/account") > -1 && options.method === "GET"){
			data = balance
		}
		//get existing orders proxy
		else if(options.path.search("openOrders") > -1 && options.method === "POST"){
			//console.log("proxy get existing Binance order");
			data = {orderId:'111222333'};
		}
		//get listen key proxy
		else if(options.path === "/api/v1/userDataStream"){
			//console.log("proxy get Binance listen key");
			data = {listenKey:"pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sv8a65a1"}
		}
		//place trade proxy
		else if(options.path.search("&type=LIMIT&quantity=") > -1){
			data = {orderId:123}
			var x = Math.round(Math.random(1)*10);
			var _data1={
					  "e": "executionReport",        
					  "E": 1499405658658,            
					  "s": "LTCBTC",                
					  "c": "mUvoqJxFIILMdfAW5iGSOW", 
					  "S": "BUY",                   
					  "o": "LIMIT",                 
					  "f": "GTC",                   
					  "q": "1.00000000",            
					  "p": "0.10264410",            
					  "P": "0.00000000",            
					  "F": "0.00000000",             
					  "g": -1,                      
					  "C": "null",                   
					  "x": "FILLED",                    
					  "X": "FILLED",                    
					  "r": "NONE",                  
					  "i": 4293153,                 
					  "l": "0.00000000",             
					  "z": "0.00000000",             
					  "L": "0.00000000",             
					  "n": "0",                     
					  "N": null,                     
					  "T": 1499405658657,            
					  "t": -1,                       
					  "I": 8641984,                 
					  "w": true,                     
					  "m": false,                    
					  "M": false              
			}
			var _data2={
					  "e": "executionReport",        
					  "E": 1499405658658,            
					  "s": "LTCBTC",                
					  "c": "mUvoqJxFIILMdfAW5iGSOW", 
					  "S": "BUY",                   
					  "o": "LIMIT",                 
					  "f": "GTC",                   
					  "q": "1.00000000",            
					  "p": "0.10264410",            
					  "P": "0.00000000",            
					  "F": "0.00000000",             
					  "g": -1,                      
					  "C": "null",                   
					  "x": "NEW",                    
					  "X": "NEW",                    
					  "r": "NONE",                  
					  "i": 4293153,                 
					  "l": "0.00000000",             
					  "z": "0.00000000",             
					  "L": "0.00000000",             
					  "n": "0",                     
					  "N": null,                     
					  "T": 1499405658657,            
					  "t": -1,                       
					  "I": 8641984,                 
					  "w": true,                     
					  "m": false,                    
					  "M": false              
			}		
			var data2 = x%2 == 0 ? _data1 : _data2;	
			userEvents.emit("trade",data2);
		}
		//use listen key proxy
		else if(options.path.search("listenKey=") > -1){
			//console.log("proxy use Binance listen key");
			data = {}
		}
		//get open orders proxy
		else if(options.path.search("/api/v1/openOrders") > -1){
			//console.log("proxy get Binance open orders");
			data = orders;
		}		
		//slack proxy
		else if(options.path.search("Slack") > -1){
			//console.log("Proxy slack message");
			func(events);
			events.emit("data",'ok');
			return events.emit("end");
		}		
		else if(options.method === "DELETE"){
			//console.log("proxy cancel Binance order");
			data = {symbol:'BTCUSDT'};
			userEvents.emit("delete",options);
		}
		//Bittrex proxies
		//Get balance
		else if(options.path.search("account/getbalances") > -1){
			data = {result:[{Currency:"BTC",Available:1}]}
		}	
		//Get Open Orders
		else if(options.path.search("market/getopenorders") > -1){
			data = {
				"success" : true,
				"message" : "",
				"result" : [{
						"Uuid" : null,
						"OrderUuid" : "09aa5bb6-8232-41aa-9b78-a5a1093e0211",
						"Exchange" : "BTC-LTC",
						"OrderType" : "LIMIT_SELL",
						"Quantity" : 5.00000000,
						"QuantityRemaining" : 5.00000000,
						"Limit" : 2.00000000,
						"CommissionPaid" : 0.00000000,
						"Price" : 0.00000000,
						"PricePerUnit" : null,
						"Opened" : "2014-07-09T03:55:48.77",
						"Closed" : null,
						"CancelInitiated" : false,
						"ImmediateOrCancel" : false,
						"IsConditional" : false,
						"Condition" : null,
						"ConditionTarget" : null
					}, {
						"Uuid" : null,
						"OrderUuid" : "8925d746-bc9f-4684-b1aa-e507467aaa99",
						"Exchange" : "BTC-LTC",
						"OrderType" : "LIMIT_BUY",
						"Quantity" : 100000.00000000,
						"QuantityRemaining" : 100000.00000000,
						"Limit" : 0.00000001,
						"CommissionPaid" : 0.00000000,
						"Price" : 0.00000000,
						"PricePerUnit" : null,
						"Opened" : "2014-07-09T03:55:48.583",
						"Closed" : null,
						"CancelInitiated" : false,
						"ImmediateOrCancel" : false,
						"IsConditional" : false,
						"Condition" : null,
						"ConditionTarget" : null
					}
				]
			}
		}			
		//Bittrex Trade
		else if( (options.path.search("market/buylimit") > -1) || (options.path.search("market/selllimit") > -1 )){
			data = {
				"success" : true,
				"message" : "",
				"result" : {
						"uuid" : "614c34e4-8d71-11e3-94b5-425861b86ab6"
					}
			}
		}	
		//cancel trade
		else if(options.path.search("market/cancel") > -1){
			data = {
				    "success" : true,
				    "message" : "",
				    "result" : null
				}
		}
		else if(options.path.search("public/getorderbook") > -1){
			console.log("using prox")
			console.log(options)
			data =  {
				"success" : true,
				"message" : "",
				"result" : {
					"buy" : [{
							"Quantity" : 12.37000000,
							"Rate" : 0.02525000
						}
					],
					"sell" : [{
							"Quantity" : 32.55412402,
							"Rate" : 0.02540000
						}, {
							"Quantity" : 60.00000000,
							"Rate" : 0.02550000
						}, {
							"Quantity" : 60.00000000,
							"Rate" : 0.02575000
						}, {
							"Quantity" : 84.00000000,
							"Rate" : 0.02600000
						}
					]
				}
			}
		}						
		else{
			return rhttps.request(options,func);		
		}
		func(events)
		return {
			write:()=>{},
			end:()=>{
				events.emit("data",JSON.stringify(data));
				events.emit("end")
			},
			on:()=>{
				return {
					write:()=>{},
					end:()=>{
						events.emit("data",JSON.stringify(data));
						events.emit("end")
					},
				}
			}
		}
	}
}
var _httpsError = {
	request:()=>{
		return{
			write:()=>{},
			end:()=>{},
			on:(x,func)=>{
				return func("ERROR")
			}
		}
	}
}
var _httpsError2 = {
	request:(option,func)=>{
		const events = new MyEmitter();
		func(events);
		events.emit("error","ERROR");
	}
}
var _httpsBadData = {
	request:(options,func)=>{
		const events = new MyEmitter();
		func(events)
		return{
			write:()=>{},
			end:()=>{events.emit("data","x}");return events.emit("end");},
			on:()=>{
				return {
					write:()=>{},
					end:()=>{events.emit("data","x}");return events.emit("end");},
				}
			}
		}
		events.emit("data","x}");
	}
}

var _httpsEmptyData = {
	request:(options,func)=>{
		const events = new MyEmitter();
		func(events)
		return{
			write:()=>{},
			end:()=>{events.emit("data","[]");return events.emit("end");},
			on:()=>{
				return {
					write:()=>{},
					end:()=>{events.emit("data","[]");return events.emit("end");},
				}
			}
		}
	}
}

var _MongoClient = {
	connect:function(string,func){
		var database = {
			createCollection:function(coll,opts,func){
				func(true);
			},
			collection:(_name)=>{
				var simpleDB = [{OrderUuid:123456789,text:"hello world"}]
				return {
					createIndex:function(x,y){
						console.log(_name," collection created");
					},
					find:function(){
						return {
							toArray:function(func){return func(false,simpleDB)}
						}
					},
					insert:function(x,y,func){
						simpleDB.push[x];
						func(false,true);
					},
					remove:function(x,func){
						func(false,true);
					},
					update:function(x,y,z,func){func(false,true);}
				};
			}
		}
		var dbConnection = {
			db:function(){
				return database;
			}
		}
		return func(undefined,dbConnection);
	}
}

var _MongoClient2 = {
	connect:function(string,func){
		var database = {
			createCollection:function(coll,opts,func){
				func(false);
			},
			collection:(_name)=>{
				var simpleDB = [{OrderUuid:123456789,text:"hello world"}]
				return {
					createIndex:function(x,y){
						console.log(_name," collection created");
					},
					find:function(){
						return {
							toArray:function(func){return func(false,simpleDB)}
						}
					},
					insert:function(x,y,func){
						simpleDB.push[x];
						func(false,true);
					},
					remove:function(x,func){
						func(false,true);
					},
					update:function(x,y,z,func){func(false,true);}
				};
			}
		}
		var dbConnection = {
			db:function(){
				return database;
			}
		}
		return func(undefined,dbConnection);
	}
}

var _MongoClient3 = {
	connect:function(x,func){
		var database = {}
		var dbConnection = {
			db:function(){
				return database;
			}
		}
		return func(true,dbConnection);
	}
}

var _MongoClient4 = {
	connect:function(string,func){
		var database = {
			createCollection:function(coll,opts,func){
				func(true);
			},
			collection:(_name)=>{
				var simpleDB = [{OrderUuid:123456789,text:"hello world"}]
				return {
					createIndex:function(x,y){
						console.log(_name," collection created");
					},
					find:function(){
						return {
							toArray:function(func){return func(new Error("find error"),simpleDB)}
						}
					},
					insert:function(x,y,func){
						simpleDB.push[x];
						func(new Error("insert error"),true);
					},
					remove:function(x,func){
						func(new Error("remove error"),true);
					},
					update:function(x,y,z,func){func(new Error("update error"),true);}
				};
			}
		}
		var dbConnection = {
			db:function(){
				return database;
			}
		}
		return func(undefined,dbConnection);
	}
}


var settings1 ={
	"Binance":
		{
			"apikey":"Binance_API_Key",
			"secretkey":"Binance_API_Secret",
			"enabled":true,
			"pairs":[{
			"liquidTrades":true,
			"lowerLimit1":100,
			"lowerLimit2":99,
			"optimalTrades":true,
			"pair1":"ltcbtc",
			"pair2":"btcusdt",
			"pair3":"ltcusdt",
			"upperLimit1":100.5,
			"upperLimit2":99.99
			}]
		},
	"Bittrex":
		{
			"apikey":"Bittrex_API_Key",
			"secret":"Bittrex_API_Secret",
			"minimum":0.001
		},
	"Config":
		{
			"enabled":true,
			"key":"Secret Private Key",	
			"liquidTrades":true,
			"logs":3,
			"lowerLimit":98.3,
			"pair1":"BTC-LTC",
			"pair2":"USDT-BTC",
			"pair3":"USDT-LTC",		
			"percentage1":1,
			"percentage2":0.5,					
			"polling":45000,
			"port":7073,
			"saneTrades":true,
			"upperLimit":101.79,
			"viewBook":false
		},
	"Email":
		{
			"addr":"Recipient_Email_Address",
			"host_smtp":"Email_SMTP_IP_Address",
			"use":true,
			"usr":"Email_Account_Address",
			"pwd":"Email_Password"		
		},
	"MongoDB":
		{
			"db_string":"mongodb://xxxx:xxxxxxxx@ipaddress:port/database",
			"connect":true
		},	
	"Slack":
		{
			"channel":"Slack_Channel",
			"hook":"Slack_Webhook",
			"use":true,
			"usr":"Slack_user_to_notify"
		},
	"Swing":
		{
			"amount":0.001,
			"pair":"BTC-USDT",
			"rate":60000,
			"swing":0.02,
			"swingTrade":true
		}		
}
var settings2 ={
	"Binance":
		{
			"apikey":"Binance_API_Key",
			"secretkey":"Binance_API_Secret",
			"enabled":true,
			"pairs":[{
			"liquidTrades":true,
			"lowerLimit1":100,
			"lowerLimit2":99,
			"optimalTrades":true,
			"pair1":"ltcbtc",
			"pair2":"btcusdt",
			"pair3":"ltcusdt",
			"upperLimit1":100.5,
			"upperLimit2":99.99
			}]
		},
	"Bittrex":
		{
			"apikey":"Bittrex_API_Key",
			"secret":"Bittrex_API_Secret",
			"minimum":0.001
		},
	"Config":
		{
			"enabled":true,
			"key":"Secret Private Key",	
			"liquidTrades":true,
			"logs":3,
			"lowerLimit":98.3,
			"pair1":"BTC-XVG",
			"pair2":"USDT-BTC",
			"pair3":"USDT-XVG",		
			"percentage1":1,
			"percentage2":0.5,					
			"polling":45000,
			"port":7073,
			"saneTrades":true,
			"upperLimit":101.79,
			"viewBook":false
		},
	"Email":
		{
			"addr":"Recipient_Email_Address",
			"host_smtp":"Email_SMTP_IP_Address",
			"use":true,
			"usr":"Email_Account_Address",
			"pwd":"Email_Password"		
		},
	"MongoDB":
		{
			"db_string":"mongodb://xxxx:xxxxxxxx@ipaddress:port/database",
			"connect":true
		},	
	"Slack":
		{
			"channel":"Slack_Channel",
			"hook":"Slack_Webhook",
			"use":true,
			"usr":"Slack_user_to_notify"
		},
	"Swing":
		{
			"amount":0.001,
			"pair":"BTC-USDT",
			"rate":60000,
			"swing":0.02,
			"swingTrade":true
		}		
}

//mock Binance Market
function _marketStream(_port){
	var wss;
	try{
		wss = new WebSocket.Server({port:_port});
		wss.on('connection',(ws,req)=>{
			setTimeout(()=>{
				wss.close();
			},1000);
			console.log("Mock Websocket connection created:",req.url);
			ws.on('error',(e)=>{
				return console.log("Mock socket error:",e);
			})
			ws.on('close',(e)=>{
				return console.log("Mock Market WebSocket Closed:",e,new Date());
			})					
		})	
	}
	catch(e){
		console.log(e)
	}
	return wss;
}

//mock Binance Userstream
function _userStream(){
	var wss = new WebSocket.Server({port:8090});
	var clients = []
	userEvents.on('trade',(data)=>{
		for(var i = 0;i < clients.length;i++){
			try{
				clients[i].send(JSON.stringify(data));
			}
			catch(e){
				console.log(e);
			}
		}
	});
	setTimeout(()=>{
		wss.close();
	},5000);
	wss.on('connection',(ws,req)=>{
		clients.push(ws);
		ws.on('error',(e)=>{
			console.log("Mock socket error:",e);
		})
		ws.on('close',(e)=>{
			return console.log("Mock UserStream WebSocket Closed:",e,new Date());
		})					
	})
	return wss;	
}

var _book = { Bids: 
   { '6261': 0.88432034,
     '6264': 0.05,
     '6268': 0.65541766,
     '6747.56862143': 0.00078586,
     '6740.68542667': 0.00079455,
     '6733.74049173': 0.00080335,
     '6726.73333437': 0.00081227,
     '6712.53041185': 0.00083045,
     '6705.33367069': 0.00083972,
     '6268.81382555': 0.1,
     '6723.92509': 0.7272209,
     '6754.43979': 0.77678411,
     '6751.00010008': 1.461,
     '6735.76858972': 0.01479852,
     '6754.43979001': 0.10216401,
     '6679.818': 3.134,
     '6268.2256': 0.14019566,
     '6754.43979004': 0.28450729,
     '6730.00000001': 0.251,
     '6751.00010001': 0.767,
     '6717.54441524': 0.55675312,
     '6653.86560001': 0.23763545,
     '6263.01421156': 0.15966807,
     '6262.5': 0.0479042,
     '6260.00000002': 0.23355897,
     '6260.00000001': 0.09982267 },
  Asks: 
   { '6816': 0.08318012,
     '6811.2': 9.87561297,
     '6812': 9.87561297,
     '6818': 9.87561297,
     '6814': 9.87561297,
     '6851': 0.11514584,
	 '6816.1': 0.08318012,
     '6831': 9.87561297,
     '6819': 9.87561297,
     '6813': 9.87561297,
     '6812.3': 9.87561297,
     '6831': 0.11514584,     
     '6402.4': 0.00225763,
     '6828.088': 0.61937144,
     '6809.99499998': 1.13151431,
     '6809.99299999': 1.62,
     '6809.99399998': 0.04490451,
     '6809.992': 0.3134,
     '6813.16028402': 2.09051021,
     '6809.992': 0.3134,
     '6813.16028402': 2.09051021,
     '6819.99499998': 1.13151431,
     '6829.99299999': 1.62,
     '649.99399998': 0.04490451,
     '6809.992': 0.3134,
     '6813.16028402': 2.09051021,
     '6822.5': 6.76,
     '6809.99499998': 1.13151431,
     '6809.99299999': 1.62,
     '6809.99399998': 0.04490451,
     '6809.992': 0.3134,
     '6813.16028402': 2.09051021,     
     '6846.063': 3.134,
     '6834.39087': 0.71849404,
     '6899.19336001': 0.28227746,
     '6899.393': 0.3134,
     '6809.98899996': 1.13117512,
     '6809.98899995': 1.755241 },
  Sorted: 
   [ [ '6846.063',
       '6834.39087',
       '6828.088',
       '6822.5',
       '6813.16028402',
       '6810',
       '6809.99499998',
       '6809.99399998',
       '6809.99299999',
       '6809.992',
       '6809.98899996',
       '6809.98899995',
       '6799.393',
       '6799.19336001' ],
     [ '6754.43979004',
       '6754.43979001',
       '6754.43979',
       '6751.00010008',
       '6751.00010001',
       '6747.56862143',
       '6740.68542667',
       '6735.76858972',
       '6733.74049173',
       '6730.00000001',
       '6726.73333437',
       '6723.92509',
       '6717.54441524',
       '6712.53041185',
       '6705.33367069',
       '6679.818',
       '6653.86560001',
       '6268.81382555',
       '6268.2256',
       '6268',
       '6264',
       '6263.01421156',
       '6262.5',
       '6261' ] ] }
var _sorted = { Bids: 
   { '6268': 0.65541766,
     '6747.56862143': 0.00078586,
     '6740.68542667': 0.00079455,
     '6733.74049173': 0.00080335,
     '6726.73333437': 0.00081227,
     '6712.53041185': 0.00083045,
     '6705.33367069': 0.00083972,
     '6268.81382555': 0.1,
     '6723.92509': 0.7272209,
     '6754.43979': 0.77678411,
     '6751.00010008': 1.461,
     '6735.76858972': 0.01479852,
     '6754.43979001': 0.10216401,
     '6679.818': 3.134,
     '6268.2256': 0.14019566,
     '6754.43979004': 0.28450729,
     '6730.00000001': 0.251,
     '6751.00010001': 0.767,
     '6717.54441524': 0.55675312,
     '6653.86560001': 0.23763545,
     '6260.00000001': 0.09982267 },
  Asks: 
   { '6812': 9.87561297,
     '6813': 9.87561297,
     '6814': 9.87561297,
     '6816': 0.08318012,
     '6818': 9.87561297,
     '6819': 9.87561297,
     '6831': 0.11514584,
     '6811.2': 9.87561297,
     '6816.1': 0.08318012,
     '6812.3': 9.87561297,
     '6402.4': 0.00225763,
     '6828.088': 0.61937144,
     '6809.99499998': 1.13151431,
     '6809.99299999': 1.62,
     '6809.99399998': 0.04490451,
     '6809.992': 0.3134,
     '6813.16028402': 2.09051021,
     '6819.99499998': 1.13151431,
     '6829.99299999': 1.62,
     '649.99399998': 0.04490451,
     '6822.5': 6.76,
     '6809.98899996': 1.13117512,
     '6809.98899995': 1.755241 },
  Sorted: 
   [ [ '6831',
       '6829.99299999',
       '6828.088',
       '6822.5',
       '6819.99499998',
       '6819',
       '6818',
       '6816.1',
       '6816',
       '6814',
       '6813.16028402',
       '6813',
       '6812.3',
       '6812',
       '6811.2',
       '6809.99499998',
       '6809.99399998',
       '6809.99299999',
       '6809.992',
       '6809.98899996',
       '6809.98899995' ],
     [ '6754.43979004',
       '6754.43979001',
       '6754.43979',
       '6751.00010008',
       '6751.00010001',
       '6747.56862143',
       '6740.68542667',
       '6735.76858972',
       '6733.74049173',
       '6730.00000001',
       '6726.73333437',
       '6723.92509',
       '6717.54441524',
       '6712.53041185',
       '6705.33367069',
       '6679.818',
       '6653.86560001',
       '6268.81382555',
       '6268.2256',
       '6268' ] ] }
var _bittrexData ={
	Z:[
		{TY:0,Q:1,R:3.33},
		{TY:3,Q:1,R:4.44},
	],
	S:[
		{TY:0,Q:1,R:7.77},
		{TY:3,Q:1,R:55.5},
	]
}
var _bittrexMarketData = {
	
	'BTC-LTC':{
		
		Bids:{'4.44':5},
		Asks:{'55.5':10}
	}
	
}
var _generateMarket1 =  {"BTC-LTC":{"Bids":{"0.01722":0.40739322,"0.0160425":12.59607612,"0.01685114":35.88349287,"0.01467937":0.34061394,"0.01708493":1,"0.0066":0.95295438,"0.01681231":48.47796882,"0.0171":6.32668771,"0.0065":7.17518941,"0.01712024":5.79,"0.0064":10.00551895,"0.01712028":6.49884997,"0.01712025":0.17479409,"0.01722444":28.96377775,"0.0171256":0.12583119,"0.01712029":279.171091},"Asks":{"0.01726751":174.16664493,"0.01739374":14.12231238,"0.01737333":11.50115003,"0.01749959":133.42260813,"0.01738289":14.12231238,"0.01737944":151.605,"0.01934585":0.08625983,"0.01746218":14.45755263,"0.01737941":6.89489288,"0.01934599":0.17745562,"0.01934616":0.03704672},"Sorted":[["0.01749959","0.01746218","0.01739374","0.01738289","0.01737944","0.01737941","0.01737333","0.01726751"],["0.01722444","0.01722","0.0171256","0.01712029","0.01712028","0.01712025","0.01712024","0.0171","0.01708493","0.01685114","0.01681231","0.0160425","0.01467937","0.0066","0.0065","0.0064"]]},"USDT-BTC":{"Bids":{"6542":0.00725452,"6560":0.32411941,"6567":0.41121738,"6595.00000007":0.01354665,"6593.14000002":0.44007092,"6574.08421484":1.26528058,"6559.71430055":0.015163,"6572.629":0.35539,"6590.13700002":0.88054292,"6595.00000008":0.00639166,"6569.54201337":0.55986139,"6587.00000006":0.44048115,"6571.2":2.57,"6587.00000002":0.8809623,"6559.11063542":1.26528058,"6573.475":0.1,"6563.553":0.1,"6574.8605":2,"6569.64525":2,"6587.00000014":1.584,"6578.51700003":0.44104918,"6503.00050001":0.24347735},"Asks":{"6630":0.08348725,"6640":0.14564667,"6641":1.711,"6800":0.28521956,"6900":29.39588612,"6920":3.81895944,"6699.11150801":0.35491219,"6639.99999983":0.01,"7197.5":0.06481629,"6671.177":0.1,"6633.955":0.1,"6643.924":0.1,"6749.99999998":0.81502664,"7430.64105421":0.01,"6665.5728709":2.89576544,"6662.38487845":0.04023051,"6644.999":0.35539,"6674.00707052":0.00285,"7431.681":0.03734099,"6686.16529897":0.75930029,"7433.6":0.0015},"Sorted":[["6800","6749.99999998","6699.11150801","6686.16529897","6674.00707052","6671.177","6665.5728709","6662.38487845","6644.999","6643.924","6641","6640","6639.99999983","6633.955","6630"],["6595.00000008","6595.00000007","6593.14000002","6590.13700002","6587.00000014","6587.00000006","6587.00000002","6578.51700003","6574.8605","6574.08421484","6573.475","6572.629","6571.2","6569.64525","6569.54201337","6567","6563.553","6560","6559.71430055","6559.11063542"]]},
	  "USDT-LTC":{"Bids":{"114.04353518":6.64017286,"114.0534":32.595496,"114.05340003":6.64017286,"114.05340004":176.278,"114.0469":17.8,"114.05340015":6.64017286,"107.5":40.95628728,"114.05340031":175.39,"114.05340032":13.28034572,"114.027":2.54846886,"114.01705":39.50521023,"114.05340034":13.28034572,"114.05340046":172.902,"113.97394":54.275912,"114.05340058":166.15,"114.05340062":152.60417286,"114.05340063":141.093,"114.04690001":6.64017286,"113.775695":0.527,"113.79800036":6.64017286,"113.79800037":29.46},"Asks":{"239":1.2,"115.28355":1,"114.999":17.5406,"115.90926107":8.77039116,"115.99899999":106.99326636,"114.89999967":14.12231238,"239.66909008":3.65901447,"114.89999966":15.015},"Sorted":[["115.99899999","115.90926107","115.28355","114.999","114.89999967","114.89999966"],["114.05340063","114.05340062","114.05340058","114.05340046","114.05340034","114.05340032","114.05340031","114.05340015","114.05340004","114.05340003","114.0534","114.04690001","114.0469","114.04353518","114.027","114.01705","113.97394","113.79800037","113.79800036","113.775695","107.5"]]}}

var _generateStrategy1 ={ 'BTC-LTC': { strat1: 0.01726751, strat2: 0.01722444 },
  'USDT-BTC': { strat1: 6595.00000008, strat2: 6595.00000008 },
  'USDT-LTC': { strat1: 114.05340063, strat2: 114.89999966 } }
var _generateTransaction1 = { btc_amount1: 0.00639166,
  btc_amount2: 0.00639166,
  ltc_amount1: 141.093,
  ltc_amount2: 15.015,
  usdt_amount1: 174.27850169,
  usdt_amount2: 28.96377775,
  btc: NaN,
  ltc: NaN } 
var _generateStrategyValid1 =  { 'BTC-LTC': { strat1: 0.01726751, strat2: 0.01722444 },
  'USDT-BTC': { strat1: 6595.00000008, strat2: 6595.00000008 },
  'USDT-LTC': { strat1: 114.05340063, strat2: 114.89999966 } } 
var _generateTransactionValid1 =  { btc_amount1: 0.00639166,
  btc_amount2: 0.00639166,
  ltc_amount1: 141.093,
  ltc_amount2: 15.015,
  usdt_amount1: 174.16664493,
  usdt_amount2: 28.96377775,
  btc: NaN,
  ltc: NaN }

var _generateMarket2 =  {"BTC-LTC":
	{"Bids":{"0.01713876":0.17460532,"0.01714234":0.12298011,"0.00666666":2.87852903},"Asks":{"0.01737939":11.50115003,"0.01738148":28.76625832,"0.01934648":1.56028639},"Sorted":[["0.01738148","0.01737939"],["0.01714234","0.01713876","0.00666666"]]},
	"USDT-BTC":{"Bids":{"6583.82":1.665,"6542.40284638":0.0038},"Asks":{"6627":0.51782777,"6679.56991":0.75930029},"Sorted":[["6679.56991","6627"],["6583.82","6542.40284638"]]},
	"USDT-LTC":{"Bids":{"113.18116":8.77039116},"Asks":{},"Sorted":[[],["113.18116"]]}
	} 

var _generateStrategy2 = { 'BTC-LTC': { strat1: 0.01737939, strat2: 0.01714234 },
  'USDT-BTC': { strat1: NaN, strat2: NaN },
  'USDT-LTC': { strat1: 113.18116, strat2: NaN } }

var _generateTransaction2 = { ltc_amount1: 8.77039116,
  ltc_amount2: undefined,
  usdt_amount1: 11.50115003,
  usdt_amount2: 0.12298011,
  btc_amount1: undefined,
  btc_amount2: undefined }

var _generateStrategyValid2 =  { 'BTC-LTC': { strat1: 0.01737939, strat2: 0.01714234 },
  'USDT-BTC': { strat1: 6583.82, strat2: 6583.82 },
  'USDT-LTC': { strat1: 113.18116, strat2: NaN } }

var _generateTransactionValid2 = { ltc_amount1: 8.77039116,
  ltc_amount2: undefined,
  usdt_amount1: 11.50115003,
  usdt_amount2: 0.12298011,
  btc_amount1: 1.665,
  btc_amount2: 1.665 } 
  
var _generateMarket3 =  {
	"BTC-LTC":{"Bids":{"0.016089":2,"0.01726507":165.083,"0.0172492":0.1,"0.0170936":3,"0.01690018":35.54568575,"0.01690025":24.39857394,"0.0172651":6.49884997,"0.01737946":1.56601346,"0.01698058":47.9975737,"0.01710501":1.16920432,"0.01726325":28.83327493,"0.0069":7.28085532,"0.01726514":0.17332722,"0.01726515":2.89600727,"0.01720514":5.79,"0.01716752":277.88994835},"Asks":{"0.01761736":3,"0.01750594":14.45755263,"0.0175566":0.5,"0.01888913":0.35019609,"0.01743675":28.67506846,"0.01747135":11.50115003,"0.01934989":4.1598573,"0.01935":0.0290279,"0.01935034":0.03101107,"0.01743027":50.341,"0.01743026":3.98444,"0.01936":0.07650034},"Sorted":[["0.01761736","0.0175566","0.01750594","0.01747135","0.01743675","0.01743027","0.01743026"],["0.01737946","0.01726515","0.01726514","0.0172651","0.01726507","0.01726325","0.0172492","0.01720514","0.01716752","0.01710501","0.0170936","0.01698058","0.01690025","0.01690018","0.016089","0.0069"]]},"USDT-BTC":{"Bids":{"6262":0.03185883,"6300":37.12379504,"6500":65.54679085,"6595":9.14183031,"6636":0.22190152,"6640":0.2,"6613.037278":1.87544642,"6520.67732001":0.24281731,"6621.219":0.1,"6611.194":0.1,"6262.6":0.01,"6605.971875":2,"6602.416":0.35539,"6646.64":0.00148947,"6576.94657678":0.0038,"6624.67":1.655,"6559.97134233":0.01504519,"6648.68916371":0.0257941,"6619.4365":2,"6262.5":0.0479042},"Asks":{"6650":0.00186065,"7100":13.792692,"7425":3.07362082,"7426":0.2,"6706.27244896":2.81691228,"7425.6":0.0015,"6708.841":0.75930029,"6718.68439233":0.0038,"7426.80353595":0.01885966,"7426.8580173":0.00067796,"6662.35139582":0.06265925,"6679.24999999":1.591,"6700.32":0.1,"6710.312":0.1},"Sorted":[["6718.68439233","6710.312","6708.841","6706.27244896","6700.32","6679.24999999","6662.35139582","6650"],["6648.68916371","6646.64","6640","6636","6624.67","6621.219","6619.4365","6613.037278","6611.194","6605.971875","6602.416","6595","6576.94657678","6559.97134233","6520.67732001","6500","6300","6262.6","6262.5","6262"]]},"USDT-LTC":{"Bids":{"114.18005":8.77039116,"115.20000001":39.03879766,"114.45000003":6.83646612,"114.86270001":108.855,"114.8627":17.8,"114.45000001":3.41823306},"Asks":{"115.89418378":13.68052649,"115.4526":0.44380498,"116.27849999":163.662,"248.0228":3.79311043,"116.90109995":132.87579416,"116.34799999":170.237},"Sorted":[["116.90109995","116.34799999","116.27849999","115.89418378","115.4526"],["115.20000001","114.86270001","114.8627","114.45000003","114.45000001","114.18005"]]}}

var _generateStrategy3 = { 'BTC-LTC': { strat1: 0.01743026, strat2: 0.01737946 },
  'USDT-BTC': { strat1: 6646.64, strat2: 6646.64 },
  'USDT-LTC': { strat1: 115.20000001, strat2: 115.4526 } }

var _generateTransaction3 = { usdt_amount1: 3.98444,
  usdt_amount2: 1.56601346,
  btc_amount1: 0.00148947,
  btc_amount2: 0.00148947,
  ltc_amount1: 39.03879766,
  ltc_amount2: 0.44380498,
  btc: NaN } 

var _generateStrategyValid3 =  { 'BTC-LTC': { strat1: 0.01743026, strat2: 0.01737946 },
  'USDT-BTC': { strat1: 6648.68916371, strat2: 6648.68916371 },
  'USDT-LTC': { strat1: 115.20000001, strat2: 115.4526 } }

var _generateTransactionValid3 ={ usdt_amount1: 3.98444,
  usdt_amount2: 1.56601346,
  btc_amount1: 0.0257941,
  btc_amount2: 0.0257941,
  ltc_amount1: 39.03879766,
  ltc_amount2: 0.44380498,
  btc: NaN } 

var _generateSmallMarket =  {
	"BTC-LTC":
		{"Bids":{"0.01713876":0.17460532,"0.01714234":0.12298011,"0.00666666":2.87852903},"Asks":{"0.01737939":11.50115003,"0.01738148":28.76625832,"0.01934648":1.56028639},"Sorted":[["0.001738148","0.001737939"],["0.01714234","0.01713876","0.00666666"]]},
	"USDT-BTC":
		{"Bids":{"6583.82":1.665,"6542.40284638":0.0038},"Asks":{"6627":0.51782777,"6679.56991":0.75930029},"Sorted":[["5679.56991","5627"],["6583.82","6542.40284638"]]},
	"USDT-LTC":
	{"Bids":{"113.18116":8.77039116},"Asks":{},"Sorted":[["112"],["113.18116"]]}
} 

var _bittrexArbitrage1  = {"TY":"utf8","utf8Data":"{\"C\":\"d-C34169D2-B,0|BJHgS,0|BJHgT,4|Bc,86292|BS,A2A05|Qo,6451A\",\"M\":[{\"H\":\"CoreHub\",\"M\":\"updateExchangeState\",\"A\":[{\"M\":\"BTC-XVG\",\"Nounce\":549522,\"Z\":[{\"TY\":2,\"R\":0.00000942,\"Q\":194422.68953821}],\"S\":[],\"F\":[]}]}]}"}
var _bittrexArbitrage2  = {"BTC-XVG":
	{"Bids":{"0.00000935":177736.67607308,"0.00000934":168406.20040576,"0.00000941":246247.11347046,"0.00000933":806153.72096553,"0.0000094":130311.9584391,"0.00000937":57715.97429635,"0.00000932":56893.97801209,"0.00000944":52588.24727826,"0.00000931":5418.8456638,"0.0000093":325259.39485015,"0.00000929":21993.5475581,"0.00000939":1488.41551863,"0.00000928":6144.35042782,"0.00000943":62335.77491848,"0.00000942":189422.68953821,"0.00000936":6156.32661058,"0.00000945":9224.24046306,"0.00000938":54447.0523079,"0.00000437":30591.58258601,"0.00000804":75488.29386194,"0.00000946":5000,"0.00000923":152234.80161826},"Asks":{"0.00001067":139628.86374338,"0.00000957":12704.936,"0.00000958":1206.98995182,"0.00000959":203234.48913872,"0.00001107":13252.61668382,"0.00001321":34410.23134784,"0.00001069":541137.88663137,"0.00001079":23418.00605597,"0.00001109":54851.23771928,"0.00001139":61587.35093591,"0.00001169":551958.61609209,"0.00001199":207714.14892068,"0.00001229":13993.50731628,"0.00000972":68521.45603638,"0.00000954":19139.23,"0.00001099":380339.20418425,"0.00000964":31549.63358153,"0.00001129":30308.0324902,"0.00000999":1608201.04788848,"0.00000956":938.94736842,"0.00001048":189869.80293133,"0.00001026":614956.96984732,"0.00001159":9384.16459402,"0.00000963":64529.78917268,"0.00001189":73699.54974228,"0.0000099":1358029.58117685,"0.00000965":989205.51850482,"0.00001219":17262.25076961,"0.00000993":39489.89366525,"0.00001008":7635.64584503,"0.00000962":3981.43298708,"0.00001249":497678.91588004,"0.00001":4678053.28676305,"0.00001279":18519.48158389,"0.000011":9227787.02394865,"0.0000096":21201.00872878,"0.00000998":1352172.45440375,"0.00000952":8505,"0.0000095":3934.27346341,"0.00000973":117461.64691699,"0.00000975":206787.19418613,"0.0000105":2019367.53492326,"0.00000949":185693.34306734,"0.00000955":4786.66653039,"0.00001005":738364.06061029,"0.0000102":777740.30671606,"0.0000098":1275054.5914987,"0.00001462":44147.2731254,"0.00000961":134543.62394627,"0.00001463":125,"0.00001066":63539.1632226,"0.00000953":50957.064},
		"Sorted":[
		["0.00000975","0.00000973","0.00000972","0.00000965","0.00000964","0.00000963","0.00000962","0.00000961","0.0000096","0.00000959","0.00000958","0.00000957","0.00000956","0.00000955","0.00000954","0.00000953","0.00000952","0.0000095","0.00000949"],
		["0.00000946","0.00000945","0.00000944","0.00000943","0.00000942","0.00000941","0.0000094","0.00000939","0.00000938","0.00000937","0.00000936","0.00000935","0.00000934","0.00000933","0.00000932","0.00000931","0.0000093","0.00000929","0.00000928","0.00000923","0.00000804","0.00000437"]]},
		"USDT-BTC":{"Bids":{"6440":0.68762682,"6900":5.40428237,"6905":0.13603731,"6935":5,"7000":0.49209678,"7001":11.00245642,"7002":13.17295996,"6927.37450694":0.71377587,"6967.985":0.00640777,"6965.001":0.3,"6924.44201232":0.01427144,"6962.9439":2,"6968.424":0.3,"6947.29003697":1.10977961,"7000.49000099":1,"6965.98300001":0.2,"6954.237":0.35539,"6931.7":0.0156,"6965.98248789":0.2,"6863.42020097":0.40227639,"6912.143":3.5539,"6861.96":0.85068099,"6442.1":1.03},"Asks":{"7035":2,"7250":1.23283052,"7048.99999999":1.22934544,"7015.49000095":1.12017797,"7046.99999999":0.2,"7455.4362112":1.0228233,"7455.70762252":0.8913986,"7015.48888899":0.16546088,"7013.49000099":0.91574102,"7042.77618474":0.2,"7046.22638225":1.13036081,"7456.24335735":0.25,"7456.74567456":0.1,"7013.48888899":0.99784135,"7175.118":1.6739,"7022.482965":0.95042382,"7127.99999999":0.81599489,"7038.404":0.3,"7455.86542235":0.93265874,"7042.77618475":0.2,"7080.243":3.5539,"7066.47096":0.71377587,"7129.99999999":0.81599489},
			"Sorted":[
			["7175.118","7129.99999999","7127.99999999","7080.243","7066.47096","7048.99999999","7046.99999999","7046.22638225","7042.77618475","7042.77618474","7038.404","7035","7022.482965","7015.49000095","7015.48888899","7013.49000099","7013.48888899"],
			["7002","7001","7000.49000099","7000","6968.424","6967.985","6965.98300001","6965.98248789","6965.001","6962.9439","6954.237","6947.29003697","6935","6931.7","6927.37450694","6924.44201232","6912.143","6905","6900","6863.42020097","6861.96","6442.1","6440"]]},
			"USDT-XVG":{"Bids":{"0.062":279022.77852304,"0.06205":125000,"0.06475063":24262.16727698,"0.06550001":532118,"0.0621":501710.27265467,"0.06426766":532118,"0.06585":137.14743216,"0.06630008":5863.22266923,"0.06570001":53212},
				"Asks":{"0.07":175574.59159383,"0.0668":163136.33725674,"0.072":216572.24829475,"0.0669":3900},
				"Sorted":[["0.0669","0.0668"],["0.06630008","0.06585","0.06570001","0.06550001","0.06475063","0.06426766","0.0621","0.06205","0.062"]]}
			}
var _bittrexArbitrage3  = {"xvg_amount1":5863.22266923,"xvg_amount2":163136.33725674,"btc":0.15,"usdt":1047.67425,"xvg":15644.53689184,"_btc":1649622151.121746,"percentage":99.16005988023952,"before":0.15,"after":1649622151.121746,"profit":10997481007.478308,"btc_amount1":13.17295996,"btc_amount2":13.17295996,"usdt_amount1":185693.34306734,"usdt_amount2":5000,"_xvg":744.69186234}
var _bittrexArbitrage4  = {"BTC-XVG":{"strat1":0.00000949,"strat2":0.00000946},"USDT-BTC":{"strat1":7002,"strat2":7002},"USDT-XVG":{"strat1":0.06630008,"strat2":0.0668}}

var _bittrexArbitrage5  = {"TY":"utf8","utf8Data":"{\"C\":\"d-4CD09A40-B,0|BJPHO,0|BJPHP,4|CB,85F6F|BY,A24F0|DV,642C7\",\"M\":[{\"H\":\"CoreHub\",\"M\":\"updateExchangeState\",\"A\":[{\"M\":\"USDT-BTC\",\"Nounce\":664816,\"Z\":[],\"S\":[{\"TY\":1,\"R\":7039.99999999,\"Q\":0.0},{\"TY\":0,\"R\":7042.77618475,\"Q\":0.20000000}],\"F\":[]}]}]}"}
var _bittrexArbitrage6  = {"BTC-XVG":{"Bids":{},"Asks":{}},"USDT-BTC":{"Bids":{},"Asks":{}},"USDT-XVG":{"Bids":{},"Asks":{}}}
var _bittrexArbitrage7  = {}
var _bittrexArbitrage8  = {"BTC-XVG":{},"USDT-BTC":{},"USDT-XVG":{}}


var _bittrexArbitrage9  =  {"type":"utf8","utf8Data":"{\"C\":\"d-FDE92A7E-D,0|BJVIW,0|BJVIX,4|DN,8649C|B3,A2F86|4,64323\",\"M\":[{\"H\":\"CoreHub\",\"M\":\"updateExchangeState\",\"A\":[{\"MarketName\":\"USDT-BTC\",\"Nounce\":667526,\"Buys\":[{\"Type\":1,\"Rate\":6908.56641236,\"Quantity\":0.0},{\"Type\":0,\"Rate\":6421.46252500,\"Quantity\":0.22271180}],\"Sells\":[{\"Type\":2,\"Rate\":6987.99000000,\"Quantity\":0.15123849}],\"Fills\":[]}]}]}"}
var _bittrexArbitrage10 = {"BTC-XVG":{"Bids":{"0.0000094":98156.26767049,"0.00000939":44621.99051863,"0.00000937":62132.0820178,"0.00000926":79958.13608508,"0.00000924":3896.12380682,"0.00000943":7075.16907589,"0.00000941":248530.65269469,"0.00000942":55493.77238244,"0.00000921":179686.65613808,"0.0000093":316144.78437394,"0.00000938":63442.75915056,"0.00000922":160592.31053664,"0.00000936":5096.32661058,"0.00000945":127303.92131284,"0.00000935":178534.14016685,"0.00000927":35702.80144034,"0.00000925":133928.0665238,"0.00000928":6305.98835885,"0.00000931":4768.23749036,"0.00000933":810153.72096553,"0.00000944":864.68879237,"0.00000919":25523.50217367,"0.00000946":14000,"0.00000918":832972.11926006,"0.0000092":2412582.88030209},"Asks":{"0.0000097":430820.16385288,"0.0000098":1345542.17666808,"0.00000959":63995.07585681,"0.00000954":248309.76582692,"0.00001079":32255.58935928,"0.00000955":8155.87855201,"0.00000966":182348.09251949,"0.00000995":441301.78360549,"0.00000965":451702.71575246,"0.00000968":1159963.979046,"0.000011":9205186.97861719,"0.00000956":6951.69755385,"0.00001461":7500,"0.00001462":44147.2731254,"0.000013":1535526.23263524,"0.00001463":125,"0.00001464":3859.40450873,"0.00001465":313138.90247747,"0.00001466":146606.19591686,"0.0000102":747740.30671606,"0.00001084":13019.99659999,"0.0000096":207033.50412025,"0.00001035":626819.48679879,"0.0000119":597703.58536316,"0.00001033":3184.19893514,"0.00000963":132311.86481212,"0.00000957":9769.13543454,"0.00000962":54566.81739839,"0.00000953":25378.1029891,"0.0000106":185598.90950648},"Sorted":[["0.0000097","0.00000968","0.00000966","0.00000965","0.00000963","0.00000962","0.0000096","0.00000959","0.00000957","0.00000956","0.00000955","0.00000954","0.00000953"],["0.00000946","0.00000945","0.00000944","0.00000943","0.00000942","0.00000941","0.0000094","0.00000939","0.00000938","0.00000937","0.00000936","0.00000935","0.00000933","0.00000931","0.0000093","0.00000928","0.00000927","0.00000926","0.00000925","0.00000924","0.00000922","0.00000921","0.0000092","0.00000919","0.00000918"]]},"USDT-BTC":{"Bids":{"6422":0.30576197,"6790":0.00146907,"6900":5.40928237,"6960":17.93872054,"6988":0.23297508,"6423.89922856":0.18742,"6962.5":2.19685812,"6856.23232324":0.22913322,"6645.45258":0.0005,"6908.40965":0.71377587,"6942.1":7.73,"6925.66964963":2.0535733,"6800.0696624":0.0005,"6913.901":0.3,"6924.188":0.3,"6908.56641236":0.01431024,"6422.33060004":0.28018448,"6940.1":7.72,"6962.50000001":0.05,"6882.00000002":0.2282753,"6932.40000001":0.2},"Asks":{"7451.76542387":0.96587417,"7451.99999999":0.47355856,"7452.31067001":0.0015,"6989.99999999":0.0407397,"7012.337":0.35539,"7133.86759038":0.81599489,"7023.31252789":1.40263698,"6992.962":0.3,"7003.514":0.3,"7453.13111111":0.015,"7453.76542387":0.92658742,"7012.3869":0.04331,"6998.99999999":0.223,"7039.61138":0.71698465,"7039.61137999":1.30207361,"7039.61137998":0.0525982,"6999.99999998":1.17827167,"6996.99999993":0.17777878,"6996.99999992":1.623,"6989.99999998":0.2,"7009.99999999":0.0426323},"Sorted":[["7133.86759038","7039.61138","7039.61137999","7039.61137998","7023.31252789","7012.3869","7012.337","7009.99999999","7003.514","6999.99999998","6998.99999999","6996.99999993","6996.99999992","6992.962","6989.99999999","6989.99999998"],["6988","6962.50000001","6962.5","6960","6942.1","6940.1","6932.40000001","6925.66964963","6924.188","6913.901","6908.56641236","6908.40965","6900","6882.00000002","6856.23232324","6800.0696624","6790","6645.45258","6423.89922856","6422.33060004","6422"]]},"USDT-XVG":{"Bids":{"0.04":519082.50630691,"0.03223201":350,"0.0321":10000,"0.032":61481.15422698,"0.03174935":1060.14859083,"0.06585":2740.47183465,"0.06536106":53212},"Asks":{"0.066":493,"0.22":57215.19044019},"Sorted":[["0.066"],["0.06585","0.06536106","0.04","0.03223201","0.0321","0.032","0.03174935"]]}}
var _bittrexArbitrage11 = {"usdt_amount1":25378.1029891,"usdt_amount2":14000,"btc":0.01,"usdt":69.7053,"xvg":1053.50055682,"_btc":0.0099412,"percentage":100.16133333333332,"before":0.01,"after":0.0099412,"profit":0.99412,"btc_amount1":0.23297508,"btc_amount2":0.23297508,"xvg_amount1":2740.47183465,"xvg_amount2":493,"_xvg":497.19562014}
var _bittrexArbitrage12 = {"BTC-XVG":{"strat1":0.00000953,"strat2":0.00000946},"USDT-BTC":{"strat1":6988,"strat2":6988},"USDT-XVG":{"strat1":0.06585,"strat2":0.066}}

var _bittrexArbitrage13 = {"TY":"utf8","utf8Data":"{\"C\":\"d-1824C1F3-B,0|BOs4k,0|BOs4l,4|B6,92671|9,AD516|DU,6C11A\",\"M\":[{\"H\":\"CoreHub\",\"M\":\"updateExchangeState\",\"A\":[{\"M\":\"BTC-XVG\",\"Nounce\":599665,\"Z\":[{\"TY\":0,\"R\":0.00000948,\"Q\":320255.62279944},{\"TY\":1,\"R\":0.00000944,\"Q\":0.0},{\"TY\":2,\"R\":0.00000938,\"Q\":207.17120735},{\"TY\":2,\"R\":0.00000935,\"Q\":97026.03483044}],\"S\":[{\"TY\":1,\"R\":0.00000948,\"Q\":0.0},{\"TY\":0,\"R\":0.00001464,\"Q\":2602.82106453}],\"F\":[{\"TY\":\"SELL\",\"R\":0.00000948,\"Q\":326.44228454,\"TimeStamp\":\"2018-04-08T21:43:48.447\"},{\"TY\":\"SELL\",\"R\":0.00000948,\"Q\":8448.92897305,\"TimeStamp\":\"2018-04-08T21:43:48.383\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":600.00000000,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":37264.00000000,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":42192.00000000,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":3602.55143725,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":100.00000000,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":5947.00000000,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":5275.77360945,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":2256.24399889,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":22263.71642929,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":3944.42348655,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":17761.76079483,\"TimeStamp\":\"2018-04-08T21:43:48.01\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":24849.27706117,\"TimeStamp\":\"2018-04-08T21:43:47.79\"},{\"TY\":\"BUY\",\"R\":0.00000948,\"Q\":42269.19784860,\"TimeStamp\":\"2018-04-08T21:43:47.79\"}]}]}]}"}
var _bittrexArbitrage14 = {"BTC-XVG":{"Bids":{"0.00000926":2151.40394194,"0.0000093":23723.73894797,"0.00000931":17782.02792092,"0.00000929":805424.03642088,"0.00000925":144652.83167159,"0.00000934":626903.61429171,"0.00000932":6725.36400531,"0.00000935":93025.09880103,"0.00000936":42966.19325215,"0.00000927":423.84348644,"0.00000928":27925.22182831,"0.0000094":4446,"0.00000933":2781.0386194,"0.00000941":77295.56168966,"0.00000942":600,"0.00000943":21126.39385958,"0.00000946":4315.48419012,"0.00000937":2768.65297759,"0.00000911":189967.13895557,"0.00000947":764699.07004213,"0.00000917":6482.90294982,"0.00000919":29756.21904679,"0.00000944":1070,"0.00000938":106.6098081,"0.0000092":344468.49384478},"Asks":{"0.00000948":208325.94466603,"0.00001":4302403.25760144,"0.00001081":124396.60844481,"0.00000967":217083.87848411,"0.00000968":1084990.55927296,"0.00000955":342783.61995143,"0.00001414":56812.66750839,"0.00001057":30646.84443991,"0.00001044":424225.75201431,"0.00001449":69650.75299448,"0.0000145":378842.09026772,"0.0000095":951540.53857042,"0.00000982":47642.02130445,"0.00000975":359686.49409538,"0.00001451":4000,"0.00000979":132307.07322413,"0.00000951":146234.01798573,"0.00001452":166896.36555556,"0.00000953":158973.81440678,"0.00001453":903.16767691,"0.00000952":29383.22847591,"0.00001008":31124.03845864,"0.0000143":120002.22534416,"0.00001066":83754.62180738,"0.00001454":4403.56181928,"0.0000125":1753455.27601092,"0.0000105":1962464.53514945,"0.00001455":6001.9,"0.00001456":20485.1999267,"0.00001457":25006.90162722,"0.00001031":5465.00836993,"0.00000966":209964.06152264,"0.00000957":157756.07923367,"0.0000096":968078.62370724,"0.00000949":142725.65251417,"0.00000999":1858169.14673934,"0.00000997":233894.99327188,"0.00000994":114979.90228104,"0.00001458":2770.30667405,"0.00001148":15695.42168497,"0.00001018":25604.72018923,"0.00000959":551472.74226511,"0.00000995":323520.55671123,"0.00000991":30300.26882981,"0.00001459":12000,"0.0000097":553021.91524797,"0.0000146":217078.40738137,"0.00000961":26592.61701879,"0.00000965":361242.38612578,"0.00001461":7500,"0.00000962":18157.19005026,"0.00001462":44147.2731254,"0.00000963":47778.0010685,"0.00001463":125,"0.00000964":81448.48724614},"Sorted":[["0.00000979","0.00000975","0.0000097","0.00000968","0.00000967","0.00000966","0.00000965","0.00000964","0.00000963","0.00000962","0.00000961","0.0000096","0.00000959","0.00000957","0.00000955","0.00000953","0.00000952","0.00000951","0.0000095","0.00000949","0.00000948"],["0.00000947","0.00000946","0.00000944","0.00000943","0.00000942","0.00000941","0.0000094","0.00000938","0.00000937","0.00000936","0.00000935","0.00000934","0.00000933","0.00000932","0.00000931","0.0000093","0.00000929","0.00000928","0.00000927","0.00000926","0.00000925","0.0000092","0.00000919","0.00000917","0.00000911"]]},"USDT-BTC":{"Bids":{"6900":1.33351737,"6905":0.00696175,"6909":0.01876911,"6910":0.1682451,"6911":1.07045154,"6935":0.0878917,"6958":0.78627814,"6935.00100001":3.98847995,"6935.00500001":1.618,"6935.011":0.35539,"6910.243":0.71845839,"6938.001":0.3,"6938.00000002":0.04246449,"6955.39499999":5.82785475,"6510.03000008":0.13128223,"6942.60000001":1.736,"6932.00000002":0.35865371,"6902.99999999":0.00299086,"6901.7341379":1.39249854,"6901.73413791":0.02405074,"6511.53500031":0.16976473,"6511.5":14.26464667,"6875.11309635":0.01437194,"6924.76683868":1.87022146,"6935.01100001":0.35849799},"Asks":{"6965":3.26876863,"6970":0.00107701,"6990":5.59671907,"7066":0.07140629,"7090":0.50705786,"7098":0.11981035,"7400":19.6113837,"7001.64882775":1.19968095,"7004.85148933":1.19968095,"7004.59994339":1.19968095,"7004.78157517":1.19968095,"7216.5":0.15,"7415.38721055":0.01649583,"7016.356":0.35539,"7058.84091909":0.00759757,"6988.8":0.00572595,"7007.685":0.3,"7006.98419417":1.19626461,"7089.03092192":0.09886516,"7042.82":0.71845839,"7004.99999999":0.169,"7007.68499999":1.592,"7054.67352459":0.71845839,"7415.39870889":0.00179634,"7010.45040499":1.19626461,"7023.82590084":1.78535048,"7064.99999998":0.81603094},"Sorted":[["7098","7090","7089.03092192","7066","7064.99999998","7058.84091909","7054.67352459","7042.82","7023.82590084","7016.356","7010.45040499","7007.685","7007.68499999","7006.98419417","7004.99999999","7004.85148933","7004.78157517","7004.59994339","7001.64882775","6990","6988.8","6970","6965"],["6958","6955.39499999","6942.60000001","6938.001","6938.00000002","6935.01100001","6935.011","6935.00500001","6935.00100001","6935","6932.00000002","6924.76683868","6911","6910.243","6910","6909","6905","6902.99999999","6901.73413791","6901.7341379","6900","6875.11309635","6511.53500031","6511.5","6510.03000008"]]},"USDT-XVG":{"Bids":{"0.0641":31123.2449298,"0.05709007":5940.93300853,"0.06413059":532118,"0.06":169266.17839427,"0.06451002":77313.57082202,"0.06451025":100070.82711346,"0.057":571006.11653107,"0.06451047":21613.489,"0.06451063":77313.57082202,"0.06485983":29055.268,"0.06485985":77313.57082202,"0.06429639":3527.28526795,"0.0642992":775.67546285,"0.06429921":24408.29414109,"0.06451":1725.71983651,"0.06451001":53212,"0.06486":236.17234,"0.06486003":76896.49893131,"0.06486002":72877.049,"0.06486008":74354.812,"0.0648601":17598.125,"0.0301001":10000,"0.06486012":76896.49893131},"Asks":{"0.06569733":7569.97343839,"0.06691":21716.29126637,"0.06569731":53211,"0.072":198428.99688064,"0.06569713":30202.963,"0.06569682":32500,"0.06616788":219008,"0.18629008":86858.05676626,"0.06540898":8448.92897305,"0.18637116":7903.69912212,"0.18796":42790.78609125,"0.06598999":53211},"Sorted":[["0.06691","0.06616788","0.06598999","0.06569733","0.06569731","0.06569713","0.06569682","0.06540898"],["0.06486012","0.0648601","0.06486008","0.06486003","0.06486002","0.06486","0.06485985","0.06485983","0.06451063","0.06451047","0.06451025","0.06451002","0.06451001","0.06451","0.06429921","0.0642992","0.06429639","0.06413059","0.0641","0.06","0.05709007","0.057","0.0301001"]]}}
var _bittrexArbitrage15 = {"btc_amount1":0.78627814,"btc_amount2":0.78627814,"btc":0.0046,"usdt":31.926783,"xvg":486.88981303,"_btc":0.00459932,"percentage":100.7388587927835,"before":0.0046,"after":0.00459932,"profit":0.9998521739130434,"usdt_amount1":208325.94466603,"usdt_amount2":764699.07004213,"xvg_amount1":76896.49893131,"xvg_amount2":8448.92897305,"_xvg":447.0245982}
var _bittrexArbitrage16 = {"BTC-XVG":{"strat1":0.00000948,"strat2":0.00000947},"USDT-BTC":{"strat1":6958,"strat2":6958},"USDT-XVG":{"strat1":0.06486012,"strat2":0.06540898}}
  
var _bittrexArbitrage17 = {"TY":"utf8","utf8Data":"{\"C\":\"d-5758874E-I,0|Boqy,0|Boqz,4|3h,35FE|0C,2805|5N,2A97\",\"M\":[{\"H\":\"CoreHub\",\"M\":\"updateExchangeState\",\"A\":[{\"M\":\"BTC-XVG\",\"Nounce\":13822,\"Z\":[{\"TY\":1,\"R\":0.01570209,\"Q\":0.0},{\"TY\":0,\"R\":0.01568212,\"Q\":0.19986397},{\"TY\":1,\"R\":0.01566762,\"Q\":0.0},{\"TY\":0,\"R\":0.01566761,\"Q\":3.17346370}],\"S\":[{\"TY\":0,\"R\":0.01583974,\"Q\":31.56617868},{\"TY\":1,\"R\":0.01585991,\"Q\":0.0}],\"F\":[]}]}]}"}
var _bittrexArbitrage18 = {"BTC-XVG":{"Bids":{"0.015695":34.3302,"0.01566762":3.17346167,"0.0156676":69.14763243},"Asks":{"0.01581":23.5128},"Sorted":[["0.01581"],["0.015695","0.01566762","0.0156676"]]},"USDT-BTC":{"Bids":{"7550":10.24736956},"Asks":{"8100":0.47976607},"Sorted":[[],["7550"]]},"USDT-XVG":{"Bids":{"126.73315001":12.89646924,"126.131565":7.8462142},"Asks":{"2247":0.6},"Sorted":[[],["126.73315001","126.131565"]]}}
var _bittrexArbitrage19 = {"btc_amount1":10.24736956,"btc_amount2":10.24736956,"btc":13.36161869,"usdt":101133.05370798,"xvg":800,"_btc":null,"percentage":94.18648553324948,"before":800,"after":843.02432881,"profit":1.0537804110125,"xvg_amount1":12.89646924,"usdt_amount1":23.5128,"usdt_amount2":34.3302,"_xvg":843.02432881}
var _bittrexArbitrage20 = {"BTC-XVG":{"strat1":0.01581,"strat2":0.015695},"USDT-BTC":{"strat1":7550,"strat2":7550},"USDT-XVG":{"strat1":126.73315001,"strat2":null}}  


module.exports = {
	market:"ws://localhost:18080/pair?=xxx",
	marketStream:_marketStream,
	userStream:_userStream,
	mockSettings1:settings1,
	mockSettings2:settings2,
	email:_email,
	https:_https,
	httpsError:_httpsError,
	httpsError2:_httpsError2,
	httpsBadData:_httpsBadData,
	httpsEmptyData:_httpsEmptyData,
	MongoClient:_MongoClient,
	MongoClient2:_MongoClient2,
	MongoClient3:_MongoClient3,
	MongoClient4:_MongoClient4,
	binanceMessages:_binanceMessages,
	binanceUserEvents: [userevent1,userevent2,userevent3],
	bittrexUserEvents: [bittrexUserEvent1,bittrexUserEvent2],
	bittrexBook:_book,
	bittrexBookSorted:_sorted,
	bittrexData:[_bittrexData,_bittrexMarketData],
	bittrexGenerateMarket1:_generateMarket1,
	bittrexGenerateStrategy1:_generateStrategy1,
	bittrexGenerateTransaction1:_generateTransaction1,
	bittrexGenerateStrategyValid1:_generateStrategyValid1,
	bittrexGenerateTransactionValid1:_generateTransactionValid1,
	bittrexGenerateMarket2:_generateMarket2,
	bittrexGenerateStrategy2:_generateStrategy2,
	bittrexGenerateTransaction2:_generateTransaction2,
	bittrexGenerateStrategyValid2:_generateStrategyValid2,
	bittrexGenerateTransactionValid2:_generateTransactionValid2,
	bittrexGenerateMarket3:_generateMarket3,
	bittrexGenerateStrategy3:_generateStrategy3,
	bittrexGenerateTransaction3:_generateTransaction3,
	bittrexGenerateStrategyValid3:_generateStrategyValid3,
	bittrexGenerateTransactionValid3:_generateTransactionValid3,
	bittrexSmallMarket:_generateSmallMarket,
	bittrexArbitrage1:[_bittrexArbitrage1,_bittrexArbitrage2,_bittrexArbitrage3,_bittrexArbitrage4],
	bittrexArbitrage2:[_bittrexArbitrage5,_bittrexArbitrage6,_bittrexArbitrage7,_bittrexArbitrage8],
	bittrexArbitrage3:[_bittrexArbitrage9,_bittrexArbitrage10,_bittrexArbitrage11,_bittrexArbitrage12],
	bittrexArbitrage4:[_bittrexArbitrage13,_bittrexArbitrage14,_bittrexArbitrage15,_bittrexArbitrage16],
	bittrexArbitrage5:[_bittrexArbitrage17,_bittrexArbitrage18,_bittrexArbitrage19,_bittrexArbitrage20],

}
