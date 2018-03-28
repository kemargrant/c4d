var CryptoBot = require('../c4d.js');
var Settings = require('../config.json');
var mock = require('./mock.js');
var assert = require('assert');
var WebSocket = require('ws');

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
				//userStream.close();
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
	
	describe('#Arbitrage', function() {
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.binancePrec = {}
		testBot.binancePrec[base] = [6,2,2,2,6,5];
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 
		it('Should return true)',function() {
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
			testBot.binanceLimits = {}
			testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}
			testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert.equal(true,val)
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
		return it('Should return a connected websocket',function() {
			this.timeout(2500);
			var _mockMarket = new mock.marketStream();
			binanceBot.binanceMarket = mock.market;
			binanceBot.binanceMonitor([{pair1:"ltcbtc",pair2:"ltcusdt",pair3:"btcusdt"}]);
			setTimeout(()=>{
				assert.equal(binanceBot.binanceSocketConnections[0].readyState,0);
			},1000);
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
