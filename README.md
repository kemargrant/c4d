# Description

C4D is a node.js cryptocurrency arbitrage bot for use on the Bittrex exchange.

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
After starting the command line script connect to the websocket port with a web socket [client](https://chrome.google.com/webstore/detail/simple-websocket-client/pfdhoblngboilpfeibdedpjgfnlcodoo) to start the program.
* Web GUI Coming  Soon
[Preview 1](https://i.imgur.com/g8RofSN.jpg) [Preview 2](https://i.imgur.com/2nxkbQE.jpg)

## Configuration
Bot settings are controlled by the 'config.json' file


```
{
	"Bittrex":
		{
			"apikey":"Bittrex_API_Key",
			"secret":"Bittrex_API_Secret"
		},
	"Config":
		{
			"key":"Secret Private Key",	
			"pair1":"BTC-XXX",
			"pair2":"USDT-BTC",
			"pair3":"USDT-XXX",		
			"percentage1":1,
			"percentage2":0.5,					
			"polling":45000,
			"port":7071
		},
	"Email":
		{
			"addr":"Recipient Email Address",
			"host_smtp":"Email SMTP IP Address",
			"usr":"Email Account Address",
			"pwd":"Email Password"			
		},
	"MongoDB":{"db_string":"mongodb://xxxx:xxxxxxxx@ip_address:port/database","connect":false},	
	"Slack":
		{
			"channel":"Slack Channel",
			"hook":"Slack Webhook",
			"usr":"Slack user to notify",
			"img":"Image url"
		}
}
```


| Property | Value | Type
| ------ | ------ | ------ |
| Bittrex.apikey | Bittrex Api Key | String
| Bittrex.secret | Bittrex Api Secret | String
| Config.key | The key used to encrypt messages between the bot and a web client | String
| Config.pair1 |BTC- your target currency | String
| Config.pair2 |“USDT-BTC” (Required) | String
| Config.pair3 |  USDT-  your target currency| String
| Config.percentage1 | Percentage of XXX currency to use when performing trades | String
| Config.percentage2 | Percentage of BTC to use when performing BTC=>BTC trade | String
| Config.polling | The default milliseconds for the bot to query the Bittrex ticker | Number
| Config.port |Websocket port number | Number

## Disclaimer

- This bot is not guaranteed to make you money
- Do not invest more than you can afford to lose
- Do not use this bot if you do not understand cryptocurrency or triangular arbitrage


License
----

GPLv3
