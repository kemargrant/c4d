describe('#Server Commands', function() {
	var CryptoBot = require('../c4d.js');
	var mock = require('./mock.js');
	var assert = require('assert');	
	var AES = require("crypto-js").AES;
	var base ='ltcbtc';
	
	function encrypt(message){return AES.encrypt(JSON.stringify(message),mock.mockSettings1.Config.key).toString()}
	var ws = {send:console.log}

describe('Binance Server Commands (Offline)', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	/*
	 * Binance Commands That Do Not Require a Network Request
	 * 
	 */
	describe('#binanceB1Minimum', function() {
		it('Should change minimum B1 value', function() {
			bot.binanceB1Min[base] = 0;
			bot.serverCommand(encrypt({'command':'binanceB1Minimum','pair':base,'min':1}));
			assert.equal(bot.binanceB1Min[base],1);
		});
	});	
	describe('#binanceC1Minimum', function() {
		it('Should change minimum C1 value', function() {
			bot.binanceC1Min[base] = 0;
			bot.serverCommand(encrypt({'command':'binanceC1Minimum','pair':base,'min':1}));
			assert.equal(bot.binanceC1Min[base],1);
		});
	});
	describe('#binanceLimits', function() {
		it('Should change Binance Limits', function() {
			bot.binanceLimits[base] =  {
				"over":{"lowerLimit":0,"upperLimit":0},
				"under":{"lowerLimit":0,"upperLimit":0}
			}
			bot.serverCommand(encrypt({'command':'binanceLimits','pair':base,'selection':'over.lowerLimit','value':1}));
			assert.equal(bot.binanceLimits[base]['over']['lowerLimit'],1);
		});
	});
	describe('#binanceOptimal', function() {
		it('Should change Binance Optimal trading option', function() {
			bot.serverCommand(encrypt({'command':'binanceOptimal','pair':base,'bool':false}));
			assert.equal(bot.binanceOptimalTrades[base],false);
		});
	});
	describe('#binanceMonitor', function() {
		it('Should change the Binance monitor state for a selected pair', function() {
			bot.binanceInProcess[base] = true;
			bot.serverCommand(encrypt({'command':'binanceMonitor','pair':base,'bool':false}));
			assert.equal(bot.binanceInProcess[base],false);
		});
	});	
	describe('#liquidTradeBinance', function() {
		it('Should change the Binance liquid trading option', function() {
			bot.liquidTradesBinance[base] = true;
			bot.serverCommand(encrypt({'command':'liquidTradeBinance','pair':base,'bool':false}));
			assert.equal(bot.liquidTradesBinance[base],false);
		});
	});		
})

describe('Bittrex Server Commands (Offline)', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();
	/*
	 * Bittrex Commands That Do Not Require a Network Request
	 * 
	 */
	describe('#bittrex_book', function() {
		it('Should enable the  server to send the Bittrex order book', function() {
			bot.viewBittrexBook = false;
			bot.serverCommand(encrypt({'command':'bittrex_book','bool':true}));
			assert.equal(bot.viewBittrexBook,true);
		});
	});			 
	describe('#bittrexMonitor', function() {
		it('Should change the Bittrex monitor state', function() {
			bot.bittrexInProcess = true; 
			bot.serverCommand(encrypt({'command':'bittrexMonitor','pair':base,'bool':false}));
			assert.equal(bot.bittrexInProcess,false);
		});
	});
	describe('#liquidTrade', function() {
		it('Should change Bittrex liquid trading option', function() {
			bot.liquidTrades = true; 
			bot.serverCommand(encrypt({'command':'liquidTrade','bool':false}));
			assert.equal(bot.liquidTrades,false);
		});
	});	
	describe('#lowerLimit', function() {
		it('Should change Bittrex lowerLimit', function() {
			bot.lowerLimit = 98;
			bot.serverCommand(encrypt({'command':'lowerLimit','pair':base,'limit':99}));
			assert.equal(bot.lowerLimit,99);
		});
	});
	describe('#poll', function() {
		it('Should update Bittrex Polling rate', function() {
			bot.rate = 2000;
			bot.serverCommand(encrypt({'command':'poll','rate':25}));
			assert.equal(bot.rate,25000);
		});
	});
	describe('#poll_rate', function() {
		it('Should get Bittrex polling rate', function() {
			assert(bot.serverCommand(encrypt({'command':'poll_rate'})));
		});
	});	
	describe('#Sanity', function() {
		it('Should change Bittrex sane trading option', function() {
			bot.saneTrades = true;
			bot.serverCommand(encrypt({'command':'sanity','bool':false}));
			assert.equal(bot.saneTrades,false);
		});
	});		
	describe('#SwingPercentage', function() {
		it('Should change Bittrex swing ercentage', function() {
			bot.swingPercentage = 90;
			bot.serverCommand(encrypt({'command':'swingPercentage','percentage':95}));
			assert.equal(bot.swingPercentage,95/100);
		});
	});		
	describe('#SwingPoll', function() {
		it('Should change Bittrex swing polling rate', function() {
			bot.swingRate = 3000;
			bot.serverCommand(encrypt({'command':'swingPoll','rate':120}));
			assert.equal(bot.swingRate,120000);
		});
	});													
	describe('#SwingReset', function() {
		it('Should remove Bittrex trade from the database', function() {
			assert(bot.serverCommand(encrypt({'command':'swingReset'})));
		});
	});	
	describe('#SwingTrade', function() {
		it('Should return true', function() {
			bot.vibrate = false;
			bot.serverCommand(encrypt({'command':'swingTrade','bool':true}));
			assert.equal(bot.vibrate,true);
		});
	});	

	describe('#upperLimit', function() {
		it('Should change Bittrex upperLimit', function() {
			bot.upperLimit = 98;
			bot.serverCommand(encrypt({'command':'upperLimit','pair':base,'limit':99}));
			assert.equal(bot.upperLimit,99)
		});
	});		
	describe('#update_percentage', function() {
		it('Should change percentage of Bittrex balance used', function() {
			bot.p1 = 10;
			bot.p2 = 11;
			bot.serverCommand(encrypt({'command':'update_percentage','percentage1':50,'percentage2':99}));
			assert(bot.p1 === 50 && bot.p2 === 99);
		});
	});		
});

