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
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.email = mock.email;
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
		it('Should return a setTimeout Object > 0 (Unable to find Order)', async function() {
			var val = await bot.bittrexSwingOrder();
			assert.equal(typeof val._idleStart,"number");
			clearTimeout(val);
		});
		it('Should return a setTimeout Object > 0 (Order is filled)', async function() {
			bot.bittrexAPI = function(){return new Promise((resolve,reject)=>{
				return resolve({isOpen:false});
			})}
			var val = await bot.bittrexSwingOrder(1234);
			assert.equal(typeof val._idleStart,"number");
			clearTimeout(val);
		});
		it('Should return a setTimeout Object > 0 (Order is not filled)', async function() {
			bot.bittrexAPI = function(){return new Promise((resolve,reject)=>{
				return resolve({isOpen:true});
			})}
			var val = await bot.bittrexSwingOrder(1234);
			assert.equal(typeof val._idleStart,"number");
			clearTimeout(val);
		});
		it('Should return a setTimeout Object > 0 (Api Error)', async function() {
			bot.bittrexAPI = function(){return new Promise((resolve,reject)=>{
				return reject({isOpen:true});
			})}
			var val = await bot.bittrexSwingOrder(1234);
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
	describe('#PrepareStream', function() {
		it('Should return cookie and header', function() {
			this.timeout(15000);
			var bot = new CryptoBot.bot(mock.mockSettings1);
			return Promise.resolve(bot.bittrexPrepareStream().then((val)=>{
				assert(val[0].length > 50)
			}).catch((e)=>{
				console.log("Error:",e);
				assert(false);
			}))
			
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
			this.timeout(2000)
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

	describe('#Subscribe to market', function() {
		return it('Should return return true', function() {
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
	});	
	
	describe('#Update Market', function() {
		it('Should update local order book',function(done) {
			this.timeout(300000)
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var update = bot.bittrexUpdateMarket('BTC-LTC',mock.bittrexData[0],mock.bittrexData[1]);
			var updated = JSON.stringify({ 'BTC-LTC': { Bids: { '3.33': 1 }, Asks: { '7.77': 1 } } })
			assert.equal(JSON.stringify(update),updated);
			done();		
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
});


