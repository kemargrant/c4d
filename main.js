function main(){
	var CryptoBot = require('./c4d.js');
	var Settings;
	try{
		Settings = require('./config.json');
	}
	catch(e){
		return console.log(e);
	}
	var bot = new CryptoBot.bot(Settings);
	return bot.setupWebsocket().then(()=>{
		return bot.bittrexAccount().then(()=>{
			if(bot.vibrate === true){
				bot.bittrexSwing();
			}
			bot.binanceAccount().then(()=>{
				if(bot.binanceSocketConnections){
					bot.binanceMonitor(bot.Settings.Binance.pairs);
					return bot.binanceListenUser();
				}
			}).catch((e)=>{
				if(bot.Settings.Binance.enabled){
					bot.binanceMonitor(bot.Settings.Binance.pairs);
					return bot.binanceListenUser();
				}
			})
			if(bot.bittrexSocketConnection){
					bot.bittrexStream().catch((e)=>{
					bot.log("Error connecting to Bittrex Websocket:",e);
				});
			}
		}).catch((e)=>{
			if(bot.Settings.Binance.enabled){
				bot.binanceMonitor(bot.Settings.Binance.pairs);
				bot.binanceListenUser();
			}
			if(bot.bittrexSocketConnection){
				bot.bittrexStream().catch((e)=>{
					bot.log("Error connecting to Bittrex Websocket");
				});
			}
		});
	});
}

main();
