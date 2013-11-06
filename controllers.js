'use strict';

function ServerListCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc) {


    $scope.servers = {
        selected: null,
        current: {
            servers: [],
            servers_search: [],
            paginator: {}
        },
        list: []
    };

    $scope.loadingServers = false;

    $scope.loadingServers = true;
    cpSvc.loadServers(0, function(servers) {
        $scope.servers.list = servers;
        $scope.loadingServers = false;

        $scope.servers.paginator = servers.__paginator;
    });


    $scope.$watch("servers.paginator.page", function( newVal, oldVal ){
        if (newVal != undefined && oldVal != undefined) {
            cpSvc.loadServers(newVal, function(servers) {
                $scope.servers.servers = servers;
                $scope.servers.paginator = servers.__paginator;
            }, true);
        }

    } );


}

function DomainListCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc) {


    $scope.servers = {
        selected: null,
        current: {
            domains: [],
            domains_search: [],
            paginator: {}
        },
        list: []
    };

    $scope.tabs = [
        {
            title: 'tab 1',
            content: 'content 1'
        },
        {
            title: 'tab 2',
            content: 'content 2'
        }
    ];

    $scope.loadingDomains = false;

    $scope.isSearch = false;
    $scope.search = {
        'value': ''
    };
    $scope.async = {
        time: 10,
        error_time: 0
    };

    $scope.status = {
        value: 0,
        type: 'info'
    };
    $scope.statusText = '';

    $scope.loadingServers = false;

    $scope.loadingServers = true;
    cpSvc.loadServers(0, function(servers) {
        $scope.servers.list = servers;
        $scope.loadingServers = false;

        //$scope.servers.paginator = servers.__paginator;
    });

    $scope.resetNewDomain = function() {
        $scope.newdomain = {
            name: ''
        };
        $scope.dns_service = '0';
        $scope.webServer = 'app_apache2';
        $scope.ipAddress= '69.195.198.157';
    }

    $scope.resetNewDomain();


    $scope.add = function() {
        var domain = {
            name: $scope.newdomain.name,
            server_id: '4cc4a5c4f597e9db6e660200',
            services: {
                'dns': {
                    'providerId' : $scope.dns_service
                },
                'web': {
                    'providerId': 'servergrove',
                    'serverId': '4cc4a5c4f597e9db6e660200',
                    'appType': $scope.webServer
                }
            }
        };

        cpSvc.domains.post(domain).then(function (newId) {

            // fill with the new id and insert into the list
            Restangular.one('domains', newId).get()
                    .then(function (response) {
                        cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', $scope.paginator.page, function(domains) {
                            $scope.domains = domains;
                            $scope.domainsLoaded = true;

                            $scope.paginator = domains.__paginator;
                        }, true);
                        $scope.resetNewDomain();
                    });
        });
    };

    $scope.remove = function(domain) {

        if (confirm("Are you sure you want to remove the domain " + domain.name + "?")) {

            cpSvc.asyncRequest(domain.remove({'async': 1}), 100, function(result, taskId) {
                // domain removed, get page

                var pagesNb = Math.ceil($scope.servers.current.paginator.page / $scope.servers.current.paginator.limit);
                var lastPageItemsNb = $scope.servers.current.paginator.total - ((pagesNb-1) * $scope.servers.current.paginator.limit);
                var newPage;

                if ($scope.servers.current.paginator.page < pagesNb || lastPageItemsNb > 1) {
                    newPage = $scope.servers.current.paginator.page;
                } else {
                    newPage = $scope.servers.current.paginator.page - 1;
                }

                cpSvc.loadDomains($scope.servers.selected, newPage, function(domains) {
                    var i, sel;
                    for (i=0;i<$scope.servers.list.length;i++) {
                        if ($scope.servers.list[i].id == $scope.servers.selected) {
                            sel = i;
                        }
                    }

                    $scope.servers.list[sel].domains = domains;
                    $scope.domainsLoaded = true;
                    $scope.servers.list[sel].paginator = domains.__paginator;
                    $scope.servers.current = $scope.servers.list[sel];
                    $scope.loadingDomains = false;


                    cpSvc.task = {
                        'id': taskId,
                        'percent': 100,
                        'status': 3,
                        'text': '',
                        'title': 'Deleting domain ' + domain.name
                    };
                    $scope.$emit('task_update');

                }, true);

            }, function (response, taskId) {
                alert(response.error);
            }, function (response, taskId) {
                cpSvc.task = {
                    'id': taskId,
                    'percent': response.percent,
                    'status': response.status,
                    'text': '',
                    'title': 'Deleting domain ' + domain.name
                };
                $scope.$emit('task_update');
            }, function (taskId) {
                cpSvc.task = {
                    'id': taskId,
                    'percent': 0,
                    'status': 1,
                    'text': '',
                    'title': 'Deleting domain ' + domain.name
                };
                $scope.$emit('task_add');
            });

            $scope.domains = _.without($scope.domains, domain);

            /*
            domain.remove().then(function() {
                // remove from list
                $scope.domains = _.without($scope.domains, domain);
            });*/
        }
    };

    $scope.doSearch = function() {
        $scope.loadingDomains = true;
        $scope.isSearch = true;
        console.log('searching: ' + $scope.search.value);
        cpSvc.searchDomains($scope.servers.selected, $scope.search.value, 1, function(domains) {
            $scope.servers.current.domains_search = domains;
            $scope.servers.current.paginator_search = domains.__paginator;
            $scope.loadingDomains = false;
        });
    };

    $scope.removeSearch = function() {
        $scope.loadingDomains = false;
        $scope.isSearch = false;
        $scope.search = {
                'value': ''
            };
        cpSvc.loadDomains($scope.servers.selected, 1, function(domains) {
            $scope.servers.current.domains = domains;
            $scope.servers.current.paginator = domains.__paginator;
            $scope.loadingDomains = false;
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

            cpSvc.task = {
                'id': result.id,
                'percent': result.percent,
                'status': result.status,
                'text': '',
                'title': 'Deleting domain'
            };
            $scope.$emit('task_update');

        }, $scope.async.error_time, function (taskId) {
            cpSvc.task = {
                'id': taskId,
                'percent': 0,
                'status': 1,
                'text': '',
                'title': 'Deleting domain'
            };
            $scope.$emit('task_add');
        });

    };

    $scope.cancelAsync = function() {
        Restangular.one("tasks", $scope.currentAsync).remove();
    };

    $scope.$watch("servers.current.paginator.page", function( newVal, oldVal ){
        if (newVal != undefined && oldVal != undefined) {
            $scope.loadingDomains = true;
            cpSvc.loadDomains($scope.servers.selected, newVal, function(domains) {
                $scope.servers.current.domains = domains;
                $scope.domainsLoaded = true;
                $scope.servers.current.paginator = domains.__paginator;
                $scope.loadingDomains = false;
            }, true);
        }

    } );

    $scope.$watch("servers.selected", function(newVal, oldVal){

        if (newVal != null && newVal != undefined) {
            $scope.loadingDomains = true;
            cpSvc.loadDomains(newVal, 1, function(domains) {

                var i, sel;
                for (i=0;i<$scope.servers.list.length;i++) {
                    if ($scope.servers.list[i].id == newVal) {
                        sel = i;
                    }
                }

                $scope.servers.list[sel].domains = domains;
                $scope.domainsLoaded = true;
                $scope.servers.list[sel].paginator = domains.__paginator;
                $scope.servers.current = $scope.servers.list[sel];
                $scope.loadingDomains = false;

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


function TaskManagerCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc) {

    $scope.tasks = [];

    $rootScope.$on('task_add', function () {
        console.log('adding task');
        console.log(cpSvc.task);
        $scope.tasks.push(cpSvc.task);
    });

    $scope.status = {
        'value': 0,
        'text': ''
    };

    $rootScope.$on('task_update', function () {

        console.log('task update');
        console.log(cpSvc.task);
        console.log($scope.tasks);
        var i;

        for (i=0;i<$scope.tasks.length;i++) {

            if ($scope.tasks[i].id.id == cpSvc.task.id) {
                console.log('found');
                $scope.tasks[i] = cpSvc.task;

                if (cpSvc.task.status == 3) {
                    console.log('finished task');
                    $scope.tasks = _.without($scope.tasks, cpSvc.task);
                }
            }
        }

    });
}
TaskManagerCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc'];
