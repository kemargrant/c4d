"use strict";

var Settings = {};
try{
	Settings = require('./config.json');
}
catch(e){
	return console.log(e);
}
var https = require('https');
var crypto = require("crypto-js");
var MongoClient = require('mongodb').MongoClient;
var WebSocket = require('ws');

function CryptoBot(Settings){	
	this.balance = {}
	this.rate = Settings.Config ? Settings.Config.polling : 60000;
	this.swingRate = Settings.Config ? Settings.Swing.rate : 60000;
	this.saneTrades = Settings.Config ? Settings.Config.saneTrades : true;
	this.liquidTrades = Settings.Config ? Settings.Config.liquidTrades : true;
	this.vibrate = Settings.Config ? Settings.Swing.swingTrade : false;
	this.lowerLimit = Settings.Config ? Settings.Config.lowerLimit : 89;
	this.upperLimit = Settings.Config ? Settings.Config.upperLimit : 101.79;
	this.swingPercentage = Settings.Config ? Settings.Swing.swing : 0.02;
	this.Settings = Settings;
	this.DB = this.database();
	this.p1 = this.Settings.Config.percentage1;
	this.p2 = this.Settings.Config.percentage2;
	this.bittrexHistory.updateDB(this.DB);
	//setup websocket
	this.wss = new WebSocket.Server({port:Settings.Config.port});
	//transactions
	this.Transactions = {};
}

CryptoBot.prototype.bittrexAPI = function(path,options){
	return new Promise((resolve,reject) =>{	
		var hmac;
		var nonce;
		var postData;
		var req;
		var shaObj;
		nonce = Math.floor(new Date().getTime()/1000);
		postData ="https://bittrex.com/api/v1.1/"+path+"?apikey="+Settings.Bittrex.apikey+"&nonce="+nonce;
		if(options && options.length > 0){
			postData = postData + options;
		}
		hmac = crypto.HmacSHA512(postData,Settings.Bittrex.secret).toString();
		req = https.request(
		    {
				host:"bittrex.com",
				path:postData.replace("https://bittrex.com",""),
				method:"Get",
				headers:{"apisign":hmac}
			},
			(response)=>{
		        var body = "";
		        response.on("data",function(d){
					body += d;
				});
		        response.on("end",function(){
					var parsed;
					try{
						parsed = JSON.parse(body);
						//console.log(options,"=>",parsed);
						return resolve(parsed.result);		
					}
					catch(e){
						console.log("Bittrex API Error:",e);
						return reject(e);
					}		
		            return resolve(parsed);
			    });
		        response.on('error',(e)=>{
					console.log("Bittrex API Error:",e);
					return reject(e);
				})
			}
	    );
	   return req.end();
	});
}	
	
CryptoBot.prototype.bittrexAccount = function(){
	return new Promise((resolve,reject)=>{
		return this.bittrexAPI("account/getbalances",null).then((list)=>{
			if(!list){
				console.log("Error getting Bittrex account info");
				return reject(false);
			}
			list.map((asset)=>{
				return this.balance[asset.Currency.toLowerCase()] = asset.Available;
			});
			this.balance.account = "BITTREX";
			this.broadcastMessage({"type":"balance","balance":this.balance,"p1":this.p1,"p2":this.p2});
			var balance = {};
			for(var i = 0;i < list.length;i++){
				if(this.balance[list[i].Currency.toLowerCase()] > 0){
					balance[list[i].Currency] = this.balance[list[i].Currency.toLowerCase()];
				}
			}
			balance.Time = new Date().getTime();
			this.saveDB("balance",balance);
			console.log("Balance:",this.balance);				
			return resolve(true);				
		}).catch((e)=>{
			console.log("Error getting bittrex balance:",e);
			return reject(false);
		});
	});
}
	
