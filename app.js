var sgApp = angular.module('sgApp', [
    'ngRoute',
    'ui.router',
    'restangular',
    'cpSvc',
    'ui.bootstrap'
]);

sgApp.config(['$routeProvider', 'RestangularProvider', '$locationProvider','$stateProvider', '$urlRouterProvider',
    function($routeProvider, RestangularProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
        /*$routeProvider.
                when('/servers', {
                    templateUrl: 'partials/server-list.html',
                    controller: 'ServerListCtrl'
                }).
                when('/servers/:id', {
                    templateUrl: 'partials/server-detail.html',
                    controller: 'ServerDetailCtrl'
                }).
                when('/servers/:id/domains', {
                    templateUrl: 'partials/domain-list.html',
                    controller: 'DomainListCtrl'
                }).
                when('/servers/:id/apps', {
                    templateUrl: 'partials/app-list.html',
                    controller: 'AppListCtrl'
                }).
                when('/domains', {
                    templateUrl: 'partials/domain-list.html',
                    controller: 'DomainListCtrl'
                }).
                when('/domains/:id/edit', {
                    templateUrl: 'partials/domain-edit.html',
                    controller: 'DomainEditCtrl'
                }).
                when('/domains/:id', {
                    templateUrl: 'partials/domain-detail.html',
                    controller: 'DomainDetailCtrl'
                }).
                otherwise({
                    redirectTo: '/'
                });*/


        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/");
        //
        // Now set up the states
        $stateProvider
            .state('server_list', {
                url: "/servers",
                templateUrl: "partials/server-list.html",
                controller: 'ServerListCtrl'
            })
            .state('server_detail', {
                url: "/servers/:id",
                templateUrl: "partials/server-detail.html",
                controller: 'ServerDetailCtrl'
            })
            /*.state('state1.list', {
                url: "/list",
                templateUrl: "partials/state1.list.html",
                controller: function($scope) {
                    $scope.items = ["A", "List", "Of", "Items"];
                }
            })
            /*.state('state2', {
                url: "/state2",
                templateUrl: "partials/state2.html"
            })
            .state('state2.list', {
                url: "/list",
                templateUrl: "partials/state2.list.html",
                controller: function($scope) {
                    $scope.things = ["A", "Set", "Of", "Things"];
                }
            })*/;

        //$locationProvider.html5Mode(true);
        
        RestangularProvider.setBaseUrl('http://sgcontrol2.local/rest/');
        RestangularProvider.setDefaultRequestParams({
            access_token: 'Zjk3NWJkMDliMTAxOTdkYThiZGJmMmMzOWM4MDBkMzEwYzc1NzJhNjY2ZDc4NDE1MzUyMjgxMjhlNWM3MjNkYQ',
        });
        RestangularProvider.setDefaultHeaders({
            'X-ServerGrove-Client': 'sgcontrol3'
        });

        cpSvc.extractResourceId = function(headers) {
            if (headers('x-servergove-resource-id') != undefined) {
                return headers('x-servergove-resource-id');
            }

            if (headers('Location') != undefined) {
                return headers('Location').replace(url + '/', '');
            }

            return null;
        };

        RestangularProvider.setResponseExtractor(function(data, operation, what, url, response) {
            var newResponse;

            if (operation === "getList") {
                // Here we're returning an Array which has one special property metadata with our extra information
                newResponse = data.results;
                newResponse.__paginator = {
                    page: data.page,
                    limit: data.limit,
                    total: data.total
                };
            } else if (operation === 'post') {
                newResponse = cpSvc.extractResourceId(response.headers);
            } else if (operation === 'remove') {
                newResponse = cpSvc.extractResourceId(response.headers);
            }
            else {
                // This is an element
                newResponse = data;
            }

            return newResponse;
        });


        RestangularProvider.setErrorInterceptor(function(response) {
            alert('Error: ' + response.data.message);

            return false;
        });

    }
]);