describe('General Server Commands (Offline)', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);	
	/*
	 * General Commands 
	 */
	 describe('#Invalid message', function() {
		it('Should return false', function() {
			assert(!bot.serverCommand("randomMessage"));
		});
	});
	describe('#logLevel', function() {
		it('Should return true', function() {
			bot.logLevel = 0;
			bot.serverCommand(encrypt({'command':'logs','logLevel':1}));
			assert.equal(bot.logLevel,1);
		});
	});

});
	
describe('Binance Server Commands (Network)', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.https = mock.https;
	/*
	 * Binance Commands That Require a Network Request
	 * 
	 */
	describe('#binance_balance', function() {
		it('Should get Binance balance',function(done) {
			bot.binanceBalance = {};
			bot.serverCommand(encrypt({'command':'binance_balance'}))
			setTimeout(function(){
				assert(bot.binanceBalance.btc > 0);
				done();
			},100);
		});
	});	 

	describe('#Should activate Binance', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		bot.binanceUserStreamStatus = true;
		bot.https = mock.https;
		function dummy(){}
		it('Should activate Binance', function() {
			bot.serverCommand(encrypt({'command':'binance_control','bool':true}));
			setTimeout(()=>{
				assert(bot.binanceSocketConnections.length > 0);
			},2000);
		});
		it('Should deactivate Binance', function(done) {
			this.timeout(3100);
			setTimeout(()=>{
				for(var i=0;i< bot.binanceSocketConnections.length;i++){
					bot.binanceSocketConnections[i].terminate = function(){};
				}
				bot.serverCommand(encrypt({'command':'binance_control','bool':false}));
				assert.equal(bot.binanceSocketConnections.length,0);
				for(var i=0;i< bot.binanceSocketConnections.length;i++){
					bot.binanceSocketConnections[i].onclose = dummy;
					bot.binanceSocketConnections[i].close();
				}
				done()
			},3000);
		});
	});	 		 	
	describe('#binance_orders', function() {
		it('Should resolve true', async function() {
			assert(await bot.serverCommand(encrypt({'command':'binance_orders'}),ws))
		});
	});	
	describe('#binance_orders - (send error)', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		bot.https = mock.https;
		var ws = {
			send:function(){throw new Error("send error")}
		}
		it('Should reject an error', function() {
			return bot.serverCommand(encrypt({'command':'binance_orders'}),ws).catch((e)=>{
				assert.equal(e.message,"send error");
			})
		});
	});
	describe('#binance_orders - (api error)', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		bot.https = mock.httpsError;
		var ws = {send:function(){}}
		it('Should reject an error', function() {
			return bot.serverCommand(encrypt({'command':'binance_orders'}),ws).catch((e)=>{
				assert.equal(e,"ERROR");
			})
		});
	});
				
});

