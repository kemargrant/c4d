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
var _bittrexData ={
	Buys:[
		{Type:0,Quantity:1,Rate:3.33},
		{Type:3,Quantity:1,Rate:4.44},
	],
	Sells:[
		{Type:0,Quantity:1,Rate:7.77},
		{Type:3,Quantity:1,Rate:55.5},
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
	bittrexSmallMarket:_generateSmallMarket
}
