/*var sgServices = angular.module('sgServices', ['ngResource']);

sgServices.factory('Domains', ['$resource',
    function($resource){
        return $resource('domains/:domainName.json', {}, {
            //query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
        });
    }]);
*/

/*
angular.module('sgServices', ['ngResource']).
    factory('Domain', function($resource){
        return $resource('domains/:domainName.json', {}, {
            query: {method:'GET', params:{domainName:'bob.com'}, isArray:true}
        });
    });
*/
var xxx;

var cpSvc = angular.module('cpSvc', ['restangular']);
cpSvc.factory('cpSvc', function ($rootScope, Restangular, $timeout) {
    var svc = {
        domains: null,
        doInit: true,
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
                return
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
        async: function (serverId, time, val, onSuccess, onError, onNotify, errorTime) {
            return Restangular.all('tasks').post({'type': 'test', 'server_id': serverId, 'test_time': time, 'test_error_time': errorTime})
                .then(function (taskId) {

                    //var finished = false;


                    $timeout(function asyncInterval() {
                        Restangular.one('tasks', taskId).get().then(function (result) {

                            onNotify.call(undefined, result);

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
                                    onSuccess.call(undefined, result);
                                    break;
                                case 4:
                                    // task failed
                                    console.log('error');
                                    onError.call(undefined, result);
                                    break;
                                case 6:
                                    // task cancelled
                                    console.log('cancelled');
                                    onError.call(undefined, result);
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
        }
    }

    return svc;
});
