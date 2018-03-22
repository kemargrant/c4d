var rhttps = require('https');

var _https = {
	request:function(options,func){
		const EventEmitter = require('events');
		class MyEmitter extends EventEmitter {}
		const events = new MyEmitter();
		var data = {};
		if(options.path.search("/api/v1/account") > -1 && options.method === "GET"){
			data = {balances:[{asset:'BTC',free:'0',locked:'0'},{asset:'LTC',free:'0',locked:'0'},{asset:'ETH',free:'0',locked:'0'}]}
		}
		else if(options.path.search("order?") > -1 && options.method === "POST"){
			data = {orderId:'111222333'};
		}
		else if(options.path === "/api/v1/userDataStream"){
			data = {listenKey:"pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sv8a65a1"}
		}
		else if(options.method === "DELETE"){
			data = {symbol:'BTCUSDT'};
		}		
		else{
			return rhttps.request(options,(res)=>{
				return func(res);
			});			
		}
		func(events)
		events.emit("data",JSON.stringify(data));
		return events.emit("end");
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
			"lowerLimit1":100.2,
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
			"pair1":"BTC-XXX",
			"pair2":"USDT-BTC",
			"pair3":"USDT-XXX",		
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
			"use":false,
			"usr":"Email_Account_Address",
			"pwd":"Email_Password"		
		},
	"MongoDB":
		{
			"db_string":"mongodb://xxxx:xxxxxxxx@ip_address:port/database",
			"connect":false
		},	
	"Slack":
		{
			"channel":"Slack_Channel",
			"hook":"Slack_Webhook",
			"use":false,
			"usr":"Slack_user_to_notify"
		},
	"Swing":
		{
			"amount":0.001,
			"pair":"BTC-XXX",
			"rate":60000,
			"swing":0.02,
			"swingTrade":false
		}		
}

module.exports = {
	mockSettings1:settings1,
	https:_https
}
