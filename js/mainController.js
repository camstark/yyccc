angular.module('app', []);

angular.module('app').controller('mainCntrl', ['$scope',
function ($scope) {

  $scope.master = {}; // MASTER DATA STORED BY YEAR

  // $scope.selected_year = 2005;
  // $scope.years = d3.range(2005, 1865, -5);
  $scope.selected_year = 'Failed';
  $scope.years = ['Passed', 'Failed', 'For', 'Against'];

  $scope.filters = {};
  $scope.hasFilters = false;

  $scope.tooltip = {};

  // FORMATS USED IN TOOLTIP TEMPLATE IN HTML
  $scope.pFormat = d3.format(".1%");  // PERCENT FORMAT
  $scope.qFormat = d3.format(",.0f"); // COMMAS FOR LARGE NUMBERS
  $scope.dFormat = d3.format(",.2f"); // COMMAS FOR LARGE NUMBERS
  // $scope.lowerCase = function(text) {return text.toLowerCase()}
  $scope.ttSwitcher = function(text) {
    if (text === "Passed" | text === "Failed") {
      return "on motions that " + text.toLowerCase();
    }
  }
  $scope.ttSwitcher2 = function(text) {
    if (text === "For") {
      return ' "Yes" '
    }
    if (text === "Against") {
      return ' "No" '
    }
  }
  $scope.ttSwitcher3 = function(text) {
    if (text === "For" | text === "Against") {
      return "when voting " + text.toLowerCase() + " a motion";
    }
    if (text === "Passed" | text === "Failed") {
      return "on motions that " + text.toLowerCase();
    }
  }

  $scope.updateTooltip = function (data) {
    $scope.tooltip = data;
    $scope.$apply();
  }

  $scope.addFilter = function (name) {
    $scope.hasFilters = true;
    $scope.filters[name] = {
      name: name,
      hide: true
    };
    $scope.$apply();
  };

  $scope.update = function () {
    var data = $scope.master[$scope.selected_year];

    if (data && $scope.hasFilters) {
      $scope.drawChords(data.filter(function (d) {
        var fl = $scope.filters;
        var v1 = d.importer1, v2 = d.importer2;

        if ((fl[v1] && fl[v1].hide) || (fl[v2] && fl[v2].hide)) {
          return false;
        }
        return true;
      }));
    } else if (data) {
      $scope.drawChords(data);
    }
  };

  // IMPORT THE CSV DATA
  // d3.csv('../data/trade.csv', function (err, data) {
  //
  //   data.forEach(function (d) {
  //     d.year  = +d.year;
  //     d.flow1 = +d.flow1;
  //     d.flow2 = +d.flow2;
  //
  //     if (!$scope.master[d.year]) {
  //       $scope.master[d.year] = []; // STORED BY YEAR
  //     }
  //     $scope.master[d.year].push(d);
  //   })
  //   $scope.update();
  // });

  d3.csv('../data/Calgary_2013-2017_20160418.csv', function (err, data) {

    var councillors = ["A. Chabot", "B. Pincott", "D. Colley-Urquhart", "D. Farrell", "E. Woolley", "G-C. Carra", "J. Magliocca", "J. Stevenson", "N. Nenshi", "P. Demong", "R. Jones", "R. Pootmans", "S. Chu", "S. Keating", "W. Sutherland"];

    data.forEach(function(d) {
      d.exclude = 0;
      d.Status = (d.Status === 'PASSED' ? 'Passed' : d.Status);
      d.Status = (d.Status === 'FAILED' ? 'Failed' : d.Status);
      councillors.forEach(function(c) {
        d[c] = (d[c] === "Yes" ? 1 : (d[c] === "No" ? 0 : -1));
        d.exclude += d[c];
      })
    })
    data = data.filter(function(d) {return d.exclude != -15 & d.Status != "PASSED UNANIMOUSLY"})
    console.log(data);
    data1 = pairwise(councillors, 'Status', 'Passed');
    data2 = pairwise(councillors, 'Status', 'Failed');
    data3 = pairwise2(councillors, 'For', 1);
    data4 = pairwise2(councillors, 'Against', 0);
    data = data1.concat(data2).concat(data3).concat(data4)
console.log(data)

    data.forEach(function(d) {
      if (!$scope.master[d.year]) {
        $scope.master[d.year] = []; // STORED BY YEAR
      }
      $scope.master[d.year].push(d);
    })
    $scope.update();

    function pairwise(list, comparevar, compareval) {
      if (list.length < 2) { return []; }
      var first = list[0],
          rest  = list.slice(1),
          pairs = rest.map(function (x) {
            return {
              year: compareval, //do for and against?
              importer1: first,
              importer2: x,
              flow1: d3.sum(data, function(d) { //voted the same
                if (d[first] === d[x] & d[first] != '--not specified--' & d[comparevar] === compareval) {
                  return 1;
                }
              }),
              flow2: d3.sum(data, function(d) { //voted differently
                if (d[first] === d[x]  & d[first] != '--not specified--' & d[comparevar] === compareval) {
                  return 1;
                }
              })
            };
          });
      return pairs.concat(pairwise(rest, comparevar, compareval));
    }

    function pairwise2(list, group, code) {
      if (list.length < 2) { return []; }
      var first = list[0],
          rest  = list.slice(1),
          pairs = rest.map(function (x) {
            return {
              year: group, //do for and against?
              importer1: first,
              importer2: x,
              flow1: d3.sum(data, function(d) { //voted the same
                if (d[first] === d[x] & d[first] === code) {
                  return 1;
                }
              }),
              flow2: d3.sum(data, function(d) { //voted differently
                if (d[first] === d[x]  & d[first] === code) {
                  return 1;
                }
              })
            };
          });
      return pairs.concat(pairwise2(rest, group, code));
    }

  });

  $scope.$watch('selected_year', $scope.update);
  $scope.$watch('filters', $scope.update, true);

}]);
