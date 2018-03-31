var CryptoBot = require('../c4d.js');
var Settings = require('../config.json');
var mock = require('./mock.js');
var assert = require('assert');
var WebSocket = require('ws');

describe('#Arbitrage', function() {

	describe('##Illiquid Trade', function() {	
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.email = mock.email;
		testBot.binancePrec[base] = [6,2,2,2,6,5];
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 
		it('Should return false (Illiquid Trade)',function() {
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
			testBot.liquidTradesBinance[base] = true;
			testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}
			testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert.equal(false,val)
		});
	})
	describe('##Minimum b1 not satisfied', function() {	
	var testBot = new CryptoBot.bot(mock.mockSettings1);
	var base = 'ltcbtc';
	testBot.MongoClient = mock.MongoClient;
	testBot.DB = testBot.database();
	testBot.https = mock.https;
	testBot.email = mock.email;
	testBot.binancePrec[base] = [6,2,2,2,6,5];
	var pairs = ['ltcbtc','btcusdt','ltcusdt'];
	var e1 = {'ltcbtc':'ltc'} 
	var b1 = {'ltcbtc':'btc'} 
	var u1 = {'ltcbtc':'usdt'} 
		it('Should return false',function() {
			testBot.binanceStrategy[base] = {
			  one:{
				 b: 8836,
			     b_amount: 10,
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
			testBot.liquidTradesBinance[base] = true;
			testBot.binanceB1Min[base] = 2
			testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}
			testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert.equal(false,val)
		});
	})
	describe('##Optimal Trade ? (<100)', function() {	
	var testBot = new CryptoBot.bot(mock.mockSettings1);
	var base = 'ltcbtc';
	testBot.MongoClient = mock.MongoClient;
	testBot.DB = testBot.database();
	testBot.https = mock.https;
	testBot.email = mock.email;
	testBot.binancePrec[base] = [6,2,2,3,6,5];
	var pairs = ['ltcbtc','btcusdt','ltcusdt'];
	var e1 = {'ltcbtc':'ltc'} 
	var b1 = {'ltcbtc':'btc'} 
	var u1 = {'ltcbtc':'usdt'} 
		it('Should return false',function() {
			testBot.binanceStrategy[base] = {
			  one:{
				 b: 10741.05,
			     b_amount: 10,
			     c: 886.23,
			     c_amount: 0,
			     a: 0.082314,
			     a_amount: 416.84 },
			  two: 
			   { b: 8841,
			     b_amount: 0.500171,
			     c: 18.379,
			     c_amount: 20.146,
			     a: 0.002073,
			     a_amount: 282 } 
			}
			testBot.binanceOptimalTrades[base] = true;
			testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:80,upperLimit:99.9}}
			testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert.equal(false,val)
		});
	})

	describe('##Minimum u1 not satisfied', function() {	
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.email = mock.email;
		testBot.binancePrec[base] = [6,2,2,2,6,5];
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 	
		testBot.liquidTradesBinance[base] = true;
		testBot.binanceOptimalTrades[base] = true;
		testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}
		it('Should return false',function() {
			testBot.binanceStrategy[base] = { 
			one:{ 
			     b: 8854,
			     b_amount: 0.02048,
			     c: 18.1,
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
			testBot.binanceU1Min[base] = 200;
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert.equal(val,false)
		});	
	})
		
	describe('##Low Balance', function() {	
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.email = mock.email;
		testBot.binancePrec[base] = [6,2,2,2,6,5];
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 		
		testBot.liquidTradesBinance[base] = true;
		testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}	
		it('Should return false (wallet balance low)',function() {
			testBot.binanceBalance.btc = 0;
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
			assert.equal(val,false)
	});		
	})
	describe('##Arbitrage Error', function() {	
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.email = mock.email;
		testBot.binancePrec[base] = [6,2,2,2,6,5];
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 	
		it('Should thow a promise reject Binance Arbitrage',async function() {
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
			var generic = function(){return new Promise((resolve,reject)=>reject(false))}
			var val = await testBot.binanceBeginArbitrage('ltcbtc',99,"generic message", { btc: 0.004889, usdt: 43.23826711, ltc: 2.36004 }, { ltcbtc: 'ltc' }, { ltcbtc: 'btc' }, { ltcbtc: 'usdt' }, [generic()]);
			assert.equal(val,false)
		});			
	})
	describe('#Format Message < 100%', function() {
		it('Should return a correctly formated string',function() {
			var testBot = new CryptoBot.bot(mock.mockSettings1);
			var format = "99.850% "+new Date().toString().split('GMT')[0]+"\n34.1ltc => 626.758 usdt @18.38\n626.755152usdt => 0.070932 btc @8836\n0.07082570btc => 34.15 ltc @0.002077\n"
			var message = testBot.binanceArbitrageMessageFormat({ ltc: 34.1, usdt: 626.758, btc: 0.070932 },'ltc','usdt',18.38,'btc',8836,34.1,0.002077,2,99.84968443960827)
			assert.equal(format,message)
		});		
	})
	describe('#Format Message > 100%', function() {
		it('Should return a correctly formated string',function() {
			var testBot = new CryptoBot.bot(mock.mockSettings1);
			var format = "100.020% "+new Date().toString().split('GMT')[0]+"\n0.004889btc => 43.23826711 usdt @8843.99\n43.23829284000001usdt => 2.36004 ltc @18.321\n2.36ltc => 0.004890 btc @0.002072\n"
			var message = testBot.binanceArbitrageMessageFormat({ btc: 0.004889, usdt: 43.23826711, ltc: 2.36004 },'btc','usdt',8843.99,'ltc',18.321,2,0.002072,6,100.02045346869713)
			assert.equal(format,message);
		});		
	})

});	
	

