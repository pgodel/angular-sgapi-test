/*var sgControllers = angular.module('sgControllers', ['restangular']);

sgControllers.controller('DomainListCtrl', ['$scope', function($scope, Restangular) {
    var baseDomains = Restangular.all('domains');

    $scope.domains = baseDomains.getList();
}]);

sgControllers.controller('DomainDetailCtrl', ['$scope', '$routeParams', 'Domain', function($scope, $routeParams, Domain) {
    $scope.domain = Domain.get({domainName: $routeParams.domainName}, function(domain) {
        //$scope.mainImageUrl = domain.images[0];
    });

    $scope.setImage = function(imageUrl) {
        $scope.mainImageUrl = imageUrl;
    }
}]);
*/


'use strict';

function DomainListCtrl($rootScope, $scope, $routeParams, Restangular) {

    var domainList = Restangular.all('domains/').getList();


    $scope.domains = domainList.get('results');

    //$scope.domain = Domain.get({domainName: $routeParams.domainName}, function(domain) {
        //$scope.mainImageUrl = domain.images[0];
    //});
}
DomainListCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular'];