CryptoBot.prototype.bittrexArbitrage = function(pair1,pair2,pair3){
	return new Promise((resolve,reject)=>{
		return Promise.all([this.bittrexDepth(pair1),this.bittrexDepth(pair2),this.bittrexDepth(pair3)]).then((values)=>{
			var a;
			var b;
			var c;
			var btc_status;
			var eth_status;				
			var usdt_status;
			var liquidBook;
			var message = "Bittrex Bot:";
			var myWallet;
			var percentage;
			var sanity;
			var trading_pairs;
			var Transactions = this.Transactions;
			var e1;
			var _e1;
			var u2;
			var b3;
			var _b3;
			a =  values[0].strat1,b = values[1].strat1,c = values[2].strat1;
			e1 = pair1.split('-')[1].toLowerCase();
			_e1 = "_" + pair1.split('-')[1].toLowerCase();
			b3 = pair1.split('-')[0].toLowerCase();
			_b3 = "_"+pair1.split('-')[0].toLowerCase();
			u2 = pair2.split('-')[0].toLowerCase();						
			percentage = a * b/c * 100;
			if(!Number(percentage)){
					console.log("Bittrex Arbitrage Error:",new Date());
					return setTimeout(()=>{this.bittrexArbitrage(pair1,pair2,pair3).catch((e)=>{console.log(e);})},this.rate);
			}
			if(percentage < 100){
				trading_pairs = {"type":"percentage","exchange":"bittrex","percentage":percentage,"strategy":1}
				trading_pairs[pair1] = a,trading_pairs[pair2] = b,trading_pairs[pair3] = c;
				this.bittrexHistory.add(percentage);
				this.broadcastMessage(trading_pairs);
				//console.log("Bittrex("+a+'|'+pair1+'/ '+b+'|'+pair2+'/ '+c+'|'+pair3+")",percentage);
				Transactions[e1] = Number((this.balance[e1] * this.p1).toFixed(8));
				Transactions[u2] = 0.9975*Transactions[e1] * c;
				Transactions[b3] = 0.9975*Transactions[u2]/b;	
				Transactions[_e1] = Transactions[b3]/a * 0.9975;
				message += percentage.toFixed(3) +"%\n";
				message += Transactions[e1] + e1+ " => "+ Transactions[u2].toFixed(8) + pair3.split('-')[0] + " @"+c+"\n";
				message += Transactions[u2].toFixed(8)+ pair3.split('-')[0] + " => " +Transactions[b3].toFixed(8)+pair2.split('-')[1]  +" @"+b+"\n";
				message +=Transactions[b3].toFixed(8)+pair2.split('-')[1] +" => "+Transactions[_e1].toFixed(8) + pair1.split('-')[1] +" @"+a;							
				Transactions[e1+'_status'] = this.balance[e1] >= Transactions[e1];
				Transactions[b3+'_status'] = this.balance[b3] > Transactions[b3];
				Transactions[u2+'_status'] = this.balance[u2] > Transactions[u2];
				//console.log(message+ "\n "+e1+" status:"+Transactions[e1+'_status'] +"| btc status:"+Transactions[b3+'_status']+ "| usdt status:"+Transactions[u2+'_status']);
				this.broadcastMessage({"type":"log","log":message + "\n eth status:"+ Transactions[e1+'_status']+"| btc status:"+Transactions[b3+'_status']+ "| usdt status:"+Transactions[u2+'_status']});			
				liquidBook = Transactions[u2+'_amount'] > Transactions[u2] && Transactions[b3+'_amount'] > Transactions[b3] && Transactions[e1+'_amount'] > Transactions[e1];
				sanity = percentage > this.lowerLimit && percentage < 99.25;
				myWallet = Transactions[e1+'_status'] && Transactions[b3+'_status'] && Transactions[u2+'_status'];
				if(this.saneTrades === true && sanity || this.saneTrades === false){
					if(this.liquidTrades && liquidBook || this.liquidTrades === false){
						if(myWallet){
							if(Transactions.btc < 0.0005){
									this.notify("Server error  ("+Transactions.btc+") BTC  is less than 0.0005\n"+message);
									this.bittrexAccount().catch((e)=>{});
									return setTimeout(()=>{this.bittrexArbitrage(pair1,pair2,pair3).catch((e)=>{console.log(e);});},this.rate);
							}
							console.log("Starting Trades");														
							try{
								this.notify(message);
							}
							catch(e){
								console.log(e);
							}
							return this.bittrexTrade("sell",pair3,Transactions[e1],c).then(()=>{
								this.bittrexTrade("buy",pair2,Number(Transactions[b3].toFixed(8)),b).catch((e)=>{
									this.notify("Retrying buying:"+Transactions[b3].toFixed(8)+" btc @"+b);
									setTimeout(()=>{this.bittrexTrade("buy",pair2,Number(Transactions[b3].toFixed(8)),b).catch((e)=>{this.notify(e);})},2000);
								});
							}).then(()=>{
								this.bittrexTrade("buy",pair1,Transactions[_e1].toFixed(8),a).catch((e)=>{
									this.notify("Retrying buying:"+Transactions[_e1].toFixed(8)+" "+e1+" @"+a);
									setTimeout(()=>{this.bittrexTrade("buy",pair1,Transactions[_e1].toFixed(8),a).catch((e)=>{this.notify(e);})},3000);
								});
							}).then(()=>{
								return setTimeout(()=>{
									this.bittrexCompleteArbitrage();
									this.saveDB("trade",{"Time":new Date().getTime(),"Percent":percentage,"Before":Transactions[e1],"After":Number(Transactions[_e1].toFixed(8)),"Profit":Transactions[_e1].toFixed(8)/Transactions[e1]});
								},20000);
							}).catch((e)=>{
								console.log(e);
								this.notify("Selling: "+Transactions[e1]+pair3.replace('-','<=  @')+c +" Failed");
							});
						}
						else{
							console.log("Current balances not enough to send transfer:",Transactions);
						}
					}
					else{
						console.log("Illiquid Trade:",Transactions);
					}	
				}
				else{
					console.log("Insane Trade:sanity=>",percentage,"SaneTrades=>",this.Settings.Config.saneTrades);
				}
			}
			else{
				a =  values[0].strat2,b = values[1].strat2,c = values[2].strat2;
				percentage = a * b/c * 100;
				trading_pairs = {"type":"percentage","exchange":"bittrex","percentage":percentage,"strategy":2}
				trading_pairs[pair1] = a,trading_pairs[pair2] = b,trading_pairs[pair3] = c;
				this.broadcastMessage(trading_pairs);
				this.bittrexHistory.add(percentage);
				//console.log("Bittrex("+a+'|'+pair1+'/ '+b+'|'+pair2+'/ '+c+'|'+pair3+")",percentage);
				Transactions[b3] =  Number((this.balance[b3] * this.p2).toFixed(8));
				Transactions[u2] = 0.9975 * Transactions[b3] * b;
				Transactions[e1] = 0.9975*(Transactions[u2]/c);
				Transactions[_b3] = Number((0.9975 * Transactions[e1]*a).toFixed(8));
				message = message + percentage.toFixed(3)+"%\n";
				message = message + Transactions[b3] + b3 +" => "+Transactions[u2].toFixed(8)+" "+u2+" @" + b + '\n';
				message = message + Transactions[u2].toFixed(8) + u2+" => " + Transactions[e1].toFixed(8) + e1+" @"+c +'\n';
				message = message + Transactions[e1].toFixed(8) + e1+" => " + Transactions[_b3] +" "+b3+" @"+a;
				Transactions[e1+'_status'] = this.balance[e1] > Transactions[e1];
				Transactions[b3+'_status'] = this.balance[b3] > Transactions[b3];
				Transactions[u2+'_status'] = this.balance[u2] > Transactions[u2];
				//console.log(message + "eth status:"+ Transactions[e1+'_status']+"| btc status:"+Transactions[b3+'_status']+ "| usdt status:"+Transactions[u2+'_status']);
				this.broadcastMessage({"type":"log","log":message + e1+" status:"+ Transactions[e1+'_status']+"| "+b3+" status:"+Transactions[b3+'_status']+ "| "+u2+" status:"+Transactions[u2+'_status']});
				liquidBook =  Transactions[u2+'_amount'] > Transactions[u2] && Transactions[b3+'_amount'] > Transactions[b3] && Transactions[e1+'_amount'] > Transactions[e1];
				sanity = percentage > 100.7524 && percentage < this.upperLimit;
				myWallet = Transactions[e1+'_status'] && Transactions[b3+'_status'] && Transactions[u2+'_status'];
				if(this.saneTrades === true && sanity || this.saneTrades === false){
					if(this.liquidTrades && liquidBook || this.liquidTrades === false){
						if(myWallet){	
							if(Transactions.btc < 0.0005){
								this.notify("Server error  ("+Transactions.btc+") BTC  is less than 0.0005\n"+message);
								this.bittrexAccount().catch((e)=>{});
								return setTimeout(()=>{this.bittrexArbitrage(pair1,pair2,pair3).catch((e)=>{console.log(e);});},this.rate);
							}										
							console.log("Starting Trades");
							try{this.notify(message);}catch(e){console.log(e);}
							return this.bittrexTrade("sell",pair2,Transactions[b3],b).then(()=>{
								this.bittrexTrade("buy",pair3,Transactions[e1].toFixed(8),c).catch((e)=>{
									this.notify("Retrying buying:"+Transactions[e1].toFixed(8)+u2+" =>"+e1+" @"+c);
									setTimeout(()=>{this.bittrexTrade("buy",pair3,Transactions[e1].toFixed(8),c).catch((e)=>{this.notify(e);});},3000);
								});
							})
							.then(()=>{
								this.bittrexTrade("sell",pair1,Transactions[e1].toFixed(8),a).catch((e)=>{
									this.notify("Retrying selling:"+Transactions[e1].toFixed(8)+e1+" =>"+e1+" @"+a);
									setTimeout(()=>{this.bittrexTrade("sell",pair1,Transactions[e1].toFixed(8),a).catch((e)=>{this.notify(e);});},3000);
								});		
							})
							.then(()=>{
								return setTimeout(()=>{
									this.bittrexCompleteArbitrage();
									this.saveDB("trade",{"Time":new Date().getTime(),"Percent":percentage,"Before":Transactions[b3],"After":Number(Transactions[_b3]),"Profit":Number(Transactions[_b3])/Transactions[b3]})
								},20000);
							}).catch((e)=>{
								console.log(e);
								this.notify("Selling:"+Transactions[b3]+b3+" =>"+u2+" @"+b+" Failed");
							})
						}
						else{
							console.log("Current balances not enough to perform trades",Transactions);
						}
					}
					else{
						console.log("Illiquid Trade:",Transactions);
					}	
				}
				else{
					console.log("Insane Trade:sanity=>",percentage,"SaneTrades=>",this.Settings.Config.saneTrades);
				}									
			}
			return resolve(setTimeout(()=>{this.bittrexArbitrage(pair1,pair2,pair3).catch((e)=>{console.log(e);});},this.rate));	
		}).catch((e)=>{
				console.log("Error Performing Arbitage:",e);
				return resolve(setTimeout(()=>{this.bittrexArbitrage(pair1,pair2,pair3).catch((e)=>{console.log(e);});},this.rate * 2));
		});
	});
}

