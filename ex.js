var _ = require('lodash'),
  fs = require('fs'),
  stdin = process.stdin,
  PT = require('./tools.js');

var classSize = 2,
  inputSize = 2,
  iterations = 3000,
  learningRate = 0.1,
  weightList = [];
  
var MLP = require('mlp');
var mlp = new MLP(2,1);

// add hidden layers and initialize
mlp.addHiddenLayer(5);
mlp.addHiddenLayer(5);
mlp.init();
  
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
          
          var c = _.first(words);
          var value = _.rest(words);
          
          mlp.addToTrainingSet(value, [c]);
        });
        
        var learnRate = 0.1;
        var error = Number.MAX_VALUE;
        while (error > 0.01) {
            error = mlp.train(learnRate);
        }
        
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
        
        var correct = 0;
        _.each(lines, function (line, i) {
          var words = line.split(',');
          
          var c = _.first(words);
          var value = _.rest(words);
          
          var classification = mlp.classify(value);
          
          if (classification[0] == c)
            correct++;
        });
        
        console.log('result : %d / %d', correct, lines.length);
        menu();
      });
    }
    else {
      menu();
    }
  });
}

menu();