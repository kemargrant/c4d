var CryptoBot = require('../c4d.js');
var mock = require('./mock.js');
var assert = require('assert');

describe('Utilities', function() {
	var bot = new CryptoBot.bot(mock.mockSettings1);
	describe('#BubbleSort', function() {
		return it('Should sort in decreasing order', function() {
			var array = [99.1,99.01,99.4,99.1,99.6,99.7,1,50,54];
			var sorted = bot.utilities.BubbleSort(array,99.5);
			assert.deepEqual([99.7,99.6,99.4,99.1,99.1,99.01],sorted);
		});
	});
	describe('#Solve > 100%', function() {
		return it('Should return the ideal solution when ratio > 100%', function() {
			var solution = bot.utilities.solveOver(0.0046,6,2,0.002185,8838,19.279);
			assert.equal(solution,0.004828);
		});
	});
	describe('#Solve < 100%', function() {
		return it('Should return the ideal solution when ratio < 100%', function() {
			var solution = bot.utilities.solveUnder(3,0.075332,11525,869.5);
			assert.equal(0.073,solution);
		});
	});
	describe('#Solve < 100 wasm vs js', function() {
		it('Should return the ideal solution faster than js', function() {
			var jsa;
			var wasma;
			var time;	
			time = process.hrtime();
			for(var i = 0;i < 5;i ++){
				jsa = bot.utilities.solveUnder(2,0.002077,8836,18.38);     
			}
			var js = process.hrtime(time)[1]/1000000;	
			time = process.hrtime();
			for(var i = 0;i < 5;i ++){
				wasma = bot.utilities.solveUnderWasm(2,0.002077,8836,18.38);     
			}
			var wasm = process.hrtime(time)[1]/1000000;		
			//console.log(wasma,":WASM:",wasm,"vs",jsa,":JS:",js);	
			assert(wasm < js && wasma === jsa);
		});
	});
	describe('#Solve > 100 wasm vs js', function() {
		it('Should return the ideal solution faster than js', function() {
			var jsa;
			var wasma;
			var time;
			time = process.hrtime();
			for(var i = 0;i < 1;i ++){
				wasma = bot.utilities.solveOverWasm(0.0046,6,2,0.002185,8838,19.279);     
			}		
			var wasm = process.hrtime(time)[1]/1000000;						
			time = process.hrtime();
			for(var i = 0;i < 1;i ++){
				jsa = bot.utilities.solveOver(0.0046,6,2,0.002185,8838,19.279);     
			}
			var js = process.hrtime(time)[1]/1000000;
			//console.log(wasma,":WASM:",wasm,"vs",jsa,":JS:",js);	
			assert(wasm < js && wasma === jsa);
		});
	});		
	describe('#Enable Wasm', function() {
		it('Should enable wasm code', function() {
			var temp = JSON.parse(JSON.stringify(mock.mockSettings1));
			temp.Config.useWasm = true;
			var bot = new CryptoBot.bot(temp);
			var over = bot.utilities.solveOverWasm.toString() == bot.utilities.solveOver.toString() ? true:false;
			var under = bot.utilities.solveUnderWasm.toString() == bot.utilities.solveUnder.toString() ? true:false;
			assert(over && under);
		});
	});					
});
