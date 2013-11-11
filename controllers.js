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

function DomainListCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc, $state) {

    $scope.loading = false;

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


    $scope.resetNewDomain = function() {
        $scope.newdomain = {
            name: ''
        };
        $scope.dns_service = '0';
        $scope.webServer = 'app_apache2';
        $scope.ipAddress= '69.195.198.157';
    }

    $scope.resetNewDomain();

    $scope.showDomainAddModal = function() {
        $('#modal-domain-add').modal('show');
    }

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
            $('#modal-domain-add').modal('hide');

            // fill with the new id and insert into the list
            Restangular.one('domains', newId).get()
                    .then(function (response) {
                        cpSvc.loadDomains('4cc4a5c4f597e9db6e660200', $scope.servers.current.paginator.page, function(domains) {
                            $scope.servers.current.domains = domains;
                            $scope.domainsLoaded = true;

                            $scope.servers.current.paginator = domains.__paginator;
                        }, true);
                        $scope.resetNewDomain();
                    });
        });
    };

    $scope.searchAutocomplete = [];
    $scope.autocomplete_loading=true;




    $scope.searchDomains = function(c) {
        console.log(c);
        $scope.autocomplete_loading=true;

        return Restangular.all('domains').getList({'filter_server': $state.params.id, 'filter_name': c, 'page': 1, 'limit': 10});
    };

    $scope.remove = function(domain) {

        if (confirm("Are you sure you want to remove the domain " + domain.name + "?")) {
            $scope.servers.current.domains = _.without($scope.servers.current.domains, domain);
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

            /*
            domain.remove().then(function() {
                // remove from list
                $scope.domains = _.without($scope.domains, domain);
            });*/
        }
    };

    $scope.doSearch = function() {
        $scope.loading = true;
        $scope.isSearch = true;
        console.log('searching: ' + $scope.search.value);
        cpSvc.searchDomains($state.params.id, $scope.search.value, 1, function(domains) {
            $scope.domains_search = domains;
            $scope.paginator_search = domains.__paginator;
            $scope.loading = false;
        });
    };

    $scope.removeSearch = function() {
        $scope.loading = true;
        $scope.isSearch = false;
        $scope.search = {
                'value': ''
            };
        cpSvc.loadDomains($state.params.id, 1, function(domains) {
            $scope.domains = domains;
            $scope.paginator = domains.__paginator;
            $scope.loading = false;
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


    $scope.loading = true;
    console.log('loading ' + $state.params.id);
    cpSvc.loadDomains($state.params.id, 1, function(domains) {
        $scope.domains = domains;
        $scope.domainsLoaded = true;
        $scope.paginator = domains.__paginator;
        $scope.loading = false;
    }, true);

    $scope.$watch("paginator.page", function( newVal, oldVal ){
        if (newVal != undefined && oldVal != undefined) {
            $scope.loading = true;
            cpSvc.loadDomains($state.params.id, newVal, function(domains) {
                $scope.domains = domains;
                $scope.domainsLoaded = true;
                $scope.paginator = domains.__paginator;
                $scope.loading = false;
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
DomainListCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc', '$state'];

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

    $scope.test = '1';

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

function ServerDetailCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc, $state) {

    $scope.server = {};
    $scope.loading = true;
    $scope.tabSelected = 1;
    $scope.tabs = [
        {
            title: 'Overview',
            active: true,
            disabled: false,
            ccc: 'loadOverview'
        }
    ];

    Restangular.one('servers', $state.params.id).get()
        .then(function (response) {
            $scope.server = response;
            $scope.loading = false;
        });

    $scope.loadOverview = function() {
        alert(1);
    };

}
ServerDetailCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc', '$state'];

function MainCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc, $location, $window, $state) {

    $scope.isAuth = false;

    $scope.servers = [];
    $scope.selectedServer = null;

    $scope.loading = {
        servers: true,
        user: true
    };


    $rootScope.$on('post_login', function() {
        Restangular.one('me').get()
            .then(function (response) {
                $scope.user = response;
                $scope.loading.user = false;
                $scope.isAuth = true;
            });

        $scope.loadingServers = true;
        cpSvc.loadServers(0, function(servers) {
            $scope.servers = servers;
            $scope.loadingServers = false;
        });
    });


    $rootScope.$on('post_logout', function() {
        $scope.isAuth = false;
        $scope.user = null;
    });


    /*$scope.user = {
        name: 'Raul Fraile',
        avatar: 'https://pbs.twimg.com/profile_images/378800000213396112/e23ebf3ee11b738595f66c31a9978c43.png'
    };*/

    $scope.breadcrumbs = [
        {
            title: 'Home',
            state: 'home'
        },
        {
            title: 'Servers',
            state: 'server_list'
        },
        {
            title: 'server-1'
        }
    ];



    $scope.selectServer = function(serverId) {
        $scope.selectedServer = serverId;

        //$window.location.href = '#/domains';

        //window.location.href = '#/domains';
        $state.go('server_detail', { id: serverId });
    };
}
MainCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc', '$location', '$window', '$state'];

function LoginCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc, $location, $window, $state) {

    $scope.user = {
        email: '',
        password: ''
    };

    $scope.doLogin = function() {
        // get login
        console.log('do login');


        Restangular.one("oauth/v2", "token").get({
            client_id: "51c0961f6c0f4e510be5d4c1_4wh10vjtkbokk8gg0ccwgcg84o0w44coc00s4os4wsso4ossw8",
            grant_type: "password",
            username: $scope.user.email,
            password: $scope.user.password
        }).then(function (response) {
                console.log(response);

                cpSvc.setOauthAccessToken(response.access_token);
                cpSvc.isAuth = true;

                $state.go('home');

                $rootScope.$emit('post_login');
            }, function (r) {
                console.log(r);
            });
    };

}
LoginCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc', '$location', '$window', '$state'];

function LogoutCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc, $location, $window, $state) {

    cpSvc.isAuth = false;
    $rootScope.$emit('post_logout');

}
LogoutCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc', '$location', '$window', '$state'];

function TimelineCtrl($rootScope, $scope, $routeParams, Restangular, cpSvc, $location, $window, $state) {
console.log('timeline');
    $scope.events = [];

    cpSvc.loadTimeline(1, function (response) {
       $scope.events = response;
    });

}
TimelineCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'Restangular', 'cpSvc', '$location', '$window', '$state'];