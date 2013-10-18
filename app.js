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
        RestangularProvider.setDefaultRequestParams({ access_token: 'ZWJhY2I0YzlmNzAwMmUxNjkxYjRhYjBkZWNmZWRjYTQ1YWNlYTQ5M2ZjMGNjOGI1MTlmNDAzYzIwYjcxZTlhMA' })
        /*RestangularProvider.setRestangularFields({
            id: '_id.$oid'
        });*/
    }]);
