describe('Bittrex', function() {
	var CryptoBot = require('../c4d.js');
	var Settings = require('../config.json');
	var mock = require('./mock.js');
	var assert = require('assert');

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
		it('Should return an object with bid and ask price', function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.https;
			bot.bittrexDepthPure('USDT-BTC').then((val)=>{
				assert(val.buy && val.sell);
				done()
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
	describe('#UpdateBittrexSocketStatus', function() {
		it('Should update Bittrex socket status to false', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			assert.equal(bot.updateBittrexSocketStatus(false),false);
		});
	});	
	describe('#BittrexStream', function() {
		it('Should return a signal-r client',function() {
			this.timeout(15000)
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var result = bot.bittrexStream("dummy","dummy")
			assert(result.end);
			bot.bittrexKill = true;
			result.end();
		});
	});
	/*
	 * 
	 * Arbitrage Helpers
	 * 
	 * */
	describe('#BittrexReset', function() {
		it('Should reset Bittrex Settings',function(done) {
			this.timeout(3000)
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.bittrexInProcess = true;
			bot.email = mock.email;
			var reset = bot.bittrexReset("Testing bittrexReset Function",0);
			setTimeout(()=>{
				assert(!bot.bittrexInProcess);
				clearTimeout(reset);
				done();
			},100)
		});
	});
	describe('#SortBook', function() {
		it('Should sort Bittrex order book',function() {
		this.timeout(300000)
		var bot = new CryptoBot.bot(mock.mockSettings1);
		var book = mock.bittrexBook;
		var sorted = JSON.stringify(mock.bittrexBookSorted);
		assert.equal(JSON.stringify(bot.bittrexSortBook(book)),sorted);
		});
	});	 
		
});
