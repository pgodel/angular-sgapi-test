var sgApp = angular.module('sgApp', [
    //'sgControllers',
    //'sgServices',
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
            access_token: 'MTY1NWU2MzM5Y2E1YmRlY2EyY2Q2YzYzNjFiNmQ3MjI3MDdmODczNDM3ZWNhN2M1NmE3MDlmZmMyMmE0ZWM0Yw',
        });
        RestangularProvider.setDefaultHeaders({
            'X-ServerGrove-Client': 'sgcontrol3'
        });

        //RestangularProvider.setFullResponse(false);


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
                if (response.headers('x-servergove-resource-id') != undefined) {
                    newResponse = response.headers('x-servergove-resource-id');
                    console.log('yay');
                } else if (response.headers('Location') != undefined) {
                    newResponse = response.headers('Location').replace(url + '/', '');
                } else if (response.headers('X-sgapi-location') != undefined) {
                    newResponse = response.headers('X-sgapi-location').replace(url + '/', '');
                    console.log(newResponse);
                }

            } else if (operation === 'delete') {
                newResponse = null;
            }
            else {
                // This is an element
                newResponse = data;
            }

            return newResponse;
        });

        RestangularProvider.setErrorInterceptor(function(response) {
            alert('Error: ' + response.data.message);
console.log(response);
            return false;
        });

/*
        RestangularProvider.setResponseInterceptor(function (data, operation, what, url, response, deferred)
        {
            console.log('interceptor for ' + operation);

            // available headers (CORS exposed)
            //console.log(response.headers());

            //data.__headers = response.headers();


            var newResponse;
            if (operation === "getList") {
                // Here we're returning an Array which has one special property metadata with our extra information
                newResponse = response.results;
                //newResponse.metadata = response.data.meta;
            } else {
                // This is an element
                newResponse = response;
            }
            return newResponse;

        });
*/



    }]);
