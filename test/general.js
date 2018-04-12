var CryptoBot = require('../c4d.js');
var Settings = require('../config.json');
var mock = require('./mock.js');
var assert = require('assert');
var WebSocket = require('ws');

describe('General Functions', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.https = mock.https;
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();
	bot.setupWebsocket().then(()=>{
		bot.wss.close();
	});	
	describe('#Connect To Database', function() {
		it('Should return a db connection with trade and balance collections', function() {
			var x = bot.DB.balance;
			var y = bot.DB.trade;
			assert((x && y) !== undefined);
		});
		it('Should return empty DB', function() {
			let old = console.log
			console.log = function(){return}
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var _mockSettings = mock.mockSettings1;
			var empty = bot.database();
			assert(JSON.stringify(empty),"{}");
			console.log = old;
		});		
	});
	describe('#Connect To Empty Database', function() {
		var bot = new CryptoBot.bot(mock.mockSettings1);
		bot.MongoClient = mock.MongoClient2;
		bot.DB = bot.database();
		it('Should return a db connection with trade and balance collections', function() {
			var x = bot.DB.balance;
			var y = bot.DB.trade;
			assert((x && y) !== undefined);
		});	
	});
	
	
	describe('#Save to Database', function() {
		it('Should save and delete record from the database', function(done) {
			this.timeout(2000);
			var date = new Date().getTime();
			setTimeout( async function(){
				var x = await bot.saveDB("trade",{"UUID":date});
				var y = await bot.saveDB("trade",{},{method:"remove",query:{'UUID':date}});	
				try{
					console.log(x,y)
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
		var bot = new CryptoBot.bot(mock.mockSettings1);
		it('Should log a message', function() {
			var val = bot.log("Hello World");
			assert.equal(val,true);
		});
		it('Should return undefined', function() {
			bot.logLevel = 0;
			var val = bot.log("Hello World");
			assert(!val);
		});
		it('Should return true', function() {
			bot.logLevel = 2;
			var val = bot.log("Hello World");
			assert(val);
		});
	});	
	
	describe('#NiceOrderChain', function() {
		it('Should slow chain a series of functions', function(done) {
			this.timeout(5000);
			var bot = new CryptoBot.bot(mock.mockSettings1);
			function sum(obj){
				var count = 0;
				for(var key in obj){
					count += obj[key];
				}
				return count;
			}
			bot.cb = function (red){
				assert.equal(sum(red),2)
				done();
			}
			bot.add = function(x,y){return new Promise((resolve,reject)=>resolve(x+y))}
			var answer = {}
			bot.niceOrderChain([bot.add,bot.cb],answer).chain([[1,1]])			
		});
	});
	(function (){describe('#NiceOrderChain - 2', function() {
		it('Should return a promise', function(done) {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.cb = function(){}
			bot.add = function(x,y){return new Promise(function(resolve,reject){resolve(x+y)})}
			var y = Promise.resolve(bot.niceOrderChain([bot.add,bot.add,bot.cb],{}).chain([[1,1],[1,1]]))
			assert(y instanceof Promise);
			done();;
		});
	});})()			
	describe('#Send Email', function() {
		return it('Should send an email message', async function() {
			bot.email = mock.email;
			var val = await bot.sendEmail("Hello World");
			assert(val);			
		});
	});
	
	describe('#Should send Slack message', function() {
		it('Should send a slack message', async function() {
			var val = await bot.slackMessage("Hello World");
			assert(val);
		});
		 it('Should get error sending Slack message', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.https = mock.httpsError;
			return bot.slackMessage("Hello World").then((val)=>{
				assert(!val);
			});
		});
	});
	
	describe('#Setup WebSocket', function() {
		return it('Should setup a web socket server and connect to it', function() {
			var client = new WebSocket("ws://127.0.0.1:7073");
			client.onopen = (connected)=>{
				assert(connected);
				client.terminate();
			}
			client.onerror = (e) =>{
				console.log("Error:",e.code);
				assert(false);
			}	
		});
	});	
})
