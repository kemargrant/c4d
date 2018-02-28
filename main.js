function main(){
	var CryptoBot = require('./c4d.js');
	var bot = new CryptoBot.bot();
	return bot.setupWebsocket().then(()=>{
		return bot.bittrexAccount().then(()=>{
			if(bot.vibrate === true){
				bot.bittrexSwing();
			}
			if(bot.binanceSocketConnections){
				bot.binanceSocketConnections = [];
			}
			bot.binanceAccount().then(()=>{
				if(bot.binanceSocketConnections !== false){
					bot.binanceMonitor();
					return bot.binanceListenUser();
				}
			}).catch((e)=>{
				if(bot.binanceSocketConnections !== false){
					bot.binanceMonitor();
					return bot.binanceListenUser();
				}
			})
			if(bot.bittrexSocketConnection){
				bot.bittrexPrepareStream().then((info)=>{
					bot.bittrexStream(info[0],info[1])
				}).catch((e)=>{
					bot.log("Error connecting to Bittrex Websocket:",e);
				});
			}
		}).catch((e)=>{
			if(bot.binanceSocketConnections !== false){
				bot.binanceMonitor();
				bot.binanceListenUser();
			}
			if(bot.bittrexSocketConnection){
				bot.bittrexPrepareStream().then((info)=>{
					bot.bittrexStream(info[0],info[1])
				}).catch((e)=>{
					bot.log("Error connecting to Bittrex Websocket");
				});
			}
		});
	});
}

main();