CryptoBot.prototype.bittrexCompleteArbitrage = function(){
	console.log("Monitoring Orders: ",new Date().toString());
	return this.bittrexGetOrders().then((orders)=>{
		var z;
		console.log("orders:",orders);
		if(!orders || orders === null){
			this.balance.orders = false;
			z= -1;
		}
		else if(JSON.stringify(orders) === "{}" || orders.length < 1){
			z=0;
		}
		else{
			z =1;
		}
		this.rate = this.rate * 2.3;		
		console.log("Z:",z," Polling: ",this.rate,new Date().toString());	
		if(this.rate > 1400000){
			z = -1;
			this.rate = this.Settings.Config.polling;
		}
		this.broadcastMessage({"type":"poll_rate","polling":this.rate});
		if(z > 0){
			return setTimeout(()=>{this.bittrexCompleteArbitrage();},this.rate);
		}
		else{
				console.log("Arbitrage Completed");
				this.broadcastMessage({"type":"alert","alert":"Arbitage Completed","polling":this.rate});
				return this.bittrexAccount().then(()=>{
					this.rate = this.Settings.Config.polling;
					return this.bittrexPoll();
				}).catch((e)=>{
					console.log("Error Getting Balance:",e);
					this.notify("Error getting balance after arbitrage compleged:"+new Date());
					return this.bittrexAccount().then(()=>{
						this.bittrexPoll();
					}).catch((e)=>{
						this.bittrexPoll();
					});
				})	
		}
	}).catch((e)=>{
		console.log("Error:",e);
		return setTimeout(()=>{this.bittrexCompleteArbitrage();},this.rate * 3);
	});		
}	

