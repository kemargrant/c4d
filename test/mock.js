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
  "b": [              
    [
      "0.018882",       
      "10",
      []              
    ]
  ],
  "a": [              
    [
      "0.018881",       
      "100",         
      []              
    ]
  ]
},
{
  "e": "depthUpdate", 
  "E": 123456789,     
  "s": "BTCUSDT",      
  "U": 157,           
  "u": 160,           
  "b": [              
    [
      "9000",       
      "10",
      []              
    ]
  ],
  "a": [              
    [
      "8500",       
      "100",         
      []              
    ]
  ]
},
{
  "e": "depthUpdate", 
  "E": 123456789,     
  "s": "LTCUSDT",      
  "U": 157,           
  "u": 160,           
  "b": [              
    [
      "170",       
      "10",
      []              
    ]
  ],
  "a": [              
    [
      "164",       
      "100",         
      []              
    ]
  ]
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
		events.emit("data",JSON.stringify(data));
		return events.emit("end");
	}
}
var _httpsError = {
	request:function(options,func){
		const events = new MyEmitter();
		var data = {};
		func(events)
		const error = Error('Unexpected Error');
		return events.emit("error",error);
	}
}
var _httpsBadData = {
	request:function(options,func){
		const events = new MyEmitter();
		func(events)
		events.emit("data","x}");
		return events.emit("end");;
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

module.exports = {
	market:"ws://localhost:18080/pair?=xxx",
	marketStream:_marketStream,
	userStream:_userStream,
	mockSettings1:settings1,
	email:_email,
	https:_https,
	MongoClient:_MongoClient,
	binanceMessages:_binanceMessages,
	binanceUserEvents: [userevent1,userevent2,userevent3],
	bittrexBook:_book,
	bittrexBookSorted:_sorted
}
