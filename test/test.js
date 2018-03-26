var CryptoBot = require('../c4d.js');
var Settings = require('../config.json');
var mock = require('./mock.js');
var assert = require('assert');
var WebSocket = require('ws');

//General Tests
describe('General Functions', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.https = mock.https;
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();
	bot.setupWebsocket().then(()=>{
		bot.wss.close();
	});	
	describe('#Connect To Database', function() {
		this.timeout(2100);
		return it('Should return a db connection with trade and balance collections', function(done) {
			return setTimeout(async function(){
				try{
					var x = await bot.DB.balance;
					var y = await bot.DB.trade;
					assert((x && y) !== undefined);
					done();
				}
				catch(e){
					done(e);
				}
			},150)
		});
	});
	
	describe('#Save to Database', function() {
		this.timeout(2000);
		return it('Should save and delete record from the database', function(done) {
			var date = new Date().getTime();
			return setTimeout( async function(){
				var x = await bot.saveDB("trade",{"UUID":date});
				var y = await bot.saveDB("trade",{},{method:"remove",query:{'UUID':date}});	
				try{
					assert(x && y,true);
					done();
				}
				catch(e){
					done(e);
				}
			},150)
		});
	});		
	
	describe('#Log', function() {
		return it('Should log a message', function() {
			var val = bot.log("Hello World");
			assert.equal(val,true);
		});
	});	
	
	describe('#Send Email', function() {
		return it('Should send an email message', async function() {
			bot.email = mock.email;
			var val = await bot.sendEmail("Hello World");
			assert(val);			
		});
	});
	
	describe('#Should send Slack Message', function() {
		return it('Should send a slack message', async function() {
			var val = await bot.slackMessage("Hello World");
			assert(val);
		});
	});
	
	describe('#Setup WebSocket', function() {
		return it('Should setup a web socket server and connect to it', function(done) {
			var client = new WebSocket("ws://127.0.0.1:7073");
			client.onopen = (connected)=>{
				assert(connected);
				client.terminate();
				done();
			}
			client.onerror = (e) =>{
				console.log("Error:",e.code);
				assert(false);
				done();
			}	
		});
	});	
	return
})

