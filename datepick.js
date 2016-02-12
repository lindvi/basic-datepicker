'use strict';

tv4App.directive('woodatepick', ['$timeout', function($timeout){
  // Runs during compile
  return {
    name: 'woodatepick',
    // priority: 1,
    // terminal: true,
    scope: {
      disabled: '=disabled',
      min: '=min',
      max: '=max',
      date: '=date',
      showWeek: '=week'
    }, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: 'views/directives/_datepick.html',
    replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    // link: function($scope, iElm, iAttrs, controller) {
      link: function($scope) {


        function getWeekNumber(date){
          var d = new Date(date);
          d.setHours(0,0,0);
          d.setDate(d.getDate()+4-(d.getDay()||7));
          return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
        }

        //Mon as start
        var weekDays = {0: 6, 1:0, 2:1, 3:2, 4:3, 5:4, 6:5};

        //Sun as start
        //var weekDays = {0: 0, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6};

        $scope.options = {
          monthNames: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni','Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
          weekDays: {0: 6, 1:0, 2:1, 3:2, 4:3, 5:4, 6:5},
          weekdayNames: [{full: 'Måndag', short: 'Må', color: ''},
          {full: 'Tisdag', short: 'Ti', color: ''},
          {full: 'Onsdag', short: 'On', color: ''},
          {full: 'Torsdag', short: 'To', color: ''},
          {full: 'Fredag', short: 'Fr', color: ''},
          {full: 'Lördag', short: 'Lö', color: '#ED8595'},
          {full: 'Söndag', short: 'Sö', color: '#E0546D'}]
        };
        $scope.calendar = [];

        $scope.fullDisplayMonth = [];
        for(var index = 0; index < 43; index++){
          $scope.fullDisplayMonth.push({});
        }

        $scope.current = {
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
          displayMonth: '',
          days: [],
          weeks: [],
          selectedDate: {},
          init: function(){

            if ($scope.min !== null  && $scope.min !== undefined) {
              $scope.min.setHours(0);
              $scope.min.setMinutes(0);
              $scope.min.setSeconds(0);
              $scope.min.setMilliseconds(0);
              this.month = $scope.min.getMonth();
              this.year = $scope.min.getFullYear();
            } else {
              this.month = new Date().getMonth();
              this.year = new Date().getFullYear();
            }
            this.displayMonth = $scope.options.monthNames[this.month];
            this.draw();

            var date = this.findDate($scope.date);
            this.selectDate(date);
          },
          update: function(year, month) {
            this.days = [];
            this.weeks = [];
            this.year = year;
            this.month = month;
            this.displayMonth = $scope.options.monthNames[month];
            this.draw();
          },
          draw: function(){
            //reset
            this.days = [];
            this.weeks = [];

            var newMonth = [];
            //Days before month starts
            var preOffset = getFirstDayOfMonth(this.year, this.month);
            newMonth.push.apply(newMonth, this.getPre(preOffset-1));

            //This month
            newMonth.push.apply(newMonth, getMonthFromDate(this.year, this.month, 1, false));

            //Start on next month

            var postOffset = 6-getLastDayOfMonth(this.year, this.month);
            newMonth.push.apply(newMonth, this.getPost(postOffset));

            this.days = newMonth;
            //var monthLength = this.days.length;

            for(var idx = 0; idx < 43; idx++){
              if(this.days[idx] !== undefined){
                $scope.fullDisplayMonth[idx] = this.days[idx];
              }else {
                $scope.fullDisplayMonth[idx] = undefined;
              }
            }
            if($scope.showWeek) {
              this.weeks = this.getWeekdays(this.days);
            }
          },
          getPre: function(offset) {
            var lastDay = getLastDateOfMonth(this.year, this.month);
            var safeMonth = checkDate(this.year, this.month-1, 1);
            return (getMonthFromDate(safeMonth.getFullYear(), safeMonth.getMonth(), lastDay-offset, true));
          },
          getPost: function(offset){
            var safeMonth = checkDate(this.year, this.month+1, 1);
            return (getDaysFromStartOfMonth(safeMonth.getFullYear(), safeMonth.getMonth(), offset, true));
          },
          nextMonth: function(){
            var newMonth = checkDate(this.year, this.month+1, 1);
            this.update(newMonth.getFullYear(), newMonth.getMonth());

          },
          previousMonth: function(){
            var newMonth = checkDate(this.year, this.month-1, 1);
            this.update(newMonth.getFullYear(), newMonth.getMonth());
          },
          selectDate: function(date){
            if(date !== null && !$scope.disabled && !date.disabled){
              if(date !== this.selectedDate) {
                this.selectedDate.selected = false;
                date.selected = true;
                this.selectedDate = date;
                $scope.date = date.full;
              }else {
                date.selected = false;
                this.selectedDate = {};
                $scope.date = null;
              }
            }
          },
          findDate: function(date) {
            var found = null;
            if(date !== null){
              $scope.fullDisplayMonth.forEach(function(entry) {
                if(entry !== undefined && entry.date === date.getDate() && entry.month === date.getMonth() && entry.year === date.getFullYear()) {
                  found = entry;
                }
              });
            }
            return found;
          },
          getWeekdays: function(days){
            var noWeeks = Math.floor(days.length / 7);
            var weekNumbers = [];
            for(var i = 0; i < noWeeks; i++){
              weekNumbers.push(days[i*7].weekNumber);
            }

            return weekNumbers;
          }
        };

        function getLastDateOfMonth(year, month){
          return new Date(year, month, 0).getDate();
        }

        function getFirstDayOfMonth(year,month){
          return getWeekday(year, month, 1);
        }

        function getLastDayOfMonth(year, month) {
          return getWeekday(year, month + 1, 0);
        }

        function getWeekday(year,month,date){
          return weekDays[new Date(year, month, date).getDay()];
        }


        // 2015, -1, 1 => 2014, 11, 1
        // 2015, 12, 1 => 2016, 1, 1
        function checkDate(year, month, date) {
          return new Date(year, month, date);
        }

        function getMonthFromDate(year, month, indate, disabled) {
          var d = [];

          var date = new Date(year, month, indate);
          var tmp;
          var tmpObj;

          if($scope.min !== null && $scope.min !== undefined){
            $scope.min.setHours(0);
            $scope.min.setMinutes(0);
            $scope.min.setSeconds(0);
            $scope.min.setMilliseconds(0);
          }

          while (date.getMonth() === month) {
            tmp = new Date(date);

            tmpObj = {date: tmp.getDate(), month: tmp.getMonth(), year: tmp.getFullYear(), full: tmp, disabled: disabled, available: 1, selected: false, weekNumber: getWeekNumber(tmp)};

            if($scope.min !== undefined && $scope.min !== null && tmp < $scope.min) {
              tmpObj.disabled = true;
            }

            if($scope.max !== undefined && $scope.max !== null && tmp > $scope.max) {
              tmpObj.disabled = true;
            }

            d.push(tmpObj);
            date.setDate(date.getDate() + 1);

          }
          return d;
        }

        function getDaysFromStartOfMonth(year, month, count, disabled) {
          var d = [];
          var date = new Date(year, month, 1);
          var tmp;
          for(var index = 0; index < count; index++){
            tmp = new Date(date);
            d.push({date: tmp.getDate(), month: tmp.getMonth(), year: tmp.getFullYear(), full: tmp, disabled: disabled, available: 1, selected: false, weekNumber: getWeekNumber(tmp)});
            date.setDate(date.getDate() + 1);
          }
          return d;
        }
        $timeout(function(){
          $scope.current.init();
        }, 10);

        $scope.$watch('min', function(newValue, oldValue){
          if($scope.min !== undefined && $scope.min !== null && newValue !== oldValue){
            $scope.current.update($scope.min.getFullYear(), $scope.min.getMonth());
          }
        });

        $scope.$watch('max', function(newValue, oldValue){
          if($scope.max !== undefined && $scope.max !== null && newValue !== oldValue){
            $scope.current.update($scope.max.getFullYear(), $scope.max.getMonth());
          }
        });
      }
    };
  }]);