CryptoBot.prototype.bittrexDepth = function(pair){
	return new Promise((resolve,reject) =>{	
	    https.get({host: "bittrex.com",path: "/api/v1.1/public/getorderbook?market="+pair+"&type=both"},(response)=>{
		        var body = '';
		        response.on('data',(d)=> {
					body += d;
				});
		        response.on('end',()=> {	
						try{
							if(!body){
								return reject(body);
							}
				            var parsed = JSON.parse(body);
				            if(!parsed || !parsed.success){
								return reject("Error:"+body);
							}
							if(!this.Transactions[pair.split('-')[1].toLowerCase()+'_amount']){
								this.Transactions[pair.split('-')[1].toLowerCase()+'_amount'] =  Number(parsed['result'].sell[0].Quantity);
							}
							else{
								this.Transactions[pair.split('-')[0].toLowerCase()+'_amount'] =  Number((parsed['result'].buy[0].Quantity * parsed['result'].buy[0].Rate));
							}
							if(pair === this.Settings.Config.pair3){
								return resolve({"strat1":Number(parsed['result'].buy[0].Rate),"strat2":Number(parsed['result'].sell[0].Rate)});
							}
							else if(pair === this.Settings.Config.pair2){
								return resolve({"strat1":Number(parsed['result'].sell[0].Rate),"strat2":Number(parsed['result'].buy[0].Rate)});
							}
							else{
								return resolve({"strat1":Number(parsed['result'].sell[0].Rate),"strat2":Number(parsed['result'].sell[0].Rate)});
							}
						}
						catch(e){
							return reject(e);
						}
			    });
		}).on('error',(e)=>{
			console.log(e);
			return reject(e);
		});
	});
}

