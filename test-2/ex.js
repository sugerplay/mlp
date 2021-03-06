var _ = require('lodash'),
  fs = require('fs'),
  stdin = process.stdin,
  PT = require('../tools.js');

// var classSize = 2,
//   inputSize = 2,
//   iterations = 3000,
//   learningRate = 0.1,
//   weightList = [];

var sentenceHL = 10;
var texts = {};
var textSearcher = [];
var idGenerator = 0;

var MLP = require('mlp');
var mlp = new MLP(sentenceHL*2, 100);

// add hidden layers and initialize
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

// for output
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
      index = i;
    }
  }
  return index;
}

// for input
function leftFill (src) {
  var arr = newArray(sentenceHL, -1);
  arr = arr.concat(src);
  var extra = sentenceHL*2 - arr.length;
  if (extra > 0)
    arr = arr.concat(newArray(extra, -1));
  
  return arr;
}
function rightFill (src) {
  var arr = newArray(sentenceHL, -1);
  arr = src.concat(arr);
  var extra = sentenceHL*2 - arr.length;
  if (extra > 0)
    arr = newArray(extra, -1).concat(arr);
  
  return arr;
}

var binary100 = n2Bin(100);

function menu () {
  console.log('[L]earning. [T]esting. [Q]uit.');
  
  PT.ask('> ', /.+/, function (data) {
    if ( data.toLowerCase() == 'q' ) {
      process.exit();
    }
    else if ( data.toLowerCase() == 'l' ) {
      fs.readFile('./train', 'utf8', function(err, data) {
        if (err) {
          console.log('File not found.');
          return;
        }
        var lines = data.split('\n');
        
        _.each(lines, function (line, i) {
          var words = line.split(' ');
          var ids = [];
          
          for (var i=0; i<words.length; i++) {
            texts[words[i]] = idGenerator;
            textSearcher[idGenerator] = words[i];
            ids.push(idGenerator);
            idGenerator++;
          }
          
          for (var i=0; i<ids.length; i++) {
            var selected = ids[i];
            
            // seeing right
            for (var j=i+1; j<ids.length; j++) {
              var arr = leftFill(ids.slice(i+1, j+1));
              // console.log(selected, arr.join(','));
              mlp.addToTrainingSet(arr, position(100, selected));
            }
            
            // seeing left
            for (var j=i-1; j>=0; j--) {
              var arr = rightFill(ids.slice(j, i));
              // console.log(selected, arr.join(','));
              mlp.addToTrainingSet(arr, position(100, selected));
            }
          }
        });
        
        var learnRate = 0.1;
        // var error = Number.MAX_VALUE;
        // while (error > 0.01) {
        //     error = mlp.train(learnRate);
        // }
        
        for (var i=0; i<20; i++) {
          mlp.train(learnRate);
        }
        
        menu();
      });
    }
    else if ( data.toLowerCase() == 't' ) {
      var input = 4;
      
      // function left (size, src) {
      //   var ret = newArray(size/2, -1).concat(src);
      //   if (ret.length != size)
      //     ret = ret.concat(newArray(size - ret.length, 0));
      //   return ret;
      // }
      
      // function right (size, src) {
      //   var ret = src.concat(newArray(size/2, -1));
      //   if (ret.length != size)
      //     ret = newArray(size - ret.length, 0).concat(ret);
      //   return ret;
      // }
      
      function traveling (depth, current) {
        if (depth == 4)
          return;
        
        // left
        var new20Left = leftFill(current);
        new20Left = [unPosition(mlp.classify(new20Left))].concat(current);
        new20Left = new20Left.map(function (x) {
          return textSearcher[x];
        });
        console.log(new20Left);
        traveling(depth+1, new20Left);
        
        // right
        var new20Right = rightFill(current);
        new20Right = current.concat([unPosition(mlp.classify(new20Right))]);
        new20Right = new20Right.map(function (x) {
          return textSearcher[x];
        });
        console.log(new20Right);
        traveling(depth+1, new20Right);
      }
      
      traveling(0, [input]);
      
      // console.log(mlp.classify([0,0,2,3]).slice(1,5));
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