//Binance Tests
describe('Binance', function() {
	var binanceBot = new CryptoBot.bot(mock.mockSettings1);
	var yBot = new CryptoBot.bot(mock.mockSettings1);
	binanceBot.https = mock.https;
	binanceBot.binanceUserStreamString = "ws://127.0.0.1:8090/";
	new mock.userStream();
	
	describe('#Listen User Account', function() {
		it('Should return a connected websocket client',function(done) {
			var val = binanceBot.binanceUserStream('randomekey');
			setTimeout(()=>{
				assert(binanceBot.binanceUserStreamString.search(val.url.host) > -1);
				done();
			},400);
			
		});
	});	
	
	describe('#ApiKeys', function() {
		return it('should return true when the apikey and apisecret are present', function() {
			assert.equal(binanceBot.Settings.Binance.apikey.length > 0 && binanceBot.Settings.Binance.secretkey.length > 0, true);
		});
	});
    
	describe('#Account Data', function() {
		return it('Should return account data', async function() {
			var val = await binanceBot.binanceAccount();
			assert.equal(typeof val,"object")
		});
	});
	
	describe('#Arbitrage', function() {
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.Settings.Binance.pairs[0].prec = [6,2,2,2,6,5];
		var base = 'ltcbtc';
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 
		it('Should return false (illiquid Trade)',function() {
			testBot.binanceStrategy[base] = {
			  one:{
				 b: 8836,
			     b_amount: 0,
			     c: 18.38,
			     c_amount: 0,
			     a: 0.002077,
			     a_amount: 416.84 },
			  two: 
			   { b: 8841,
			     b_amount: 0.500171,
			     c: 18.379,
			     c_amount: 20.146,
			     a: 0.002073,
			     a_amount: 282 } 
			}
			testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert(!val)
		});
		it('Should return true',function() {
			testBot.binanceStrategy[base] = { 
			one:{ 
			     b: 8854,
			     b_amount: 0.02048,
			     c: 18.311,
			     c_amount: 25,
			     a: 0.00208,
			     a_amount: 277.84 },
			two: 
			   { b: 8843.99,
			     b_amount: 0.09,
			     c: 18.321,
			     c_amount: 4.102,
			     a: 0.002072,
			     a_amount: 66.05 } 
			}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert(val)
		});		
	});	
	
	describe('#Precision', function() {			
		return it('Should format precision data for ltc/btc/usdt pairs', function() {
			var zBot = new CryptoBot.bot(mock.mockSettings1);
			return setTimeout((done)=>{
				assert.deepEqual(zBot.Settings.Binance.pairs[0].prec,[6,2,2,2,6,5]);
			},1000);			
		});			
	});		
		
	describe('#Get Orders', function() {
		return it('Should return a list of open orders for btcusdt', async function() {
			var val = await binanceBot.binanceOpenOrders("BTCUSDT");
			assert(val instanceof Array)
		})
	});  	
	
	describe('#Listen Key', function() {
		return it('Should return a user listen key of 60 characters', async function() {
			var val = await binanceBot.binanceListenKey()
			assert.equal(val.length,60);				
		});
	});	

	describe('#Keep Alive', function() {
		return it('Should return an empty object', async function() {
			var val = await binanceBot.binanceListenKey();
			var val2 = await binanceBot.binanceListenBeat(val);
			assert.equal(JSON.stringify(val2),"{}");
		});
	});
	
	describe('#Reset', function() {
		return it('Should return true',function() {
			var bool = binanceBot.binanceReset('ltcbtc');
			assert(bool);
		});
	});	
	describe('#Save Orders', function() {
		var base = 'ltcbtc';
		binanceBot.MongoClient = mock.MongoClient;
		binanceBot.DB = binanceBot.database();
		it('Should return a setTimeout object when percentage < 100%',function() {
			var val = binanceBot.binanceSaveOrders([{clientOrderId:1},{clientOrderId:2},{clientOrderId:3}],base,99,{'ltc':1,'btc':2,'usdt':3},{'ltcbtc':'ltc'},{'ltcbtc':'btc'},{'ltcbtc':'usdt'});
			assert.equal(typeof val._idleStart,"number")
		});
		it('Should return a setTimeout object when percentage > 100%',function() {
			var val = binanceBot.binanceSaveOrders([{clientOrderId:1},{clientOrderId:2},{clientOrderId:3}],base,101,{'ltc':1,'btc':2,'usdt':3},{'ltcbtc':'ltc'},{'ltcbtc':'btc'},{'ltcbtc':'usdt'});
			assert.equal(typeof val._idleStart,"number")
		});		
	});

	describe('#Strategy', function() {
		var messages = mock.binanceMessages;
		yBot.binanceStrategy['ltcbtc'] = {one:{},two:{}}
		yBot.binanceDepth = {}
		yBot.binanceDepth['ltcbtc'] = {depth:{},strategy1:{'a%':{},'b%':{},'c%':{}},strategy2:{'a%':{},'b%':{},'c%':{}}}
		it('Should create a Binance Strategy using pair1',function() {
			yBot.binanceGenerateStrategy('ltcbtc',0,messages[0]);
			assert.equal(yBot.binanceStrategy['ltcbtc']['one']['a'],0.018881);
		});
			it('Should create a Binance Strategy using pair2',function() {
			yBot.binanceGenerateStrategy('ltcbtc',1,messages[1]);
			assert.equal(yBot.binanceStrategy['ltcbtc']['one']['b'],8500);
		});
		it('Should create a Binance Strategy using pair3',function() {
			yBot.binanceGenerateStrategy('ltcbtc',2,messages[2]);
			assert.equal(yBot.binanceStrategy['ltcbtc']['one']['c'],170);
		});
	});		
	
	describe('#Stream', function() {
		return it('Should return a connected websocket',function() {
			this.timeout(3000);
			var _mockMarket = new mock.marketStream();
			binanceBot.binanceMarket = mock.market;
			binanceBot.binanceMonitor([{pair1:"ltcbtc",pair2:"ltcusdt",pair3:"btcusdt"}]);
			assert.equal(binanceBot.binanceSocketConnections[0].readyState,0);
		});
	});		
	
	describe('#Place and Remove Order', function() {
		return it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
			var val = await binanceBot.binanceTrade("BTCUSDT","BUY",1.00,20.00,"GTC")
			var val2 = await binanceBot.binanceCancelOrder("BTCUSDT",val.orderId);
			assert.equal(val2.symbol,"BTCUSDT");
		});
	});	
  return
});

