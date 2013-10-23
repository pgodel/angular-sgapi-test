'use strict';

function DomainListCtrl($rootScope, $scope, $routeParams, Restangular) {


    $scope.domainsLoaded = false;

    Restangular.all('domains').getList({'filter_server': '4cc4a5c4f597e9db6e660200', 'limit': 50})
        .then(function (response) {
            $scope.domains = response;
            $scope.domainsLoaded = true;
        });


    $scope.resetNewDomain = function() {
        $scope.newdomain = {
            name: ''
        };
    }

    $scope.resetNewDomain();


    $scope.add = function() {

        var domain = {
            name: $scope.newdomain.name,
            server_id: '4cc4a5c4f597e9db6e660200'
        };

        var list = Restangular.all('domains');

        list.post(domain).then(function (newId) {

            // fill with the new id and insert into the list
            Restangular.one('domains', newId).get()
                    .then(function (response) {
                        $scope.domains.push(response);
                        $scope.resetNewDomain();
                    });
        });
    };

    $scope.remove = function(domain) {

        if (confirm("Are you sure you want to remove the domain " + domain.name + "?")) {
            domain.remove().then(function() {
                // remove from list
                $scope.domains = _.without($scope.domains, domain);
            });
        }
    };

}
DomainListCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular'];

function DomainEditCtrl($rootScope, $scope, $routeParams, Restangular) {

    Restangular.one('domains', $routeParams.id).get()
        .then(function (response) {
            $scope.domain = response;
        });

    $scope.cancel = function() {
        window.history.back();
    };

    $scope.edit = function() {
        $scope.domain.put().then(function() {
            window.location.href = "#/domains";
        });
    };

}
DomainEditCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular'];