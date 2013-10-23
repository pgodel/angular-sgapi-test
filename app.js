var sgApp = angular.module('sgApp', [
    //'sgControllers',
    //'sgServices',
    'restangular'
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
        RestangularProvider.setDefaultRequestParams({ access_token: 'NjU5YzVkOWQ1ZjU1Y2U5YzdhY2Y4YjdhM2M5OWJhNGZlMGI1N2FmMTAxZDE1ZmY1ZGUwNmRkMWE0NzA3N2QzYw' })

        //RestangularProvider.setFullResponse(false);

        RestangularProvider.setResponseExtractor(function(data, operation, what, url, response) {
            var newResponse;

            if (operation === "getList") {
                // Here we're returning an Array which has one special property metadata with our extra information
                newResponse = data.results;
                //newResponse.metadata = response.data.meta;
            } else if (operation === 'post') {
                newResponse = response.headers('Location').replace(url + '/', '');
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