CryptoBot.prototype.bittrexDepthPure = function(pair){
	return new Promise((resolve,reject) =>{	
	    https.get({host: "bittrex.com",path: "/api/v1.1/public/getorderbook?market="+pair+"&type=both"},(response)=>{
		        var body = '';
		        response.on('data',(d)=> {
					body += d;
				});
		        response.on('end',()=> {	
						try{
							if(!body){
								return reject(body);
							}
				            var parsed = JSON.parse(body);
				            if(!parsed || !parsed.success){
								return reject("Error:"+body);
							}
							return resolve({"sell":Number(parsed['result'].sell[0].Rate),"buy":Number(parsed['result'].buy[0].Rate)});
						}
						catch(e){
							return reject(false);
						}
			    });
		}).on('error',(e)=>{
			console.log(e);
			return reject(e);
		});
	});
}

CryptoBot.prototype.bittrexGetOrders = function(){
	return new Promise((resolve,reject) => {	
		return this.bittrexAPI("market/getopenorders",null).then((orders)=>{
			if(orders && orders.length > 0){
				for(var i = 0;i < orders.length;i++){
					this.saveDB("order",{},{method:"update",query:{"uuid":orders[i].OrderUuid},modifier:{"$set":{"open":true}}})
				}
			}
			return resolve(orders);
		}).catch((e)=>{
			console.log(e);return reject(e);
		});	
	})
}	

CryptoBot.prototype.bittrexHistory = (function(){
	var _history = {percentages:[],dates:[],DB:undefined}
	var _add = function (percentage){
		var date = new Date().getTime();
		if(_history.percentages.length > 500){
				_history.percentages = _history.percentages.slice(Math.floor(_history.percentages.length/2));
				_history.dates = _history.dates.slice(Math.floor(_history.dates.length/2));
		}
		_history.percentages.push(percentage);
		_history.dates.push(date);
		if(_history.DB && _history.DB.history){
			return _history.DB.history.insert({"Time":date,"Percent":percentage}, {w:1},function(err, result) {
					if(err){
						console.log("Error adding percentage to DB:",err);
					}
					else{
						console.log("Percentage added to DB");
					}
					return;
				});	
			}
	}
	var _updateDB = function(db){_history.DB = db;}
	var _saveDB = function(type,doc){
			try{
				
				if(!_history.DB[type]){
					return console.log("Database Does Not Exist");
				}
				return _history.DB[type].insert(doc, {w:1},function(err, result) {
					if(err){
						console.log("Error adding "+type+" to DB:",err);
					}
					else{
						console.log(type+" added to DB");
					}
					return;
				});	
			}
			catch(e){
				return console.log(e);
			}
	}
	return {add: _add,history:_history,updateDB:_updateDB,saveDB:_saveDB}
})()

CryptoBot.prototype.bittrexPoll = function(){
	return this.bittrexArbitrage(this.Settings.Config.pair1,this.Settings.Config.pair2,this.Settings.Config.pair3);		
}

CryptoBot.prototype.broadcastMessage = function(data){
  return this.wss.clients.forEach((client)=> {
	    if (client.readyState === WebSocket.OPEN){
				try{
					var encrypted = typeof data === "string" ? crypto.AES.encrypt(data,Settings.Config.key).toString() : crypto.AES.encrypt(JSON.stringify(data),Settings.Config.key).toString();
					return client.send(encrypted);
				}
				catch(e){
					return console.log(e);
				}
		}
	});
}	

CryptoBot.prototype.database = function(){
	var DB = {}
	if(this.Settings.MongoDB.connect){
		try{
			MongoClient.connect(this.Settings.MongoDB.db_string, function(err, db) {
				if(err) { 
					return (console.log("Unable to connect to the database:",err)); 
				}
				else{
					db.createCollection('bittrexBalance',{strict:true},function(err,collection){ 
							if(err){
								console.log("Bittrex Balance Collection Already Created");
							}
							else{
								db.collection('bittrexBalance').createIndex( { "Time": 1 }, { unique: true } )
							}
							return DB.balance = db.collection('bittrexBalance');
					});	
					db.createCollection('bittrexHistory',{strict:true},function(err,collection){ 
							if(err){
								console.log("Bittrex History Collection Already Created");
								}
							else{
								db.collection('bittrexHistory').createIndex( { "Time": 1 }, { unique: true } )
							}
							DB.history = db.collection('bittrexHistory');	
					});	
					db.createCollection('bittrexTrade',{strict:true},function(err,collection){ 
							if(err){
								console.log("Bittrex Trade Collection Already Created");
							}
							else{
								db.collection('bittrexTrade').createIndex( { "Time": 1 }, { unique: true } )
							}
							DB.trade = db.collection('bittrexTrade');	
					});	
					db.createCollection('bittrexOrder',{strict:true},function(err,collection){ 
							if(err){
								console.log("Bittrex Order Collection Already Created");
							}
							else{
								db.collection('bittrexOrder').createIndex( { "uuid": 1 }, { unique: true } )
							}
							DB.order = db.collection('bittrexOrder');	
					});	
					db.createCollection('bittrexSwing',{strict:true},function(err,collection){ 
							if(err){
								console.log("Bittrex Swing Collection Already Created");
							}
							else{
								db.collection('bittrexSwing').createIndex( { "swing": 1 }, { unique: true } )
							}
							DB.swing = db.collection('bittrexSwing');	
					});													
				}
			});			
		}
		catch(e){
			console.log(e);
		}	
	}
	else{
		console.log("Database Not Found");
	}
	return DB
}

