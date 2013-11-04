var sgApp = angular.module('sgApp', [
    'restangular',
    'cpSvc',
    'ui.bootstrap'
]);

sgApp.config(['$routeProvider', 'RestangularProvider',
    function($routeProvider, RestangularProvider) {
        $routeProvider.
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
            })/*.
            otherwise({
                redirectTo: '/domains'
            })*/;

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
