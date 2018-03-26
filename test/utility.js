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
});