CryptoBot.prototype.notify = function(message){
	if(this.Settings.Slack.use){
		this.sendEmail(message)
	}
	if(this.Settings.Email.use){
		this.slackMessage(message);
	}
	return;
}

CryptoBot.prototype.retrieveDB = function(type){
	return new Promise((resolve,reject) => {
		try{
			if(!this.DB || !this.DB[type]){
				this.DB = this.database();
			}
			return this.DB[type].find({}).toArray(function(err, items){
				if(err){
					console.log(err);return resolve(e);
				}
				else{
					return resolve(items);
				}
			});									
		}
		catch(e){
			console.log(e);
			return resolve(e);
		}
	})
}	

CryptoBot.prototype.saveDB = function(type,doc,options){
	try{
		if(!this.Settings.MongoDB.connect){
			return console.log("MongoDB setting error")
		}
		if(!this.DB || !this.DB[type]){
			this.DB = this.database();
		}
		if(!options){
			return this.DB[type].insert(doc, {w:1},function(err, result) {
				if(err){
					console.log("Error adding "+type+" to DB:",err);
				}
				else{
					console.log(type+" added to DB");
				}
				return;
			});	
		}
		else{
			return this.DB[type][options.method](options.query,options.modifier,options.extra,function(err, result) {
				if(err){
					console.log("Error updating "+type+" in DB:",err);
				}
				else{
					console.log(type+" updated in DB");
				}
				return;
			});	
		}										
	}
	catch(e){
		return console.log(e);
	}
}

CryptoBot.prototype.sendEmail = function(email_message){
	var email;
	var message;
	var server;		
	email  = require("emailjs");
	server = email.server.connect({
	   user:	Settings.Email.usr, 
	   password: Settings.Email.pwd, 
	   host:	Settings.Email.host_smtp, 
	   tls:		true,
	   port:	587
	}); 
	message	= {
		   text:email_message, 
		   from:Settings.Email.usr, 
		   to:Settings.Email.addr,
		   subject:"C4D",
		   attachment:[{data:"<html>"+email_message+"</html>",alternative:true,inline:true}]			   
	};		
	return server.send(message,function(err, message){
		if(err){
			return console.log("Error Sending Email:",err);
		}
	});
}

