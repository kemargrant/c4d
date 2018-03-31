var CryptoBot = require('../c4d.js');
var Settings = require('../config.json');
var mock = require('./mock.js');
var assert = require('assert');
var WebSocket = require('ws');

describe('Bittrex', function() {
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
	describe('#Stream', function() {
		it('Should return signalr client', function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			return bot.bittrexPrepareStream().then( (val) => {
				return bot.bittrexStream(val[0],val[1])}).then( (result) => {
					return assert(result);
			  }).then(done()).catch((e)=>{done(e)});
		});
	});
	describe('#UpdateBittrexSocketStatus', function() {
		it('Should update Bittrex socket status to false', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			assert.equal(bot.updateBittrexSocketStatus(false),false);
		});
	});	
});
