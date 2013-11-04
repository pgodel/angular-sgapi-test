'use strict';

function DomainListCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc) {

    $scope.domainsLoaded = false;
    $scope.isSearch = false;
    $scope.searchValue = '';
    $scope.async = {
        time: 10,
        error_time: 0
    };

    $scope.status = {
        value: 0,
        type: 'info'
    };
    $scope.statusText = '';

    cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', 1, function(domains) {
        $scope.domains = domains;
        $scope.domainsLoaded = true;

        $scope.paginator = domains.__paginator;
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

        cpSvc.domains.post(domain).then(function (newId) {

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

            cpSvc.asyncRequest(domain.remove({'async': 1}), 1000, function() {
                // domain removed, get page

                var pagesNb = Math.ceil($scope.paginator.page / $scope.paginator.limit);
                var lastPageItemsNb = $scope.paginator.total - ((pagesNb-1) * $scope.paginator.limit);
                var newPage;

                if ($scope.paginator.page < pagesNb || lastPageItemsNb > 1) {
                    newPage = $scope.paginator.page;
                } else {
                    newPage = $scope.paginator.page - 1;
                }

                cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', newPage, function(domains) {
                    $scope.domains = domains;
                    $scope.domainsLoaded = true;

                    $scope.paginator = domains.__paginator;
                }, true);

            }, function (response) {
                alert(response.error);
            }, function (response) {

            });

            $scope.domains = _.without($scope.domains, domain);

            /*
            domain.remove().then(function() {
                // remove from list
                $scope.domains = _.without($scope.domains, domain);
            });*/
        }
    };

    $scope.search = function() {
        $scope.domainsLoaded = false;
        cpSvc.searchDomains('4cc4a5c4f597e9db6e660200', $scope.searchValue, 1, function(domains) {
            $scope.domains = domains;
            $scope.domainsLoaded = true;

            $scope.paginator = domains.__paginator;
        });
    };

    $scope.removeSearch = function() {
        $scope.domainsLoaded = false;
        cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', 1, function(domains) {
            $scope.domains = domains;
            $scope.domainsLoaded = true;

            $scope.paginator = domains.__paginator;
        }, true);
    };


    $scope.currentAsync = null;

    $scope.goAsync = function() {
        var types = ['success', 'info', 'warning', 'danger'];

        cpSvc.async('4cc4a5c4f597e9db6e660200', $scope.async.time, $scope.status, function() {
            $scope.statusText = 'completed';
            $scope.status.value = 100;
            $scope.status.type = types[0];
        }, function(result) {
            if (result.status == 6) {
                $scope.statusText = 'cancelled';
            } else {
                $scope.statusText = 'error';
            }

            $scope.status.type = types[3];
        }, function(result) {
            $scope.statusText = 'running';
            $scope.status.value = result.percent;
            $scope.status.type = types[1];

            $scope.currentAsync = result.id;
        }, $scope.async.error_time);

    };

    $scope.cancelAsync = function() {
        Restangular.one("tasks", $scope.currentAsync).remove();
    };

    $scope.$watch("paginator.page", function( newVal, oldVal ){

        console.log(newVal, oldVal);

        if (newVal != undefined && oldVal != undefined) {
            $scope.domainsLoaded = false;
            cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', newVal, function(domains) {
                $scope.domains = domains;
                $scope.domainsLoaded = true;
                $scope.paginator = domains.__paginator;
            }, true);
        }



    } );

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