CryptoBot.prototype.setupWebsocket = function(){
	return new Promise((resolve,reject) =>{			
		this.wss.on('connection',(ws)=>{
			console.log("Websocket started");
			resolve(true);
			ws.on('message',(message)=>{
				try{
					console.log("Message Received:",message);
					try{
						message = JSON.parse(crypto.AES.decrypt(message,Settings.Config.key).toString(crypto.enc.Utf8));												
					}
					catch(e){
						return console.log(e);
					}
					if(message.command === "bittrex_orders"){
						return this.bittrexGetOrders().then((orders)=>{
							orders.map(function(order){
								return ws.send(crypto.AES.encrypt(JSON.stringify({"type":'order',"otype":order.OrderType,"timestamp_created":order.Opened,"rate":order.Limit,"status":order.Closed,"pair":order.Exchange,"filled":order.QuantityRemaining,"amount":order.Quantity,"order_id":order.OrderUuid}),Settings.Config.key).toString());
							});
						}).catch((e)=>{
							console.log(e);
						})
					}	
					if(message.command === "bittrex_db"){
						return this.retrieveDB(message.db).then((que)=>{
							return ws.send(crypto.AES.encrypt(JSON.stringify({"type":'db_'+message.db,"info":que}),Settings.Config.key).toString());														
						}).catch((e)=>{
							console.log(e);
							return ws.send(crypto.AES.encrypt(JSON.stringify({"type":'log',"log":e}),Settings.Config.key).toString());
						})								
					}						
					if(message.command === "connect"){
						ws.send(crypto.AES.encrypt(JSON.stringify({"type":'balance',"balance":this.balance,"p1":this.p1,"p2":this.p2,"polling":this.rate}),Settings.Config.key).toString());
						ws.send(crypto.AES.encrypt(JSON.stringify({"type":'config',"swingPercentage":this.swingPercentage,"swingRate":this.swingRate,"sanity":this.saneTrades,"liquid":this.liquidTrades,"vibrate":this.vibrate,"upperLimit":this.upperLimit,"lowerLimit":this.lowerLimit}),Settings.Config.key).toString());
						ws.send(crypto.AES.encrypt(JSON.stringify({"type":'swingStatus',"amount":this.Settings.Swing.amount,"pair":this.Settings.Swing.pair,"order":this.swingTrade,"swing":this.Settings.Swing.swing,"on":this.Settings.Swing.swingTrade}),Settings.Config.key).toString());
						
						return ws.send(crypto.AES.encrypt(JSON.stringify({"type":"history","bittrex_history1":this.bittrexHistory.history.percentages,"bittrex_history2":this.bittrexHistory.history.dates}),Settings.Config.key).toString());
					}			
					if(message.command === "lowerLimit"){
						this.lowerLimit = message.limit;
						return console.log("Lower Limit:",this.lowerLimit);
					}															
					if(message.command === "poll"){
						if(Number(message.rate)){this.rate = message.rate * 1000;}
						return console.log("poll_rate:",this.rate/1000 +" seconds");
					}									
					if(message.command === "poll_rate"){
						return this.broadcastMessage({"type":"poll_rate","polling":this.rate});
					}											
					if(message.command === "bittrex_balance"){
						return this.bittrexAccount().catch(e=>console.log(e));
					}	
					if(message.command === "liquidTrade"){
						this.liquidTrades = message.bool;
						return console.log("liquidTrades:",this.liquidTrades);
					}					
					if(message.command === "sanity"){
						this.saneTrades = message.bool;
						return console.log("saneTrades:",this.saneTrades);
					}
					if(message.command === "swingPercentage"){
						this.swingPercentage = message.percentage/100;
						return console.log("Swing Percentage:",this.swingPercentage);
					}												
					if(message.command === "swingPoll"){
						if(Number(message.rate)){this.swingRate = message.rate * 1000;}
						return console.log("poll_rate:",this.swingRate/1000 +" seconds");
					}	
					if(message.command === "swingTrade"){
						this.vibrate = message.bool;
						if(message.bool === true && this.vibrate === false){
							this.bittrexSwing();
						}
						return console.log("Swing Trade:",this.vibrate);
					}		
					if(message.command === "update_percentage"){
						this.p1 = message.percentage1;
						return this.p2 = message.percentage2;
					}
					if(message.command === "upperLimit"){
						this.upperLimit = message.limit;
						return console.log("Upper Limit:",this.upperLimit);
					}																																																									
				}
				catch(e){
					console.log(e);
				}
			});				
		});	
	});				
}	

CryptoBot.prototype.slackMessage = function(slack_message){
	try{
		var img;
		var parameters;
		var message;
		var req;
		message = slack_message + " @"+Settings.Slack.usr;
		parameters = {};
		img = Settings.Slack.img;
		parameters.channel = Settings.Slack.channel;
		parameters.username = "Server_Message";
		parameters.attachments = [{"pretext":new Date().toString().split('GM')[0],"text":message,"image_url":img}];
		req = https.request(
		    {
				host:"hooks.slack.com",
				path: Settings.Slack.hook.replace("https://hooks.slack.com",""),
				method:"Post",
			},
			(response)=>{
		        var body = "";
		        response.on("data",function(d){
					body += d;
					console.log(body)
				});
		        response.on("end",function(){
					console.log('body:',body)
			    });
		        response.on('error',(e)=>{
					console.log("Bittrex API Error:",e);
				})
			}
	    );
	   req.write(JSON.stringify(parameters))
	   req.end();
	}
	catch(e){
		return console.log(e);
	}
}		

