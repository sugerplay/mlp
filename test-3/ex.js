var _ = require('lodash'),
  fs = require('fs'),
  stdin = process.stdin,
  PT = require('../tools.js');

// var classSize = 2,
//   inputSize = 2,
//   iterations = 3000,
//   learningRate = 0.1,
//   weightList = [];
  
var MLP = require('mlp');
var mlp = new MLP(4,100);

// add hidden layers and initialize
mlp.addHiddenLayer(100);
mlp.addHiddenLayer(100);
mlp.addHiddenLayer(100);
mlp.init();

function newArray (size, def) {
  return _.map(new Array(size), function () {return def});
};

function n2Bin (size) {
  return function (dec) {
    var bin = _.chain((dec >>> 0).toString(2))
      .toArray()
      .map(function (x) { return parseInt(x); })
      .value();
      
    var extra = size - bin.length;
    
    if (extra < 0) {
      console.log('exception! size up!')
      return newArray(size, 0);
    }
    
    return newArray(extra, 0).concat(bin);
  }
}

function bin2N (bin) {
  return parseInt(bin.join(''), 2);
}

function position (size, n) {
  var ret = newArray(size, 0);
  ret[n]=1;
  return ret;
}

function unPosition (arr) {
  var best = -1;
  var index = 0;
  for (var i=0; i<arr.length; i++) {
    if (arr[i] > best) {
      best = arr[i];
      best = i;
    }
  }
  return best;
}

var binary100 = n2Bin(100);

function menu () {
  console.log('[L]earning. [T]esting. [Q]uit.');
  
  PT.ask('> ', /.+/, function (data) {
    if ( data.toLowerCase() == 'q' ) {
      process.exit();
    }
    else if ( data.toLowerCase() == 'l' ) {
      function array2Comibination (arr) {
        
      }
      
      var domain = [];
      fs.readFile('./train', 'utf8', function(err, data) {
        if (err) {
          console.log('File not found.');
          return;
        }
        var lines = data.split('\n');
        
        _.each(lines, function (line, i) {
          var words = line.split(' ');
          
          var c = _.first(words);
          var value = _.rest(words);
          
          mlp.addToTrainingSet(value, position(100, c));
        });
        
        var learnRate = 0.4;
        // var error = Number.MAX_VALUE;
        // while (error > 0.01) {
        //     error = mlp.train(learnRate);
        // }
        
        for (var i=0; i<100; i++) {
          mlp.train(learnRate);
        }
        
        menu();
      });
    }
    else if ( data.toLowerCase() == 't' ) {
      var input = 5;
      
      function left (size, src) {
        var ret = newArray(size/2, 0).concat(src);
        if (ret.length != size)
          ret = ret.concat(newArray(size - ret.length, 0));
        return ret;
      }
      
      function right (size, src) {
        var ret = src.concat(newArray(size/2, 0));
        if (ret.length != size)
          ret = newArray(size - ret.length, 0).concat(ret);
        return ret;
      }
      
      function traveling (depth, current) {
        if (depth == 2)
          return;
        
        // left
        var new4Left = left(4, current);
        new4Left = [unPosition(mlp.classify(new4Left))].concat(current);
        console.log(new4Left);
        traveling(depth+1, new4Left);
        
        // right
        var new4Right = right(4, current);
        new4Right = current.concat([unPosition(mlp.classify(new4Right))]);
        console.log(new4Right);
        traveling(depth+1, new4Right);
      }
      
      // traveling(0, [input]);
      
      console.log(mlp.classify([0,0,2,3]).slice(1,5));
      // console.log(mlp.classify([1,4,0,0]).slice(5,5));
      // console.log(mlp.classify([0,1,0,0]).slice(1,5));
      // console.log(mlp.classify([0,0,3,0]).slice(1,5));
      
      menu();
    }
    else {
      menu();
    }
  });
}

menu();