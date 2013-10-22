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

    var domainList = Restangular.all('domains/').getList({'filter_server': '4cc4a5c4f597e9db6e660200', 'limit': 50});



//console.log(domainList.get('__headers'));
    $scope.domains = domainList.get('results');


    $scope.newdomain = {
        name: ''
    };

    //$scope.domain = Domain.get({domainName: $routeParams.domainName}, function(domain) {
        //$scope.mainImageUrl = domain.images[0];
    //});

    $scope.addDomain = function() {

        var domain = {
            name: $scope.newdomain.name,
            server_id: '4cc4a5c4f597e9db6e660200'
        };

        var domainElement = Restangular.one('domains', domain.name);

        domainElement.customPUT(domain).then(function () {
            $scope.domains.push(domainElement.get());
        }, function (response) {
            alert("Error: " + response);
        });
    };

    $scope.edit = function(domain) {
        console.log('edit');
    };

    $scope.remove = function(domain, index) {
        /*
        if (confirm("Are you sure you want to remove the domain " + domain.name + "?")) {
            var domainElement = Restangular.one('domains', domain.name);

            domainElement.remove()
                .then(function () {
                    console.log($scope.domains);
                    $scope.domains.splice(index, 1);
                });
        }*/

        Restangular.one("domains", domain.name).remove().then(function(){
            $scope.domains = Restangular.all('domains/').getList({'filter_server': '4cc4a5c4f597e9db6e660200', 'limit': 50}).get('results');
        });
    };
}
DomainListCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular'];