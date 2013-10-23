'use strict';

function DomainListCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc) {


    $scope.domainsLoaded = false;

    console.log(cpSvc);

    cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', function(domains) {
        $scope.domains = domains;
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
DomainListCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc'];

function DomainEditCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc) {

    cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', function(domains) {
        $scope.master = cpSvc.getDomainById($routeParams.id);
        $scope.domain = Restangular.copy($scope.master);
    });

    $scope.cancel = function() {
        window.history.back();
    };

    $scope.save = function() {
        $scope.domain.put().then(function() {
            cpSvc.domains = cpSvc.replaceObject(cpSvc.domains, $scope.master, $scope.domain);
            window.location.href = "#/domains";
        });
    };

}
DomainEditCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc'];