describe('Bittrex Server Commands (Network)', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.https = mock.https;	
	/*
	 * Bittrex Commands That Require a Network Request
	 * 
	 */	 
	describe('#bittrex_balance', function() {
		it('Should get Bittrex Balance', async function() {
			bot.balance = {btc:0}
			var x = await bot.serverCommand(encrypt({'command':'bittrex_balance'}));
			assert(bot.balance.btc > 0);
		});
	});		
	describe('#bittrex_control', function() {
		it('Should should have an error when starting arbitrage process', function() {
			bot.bittrexSocketConnection = false;
			bot.bittrexPrepareStream = function(){
				return new Promise((resolve,reject)=>{
					reject(false);
				});
			}
			return bot.serverCommand(encrypt({'command':'bittrex_control','bool':true})).catch((val)=>{
				assert(!val);
			});
		});
		it('Should should start bittrex stream', function() {
			bot.bittrexSocketConnection = false;
			bot.bittrexPrepareStream = function(){
				return new Promise((resolve,reject)=>{
					resolve(["header","cookie"]);
				});
			}
			return bot.serverCommand(encrypt({'command':'bittrex_control','bool':true})).then((val)=>{
				assert(val);
			});
		});
		it('Should should stop bittrex stream', function(done) {
			this.timeout(3000)
			setTimeout(()=>{
				_r = bot.bittrexSocketConnection.close;
				bot.bittrexSocketConnection.close = function(){
					return setTimeout(()=>{_r()},1000)
				};
				var val = bot.serverCommand(encrypt({'command':'bittrex_control','bool':false}))
				assert(val);
				done()
			},2000);
		});					
	});			
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();		 
	describe('#bittrex_db', function() {
		it('Should return true',async function() {
			assert(await bot.serverCommand(encrypt({'command':'bittrex_db','db':'trade'}),ws))
		});
		it('Should return an Error',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var ws = {
				send:function(){throw new Error("send error")}
			}
			return bot.serverCommand(encrypt({'command':'bittrex_db','db':'trade'}),ws).then((e)=>{
				assert.equal(e,false);
			});
		});		
	});			 
	describe('#bittrex_orders', function() {
		it('Should return true', async function() {
			assert(await bot.serverCommand(encrypt({'command':'bittrex_orders'}),ws))
		});
		it('Should return an Error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError2;
			return bot.serverCommand(encrypt({'command':'bittrex_orders'}),ws).then((e)=>{
				assert.equal(e,false);
			});
		});		
	});	
});

describe('Server Commands (Network)', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	/*
	 * General Commands Network Commands
	 */
	describe('#Connect', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'connect'}),ws))
		});
	});		
})

})
