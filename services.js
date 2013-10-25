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

var cpSvc = angular.module('cpSvc', ['restangular']);
cpSvc.factory('cpSvc', function ($rootScope, Restangular) {
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
        replaceObject: function(list, existing, newObject) {
            list = _.without(list, existing);
            list.push(newObject);
            return list;
        }
    }

    return svc;
});
