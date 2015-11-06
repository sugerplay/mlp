var _ = require('underscore');

function initialArray (length) {
  return Array.apply(null, Array(length));
}

function randomVector (minimax) {
  return _.map(initialArray(minimax.length), function (x, i) {
      return minimax[i][0] + ((minimax[i][1] - minimax[i][0]) * Math.random());
    });
}

function initializeWeights (size) {
  var minimax = _.map(initialArray(size), function (x, i) { return [-1.0, 1.0] });
  return randomVector(minimax);
}

function updateWeights (size, weight, input, err, lRate) {
  // assume that weights.length === input.length
  
  return _.map(weight, function (w, i) {
    return w + lRate * err * input[i];
  });
}

function activate (weight, vector) {
  return _.reduce(weight, function (total, w, i) {
    return total + w * vector[i];
  }, 0);
}

function transfer (activation) {
  if (activation >= 0)
    return 1.0;
  return -1.0;
}

function getOutput (weight, vector) {
  return transfer(activate(weight, vector));
}

function ask(question, format, callback) {
 var stdin = process.stdin, stdout = process.stdout;
 
 stdin.resume();
 stdout.write(question);
 
 stdin.once('data', function(data) {
   data = data.toString().trim();
 
   if (format.test(data)) {
     callback(data);
   } else {
     stdout.write("It should match: "+ format +"\n");
     ask(question, format, callback);
   }
 });
}

module.exports.initialArray = initialArray;
module.exports.randomVector = randomVector;
module.exports.initializeWeights = initializeWeights;
module.exports.updateWeights = updateWeights;
module.exports.activate = activate;
module.exports.transfer = transfer;
module.exports.getOutput = getOutput;
module.exports.ask = ask;