//~ //Bittrex Tests
describe('Bittrex', function() {
    var bot = new CryptoBot.bot(mock.mockSettings1);
    bot.https = mock.https;
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();
	describe('#ApiKeys', function() {
		return it('should return true when the apikey and apisecret are present', function() {
			assert.equal(bot.Settings.Bittrex.apikey.length > 0 && bot.Settings.Bittrex.secret.length > 0, true);
		});
	});
	
	describe('#Account Data', function() {
		return it('Should return account data', async function() {
			var val = await bot.bittrexAccount();
			assert.equal(typeof val,"object")
		});
	});
	
	describe('#Get Open Orders', function() {
		return it('Should return open orders list', async function() {
			var val = await bot.bittrexGetOrders();
			assert(val instanceof Array)
		});
	});	
	
	describe('#Complete Arbitrage', function() {
		return it('Should return a setTimeout object', async function() {
			var val = await bot.bittrexCompleteArbitrage({'randomid':false,'randomi2':false,'randomid3':false});
			assert.equal(typeof val._idleStart,"number");
			clearTimeout(val);
		});
	});	
	
	describe('#Market Depth', function() {
		return it('Should return an object with bid and ask price', async function() {
			var val = await bot.bittrexDepthPure('USDT-BTC');
			assert(val.buy && val.sell)
		});
	});		

	describe('#Place and Remove Order', function() {
		it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
			var val = await bot.bittrexTrade("buy","USDT-BTC",1,20.00);
			var val2 = await bot.bittrexCancelOrder(val);
			assert.equal(val2.success,true);
		});
	});	

	describe('#Completed Trades', function() {
		return it('Should return a settimeout object', function() {
			var val = bot.completedTrades(['xxxx']);
			assert.equal(Number(val._idleStart > 0),true);
			clearTimeout(val);
		});
	});

	describe('#Stream', function() {
		this.timeout(20500);
		return it('Should return signalr client', async function() {
			var val = await bot.bittrexPrepareStream();
			var val2 = await bot.bittrexStream(val[0],val[1]);
			setTimeout(()=>{
					try{
						
						bot.bittrexKill = true;
						if(bot.bittrexSocketConnection.close){
							assert(val2.headers.cookie);
							bot.bittrexSocketConnection.close();
						}
					}
					catch(e){
						console.log(e);
					}
				},15000);
			
		});
	});
	
	describe('#Swing Orders', function() {
		describe('#Reset a swing order',function() {
			it('Should return true', async function() {
				var val = await bot.bittrexResetSwingOrder();
				assert(val);
			});
		})

		describe('#Swing',function() {
			it('Should return 2', async function() {
				var val = await bot.bittrexSwing();
				assert.equal(val.status,2);
				clearTimeout(val.Timeout);
			});
			it('Should return 0', async function() {
				bot.vibrate = false;
				var val = await bot.bittrexSwing();
				assert.equal(val.status,0);
			});
		})
		
		describe('#Prepare Swing Order',function() {
			it('Should return a setTimeout Object > 0', async function() {
				var val = await bot.bittrexSwingOrder();
				assert.equal(typeof val._idleStart,"number");
				clearTimeout(val);
			});
		})

	});
});

//Utility Tests
describe('Utilities', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	describe('#BubbleSort', function() {
		return it('Should sort in decreasing order', function() {
			var array = [99.1,99.01,99.4,99.1,99.6,99.7,1,50,54];
			var sorted = bot.utilities.BubbleSort(array,99.5);
			assert.deepEqual([99.7,99.6,99.4,99.1,99.1,99.01],sorted);
		});
	});
	describe('#Solve > 100%', function() {
		return it('Should return the ideal solution when ratio > 100%', function() {
			var solution = bot.utilities.solveOver(0.0046,6,2,0.002185,8838,19.279);
			assert.equal(solution,0.004828);
		});
	});
	describe('#Solve < 100%', function() {
		return it('Should return the ideal solution when ratio < 100%', function() {
			var solution = bot.utilities.solveUnder(3,0.075332,11525,869.5);
			assert.equal(0.073,solution);
		});
	});	
});
