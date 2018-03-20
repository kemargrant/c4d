[![codecov](https://codecov.io/gh/kemargrant/c4d/branch/master/graph/badge.svg)](https://codecov.io/gh/kemargrant/c4d)
[![CircleCI](https://circleci.com/bb/grant_christophe/ckg.svg?style=svg&circle-token=f685dbd819c526b36a94619c2278e99681b4b67f)](https://circleci.com/bb/grant_christophe/ckg)
# Description

C4D is a node.js cryptocurrency arbitrage bot for use on the Bittrex/Binance exchange.

Using the BTC/USDT markets on Bittrex the bot conducts triangular arbitrage. The bot's wallet requires a sufficient amount of each currency to perform the three trades in parallel.

Exmaple Arbitrage 1:
XXX => USDT => BTC => XXX

Example Arbitrage 2:
BTC => USDT => XXX => BTC

Sample Bittrex Wallet 

| Currency| (BTC)Value 
| ------ | ------ |
|BTC| 2
|USDT| 2
|XXX| 1

So for every 1 unit of your target currency you should have double the btc value. When configuring for BTC arbitrage in this scenario set percentage2 in the config file to be less than or equal to 0.5
to ensure you can convert from BTC/USDT to your target currency.
 
## Running
```
git clone https://github.com/kemargrant/c4d
cd c4d
npm install
node c4d.js
```
## Testing
```npm test```

----

After starting the command line script connect to the websocket port with a web socket [client](https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo) to start the program.
* Web GUI
[C4DC](https://github.com/kemargrant/c4dc)

## Configuration
Bot settings are controlled by the 'config.json' file


```
{
	"Binance":
		{
			"apikey":"Binance_API_Key",
			"secretkey":"Binance_API_Secret",
			"enabled":true,
			"pairs":[{
			"liquidTrades":true,
			"lowerLimit1":100.2,
			"lowerLimit2":99,
			"optimalTrades":true,
			"pair1":"xxx_yyy",
			"pair2":"yyy_zzz",
			"pair3":"xxx_zzz",
			"upperLimit1":100.5,
			"upperLimit2":99.99
			}]
		},
	"Bittrex":
		{
			"apikey":"Bittrex_API_Key",
			"secret":"Bittrex_API_Secret",
			"minimum":0.001
		},
	"Config":
		{
			"enabled":true,
			"key":"Secret Private Key",	
			"liquidTrades":true,
			"logs":3,
			"lowerLimit":98.3,
			"pair1":"BTC-XXX",
			"pair2":"USDT-BTC",
			"pair3":"USDT-XXX",		
			"percentage1":1,
			"percentage2":0.5,					
			"polling":45000,
			"port":7071,
			"saneTrades":true,
			"upperLimit":101.79,
			"viewBook":false
		},
	"Email":
		{
			"addr":"Recipient_Email_Address",
			"host_smtp":"Email_SMTP_IP_Address",
			"use":false,
			"usr":"Email Account Address",
			"pwd":"Email Password"		
		},
	"MongoDB":
		{
			"db_string":"mongodb://xxxx:xxxxxxxx@ip_address:port/database",
			"connect":false
		},	
	"Slack":
		{
			"channel":"Slack_Channel",
			"hook":"Slack_Webhook",
			"use":false,
			"usr":"Slack_user_to_notify"
		},
	"Swing":
		{
			"amount":0.001,
			"pair":"BTC-XXX",
			"rate":60000,
			"swing":0.02,
			"swingTrade":false
		}		
}
```


| Property | Value | Type
| ------ | ------ | ------ |
| Binance.apikey | Binance Api Key | String
| Binance.secretkey | Binance Api Secret | String
| Binance.enabled | Enable trading on Binance exchange (Default true) | Boolean
| Binance.pairs | Array of pairs to use | Array
| Binance.pairs.liquidTrades | Perform arbitrage between when enough liquidity is on the books (Default true) | Boolean
| Binance.pairs.optimalTrades | Make the best trade possible | Boolean
| Binance.pairs.lowerLimit1 | Minimum percent to perform trade when percentage < 100% | Number
| Binance.pairs.lowerLimit2 | Minimum percent to perform trade when percentage > 100% | Number
| Binance.pairs.optimalTrades | Make the best trade possible | Boolean
| Binance.pairs.pair1 | Currency Pair1 ie ltcbtc | String
| Binance.pairs.pair2 | Currency Pair2 ie btcusdt| String
| Binance.pairs.pair3 | Currency Pair3 ie ltcusdt | String
| Binance.pairs.upperLimit1 | Maximum percent to perform trade when percentage < 100% | Number
| Binance.pairs.upperLimit2 | Maximum percent to perform trade when percentage > 100% | Number
| Bittrex.apikey | Bittrex Api Key | String
| Bittrex.secret | Bittrex Api Secret | String
| Bittrex.minimum | Bittrex minimum btc order size Defaut(0.001)| Number
| Config.enabled | Enable trading on Bittrex (Default true) | Boolean
| Config.key | The key used to encrypt messages between the bot and a web client | String
| Config.liquidTrades | Perform arbitrage between when enough liquidity is on the books (prevents left behind trades...usually) | Boolean
| Config.logs | 0-None 1-Server Only 2-Client Only 3-Server and Client Default(3) | Number
| Config.lowerLimit | Lower percentage limit when saneTrades is true | Number
| Config.pair1 | BTC- your target currency | String
| Config.pair2 | “USDT-BTC” (Required) | String
| Config.pair3 |  USDT-  your target currency| String
| Config.percentage1 | Percentage of XXX currency to use when performing trades (Default 100%)| Number
| Config.percentage2 | Percentage of BTC to use when performing BTC=>BTC trade (Default 50%) | Number
| Config.polling | The default milliseconds for the bot to query the Bittrex ticker | Number
| Config.port | Websocket port number | Number
| Config.saneTrades | Perform arbitrage between upper and lower limits (Prevents trading during flash crashes...probably) | Boolean
| Config.upperLimit | Upper percentage limit when saneTrades is true | Number
| Config.viewBook | View Bittrex order book in c4dc client (Default false)| Boolean
| Email.addr | Recipient Email Address | String
| Email.host_smtp | Email SMTP Address| String
| Email.use | Use email notifications | Boolean
| Email.usr | Email Account Address | String
| Email.pwd | Email Password | String
| MongoDB.db_string | MongoDB connection string | String
| MongoDB.connect | Use MongoDB database | Boolean
| Slack.channel |Slack channel | String
| Slack.hook | Slack Webhook| String
| Slack.use | Use Slack notifications | Boolean
| Slack.usr | Slack user to notify | String
| Slack.img | Image to attach to slack message | String
| Swing.amount | Inital amount in BTC to place buy order | Number
| Swing.pair | Bittrex BTC pair | String
| Swing.rate | The default milliseconds for the swingbot to query the Bittrex bids/ask | Number
| Swing.swing | Percent to swing trades (Default 2%) | Number
| Swing.swingTrade | Perform swing trading | Boolean

## Disclaimer

- This bot is not guaranteed to make you money
- Do not invest more than you can afford to lose
- Do not use this bot if you do not understand cryptocurrency or triangular arbitrage


License
----

GPLv3

Donate
----
BTC:1656ASaUDzMbiQHf32YUNU2E3QWKGPdFEL

ETH:0x30CE6E295D5c204b9C77C6DE995260735B8Ba8bC
