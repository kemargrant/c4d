describe('Bittrex', function() {
	var CryptoBot = require('../c4d.js');
	var Settings = require('../config.json');
	var mock = require('./mock.js');
	var assert = require('assert');
	const zlib = require('zlib');
	const jsonic = require('jsonic');

	Math.random = function(){return 3}
    var bot = new CryptoBot.bot(mock.mockSettings1);
    bot.https = mock.https;
    bot.email = mock.email;
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();
	describe('#ApiKeys', function() {
		return it('should return true when the apikey and apisecret are present', function() {
			assert.equal(bot.Settings.Bittrex.apikey.length > 0 && bot.Settings.Bittrex.secret.length > 0, true);
		});
	});

	describe('#Api', function() {
		it('Should catch an Api Error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError2;
			return bot.bittrexAPI().catch((e)=>{
				assert.equal(e,"ERROR")
			});
		});
		it('Should catch error parsing API response', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsBadData;
			return bot.bittrexAPI().catch((e)=>{
				assert.equal(e.message,'Unexpected token x in JSON at position 0');
			});
		});		
	});
	
	describe('#Account Data', function() {
		it('Should return account data', function() {
			return bot.bittrexAccount().then((val)=>{
				assert.equal(typeof val,"object");
			});
		});
		it('Should catch error getting account data', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexAPI = function(){
				return new Promise((resolve,reject)=>{
					return resolve(null)
				})
			}
			return bot.bittrexAccount().catch((e)=>{
				assert.equal(e.message,"Error getting Bittrex account info")
			})
		});		
	});
	
	describe('#Get Open Orders', function() {
		it('Should return open orders list',function() {
			return bot.bittrexGetOrders().then((val)=>{
				assert(val instanceof Array);
			});
		});
		it('Should catch an error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError2;
			return bot.bittrexGetOrders().catch((e)=>{
				assert.equal(e,"ERROR")
			});
		});		
	});	
	

	describe('#Market Depth', function() {
		it('Should return an object with bid and ask price', function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.https;
			bot.bittrexDepthPure('USDT-BTC').then((val)=>{
				assert(val.buy && val.sell);
				done()
			})
		});
		it('Should return an error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError2;
			return bot.bittrexDepthPure('USDT-BTC').catch((e)=>{
				assert.equal(e,"ERROR");
			})
		});
		it('Should return an error (empty data)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsEmptyData;
			return bot.bittrexDepthPure('USDT-BTC').catch((e)=>{
				assert.equal(e,"Error:[]");
			})
		});	
		it('Should return an error (bad data)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsBadData;
			return bot.bittrexDepthPure('USDT-BTC').catch((e)=>{
				assert(!e);
			})
		});				
	});		

	describe('#Cancel Order', function() {
		it('Should return false (error)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError2
			return bot.bittrexCancelOrder().catch((e)=>{
				assert.equal(e,false);
			})
		});
		it('Should return false (empty data)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsEmptyData;
			return bot.bittrexCancelOrder().catch((e)=>{
				assert.equal(e,false);
			})
		});		
	});	

	describe('#Place and Remove Order', function() {
		it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
			var val = await bot.bittrexTrade("buy","USDT-BTC",1,20.00);
			var val2 = await bot.bittrexCancelOrder(val);
			assert.equal(val2.success,true);
		});
	});	

	describe('#Trades', function() {
		it('Should return an Error (API Error)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError2;
			return bot.bittrexTrade("buy","USDT-BTC",1,20.00).catch((e)=>{
				assert.equal(e,"ERROR");
			});
		});	
		it('Should return an Error - (Undefined Trade)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexAPI = function(){
				return new Promise((resolve,reject)=>{
					return resolve(false);
				});
			}
			return bot.bittrexTrade("buy","USDT-BTC",1,20.00).catch((e)=>{
				assert.equal(e.message,"Error Placing Order");
			});
		});			
	});
	
	describe('#Swing Orders', function() {
		describe('#Reset a swing order',function() {
			it('Should return true', function() {
				return bot.bittrexResetSwingOrder().then((val)=>{
					assert(val);
				});
			});
		})

		describe('#Swing',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.email = mock.email;
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			it('Should return 2', function() {
				return bot.bittrexSwing().then((val)=>{
					clearTimeout(val.Timeout);
					assert.equal(val.status,2);
				});
			});
			it('Should return 0', function() {
				bot.vibrate = false;
				var val = bot.bittrexSwing()
				assert.equal(val.status,0);
			});
			it('Should return 2', async function() {
				bot.vibrate = true;
				bot.swingTrade = {filled:false,order:{OrderUuid:"1234"}}
				var val = await bot.bittrexSwing();
				clearTimeout(val.Timeout)
				assert.equal(val.status,2);
			});			
		})
		
	describe('#Prepare Swing Order',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.email = mock.email;
			bot.https = mock.https;
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
		it('Should return a setTimeout Object > 0 (Unable to find Order)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexAPI = function(){return new Promise((resolve,reject)=>{
				return resolve(false);
			})}
			return bot.bittrexSwingOrder("order-does-not-exist").then((val)=>{
				clearTimeout(val);
				assert.equal(typeof val._idleStart,"number");
			});
		});
		it('Should return a setTimeout Object > 0 (Order is filled)', async function() {
			bot.bittrexAPI = function(){return new Promise((resolve,reject)=>{
				return resolve({IsOpen:false});
			})}
			var val = await bot.bittrexSwingOrder(1234);
			clearTimeout(val);
			assert.equal(typeof val._idleStart,"number");
		});
		it('Should return a setTimeout Object > 0 (Order is not filled)', async function() {
			bot.bittrexAPI = ()=>{return new Promise((resolve,reject)=>{
				resolve({IsOpen:true});
			})}
			var val = await bot.bittrexSwingOrder(1234);
			clearTimeout(val);
			assert.equal(typeof val._idleStart,"number");
			
		});
		it('Should return a setTimeout Object > 0 (Api Error)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexAPI = function(){return new Promise((resolve,reject)=>{
				return reject(new Error("API Error"));
			})}
			return bot.bittrexSwingOrder(1234).then((val)=>{
				clearTimeout(val);
				assert.equal(typeof val._idleStart,"number");
			});
			
		});		
	})
	describe('#Create Bittrex swing order',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.https;
			bot.email = mock.email;
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
		it('Should return a setTimeout Object > 0 (API Error)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexTrade = function(){return new Promise((resolve,reject)=>{
				return reject(false);
			})}
			return bot.bittrexCreateSwingOrder("BUY","BTC-LTC",500,10).then((val)=>{
				clearTimeout(val.Timeout);
				assert.equal(typeof val.Timeout._idleStart,"number");
			});
		});	
		it('Should return a setTimeout Object > 0 (Error placing order)', async function() {
			bot.bittrexTrade = function(){return new Promise((resolve,reject)=>{
				return resolve(false);
			})}
			var val = await bot.bittrexCreateSwingOrder("BUY","BTC-LTC",500,10);
			clearTimeout(val.Timeout);
			assert.equal(typeof val.Timeout._idleStart,"number");
			
		});	
		it('Should return a setTimeout Object > 0 (Order Complete)', async function() {
			bot.bittrexTrade = function(){return new Promise((resolve,reject)=>{
				return resolve({uuid:1234});
			})}
			var val = await bot.bittrexCreateSwingOrder("BUY","BTC-LTC",500,10);
			clearTimeout(val.Timeout);
			assert(val.Timeout instanceof Promise);
		});		
	})

	describe('#Supervise Bittrex swing order',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.https;
			bot.email = mock.email;
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
		it('Should return a object with a status of 2', function() {
			var val = bot.bittrexSwingSupervisor({filled:false,order:{uuid:1234}});
			clearTimeout(val.Timeout);
			assert.equal(val.status,2);
		});			
		it('Should return a object with a status of 2', async function() {
			var val = await bot.bittrexSwingSupervisor({filled:true,order:{uuid:1234,Type:"LIMIT_SELL"}});
			clearTimeout(val.Timeout);
			assert.equal(val.status,2);
		});	
		it('Should return a object with a status of 1', async function() {
			var val = await bot.bittrexSwingSupervisor({filled:true,order:{uuid:1234,Type:"LIMIT_SELL",Limit:1}});
			bot.swingPercentage = 0.05;
			bot.bittrexDepthPure = function(){
				return new Promise((resolve,reject)=>{
					resolve({sell:0.5});
				});
			}
			clearTimeout(val.Timeout);
			assert.equal(val.status,1);
		});	
		it('Should return a object with a status of 2', async function() {
			var val = await bot.bittrexSwingSupervisor({filled:true,order:{uuid:1234,Type:"LIMIT_BUY",Limit:1}});
			clearTimeout(val.Timeout);
			assert.equal(val.status,2);
		});	
		it('Should return a object with a status of 1', async function() {
			bot.swingPercentage = 0.05;
			bot.bittrexDepthPure = function(){
				return new Promise((resolve,reject)=>{
					resolve({buy:2.5});
				});
			}		
			var val = await bot.bittrexSwingSupervisor({filled:true,order:{uuid:1234,Type:"LIMIT_BUY",Limit:0.9}});	
			clearTimeout(val.Timeout);
			assert.equal(val.status,1);
		});	
		it('Should return a object with a status of 2', async function() {
			bot.swingPercentage = 0.05;
			bot.bittrexDepthPure = function(){
				return new Promise((resolve,reject)=>{
					reject({buy:2.5});
				});
			}		
			var val = await bot.bittrexSwingSupervisor({filled:true,order:{uuid:1234,Type:"LIMIT_BUY",Limit:0.9}});	
			clearTimeout(val.Timeout);
			assert.equal(val.status,2);
		});	
		it('Should return a object with a status of 2 (Undefined Order - Low account balance) ', function() {	
			bot.balance.btc = 0;
			bot.Settings.Swing.amount = 1;
			var val = bot.bittrexSwingSupervisor(undefined);
			clearTimeout(val.Timeout);
			assert.equal(val.status,2);
		});		
		it('Should return a object with a status of 2 (Undefined Order - Low account balance) ', async function() {	
			bot.balance.btc = 2;
			bot.Settings.Swing.amount = 1;
			bot.bittrexDepthPure = function(){
				return new Promise((resolve,reject)=>{
					reject({buy:2.5});
				});
			}	
			var val = await bot.bittrexSwingSupervisor(undefined);
			clearTimeout(val.Timeout);
			assert.equal(val.status,2);
		});		
		it('Should return a object with a status of 2 (Undefined Order - Low account balance) ', async function() {	
			bot.balance.btc = 2;
			bot.Settings.Swing.amount = 1;
			bot.bittrexDepthPure = function(){
				return new Promise((resolve,reject)=>{
					resolve({buy:2.5});
				});
			}	
			var val = await bot.bittrexSwingSupervisor(undefined);
			assert.equal(val.status,1);
		});													
	})

	});
	describe('#UpdateBittrexSocketStatus', function() {
		it('Should update Bittrex socket status to false', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			assert.equal(bot.updateBittrexSocketStatus("",false),false);
		});
	});	
	describe('#BittrexStream', function() {
		it('Should return a signal-r client',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var result = bot.bittrexStream()
			assert(result.end);
			bot.bittrexKill = true;
			result.end();
		});
		it('Should update bittrexSocketStatus (connectFailed)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = true;
			var client = bot.bittrexStream();
			client.serviceHandlers.connectFailed("test failed");
			assert.equal(bot.bittrexSocketStatus,false);
			bot.bittrexKill = true;
			client.end();
			done()
		});			
		it('Should update bittrexSocketStatus (connected)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = false;
			var _client = bot.bittrexStream();
			_client.serviceHandlers.bound();
			var oldTimeout = setTimeout;
			setTimeout = function(func,time){
				oldTimeout(func,10)
			}
			var ans = _client.serviceHandlers.connected({close:function(){}});
			assert.equal(bot.bittrexSocketStatus,true);
			setTimeout = oldTimeout;
			bot.bittrexKill = true;
			_client.end();
			done()
		});			
		it('Should update bittrexSocketStatus (disconnected)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = true;
			bot.bittrexKill = true;
			var client = bot.bittrexStream();
			client.serviceHandlers.disconnected();
			client.serviceHandlers.reconnecting();
			assert.equal(bot.bittrexSocketStatus,false);
			bot.bittrexKill = true;
			client.end();
			done()
		});	
		it('Should update bittrexSocketStatus (onerror)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = true;
			var client = bot.bittrexStream();
			client.serviceHandlers.onerror();
			assert.equal(bot.bittrexSocketStatus,false);
			bot.bittrexKill = true;
			client.end();
			done()
		});	
		it('Should update bittrexSocketStatus (bindingerror)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = true;
			var client = bot.bittrexStream();
			client.serviceHandlers.bindingError();
			assert.equal(bot.bittrexSocketStatus,false);
			bot.bittrexKill = true;
			client.end();
			done()
		});
		it('Should update bittrexSocketStatus (connectionLost)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = true;
			var client = bot.bittrexStream();
			client.serviceHandlers.connectionLost();
			assert.equal(bot.bittrexSocketStatus,false);
			bot.bittrexKill = true;
			client.end();
			done()
		});		
		it('Should test bittrex client message received (false)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexSocketStatus = true;
			var client = bot.bittrexStream();
			var val = client.serviceHandlers.messageReceived({utf8:{}});
			assert.equal(val,false);
			bot.bittrexKill = true;
			client.end();
			done()
		});		

	it('Should test bittrex client message received (Exchange Delta)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.sendEmail = function(){}
			[bot.balance.btc ,bot.balance.xvg,bot.balance.usdt] = [1,5000,3000]
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexSocketStatus = true;
			var message = {}
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy = mock.bittrexArbitrage1[3]
			var e1 = "xvg"
			var u2 = "usdt"
			var b3 = "btc"		
			message.utf8Data = JSON.stringify({"M": "USDT-BTC",	"N": 6136,"Z": [{"TY": 0,"R": 9101.28710053,"Q": 0.68329490	},{"TY": 1,"R": 8552.00000000,"Q": 0.0}],"S": [],"f": []})
			let buffer = Buffer.from(message.utf8Data,'utf8');
			message = {utf8Data:JSON.stringify({M:[{M:'uE',A:[zlib.deflateRawSync(buffer).toString("base64")]}]})}
			var client = bot.bittrexStream();
			var trades = client.serviceHandlers.messageReceived(message);
			var validTrades = [["sell","USDT-BTC",0.01,7002],["buy","USDT-XVG","1042.96912612",0.0668],["sell","BTC-XVG","1042.96912612",0.00000946]]
			assert.equal(trades,false);
			bot.bittrexKill = true;
			client.end()
			done();
		});			

		it('Should test bittrex client message received (Parse User Event)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.sendEmail = function(){}
			[bot.balance.btc ,bot.balance.xvg,bot.balance.usdt] = [1,5000,3000]
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexSocketStatus = true;
			var message = {}
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy = mock.bittrexArbitrage1[3]
			var e1 = "xvg"
			var u2 = "usdt"
			var b3 = "btc"		
			message.utf8Data = JSON.stringify({"M": "USDT-BTC",	"N": 6136,"Z": [{"TY": 0,"R": 9101.28710053,"Q": 0.68329490	},{"TY": 1,"R": 8552.00000000,"Q": 0.0}],"S": [],"f": []})
			let buffer = Buffer.from(message.utf8Data,'utf8');
			message = {utf8Data:JSON.stringify({M:[{M:'uO',A:[zlib.deflateRawSync(buffer).toString("base64")]}]})}
			var client = bot.bittrexStream();
			var val = client.serviceHandlers.messageReceived(message);
			assert.equal(val,true);
			bot.bittrexKill = true;
			client.end();
			done();
		});

		it('Should test bittrex client message received (Error parsing data)',function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			[bot.balance.btc ,bot.balance.xvg,bot.balance.usdt] = [1,5000,3000]
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexSocketStatus = true;
			var message = {}
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy = mock.bittrexArbitrage1[3]
			var e1 = "xvg"
			var u2 = "usdt"
			var b3 = "btc"		
			message.utf8Data = '{M: "USDT-BTC","N": 6136,"Z": [{"TY": 0,"R": 9101.28710053,"Q": 0.68329490	},{"TY": 1,"R": 8552.00000000,"Q": 0.0}],"S": [],"f": []}'
			let buffer = Buffer.from(message.utf8Data,'utf8');
			message = {utf8Data:JSON.stringify({M:[{M:'uE',A:[zlib.deflateRawSync(buffer).toString("base64")]}]})}
			var client = bot.bittrexStream();
			var trades = client.serviceHandlers.messageReceived(message);
			assert.equal(trades,false);
			bot.bittrexKill = true;
			client.end();
			done();
		});							
										
	});
	//~ /*
	 //~ * 
	 //~ * Arbitrage Helpers
	 //~ * 
	 //~ * */
	describe('#BittrexReset', function() {
		it('Should reset Bittrex Settings',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.broadcastMessage = function(){}
			bot.bittrexInProcess = true
			var reset = bot.bittrexReset("Testing bittrexReset Function",0);
			assert(!bot.bittrexInProcess && bot.bittrexProcessTime === 0 && bot.bittrexTradesMade === 0);
		});
	});

	describe('#BittrexArbitrage', function() {
		var bot = new CryptoBot.bot(mock.mockSettings2);
		bot.email = mock.email;
		bot.https = mock.https;
		bot.viewBittrexBook = true;
		[bot.balance.btc ,bot.balance.xvg,bot.balance.usdt] = [1,5000,3000]
		bot.p1 = 0.01;
		bot.p2 = 1;
		it('Should return valid trades (converting percentage to < 100%)',function() {
			var message = mock.bittrexArbitrage1[0]
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy =mock.bittrexArbitrage1[3]
			var e1 = "xvg"
			var u2 = "usdt"
			var b3 = "btc"		
			//convert to compressed formatting
			message = JSON.parse(message.utf8Data);
			message = message.M[0].A[0]
			bot.bittrexCreateBook(message,localMarket);
			bot.bittrexGenerateStrategy(message.M,localMarket,strategy,Transactions,e1,u2,b3)
			//
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc")[0]
			var validTrades = [["sell","USDT-BTC",0.01,7002],["buy","USDT-XVG","1042.96912612",0.0668],["sell","BTC-XVG","1042.96912612",0.00000946]]
			assert.equal(JSON.stringify(validTrades),JSON.stringify(trades));
			
		});
		it('Should return valid trades (< 100%)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings2);
			bot.email = mock.email;
			bot.https = mock.https;
			bot.viewBittrexBook = true;
			[bot.balance.btc ,bot.balance.xvg,bot.balance.usdt] = [2,7000,9000]
			bot.p1 = 0.01;
			bot.p2 = 0.1;
			bot.saneTrades = false;
			bot.liquidTrades = false;
			var message = mock.bittrexArbitrage5[0]
			var localMarket = mock.bittrexArbitrage5[1]
			var Transactions = mock.bittrexArbitrage5[2]
			var strategy =mock.bittrexArbitrage5[3]
			var e1 = "xvg"
			var u2 = "usdt"
			var b3 = "btc"
			//
			message = JSON.parse(message.utf8Data);
			message = message.M[0].A[0]
			bot.bittrexCreateBook(message,localMarket);
			bot.bittrexGenerateStrategy(message.M,localMarket,strategy,Transactions,e1,u2,b3)
			//
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc")[0]
			var validTrades = [["sell","USDT-XVG",70,126.73315001],["buy","USDT-BTC",1.16914163,7550],["buy","BTC-XVG","73.76462877",0.01581]]
			assert.equal(JSON.stringify(validTrades),JSON.stringify(trades));
			
		});		
		it('Should return valid trades (> 100%)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings2);
			[bot.balance.btc ,bot.balance.xvg,bot.balance.usdt] = [1,5000,3000]
			var message = mock.bittrexArbitrage4[0]
			var localMarket = mock.bittrexArbitrage4[1]
			bot.Transactions = mock.bittrexArbitrage4[2]
			var strategy =mock.bittrexArbitrage4[3]
			var e1 = "xvg"
			var u2 = "usdt"
			var b3 = "btc"
			bot.p1 = 1
			bot.p2 = 0.0046
			//
			message = JSON.parse(message.utf8Data);
			message = message.M[0].A[0]
			bot.bittrexCreateBook(message,localMarket);
			bot.bittrexGenerateStrategy(message.M,localMarket,strategy,bot.Transactions,e1,u2,b3)
			//
			var trades = bot.bittrexArbitrage(localMarket,bot.Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc")[0]
			var validTrades = [["sell","USDT-BTC",0.0046,6958],["buy","USDT-XVG","486.88981303",0.06540898],["sell","BTC-XVG","486.88981303",0.00000948]]
			assert.equal(JSON.stringify(validTrades),JSON.stringify(trades));
			
		});		
		it('Should return an array with length < 3 (Illiquid Trade)',function() {
			var message = mock.bittrexArbitrage1[0]
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy =mock.bittrexArbitrage1[3]
			bot.p1 =1
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc")
			assert(trades.length < 3);
			
		});
		it('Should return an array with length < 3 (In processs)',function() {
			var message = mock.bittrexArbitrage1[0]
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy =mock.bittrexArbitrage1[3]
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc");
			assert(trades.length < 3);
			
		});			
		it('Should return an array with length < 3 (try/catch)',function() {
			var message = mock.bittrexArbitrage1[0]
			var localMarket = mock.bittrexArbitrage1[1]
			var Transactions = mock.bittrexArbitrage1[2]
			var strategy =mock.bittrexArbitrage1[3]
			bot.bittrexInProcess = false;
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc");
			assert(trades.length < 3);
		});		
		it('Should return an array with length < 3 (Percentage != Number)',function() {
			var message = mock.bittrexArbitrage2[0]
			var localMarket = mock.bittrexArbitrage2[1]
			var Transactions = mock.bittrexArbitrage2[2]
			var strategy =mock.bittrexArbitrage2[3]
			bot.bittrexInProcess = false;
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc");
			assert(trades.length < 3);
		});				
		it('Should return an array with length < 3 (Failed to generate a strategy)',function() {
			var message = mock.bittrexArbitrage3[0]
			var localMarket = mock.bittrexArbitrage3[1]
			var Transactions = mock.bittrexArbitrage3[2]
			var strategy =mock.bittrexArbitrage3[3]
			bot.bittrexInProcess = false;
			var trades = bot.bittrexArbitrage(localMarket,Transactions,strategy,"BTC-XVG","USDT-BTC","USDT-XVG","xvg","_xvg","usdt","btc","_btc");
			assert(trades.length < 3);
		});				
	});

	describe('#BittrexStartArbitrage', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		bot.email = mock.email;
		bot.https = mock.https;
		it('Should return false',function() {
			var x = bot.bittrexStartArbitrage([],{});
			assert(!x);
		});
		it('Should return a promise',function() {
			var x = bot.bittrexStartArbitrage([[1,2,3],[0,0,0,0,0,0]],{});
			assert(x instanceof Promise);;
		});
		it('Should resolve and clear local order book',function() {
			bot.niceOrderChain = function(){
				return{
					chain:function(){
						return new Promise((resolve,reject)=>{
							resolve(true);
						})
					}
				}
			}
			var localMarket = {"BTC-LTC":{Bids:true,Asks:true}}
			return bot.bittrexStartArbitrage([[1,2,3],[0,0,0,0,0,0]],localMarket).then((val)=>{
				assert(val)
			})
		});		
	});
	
	describe('#Bittrex Save Orders', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		bot.MongoClient = mock.MongoClient;
		bot.DB = bot.database();
		it('Should return a setTimeout object',function() {
			var val = bot.bittrexSaveOrders(99,{},1,'ltc','_ltc','btc','BTC-LTC');
			clearTimeout(val);
			assert.equal(typeof val._idleStart,"number");
		});		
	});
	
	describe('#Bittrex Check Trades', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		it('Should return true',function() {
			assert(bot.bittrexCheckTrade());
		});

		it('Should return false',function() {
			bot.bittrexInProcess = true;
			bot.bittrexProcessTime= new Date().getTime() - 490009;
			assert(!bot.bittrexCheckTrade());
		});
	});	
	
	describe('#Subscribe to market', function() {
		it('Should return return true', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			client = {
				call:function(){
					return {
						done:function(func){
							return func(null,true)
						}
					}
				}
			}
			var solution = Promise.resolve(bot.bittrexSubscribe(client,[bot.Settings.Config.pair1,bot.Settings.Config.pair2,bot.Settings.Config.pair3]));
			assert(solution);
		});
		it('Should return return true (Fail to authenticate)', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			client = {
				call:function(x,y){
					var err = null;
					if(y === "Authenticate"){
						err = true;
					}
					return {
						done:function(func){
							return func(err,true)
						}
					}
				}
			}
			var solution = Promise.resolve(bot.bittrexSubscribe(client,[bot.Settings.Config.pair1,bot.Settings.Config.pair2,bot.Settings.Config.pair3]));
			assert(solution);
		});		
	});	
	
	describe('#Update Market', function() {
		it('Should update local order book',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var update = bot.bittrexUpdateMarket('BTC-LTC',mock.bittrexData[0],mock.bittrexData[1]);
			var updated = JSON.stringify({ 'BTC-LTC': { Bids: { '3.33': 1 }, Asks: { '7.77': 1 } } })
			assert.equal(JSON.stringify(update),updated);
		});
	});		
	describe('#SortBook', function() {
		it('Should sort Bittrex order book',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var book = JSON.stringify(bot.bittrexSortBook(mock.bittrexBook));
			var sorted = JSON.stringify(mock.bittrexBookSorted);
			assert.equal(book,sorted);
		});
	});	 
	describe('#Bittrex Conditions', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		it('Should return false NAN',function() {
			var trade = bot.bittrexCheckConditions({btc:undefined,ltc:5,usdt:5},50,'ltc','btc','usdt','Should return false Insane Trade(<100)')
			assert.equal(trade,false);
		});		
		it('Should return false Insane Trade(<100)',function() {
			var trade = bot.bittrexCheckConditions({btc:5,ltc:5,usdt:5},50,'ltc','btc','usdt','Should return false Insane Trade(<100)')
			assert.equal(trade,false);
		});
		it('Should return false Insane Trade(<100)',function() {
			var trade = bot.bittrexCheckConditions({btc:5,ltc:5,usdt:5},150,'ltc','btc','usdt','Should return false Insane Trade(>100)')
			assert.equal(trade,false);
		});
		it('Should return false illiquid book (<100)',function() {
			var trade = bot.bittrexCheckConditions({btc_amount1:100,ltc_amount1:100,usdt_amount1:1,btc:5,ltc:5,usdt:5},98.9,'ltc','btc','usdt','Should return false illiquid book (<100)')
			assert.equal(trade,false);
		});
		it('Should return false illiquid book (>100)',function() {
			var trade = bot.bittrexCheckConditions({btc_amount2:100,ltc_amount2:100,usdt_amount2:1,btc:5,ltc:5,usdt:5},101,'ltc','btc','usdt','Should return false illiquid book (>100)')
			assert.equal(trade,false);
		});
		it('Should return false low wallet balance',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.balance.btc = 0;
			bot.balance.ltc = 200;
			bot.balance.usdt = 200;
			var trade = bot.bittrexCheckConditions({btc_amount2:100,ltc_amount2:100,usdt_amount2:100,btc:5,ltc:5,usdt:5},101,'ltc','btc','usdt','Should return false low wallet balance')
			assert.equal(trade,false);
		});
		it('Should return false minimum btc amount not met',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.balance.btc = 100;
			bot.balance.ltc = 200;
			bot.balance.usdt = 200;
			bot.Settings.Bittrex.minimum = 30
			var trade = bot.bittrexCheckConditions({btc_amount2:100,ltc_amount2:100,usdt_amount2:100,btc:5,ltc:5,usdt:5},101,'ltc','btc','usdt','Should return false minimum btc amount not met')
			assert.equal(trade,false);
		});
		it('Should return true, all conditions met',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.balance.btc = 100;
			bot.balance.ltc = 200;
			bot.balance.usdt = 200;
			bot.Settings.Bittrex.minimum = 1
			var trade = bot.bittrexCheckConditions({btc_amount2:100,ltc_amount2:100,usdt_amount2:100,btc:5,ltc:5,usdt:5},101,'ltc','btc','usdt','Should return true')
			assert.equal(trade,true);
		});
	});	 
	describe('#Format Message', function() {
		it('Should format Transactions object and return a message (>100)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.balance.btc = 0.00202041
			bot.p2 = 1
			var f_message = bot.bittrexFormatMessage('btc','usdt','xxx','_btc',0.10062088,8109.9999999,807.4,101.070,bot.Transactions);
			var message = "Bittrex Bot:101.070%\n0.00202041btc => 16.34456129usdt @8109.9999999\n16.34456129usdt => 0.02019284xxx @807.4\n0.02019284xxx => 0.00202674btc @0.10062088"
			assert.equal(f_message,message);
		});
		it('Should format Transactions object and return a message (<100)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.balance.xxx = 0.02087774
			bot.p1 = 1
			var f_message = bot.bittrexFormatMessage('xxx','usdt','btc','_xxx',0.09649,889.1,9135,99.138,bot.Transactions);
			var message = "Bittrex Bot:99.138%\n0.02087774xxx => 18.51599264usdt @889.1\n18.51599264usdt => 0.00202186btc @9135\n0.00202186btc => 0.02090172xxx @0.09649";
			assert.equal(f_message,message);
		});		
	});	
	describe('#Generate Strategy pair 1', function() {
		it('Should return false',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var valid = bot.bittrexGenerateStrategy('BTC-LTC',null,mock.bittrexGenerateStrategy1,mock.bittrexGenerateTransaction1,'ltc','usdt','btc');
			assert(!valid);
		});
		it('Generate a valid strategy for pair 1',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var computed = bot.bittrexGenerateStrategy('BTC-LTC',mock.bittrexGenerateMarket1,mock.bittrexGenerateStrategy1,mock.bittrexGenerateTransaction1,'ltc','usdt','btc');
			var valid = bot.bittrexGenerateStrategyValid1;
			assert(computed,valid);
		});
		it('Should output correct Transaction Amount for pair 1',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexGenerateStrategy('BTC-LTC',mock.bittrexGenerateMarket1,mock.bittrexGenerateStrategy1,mock.bittrexGenerateTransaction1,'ltc','usdt','btc');
			var computed = bot.Transactions;
			var valid = mock.bittrexGenerateTransactionValid1;
			assert(computed,valid);
		});
	});		
	describe('#Generate Strategy pair 2', function() {
		it('Generate a valid strategy for pair 2',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var computed = bot.bittrexGenerateStrategy('USDT-LTC',mock.bittrexGenerateMarket2,mock.bittrexGenerateStrategy2,mock.bittrexGenerateTransaction2,'ltc','usdt','btc');
			var valid = bot.bittrexGenerateStrategyValid2;
			assert(computed,valid);
		});
		it('Should output correct Transaction Amount for pair 2',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexGenerateStrategy('USDT-LTC',mock.bittrexGenerateMarket2,mock.bittrexGenerateStrategy2,mock.bittrexGenerateTransaction2,'ltc','usdt','btc');
			var computed = bot.Transactions;
			var valid = mock.bittrexGenerateTransactionValid2;
			assert(computed,valid);
		});
	});	
	describe('#Generate Strategy pair 3', function() {
		it('Generate a valid strategy for pair 3',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var computed = bot.bittrexGenerateStrategy('USDT-BTC',mock.bittrexGenerateMarket3,mock.bittrexGenerateStrategy3,mock.bittrexGenerateTransaction3,'ltc','usdt','btc');
			var valid = bot.bittrexGenerateStrategyValid3;
			assert(computed,valid);
		});
		it('Should output correct Transaction Amount for pair 3',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexGenerateStrategy('USDT-BTC',mock.bittrexGenerateMarket3,mock.bittrexGenerateStrategy3,mock.bittrexGenerateTransaction3,'ltc','usdt','btc');
			var computed = bot.Transactions;
			var valid = mock.bittrexGenerateTransactionValid3;
			assert(computed,valid);
		});
	});	
	describe('#Generate Strategy - Ordered Book', function() {
		it('Validate book for pair 3',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var valid = bot.bittrexGenerateStrategy('USDT-LTC',mock.bittrexSmallMarket,mock.bittrexGenerateStrategy3,mock.bittrexGenerateTransaction3,'ltc','usdt','btc');
			assert(!valid);
		});
		it('Validate book for pair 2',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var valid = bot.bittrexGenerateStrategy('USDT-BTC',mock.bittrexSmallMarket,mock.bittrexGenerateStrategy3,mock.bittrexGenerateTransaction3,'ltc','usdt','btc');
			assert(!valid);
		});
		it('Validate book for pair 1',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var valid = bot.bittrexGenerateStrategy('BTC-LTC',mock.bittrexSmallMarket,mock.bittrexGenerateStrategy3,mock.bittrexGenerateTransaction3,'ltc','usdt','btc');
			assert(!valid);
		});				
	});				
	describe('#ParseUserEvent - account delta', function() {
		it('Should return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			assert(bot.bittrexParseUserEvent({d:{}}));
		});
	});	
	describe('#ParseUserEvent - Error', function() {
		it('Should return false',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			assert(!bot.bittrexParseUserEvent(undefined));
		});
	});	
	describe('#ParseUserEvent - execution', function() {
		it('Should add new order in database and return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexInProcess = {}
			bot.bittrexInProcess = true;
			bot.bittrexOrders = []
			bot.bittrexProcessTime = 1
			bot.bittrexTradesMade = 0
			var addOrder = mock.bittrexUserEvents[0];
			assert(bot.bittrexParseUserEvent(addOrder));
		});
		it('Should update the status of the order in the database and return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexInProcess = {}
			bot.bittrexInProcess = true;
			bot.bittrexOrders =["fd15d-9eb60"]
			bot.bittrexProcessTime = 1
			bot.bittrexTradesMade = 3
			var updateOrder = mock.bittrexUserEvents[1];
			assert(bot.bittrexParseUserEvent(updateOrder));
		});		
		it('Should update the status of the order in the database and return true (order in position 2)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexInProcess = {}
			bot.bittrexInProcess = true;
			bot.bittrexOrders =["","fd15d-9eb60",""]
			bot.bittrexProcessTime = 1
			bot.bittrexTradesMade = 3
			var updateOrder = mock.bittrexUserEvents[1];
			assert(bot.bittrexParseUserEvent(updateOrder));
		});
		it('Should update the status of the order in the database and return true (order in position 3)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.bittrexInProcess = {}
			bot.bittrexInProcess = true;
			bot.bittrexOrders =["","","fd15d-9eb60"]
			bot.bittrexProcessTime = 1
			bot.bittrexTradesMade = 3
			var updateOrder = mock.bittrexUserEvents[1];
			assert(bot.bittrexParseUserEvent(updateOrder));
		});						
					
	});		

});


	
