const baseUrl = "http://127.0.0.1:8001/api/";

const app = angular.module("myFirstApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "practice.html",
        })
        .when("/home", {
            templateUrl: "home.html"
        })
        .when("/activity-form", {
            templateUrl: "activity-form.html"
        })
        .otherwise({
            redirectTo: '/home'
        });
    ;
});

app.controller('myFirstController', ['$scope', myFirstController]);
app.controller('activityController', ['$scope', '$http', 'Excel', '$timeout', activityController]);
app.controller('activityFormController', ['$scope', '$http', activityFormController]);
app.filter('dateRangeFilter', function () {
    return function (data, startedDate, endedDate) {
        if (startedDate == null || endedDate == null) {
            return data
        }

        var result = [];

        var from_date = new Date(Date.parse(startedDate))
        var to_date = new Date(Date.parse(endedDate))

        angular.forEach(data, function (data) {
            var date = new Date(Date.parse(data.tanggal))
            if (date > from_date && date < to_date) {
                result.push(data);
            }
        });
        return result;
    };
});

function myFirstController($scope) {
    // variable
    $scope.name = "";
    $scope.nameLenght = 0;

    // inline function
    $scope.displayLength = function () {
        $scope.nameLenght = countLenght($scope.name);
    }

    // function
    function countLenght(name) {
        return name.length
    }
}

function activityController($scope, $http, Excel, $timeout) {
    $scope.filterData = {
        // selectedType : null,
        // duration : null,
        startedDate: null,
        endedDate: null
    }

    $scope.listOfType = null;
    $scope.activities = null;
    $scope.pages = null;

    $scope.getTypes = function () {
        $http({
            method: 'GET',
            url: baseUrl + 'dashboards/kegiatan/jenis'
        }).then(function successCallback(response) {
            if (response.status == 200) {
                $response = response.data;

                $scope.listOfType = $response.data
            }
        }, function errorCallback(response) {

        });
    };

    $scope.getPage = function (pageNumber) {
        $http({
            method: 'GET',
            url: baseUrl + 'dashboards/kegiatan?page=' + pageNumber
        }).then(function successCallback(response) {
            if (response.status == 200) {
                $response = response.data;

                $scope.activities = $response.data.data;
                $scope.pages = $response.data;
            }
        }, function errorCallback(response) {

        });
    }

    $scope.exportToExcel = function (tableId) { // ex: '#my-table'
        var exportHref = Excel.tableToExcel(tableId, 'WireWorkbenchDataExport');
        $timeout(function () { location.href = exportHref; }, 100); // trigger download
    }

    $scope.deleteActivity = function (activityId) {
        var result = confirm('Are you sure?');
        if (result) {
            for (var i = 0; i < $scope.activities.length; i++) {
                ($scope.activities[i].id == activityId) ? $scope.activities.splice(i, 1) : "";
            }
        }
    }

    $scope.getTypes()
    $scope.getPage(1)
}

app.factory('Excel', function ($window) {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); },
        format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
    return {
        tableToExcel: function (tableId, worksheetName) {
            var table = $(tableId),
                ctx = { worksheet: worksheetName, table: table.html() },
                href = uri + base64(format(template, ctx));
            return href;
        }
    };
})

function activityFormController($scope, $http) {
    $scope.activityData = {
        date: null,
        selectedType: null,
        description: null,
        duration: null,
        weight: null
    }
    $scope.listOfType = null;

    $scope.getTypes = function () {
        $http({
            method: 'GET',
            url: baseUrl + 'dashboards/kegiatan/jenis'
        }).then(function successCallback(response) {
            if (response.status == 200) {
                $response = response.data;

                $scope.listOfType = $response.data
            }
        }, function errorCallback(response) {

        });
    };

    $scope.addActivity = function () {
        $http({
            method: 'POST',
            url: baseUrl + 'dashboards/kegiatan',
            params: {
                id_jenis: $scope.activityData.selectedType.id,
                keterangan: $scope.activityData.description,
                durasi: $scope.activityData.duration,
                berat_badan: $scope.activityData.weight,
                tanggal: $scope.activityData.date
            }
        }).then(function successCallback(response) {
            console.log(response)
            if (response.status == 200) {
                window.location = '#!home';
            }
        }, function errorCallback(response) {
            $scope.successAddActivity = false;
        });
    };

    $scope.getTypes()
}

