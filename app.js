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
                controller: 'DomainListCtrl'/*,
                resolve: {
                    project: function(Restangular, $route){
                        return Restangular.all('domains');
                    }
                }*/
            }).
            when('/domains/:domainName', {
                templateUrl: 'partials/domain-detail.html',
                controller: 'DomainDetailCtrl'
            }).
            otherwise({
                redirectTo: '/domains'
            });

        RestangularProvider.setBaseUrl('http://sgcontrol2.local/rest/');
        RestangularProvider.setDefaultRequestParams({ access_token: 'YzE2MTQwOWRjOThjMzZlZmYxZTI1OGJkODk1Nzc2MTEyYzgyMDM2YjZhMGUwZjc1ZjQ3MDRkMTNjMDE4MDA3OQ' })

        RestangularProvider.setResponseInterceptor(function (data, operation, what, url, response, deferred)
        {
            // available headers (CORS exposed)
            console.log(response.headers());

            data.__headers = response.headers();

            return data;
        });



    }]);
