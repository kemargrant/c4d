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
	bot.DB = bot.database();
	return bot.setupWebsocket().then(()=>{
		return bot.bittrexAccount().then(()=>{
			if(bot.vibrate === true){
				bot.bittrexSwing();
			}
			bot.binanceAccount().then(()=>{
				if(bot.Settings.Binance.enabled){
					bot.binanceMonitor(bot.Settings.Binance.pairs);
					return bot.binanceListenUser();
				}
			}).catch((e)=>{
				this.log(e);
			})
			if(bot.bittrexSocketConnection){
				bot.bittrexStream()
			}
		}).catch((e)=>{
			bot.log(e);
		});
	});
}

main();