CryptoBot.prototype.bittrexSwing = function(){
	if(!this.vibrate){
		return;
	}
	var _order = (type,pair,amount,price) => {
		return this.bittrexTrade(type,pair,amount,price,{"swing":true})
			.then((order)=>{
				if(!order){
					console.log(e);
					return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				}
				this.swingTrade = false;
				this.bittrexAccount();
				this.saveDB("swing",{},{extra:{"w":1,"upsert":true},method:"update",query:{"swing":1},modifier:{"$set":{"swing":1,"order":order,"filled":false}}});
				return this.bittrexSwingOrder(order.uuid);
			}).catch((e)=>{
					console.log(e);
					return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				});
	}
	var _swing = (trade) =>{
		if(trade){
			if(trade.filled !== true){
				return this.bittrexSwingOrder(trade.order.OrderUuid);
			}
			var newTrade = trade.order.Type === "LIMIT_SELL" ? "buy" : "sell";
			this.bittrexDepthPure(this.Settings.Swing.pair).then((val)=>{
				if(newTrade === "buy"){
					var target =(1 - this.swingPercentage) * trade.order.Limit;
					console.log("Buying (Target/Price):",target+"/"+val.sell);
					this.broadcastMessage({"type":"swing","target":target,"price":val.sell,"trade":"bid"});
					if (val.sell < target){
						this.notify(this.Settings.Swing.pair+" Buying "+trade.order.Quantity+" @"+val.sell);
						return _order("buy",this.Settings.Swing.pair,trade.order.Quantity,val.sell);
					}
					else{
						return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
					}
				}
				else{
					var target = (1 + this.swingPercentage) * trade.order.Limit;
					console.log("Selling (Target/Price):",target+"/"+val.buy);
					this.broadcastMessage({"type":"swing","target":target,"price":val.buy,"trade":"ask"});
					if (val.buy > target){
						this.notify(this.Settings.Swing.pair+" Selling "+trade.order.Quantity+" @"+val.buy);
						return _order("sell",this.Settings.Swing.pair,trade.order.Quantity,val.buy);
					}
					else{
						return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
					}
				}
			}).catch((e)=>{
					console.log(e);
					return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				});								
		}
		else{	
			if(this.balance.btc < this.Settings.Swing.amount){
				return console.log("Account balance too low:",this.balance);
			}
			return this.bittrexDepthPure(this.Settings.Swing.pair).then((val)=>{
				var amount = (this.Settings.Swing.amount/val.sell).toFixed(8)
				return _order("buy",this.Settings.Swing.pair,amount,val.sell)
			}).catch((e)=>{
					console.log(e);
					return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				});
		}	
	}
	if(!this.swingTrade){
		return this.retrieveDB("swing").then((trades)=>{
			this.swingTrade = trades[0];
			this.swingTrade.swing = this.Settings.Swing.swing;
			this.broadcastMessage({"type":"swingOrder","order":this.swingTrade});
			return _swing(this.swingTrade);
		}).catch((e)=>{
				console.log(e);
				return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
			});
	}
	else{
		return _swing(this.swingTrade);
	}
			
}

CryptoBot.prototype.bittrexSwingOrder = function(uuid){
	return new Promise((resolve,reject) => {	
		this.bittrexAPI("account/getorder","&uuid="+uuid).then((order)=>{
			if(order){
				this.saveDB("swing",{},{extra:{"w":1},method:"update",query:{"swing":1},modifier:{"$set":{"swing":1,"order":order,"filled":!order.IsOpen}}});
				if(order.IsOpen !== true){
					this.notify("Order:"+uuid+" Filled");
					this.bittrexAccount();
					return setTimeout(()=>{this.bittrexSwing()},this.swingRate);
				}		
				return setTimeout(()=>{this.bittrexSwingOrder(uuid);},this.swingRate);		
			}
			else{
				console.log("Unable to find order:"+uuid);
				this.notify("Swing Error. Unable to find:"+uuid);
				return setTimeout(()=>{this.bittrexSwingOrder(uuid);},this.swingRate);
			}
		}).catch((e)=>{
				console.log(e);
				return setTimeout(()=>{this.bittrexSwingOrder(uuid);},this.swingRate);
			});	
	})
}	

CryptoBot.prototype.bittrexTrade = function(type,pair,quantity,rate,options){
	return new Promise((resolve,reject) => {	
		return this.bittrexAPI("market/"+type+"limit","&rate="+rate+"&market="+pair+"&quantity="+quantity).then((result)=>{
			console.log("Order:"+type+","+pair+" "+quantity+"@"+rate,result);
			if(result.uuid){
				this.bittrexAPI("account/getorder","&uuid="+result.uuid).then((order)=>{
					if(!options){
						this.saveDB("order",{"uuid":result.uuid,"order":order});
					}
				}).catch((e)=>{
						console.log(e);
					});	
				return resolve(result);	
			}
			else{
				this.notify("Trade Error:"+type+"/"+pair+"/"+quantity+"/"+rate);
				return reject(false);
			}
		}).catch((e)=>{
					return reject(e);
					});
	})
}

function main(){
	var bot = new CryptoBot(Settings);
	return bot.setupWebsocket().then(()=>{
		return bot.bittrexAccount().then(()=>{
			if(bot.vibrate === true){
				bot.bittrexSwing();
			}
			return bot.bittrexPoll();
		}).catch((e)=>{
			return bot.bittrexPoll();
		});
	});
}
main();

