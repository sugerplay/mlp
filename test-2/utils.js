var _ = require('lodash');

var result = [];

function combination (arr, n) {
  var select = _.first(arr);
  var rest = _.rest(arr);
  
  if (n == 1 || arr.length < n)
    return [];
    
  if (arr.length < 2)
    return [];
  
  if (arr.length == n)
    return arr;
    
  result.concat(combination(rest, n));
  
  var t = combination(arr, n-1);
  
  t = _.map(t, function (x) {
    return [select].concat(x);
  });
  
  result.concat(t);
}

function expanding (arr) {
  for (var i=2; i<=arr.length; i++) {
    
  }
}

combination([], [1,2,3], 2);
console.log(result);