var CryptoBot = require('../c4d.js');
var bot = new CryptoBot.bot();
var assert = require('assert');
var WebSocket = require('ws');

describe('Functions', function() {
	
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
			},950)
		});
	});
	
	describe('#Save to Database', function() {
		this.timeout(3000);
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
			},1150)
		});
	});		
	
	describe('#Log', function() {
		return it('Should log a message', function() {
			var val = bot.log("Hello World");
			assert.equal(val,true);
		});
	});	
	
	describe('#Send Email', function() {
		this.timeout(2500)
		return it('Should send an email message', async function(done) {
			var val = await bot.sendEmail("Hello World");
			try{
				assert(val);
				done();
			}
			catch(e){
				done(e);
			}			
		});
	});
	
	describe('#Should send Slack Message', function() {
		return it('Should send a slack message', async function(done) {
			var val = await bot.slackMessage("Hello World");
			try{
				assert(val);
				done();
			}
			catch(e){
				done(e);
			}
		});
	});
	
	describe('#Setup WebSocket', function() {
		return it('Should setup a web socket server and connect to it', async function() {			
			return setTimeout(function(){
				var client = new WebSocket("http://localhost:7071");
				client.onopen = ()=>{
					client.terminate();
				}	
			},300);
			var val = await bot.setupWebsocket();
			assert(val);
		});
	});	
	
//Binance Tests
	describe('Binance', function() {
		
		describe('#ApiKeys', function() {
			return it('should return true when the apikey and apisecret are present', function() {
				assert.equal(bot.Settings.Binance.apikey.length > 0 && bot.Settings.Binance.secretkey.length > 0, true);
			});
		});
	    
		describe('#Account Data', function() {
			return it('Should return account data', async function() {
				var val = await bot.binanceAccount();
				assert.equal(typeof val,"object")
			});
		});
		
		describe('#Binance Precision', function() {
			return it('Should return Binance Exchange data for ltc/btc/usdt arbitrage', async function() {
				var exchangeData = await bot.binancePrecision([{pair1:"ltcbtc",pair2:"btcusdt",pair3:"ltcusdt"}]);
				bot.Settings.Binance.pairs[0].pair1 = "ltcbtc";
				bot.Settings.Binance.pairs[0].pair2 = "btcusdt";
				bot.Settings.Binance.pairs[0].pair3 = "ltcusdt";
				bot.binanceFormatPairs(exchangeData);
				assert.deepEqual(bot.Settings.Binance.pairs[0].prec,[6,2,2,2,6,5])
			});			
		});		
		
		describe('#Get Orders', function() {
			return it('Should return a list of open orders for btcusdt', async function() {
				var val = await bot.binanceOpenOrders("BTCUSDT");
				assert(val instanceof Array)
			})
		});  	
		
		describe('#Listen Key', function() {
			return it('Should return a user listen key of 60 characters', async function() {
				var val = await bot.binanceListenKey()
				assert.equal(val.length,60);				
			});
		});	
	
		describe('#Keep Alive', function() {
			return it('Should return an empty object', async function() {
				var val = await bot.binanceListenKey();
				var val2 = await bot.binanceListenBeat(val);
				assert.equal(JSON.stringify(val2),"{}");
			});
		});
	
		describe('#Listen User Account', function() {
			return it('Should return a connected websocket client', async function() {
				var val = await bot.binanceListenUser();
				assert.equal(val.url.host,"stream.binance.com:9443");		
			});
		});
		
		describe('#Binance Stream', function() {
			return it('Should return a connected websocket', function() {
				var client = bot.binanceStream("btcusdt","btcusdt");
				setTimeout(()=>{
					bot.binanceKill = true;
					client.terminate();
				},900);
				assert(client.readyState === 0);
			});
		});		
		
		describe('#Place and Remove Order', function() {
			return it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
				var val = await bot.binanceTrade("BTCUSDT","BUY",1.00,20.00,"GTC")
				var val2 = await bot.binanceCancelOrder("BTCUSDT",val.orderId);
				assert.equal(val2.symbol,"BTCUSDT");
			});
		});	
	  return
	});


//~ //Bittrex Tests
//~ describe('Bittrex', function() {

	//~ describe('#ApiKeys', function() {
		//~ return it('should return true when the apikey and apisecret are present', function() {
			//~ assert.equal(bot.Settings.Bittrex.apikey.length > 0 && bot.Settings.Bittrex.secret.length > 0, true);
		//~ });
	//~ });
	
	//~ describe('#Account Data', function() {
		//~ return it('Should return account data', async function() {
			//~ var val = await bot.bittrexAccount();
			//~ assert.equal(val,true)
		//~ });
	//~ });
	
	//~ describe('#Complete Arbitrage', function() {
		//~ return it('Should return a setTimeout object', async function() {
			//~ var val = await bot.bittrexCompleteArbitrage({'randomid':false,'randomi2':false,'randomid3':false});
			//~ assert.equal(typeof val._idleStart,"number")
		//~ });
	//~ });	
	
	//~ describe('#Market Depth', function() {
		//~ return it('Should return an object with bid and ask price', async function() {
			//~ var val = await bot.bittrexDepthPure('USDT-BTC');
			//~ assert(val.buy && val.sell)
		//~ });
	//~ });		

	//~ describe('#Place and Remove Order', function() {
		//~ it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
			//~ var val = await bot.bittrexTrade("buy","USDT-BTC",1,20.00);
			//~ var val2 = await bot.bittrexCancelOrder(val);
			//~ assert.equal(val2.success,true);
		//~ });
	//~ });	

	//~ describe('#Completed Trades', function() {
		//~ this.timeout(15000);
		//~ return it('Should return a settimeout object', function() {
			//~ var val = bot.completedTrades(['xxxx']);
			//~ assert.equal(Number(val._idleStart > 0),true);
		//~ });
	//~ });

	//~ describe('#Stream', function() {
		//~ this.timeout(15000);
		//~ return it('Should return signalr client', async function() {
			//~ var val = await bot.bittrexPrepareStream();
			//~ var val2 = await bot.bittrexStream(val[0],val[1]);
				//~ setTimeout(()=>{
					//~ bot.bittrexSocketConnection.close();
					//~ client.terminate();
				//~ },400);
			//~ assert(val2.headers.cookie);
		//~ });
	//~ });
	
//~ });

describe('Utilities', function() {
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

	return
})


