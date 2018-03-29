var CryptoBot = require('../c4d.js');
var mock = require('./mock.js');
var assert = require('assert');	
var AES = require("crypto-js").AES;
var base ='ltcbtc'

function encrypt(message){
	return AES.encrypt(JSON.stringify(message),mock.mockSettings1.Config.key).toString()
}

describe('Server Commands 1', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	/*
	 * Binance Commands That Do Not Require a Network Request
	 * 
	 */
	describe('#binanceB1Minimum', function() {
		it('Should return true', function() {
			bot.binanceB1Min[base] = 0
			assert(bot.serverCommand(encrypt({'command':'binanceB1Minimum','pair':base,'min':1})))
		});
	});	
	describe('#binanceC1Minimum', function() {
		it('Should return true', function() {
			bot.binanceC1Min[base] = 0
			assert(bot.serverCommand(encrypt({'command':'binanceC1Minimum','pair':base,'min':1})))
		});
	});
	describe('#binanceLimits', function() {
		it('Should return true', function() {
			bot.binanceLimits[base] =  {
				"over":{"lowerLimit":0,"upperLimit":0},
				"under":{"lowerLimit":0,"upperLimit":0}
			}
			assert(bot.serverCommand(encrypt({'command':'binanceLimits','pair':base,'selection':'over.lowerLimit','value':1})))
		});
	});
	describe('#binanceOptimal', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'binanceOptimal','pair':base,'bool':false})))
		});
	});
	describe('#binanceMonitor', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'binanceMonitor','pair':base,'bool':false})))
		});
	});	
	describe('#liquidTradeBinance', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'liquidTradeBinance','pair':base,'bool':false})))
		});
	});		
	/*
	 * Bittrex Commands That Do Not Require a Network Request
	 * 
	 */
	describe('#bittrexMonitor', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrexMonitor','pair':base,'bool':false})))
		});
	});
	describe('#liquidTrade', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'liquidTrade','bool':false})))
		});
	});	
	describe('#lowerLimit', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'lowerLimit','pair':base,'limit':99})))
		});
	});
	describe('#poll', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'poll','rate':25})))
		});
	});
	describe('#poll_rate', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'poll_rate'})))
		});
	});	
	describe('#Sanity', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'sanity','bool':false})))
		});
	});		
	describe('#SwingPercentage', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'swingPercentage','percentage':95})))
		});
	});		
	describe('#SwingPoll', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'swingPoll','rate':120})))
		});
	});													
	describe('#SwingReset', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'swingReset'})))
		});
	});	
	describe('#SwingTrade', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'swingTrade'})))
		});
	});	

		
	describe('#upperLimit', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'upperLimit','pair':base,'limit':99})))
		});
	});		
	describe('#update_percentage', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'update_percentage','percentage1':50,'percentage2':99})))
		});
	});		
	
	/*
	 * General Commands 
	 */
	 describe('#Invalid message', function() {
		it('Should return false', function() {
			assert(!bot.serverCommand("randomMessage"))
		});
	});
	describe('#logLevel', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'logs','logLevel':1})))
		});
	});

});
	
describe('Server Commands 2', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.https = mock.https;
	/*
	 * Binance Commands That Require a Network Request
	 * 
	 */
	describe('#binance_balance', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'binance_balance'})))
		});
	});	 
	describe('#binance_control boolean(false)', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'binance_control','bool':false})))
		});
	});	
	describe('#binance_control boolean(true)', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'binance_control','bool':true})))
		});
	});	 		 	
	describe('#binance_orders', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'binance_orders'})))
		});
	});		
	/*
	 * Bittrex Commands That Require a Network Request
	 * 
	 */	 
	describe('#bittrex_balance', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrex_balance'})))
		});
	});		
	describe('#bittrex_book', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrex_book','bool':true})))
		});
	});		
	describe('#bittrex_control boolean(false)', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrex_control','bool':false})))
		});
	});	
	describe('#bittrex_control boolean(true)', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrex_control','bool':true})))
		});
	});				 
	describe('#bittrex_db', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrex_db','db':'trade'})))
		});
	});			 
	describe('#bittrex_orders', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'bittrex_orders'})))
		});
	});	
	/*
	 * General Commands Network Commands
	 */
	describe('#Connect', function() {
		it('Should return true', function() {
			assert(bot.serverCommand(encrypt({'command':'connect'})))
		});
	});		
	setTimeout(()=>{
		console.log("close Binance/Bittrex Connections");
		bot.serverCommand(encrypt({'command':'binance_control','bool':false}))
		bot.serverCommand(encrypt({'command':'bittrex_control','bool':false}))
	},5000); 
})
