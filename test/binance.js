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
	describe('##Best Trade ? (<100)', function() {	
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
	describe('##Trade (>100)', function() {	
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
		testBot.liquidTradesBinance[base] = false;
		testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}	
		it('Should return false (sub optimal trade)',function() {
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
			assert.equal(val,true)
	});		
	})
	describe('##Trade (<100)', function() {	
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
			testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:80,upperLimit:99.9}}
			testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1);
			assert.equal(val,true)
		});
	})
	describe('## Best Trade ? (<100)(sub optimal trade)', function() {	
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.email = mock.email;
		testBot.binancePrec[base] = [6,2,2,3,6,5];
		testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 		
		testBot.liquidTradesBinance[base] = false;
		testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:80,upperLimit:99.99}}	
		it('Should return false (sub optimal trade)',function() {
			testBot.binanceStrategy[base] = {"one":{"c":112.34,"c_amount":2.12027,"b":6825,"b_amount":0,"a":0.016593,"a_amount":0},"two":{"c":113.72,"c_amount":21.2,"b":6822.06,"b_amount":0.327164,"a":0.016576,"a_amount":9.73}}
			testBot.binanceOptimalTrades[base] = false;
			var messageData = { e: 'depthUpdate',
			  E: 1523417275016,
			  s: 'LTCUSDT',
			  U: 37583033,
			  u: 37583038,
			  b: 
			   [ [ '113.28000000', '8.69530000', [] ],
			     [ '111.21000000', '1.44577000', [] ] ],
			  a: 
			   [ [ '113.46000000', '0.00000000', [] ],
			     [ '113.66000000', '7.50000000', [] ],
			     [ '113.78000000', '0.00000000', [] ] ] }
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1,2,messageData);
			assert.equal(val,false)
		});		
	})	
	describe('## Best Trade ? (>100)(sub optimal trade)', function() {	
		var testBot = new CryptoBot.bot(mock.mockSettings1);
		var base = 'ltcbtc';
		testBot.MongoClient = mock.MongoClient;
		testBot.DB = testBot.database();
		testBot.https = mock.https;
		testBot.email = mock.email;
		testBot.binancePrec[base] = [6,2,2,3,6,5];
		testBot.binanceBalance = {'bnb':1,'ltc':50,'btc':0.5,'usdt':4000}
		var pairs = ['ltcbtc','btcusdt','ltcusdt'];
		var e1 = {'ltcbtc':'ltc'} 
		var b1 = {'ltcbtc':'btc'} 
		var u1 = {'ltcbtc':'usdt'} 		
		testBot.liquidTradesBinance[base] = false;
		testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:80,upperLimit:99.99}}	
		it('Should return false (sub optimal trade)',function() {
			testBot.binanceStrategy[base] = {"one":{"a":0.016642,"a_amount":0,"b":6851.32,"b_amount":0,"c":113.84,"c_amount":28.907},"two":{"a":0.016629,"a_amount":0,"b":6850.01,"b_amount":0.396522,"c":113.89,"c_amount":0}}
			testBot.binanceOptimalTrades[base] = false;
			var messageData = { e: 'depthUpdate',
			  E: 1523422983772,
			  s: 'BTCUSDT',
			  U: 128785748,
			  u: 128785763,
			  b: 
			   [ [ '6855.40000000', '0.00000000', [] ],
			     [ '6845.07000000', '0.00000000', [] ],
			     [ '6844.31000000', '0.00570100', [] ],
			     [ '6829.70000000', '0.00000000', [] ],
			     [ '6826.49000000', '0.00000000', [] ],
			     [ '6807.58000000', '0.08238600', [] ] ],
			  a: 
			   [ [ '6854.64000000', '0.00000000', [] ],
			     [ '6855.00000000', '0.00000000', [] ],
			     [ '6855.01000000', '0.00000000', [] ],
			     [ '6855.39000000', '0.05000000', [] ],
			     [ '6855.40000000', '0.54585700', [] ],
			     [ '6858.52000000', '0.40421200', [] ],
			     [ '6864.43000000', '0.00000000', [] ],
			     [ '6865.10000000', '0.00000000', [] ],
			     [ '6887.15000000', '0.00000000', [] ] ] } 
			var val = testBot.binanceArbitrage(base,pairs,e1,b1,u1,1,messageData);
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
	
	describe('##binanceChecCondition', function() {	
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
		testBot.liquidTradesBinance[base] = false;
		testBot.binanceOptimalTrades[base] = true;
		testBot.binanceLimits[base] = {over:{lowerLimit:100,upperLimit:104},under:{lowerLimit:99,upperLimit:99.9}}	
		it('Should return false',function() {
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
			var val = testBot.binanceCheckConditions({btc:0.004889,usdt:43.23826711,ltc:2.36004},100.02045346869713,'ltcbtc','ltc','btc','usdt',18.321,18.321,66.05,0.09);
			assert.equal(val,false)
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
		it('Should return a connected websocket client',function(done) {
			var val = binanceBot.binanceUserStream('randomekey');
			assert(binanceBot.binanceUserStreamString.search(val.url.host) > -1);
			userStream.close();			
			done()
		});
	});
	
	describe('#UserStream', function() {
		it('Should return a connected websocket client',function(done) {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var val = binanceBot.binanceUserStream('randomekey');
			assert(binanceBot.binanceUserStreamString.search(val.url.host) > -1);
			userStream.close();			
			done()
		});
		it('Should open binance user Socket',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var client = binanceBot.binanceUserStream('randomekey');
			client.emit("open");
			assert(binanceBot.binanceUserStreamStatus);
		});	
		it('Should close binance user Socket',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var client = binanceBot.binanceUserStream('randomekey');
			client.emit("open");
			client.emit("close");
			assert(!binanceBot.binanceUserStreamStatus);
		});	
		it('Should parse a user message onMessage',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var client = binanceBot.binanceUserStream('randomekey');
			binanceBot.messageParsed = false;
			binanceBot.binanceParseUserEvent = ()=>{
				binanceBot.messageParsed = true;
			}
			client.emit("message");
			assert(binanceBot.messageParsed);
		});						
	});		
	
	describe('#ApiKeys', function() {
		return it('should return true when the apikey and apisecret are present', function() {
			assert.equal(binanceBot.Settings.Binance.apikey.length > 0 && binanceBot.Settings.Binance.secretkey.length > 0, true);
		});
	});
    
	describe('#Account Data', function() {
		it('Should return account data', async function() {
			var val = await binanceBot.binanceAccount();
			assert.equal(typeof val,"object")
		});
		it('Account Data Error', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsError;
			return binanceBot.binanceAccount().catch((val)=>{
				assert.equal(val,'ERROR')
			})
		});
		it('Account Data Error parsing data',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsBadData;
			return binanceBot.binanceAccount().catch((val)=>{
				assert.equal(val.message,"Unexpected token x in JSON at position 0")
			})
		});		
	});
	
	describe('#Precision', function() {			
		it('Should format precision data for ltc/btc/usdt pairs', function(done) {
			var zBot = new CryptoBot.bot(mock.mockSettings1);
			setTimeout(()=>{
				assert.deepEqual(zBot.Settings.Binance.pairs[0].prec,[6,2,2,2,6,5]);
				done();
			},1500);			
		});			
	});		
		
	describe('#Get Orders', function() {
		it('Should return a list of open orders for btcusdt', async function() {
			var val = await binanceBot.binanceOpenOrders("BTCUSDT");
			assert(val instanceof Array)
		})
		it('Should return a empty list', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsEmptyData;
			return binanceBot.binanceOpenOrders("BTCUSDT").then((val)=>{
				assert.equal(val.length,0)
			});
		})
		it('Should return an error', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsError;
			return binanceBot.binanceOpenOrders("BTCUSDT").catch((e)=>{
				assert.equal(e,"ERROR")
			});
		})
		it('Should return a parsing Error',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsBadData;
			return binanceBot.binanceOpenOrders("BTCUSDT").catch((e)=>{
				assert.equal(e.message,"Unexpected token x in JSON at position 0")
			});
		})
	});  	
	
	describe('#Listen Key', function() {
		it('Should return a user listen key of 60 characters', async function() {
			var val = await binanceBot.binanceListenKey()
			assert.equal(val.length,60);				
		});
		it('Should return an Error', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsError
			return binanceBot.binanceListenKey().catch((e)=>{
				assert.equal(e,"ERROR");				
			})
		});
		it('Should return an Error', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsBadData
			return binanceBot.binanceListenKey().catch((e)=>{
				assert.equal(e,"SyntaxError: Unexpected token x in JSON at position 0");				
			})
		});	
		it('Should return an Error (listen Key missing)', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.https = mock.httpsEmptyData
			return binanceBot.binanceListenKey().catch((e)=>{
				assert.equal(e.message,"Error Getting Binance Listen Key");				
			})
		});				
		
	});	

	describe('#ListenUser', function() {
		return it('Should return an Error', function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.binanceListenKey = function(){
				return new Promise((resolve,reject)=>reject("Error"))
			}
			return binanceBot.binanceListenUser().catch(e=>assert.equal(e,"Error"));
		});
	})

	describe('#Keep Alive', function() {
		return it('Should return an empty object', async function() {
			var val = await binanceBot.binanceListenKey();
			var val2 = await binanceBot.binanceListenBeat(val);
			assert.equal(val2,"{}");
		});
	});
	
	describe('#binanceListenBeat', function() {
		it('Should return a rejected promise with a "x}"', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsBadData;
			return bot.binanceListenBeat("xyz").catch((e)=>{
				assert.equal(e,'x}');
			})
		});
		it('Should return a rejected promise with Error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError;
			return bot.binanceListenBeat("xyz").catch((e)=>{
				assert.equal(e,'ERROR');
			})
		});
	});	

	describe('#ParseUserEvent - outboundAction', function() {
		it('Should return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var outbound = mock.binanceUserEvents[0];
			assert(bot.binanceParseUserEvent(outbound,{'ltcbtc':['ltcbtc','btcusdt','ltcusdt']}));
		});
	});	
	describe('#ParseUserEvent - Error', function() {
		it('Should return true',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			assert(!bot.binanceParseUserEvent({type:"message",data:"x/"},{}));
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
		it('Should update the status of the order in the database and return true (order in position 2)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			var base = 'ltcbtc';
			bot.binanceInProcess = {}
			bot.binanceInProcess[base] = true;
			bot.binanceProcessTime = {}
			bot.binanceProcessTime[base] = 0;
			bot.binanceOrders = {}
			bot.binanceOrders[base] = ["","mUvoqJxFIILMdfAW5iGSOW"];
			bot.binanceProcessTime = {}
			bot.binanceProcessTime[base] = 1;
			bot.binanceTradesMade = {}
			bot.binanceTradesMade[base] = 3;
			var removeOrder = mock.binanceUserEvents[2];
			assert(bot.binanceParseUserEvent(removeOrder,{'ltcbtc':['ltcbtc','btcusdt','ltcusdt']}));
		});
		it('Should update the status of the order in the database and return true (order in position 3)',function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient;
			bot.DB = bot.database();
			var base = 'ltcbtc';
			bot.binanceInProcess = {}
			bot.binanceInProcess[base] = true;
			bot.binanceProcessTime = {}
			bot.binanceProcessTime[base] = 0;
			bot.binanceOrders = {}
			bot.binanceOrders[base] = ["","mUvoqJxFIILMdfAW5iGSOW",""];
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
	
	describe('#Monitor', function() {
		it('Should return a connected websocket',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var list = binanceBot.binanceMonitor([{pair1:"ltcbtc",pair2:"ltcusdt",pair3:"btcusdt"}]);
			list.forEach((client)=>{
				client.onclose = null;
				try{client.terminate()}catch(e){console.log(e)}
			})
			assert(list.length > 2);
		});
	});
	
	describe('#Stream', function() {
		it('Should return undefined',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			binanceBot.binanceMarket = ""
			var client = binanceBot.binanceStream("ltcbtc","ltcbtc");
			assert(!client);
		});
		it('Should return a different websocket client',function(done) {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var client = binanceBot.binanceStream("ltcbtc","ltcbtc");
			var prev = client._req
			client.emit("close");
			setTimeout(()=>{
				assert(prev !== client._req)
				done()	
			},1100)
		});
		it('Should catch error processing message',function() {
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			var client = binanceBot.binanceStream("ltcbtc","ltcbtc");
			var x = client.emit("message",null);
			assert.equal(x,true)			
		});
	});	
	
	describe('#Place and Remove Order', function() {
		it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol', async function() {
			var val = await binanceBot.binanceTrade("BTCUSDT","BUY",1.00,20.00,"GTC")
			var val2 = await binanceBot.binanceCancelOrder(val.orderId);
			assert.equal(val2.symbol,"BTCUSDT");
		});
		it('Should return error parsing cancelOrder response', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError;
			return bot.binanceCancelOrder(1234).catch((e)=>{
				assert.equal(e,'ERROR');
			})
		});
		it('Should return unexpected syntax error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsBadData;
			return bot.binanceCancelOrder(1234).catch((e)=>{
				assert.equal(e.message,'Unexpected token x in JSON at position 0');
			})
		});	
		it('Should return an empty list', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsEmptyData;
			return bot.binanceCancelOrder(1234).then((val)=>{
				assert.equal(val.length,0);
			})
		});				
		
	});	
	describe('#Reject Binance Precision', function() {
		var binanceBot = new CryptoBot.bot(mock.mockSettings1);
		binanceBot.binanceExchangeInfo = function(){
			return new Promise((resolve,reject)=>{
				reject(false);
			});
		}
		it('Should reject and resolve false', function() {
			return binanceBot.binancePrecision([{pair1:'ltcbtc',pair2:'btcusdt',pair3:'ltcusdt'}]).catch((val)=>{
				assert.equal(val,false);
			})
		});
	});
	describe('#binanceExchangeInfo', function() {
		var binanceBot = new CryptoBot.bot(mock.mockSettings1);
		binanceBot.https = mock.httpsBadData;		
		it('Should reject and resolve false', function() {
			return binanceBot.binanceExchangeInfo().catch((e)=>{
				assert.equal(e,'SyntaxError: Unexpected token x in JSON at position 0');
			})
		});
		it('Should reject and resolve false', function() {
			binanceBot.https = mock.httpsError;
			return binanceBot.binanceExchangeInfo().catch((e)=>{
				assert.equal(e,'ERROR');
			})
		});
	});	
	(function(){describe('#Start Bot and catch binancePrecision error', function() {
		it('Should place and order for 1.00 btcusdt @ 20.00 and return a object with same symbol',function() {
			var Module = require('module');
			var originalRequire = Module.prototype.require;
			Module.prototype.require = function(){return {https:{"request":function(){return new Promise((resolve,reject)=>{reject()}); }}}};
			var binanceBot = new CryptoBot.bot(mock.mockSettings1);
			assert.equal(JSON.stringify(binanceBot.binancePrec),"{}");
			
		});
	});})()
		
});