describe('Binance', function() {
	var binanceBot = new CryptoBot.bot(mock.mockSettings1);
	var yBot = new CryptoBot.bot(mock.mockSettings1);
	binanceBot.https = mock.https;
	binanceBot.email = mock.email;
	binanceBot.binanceUserStreamString = "ws://127.0.0.1:8090/";
	var userStream = new mock.userStream();
	
	describe('#Listen User Account', function() {
		it('Should return a connected websocket client',function() {
			var val = binanceBot.binanceUserStream('randomekey');
			setTimeout(()=>{
				assert(binanceBot.binanceUserStreamString.search(val.url.host) > -1);
			},800);
			
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

	describe('#ParseUserEvent - outboundAction', function() {
		it('Should return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var outbound = mock.binanceUserEvents[0];
			assert(bot.binanceParseUserEvent(outbound,{'ltcbtc':['ltcbtc','btcusdt','ltcusdt']}));
		});
	});	

	describe('#ParseUserEvent - execution', function() {
		it('Should update new order in database and return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var base = 'ltcbtc';
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			bot.binanceInProcess = {}
			bot.binanceInProcess[base] = true;
			bot.binanceOrders = {}
			bot.binanceOrders[base] = [];
			bot.binanceProcessTime = {}
			bot.binanceProcessTime[base] = 1;
			bot.binanceTradesMade = {}
			bot.binanceTradesMade[base] = 0;
			var addOrder = mock.binanceUserEvents[1];
			assert(bot.binanceParseUserEvent(addOrder,{'ltcbtc':['ltcbtc','btcusdt','ltcusdt']}));
		});
		it('Should update the status of the order in the database and return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			var base = 'ltcbtc';
			bot.binanceInProcess = {}
			bot.binanceInProcess[base] = true;
			bot.binanceProcessTime = {}
			bot.binanceProcessTime[base] = 0;
			bot.binanceOrders = {}
			bot.binanceOrders[base] = ["mUvoqJxFIILMdfAW5iGSOW"];
			bot.binanceProcessTime = {}
			bot.binanceProcessTime[base] = 1;
			bot.binanceTradesMade = {}
			bot.binanceTradesMade[base] = 3;
			var removeOrder = mock.binanceUserEvents[2];
			assert(bot.binanceParseUserEvent(removeOrder,{'ltcbtc':['ltcbtc','btcusdt','ltcusdt']}));
		});		
	});		
	describe('#CheckTrade (true)', function() {
		return it('Should return true',function() {
			assert(binanceBot.binanceCheckTrade('ltcbtc',{}));
		});
	});	
	describe('#CheckTrade (false)', function() {
		return it('Should return false',function() {
			binanceBot.binanceInProcess['ltcbtc'] = true;
			binanceBot.binanceProcessTime['ltcbtc'] = new Date().getTime() - 490000;
			assert(!binanceBot.binanceCheckTrade('ltcbtc',{}));
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
		binanceBot.binancePrec = {}
		binanceBot.binancePrec[base] = [6,2,2,2,6,5];
		it('Should return a setTimeout object when percentage < 100%',function() {
			var val = binanceBot.binanceSaveOrders([{clientOrderId:1},{clientOrderId:2},{clientOrderId:3}],base,99,{'ltc':1,'btc':2,'usdt':3},{'ltcbtc':'ltc'},{'ltcbtc':'btc'},{'ltcbtc':'usdt'});
			assert.equal(typeof val._idleStart,"number");
			clearTimeout(val);
		});
		it('Should return a setTimeout object when percentage > 100%',function() {
			var val = binanceBot.binanceSaveOrders([{clientOrderId:1},{clientOrderId:2},{clientOrderId:3}],base,101,{'ltc':1,'btc':2,'usdt':3},{'ltcbtc':'ltc'},{'ltcbtc':'btc'},{'ltcbtc':'usdt'});
			assert.equal(typeof val._idleStart,"number");
			clearTimeout(val);
		});		
	});

	describe('#Strategy', function() {
		var messages = mock.binanceMessages;
		var base = 'ltcbtc'
		yBot.binanceStrategy[base] = {one:{},two:{}}
		yBot.binancePrec = {}
		yBot.binancePrec[base] = [6,2,2,2,6,5];
		it('Should create a Binance Strategy using pair1',function() {
			yBot.binanceGenerateStrategy('ltcbtc',0,messages[0]);
			assert.equal(yBot.binanceStrategy[base]['one']['a'],0.018881);
		});
			it('Should create a Binance Strategy using pair2',function() {
			yBot.binanceGenerateStrategy('ltcbtc',1,messages[1]);
			assert.equal(yBot.binanceStrategy[base]['one']['b'],8500);
		});
		it('Should create a Binance Strategy using pair3',function() {
			yBot.binanceGenerateStrategy('ltcbtc',2,messages[2]);
			assert.equal(yBot.binanceStrategy[base]['one']['c'],170);
		});
	});		
	
	describe('#Stream', function() {
		it('Should return a connected websocket',function(done) {
			var _mockMarket = new mock.marketStream(8080);
			binanceBot.binanceMarket = mock.market;
			binanceBot.binanceMonitor([{pair1:"ltcbtc",pair2:"ltcusdt",pair3:"btcusdt"}]);
			assert.equal(binanceBot.binanceSocketConnections[0].readyState,0);
			done()
		});
	});		
	
	describe('#Place and Remove Order', function() {
		return it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
			var val = await binanceBot.binanceTrade("BTCUSDT","BUY",1.00,20.00,"GTC")
			var val2 = await binanceBot.binanceCancelOrder("BTCUSDT",val.orderId);
			assert.equal(val2.symbol,"BTCUSDT");
		});
	});	
});
