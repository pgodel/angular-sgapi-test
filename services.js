/*var sgServices = angular.module('sgServices', ['ngResource']);

sgServices.factory('Domains', ['$resource',
    function($resource){
        return $resource('domains/:domainName.json', {}, {
            //query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
        });
    }]);
*/


angular.module('sgServices', ['ngResource']).
    factory('Domain', function($resource){
        return $resource('domains/:domainName.json', {}, {
            query: {method:'GET', params:{domainName:'bob.com'}, isArray:true}
        });
    });