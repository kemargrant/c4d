var CryptoBot = require('../c4d.js');
var Settings = require('../config.json');
var mock = require('./mock.js');
var assert = require('assert');
var WebSocket = require('ws');
var crypto = require("crypto-js");

describe('General Functions', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	bot.https = mock.https;
	bot.MongoClient = mock.MongoClient;
	bot.DB = bot.database();
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
			assert.equal(JSON.stringify(empty),"{}");
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
	describe('#Connect To Database Error', function() {
		it('Should return an empty db', function() {
			let bot = new CryptoBot.bot(mock.mockSettings1);
			bot.MongoClient = mock.MongoClient3;
			bot.DB = bot.database();
			assert.equal(JSON.stringify(bot.DB),"{}");
		});	
		it('Should return an empty db', function() {
			let bot = new CryptoBot.bot(mock.mockSettings1);
			bot.Settings.MongoDB.connect = false;
			bot.DB = bot.database();
			assert.equal(JSON.stringify(bot.DB),"{}");
			bot.Settings.MongoDB.connect = true;
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
	describe('#NiceOrderChain - CB Error', function() {
		it('Should return an error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.cb = function (red){
				throw new Error("cb error")
			}
			bot.add = function(x,y){return new Promise((resolve,reject)=>resolve(x+y))}
			var answer = {}
			return bot.niceOrderChain([bot.add,bot.cb],answer).chain([[1,1]]).catch((e)=>{
				assert(e.message,"cb error");
			})			
		});
	});		
	(function (){describe('#NiceOrderChain - 2', function() {
		it('Should return a promise', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.cb = function(){}
			bot.add = function(x,y){return new Promise(function(resolve,reject){resolve(x+y)})}
			var y = Promise.resolve(bot.niceOrderChain([bot.add,bot.add,bot.cb],{}).chain([[1,1],[1,1]]))
			assert(y instanceof Promise);
		});
	});})()		
	describe('#NiceOrderChain - 2 Function Error', function() {
		it('Should return an error', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.cb = function (red){
				return true;
			}
			bot.add = function(x,y){return new Promise((resolve,reject)=>reject(new Error("func error")))}
			var answer = {}
			return bot.niceOrderChain([bot.add,bot.add,bot.cb],answer).chain([[1,1],[1,2]]).catch((e)=>{
				assert(e.message,"func error");
			})			
		});
	});		
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
			bot.https = mock.httpsError2;
			return bot.slackMessage("Hello World").then((val)=>{
				assert(!val);
			});
		});
	});

	describe('#Notify', function() {
		 it('Should catch errors notify user', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			var error = function(){throw new Error("error");}
			bot.sendEmail = error;
			bot.slackMessage = error;
			bot.https = mock.httpsError;
			var val = bot.notify("Hello World")
			assert(val);
		});
	});

	
	describe('#Should broadcast a message', function() {
		 it('Should send a message to a websocket client', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.wss = {
				clients:[{
					readyState:1,
					send:(x)=>{
						bot.sent = x;
					},
					}]
			}
			bot.broadcastMessage('hello world');
			assert.equal(crypto.AES.decrypt(bot.sent,bot.Settings.Config.key).toString(crypto.enc.Utf8),"hello world");
		});
		it('Should catch error broadcasting message', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.wss = {
				clients:[
					{readyState:1,
					send:(x)=>{throw new Error("Error");},},
					{readyState:1,
					send:(x)=>{bot.sent = x},},
					
					]
			}
			bot.logLevel = 1;
			var val = bot.broadcastMessage('hello world');
			assert(bot.sent);
		});	
		it('Should catch error broadcasting message', function() {
			var bot = new CryptoBot.bot(mock.mockSettings1);
			bot.wss = {
				clients:true
			}
			bot.logLevel = 1;
			var e = bot.broadcastMessage('hello world');
			assert.equal(e.message,"this.wss.clients.forEach is not a function");
		});				
	});
		
	
	//~ describe('#Setup WebSocket', function() {
		//~ it('Should setup a web socket server and catch error event', function() {
			//~ setTimeout(()=>{
				//~ var client = new WebSocket("ws://127.0.0.1:7073");
				//~ client.onopen = (connected)=>{
				//~ }
			//~ },100)
			//~ return bot.setupWebsocket().then(()=>{
				//~ bot.wss.emit("error","");
			//~ }).catch((e)=>{
				//~ assert(e);
				//~ bot.wss.close();
			//~ });	
		//~ });
	//~ });	
	
	//~ describe('#Setup WebSocket', function() {
		//~ it('Should setup a web socket server and send a message', function() {
			//~ setTimeout(()=>{
				//~ var client = new WebSocket("ws://127.0.0.1:7073");
				//~ client.onopen = (connected)=>{
					//~ client.send("Test Message");
					//~ client.close();
				//~ }
			//~ },700)
			//~ return bot.setupWebsocket().then(()=>{
				//~ bot.wss.close();
			//~ })
		//~ });
	//~ });	
		
})
