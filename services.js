var cpSvc = angular.module('cpSvc', ['restangular']);
cpSvc.factory('cpSvc', function ($rootScope, Restangular, $timeout) {
    var svc = {
        domains: null,
        servers: null,
        doInit: true,
        isAuth: false,
        authUser: null,
        init: function (onSuccess, onError) {
            if (!svc.doInit) {
                if (angular.isFunction(onSuccess)) {
                    onSuccess.call(undefined);
                }
                return;
            }
            svc.doInit = false;

            $rootScope.$broadcast('sgSvcInit');
            if (angular.isFunction(onSuccess)) {
                onSuccess.call(undefined);
            }
        },
        getDomainById: function (id) {
            return _.findWhere(svc.domains, {'id': id});
        },
        loadDomains: function (serverId, page, onSuccess, reload) {
            if (svc.domains && !reload) {
                $rootScope.$broadcast('sgSvcLoadDomains');
                if (angular.isFunction(onSuccess)) {
                    onSuccess.call(undefined, svc.domains);
                }
                return;
            }
            svc.domains = [];

            return Restangular.all('domains').getList({'filter_server': serverId, 'page': page, 'limit': 10})
                .then(function (response) {
                    svc.domains = response;
                    $rootScope.$broadcast('sgSvcLoadDomains');
                    if (angular.isFunction(onSuccess)) {
                        onSuccess.call(undefined, svc.domains);
                    }
                });
        },
        loadServers: function (page, onSuccess, reload) {
            if (svc.domains && !reload) {
                $rootScope.$broadcast('sgSvcLoadServers');
                if (angular.isFunction(onSuccess)) {
                    onSuccess.call(undefined, svc.servers);
                }
                return;
            }
            svc.servers = [];

            return Restangular.all('servers').getList({'page': page, 'limit': 10})
                .then(function (response) {
                    svc.servers = response;
                    $rootScope.$broadcast('sgSvcLoadServers');
                    if (angular.isFunction(onSuccess)) {
                        onSuccess.call(undefined, svc.servers);
                    }
                });
        },
        searchDomains: function (serverId, searchValue, page, onSuccess, reload) {
            return Restangular.all('domains').getList({'filter_server': serverId, 'filter_name': searchValue, 'page': page, 'limit': 10})
                .then(function (response) {
                    svc.domains = response;
                    $rootScope.$broadcast('sgSvcLoadDomains');
                    if (angular.isFunction(onSuccess)) {
                        onSuccess.call(undefined, svc.domains);
                    }
                });
        },
        asyncRequest: function(task, interval, onSuccess, onError, onNotify, onCreate) {
            return task.then(function (taskId) {
                var firstRequest = true;
                    $timeout(function asyncInterval() {
                        Restangular.one('tasks', taskId).get().then(function (result) {

                            if (firstRequest && angular.isFunction(onCreate)) {
                                onCreate.call(undefined, result);
                                firstRequest = false;
                            }

                            if (angular.isFunction(onNotify)) {
                                onNotify.call(undefined, result);
                            }

                            switch (result.status) {
                                case 1:
                                case 2:
                                case 5:
                                case 7:
                                    // task still running
                                    $timeout(asyncInterval, interval);
                                    break;
                                case 3:
                                    // task completed
                                    if (angular.isFunction(onSuccess)) {
                                        onSuccess.call(undefined, result, taskId);
                                    }
                                    break;
                                case 4:
                                    // task failed
                                    if (angular.isFunction(onError)) {
                                        onError.call(undefined, result);
                                    }
                                    break;
                                case 6:
                                    // task cancelled
                                    if (angular.isFunction(onError)) {
                                        onError.call(undefined, result);
                                    }
                                    break;
                            }

                        })

                    }, interval);

                });
        },
        async: function (serverId, time, val, onSuccess, onError, onNotify, errorTime, onCreated) {
            return Restangular.all('tasks').post({'type': 'test', 'server_id': serverId, 'test_time': time, 'test_error_time': errorTime})
                .then(function (taskId) {

                    //var finished = false;

                    onCreated.call(undefined, taskId);


                    $timeout(function asyncInterval() {
                        Restangular.one('tasks', taskId).get().then(function (result) {

                            onNotify.call(undefined, result, taskId);

                            switch (result.status) {
                                case 1:
                                case 2:
                                case 5:
                                case 7:
                                    // task still running
                                    $timeout(asyncInterval, 1000);
                                    break;
                                case 3:
                                    // task completed
                                    console.log('completed');
                                    onSuccess.call(undefined, result, taskId);
                                    break;
                                case 4:
                                    // task failed
                                    console.log('error');
                                    onError.call(undefined, result, taskId);
                                    break;
                                case 6:
                                    // task cancelled
                                    console.log('cancelled');
                                    onError.call(undefined, result, taskId);
                                    break;
                            }

                        })

                    }, 1000);





                });
        },
        replaceObject: function(list, existing, newObject) {
            list = _.without(list, existing);
            list.push(newObject);
            return list;
        },
        setOauthAccessToken: function(token) {
            Restangular.setDefaultRequestParams({
                access_token: token
            });
        }
    }

    return svc;
});
