var _ = require('lodash'),
  fs = require('fs'),
  stdin = process.stdin,
  PT = require('./tools.js');

function training (weights, domain, size, iterations, lRate) {
  for (var i=0; i<iterations; i++) {
    var totalErr = 0.0;
    var curv = (1 - i/iterations);
    var adjLRate = lRate * curv * curv;
    
    _.each(domain, function (pattern, j) {
      var input = _.map(PT.initialArray(size), function (x, k) {
        return pattern[k];
      });
      var expected = _.last(pattern);
      
      weights = _.map(weights, function (w, l) {
        var exp = -1.0;
        if (expected == l) exp = 1.0;
        
        var output = PT.getOutput(w, input);
        var err = exp - output;
        totalErr += Math.abs(err);
        
        return PT.updateWeights(size, w, input, err, adjLRate);
      });
    });
    
    console.log(adjLRate);
    console.warn('> epoch=%d, error=%d', i, totalErr)
  }
  return weights;
}

function testing (weights, domain, size) {
  var correct = 0;
  
  _.each(domain, function (pattern, i) {
    var input = _.map(PT.initialArray(size), function (x, j) {
      return pattern[j];
    });
    
    var best = 0;
    var select = 0;
    
    _.each(weights, function (w, j) {
      var activation = PT.activate(w, input);
      if (activation >= best) {
        best = activation;
        select = j;
      }
    });
    
    var answer = _.last(pattern);
    console.log('ai: %d, answer: %d', select, answer);
    
    if (select == answer) correct += 1;
  });
  
  return correct;
}

var classSize = 2,
  inputSize = 2,
  iterations = 3000,
  learningRate = 0.1,
  weightList = [];
  
for (var i=0; i<classSize; i++) {
  weightList.push(PT.initializeWeights(inputSize));
}
  
function menu () {
  console.log('[L]earning. [T]esting. [Q]uit.');
  
  PT.ask('> ', /.+/, function (data) {
    if ( data.toLowerCase() == 'q' ) {
      process.exit();
    }
    else if ( data.toLowerCase() == 'l' ) {
      var domain = [];
      fs.readFile('./od.tra', 'utf8', function(err, data) {
        if (err) {
          console.log('File not found.');
          return;
        }
        var lines = data.split('\n');
        
        _.each(lines, function (line, i) {
          var words = line.split(',');
          domain.push(words);
        });
        
        weightList = training(weightList, domain, inputSize, iterations, learningRate);
        menu();
      });
    }
    else if ( data.toLowerCase() == 't' ) {
      var domain = [];
      fs.readFile('./od.tes', 'utf8', function(err, data) {
        if (err) {
          console.log('File not found.');
          return;
        }
        var lines = data.split('\n');
        
        _.each(lines, function (line, i) {
          var words = line.split(',');
          domain.push(words);
        });
        
        var c = testing(weightList, domain, inputSize);
        
        console.log('result : %d / %d', c, domain.length);
        menu();
      });
    }
    else {
      menu();
    }
  });
}

menu();