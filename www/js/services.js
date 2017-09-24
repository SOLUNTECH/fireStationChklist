angular.module('fireStation.services', [])
    
.service('LoginService', function($q, $http) {
    
    return {
//        loginUser: function(name, pw) {
//            var deferred = $q.defer();
//            var promise = deferred.promise;
// 
//            if (name == 'user' && pw == 'secret') {
//                deferred.resolve('Welcome ' + name + '!');
//            }else {
//                deferred.reject('Wrong credentials.');
//            }
//            
//            promise.success = function(fn) {
//                promise.then(fn);
//                return promise;
//            };
//            
//            promise.error = function(fn) {
//                promise.then(null, fn);
//                return promise;
//            };
//            
//            return promise;
//        }
//        
        loginUser: function(username, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var ApplicationID = '59821baba236484fa1983bdf';
            
            $http({
                method: 'POST',
                headers: 'Content-Type: application/json',
                url: 'https://api.knack.com/v1/applications/' + ApplicationID + '/session',
                data: {
                    email: username,
                    password: pw
                }
            })
            .then(function (response){
                
                console.log(response);
                var isAuthenticated = response.status === 200 ? true : false;
                if (isAuthenticated) {
                    deferred.resolve('Welcome ' + username + '!');
                }else {
                    deferred.reject('Wrong credentials.');
                }
                
//                promise.success = function(fn) {
//                    promise.then(fn);
//                    return promise;
//                };
//
//                promise.error = function(fn) {
//                    promise.then(null, fn);
//                    return promise;
//                };
                
                
            });
            
            return promise;
        }
    };
})

.service('KnackService', ['KNACK', '$http', '$q', '$ionicPopup', function KnackService(KNACK, $http, $q, $ionicPopup) {


  function find(page, view, filters, sortField, sortOrder, recordPerPage) {

    filters = filters || [];
    sortOrder = sortOrder || '';
    sortField = sortField || '';
    recordPerPage = recordPerPage || 'all';

    var filterValEnc = encodeURIComponent(JSON.stringify(filters));
    var sortFEnc = encodeURIComponent(sortField);
    var sortOEnc = encodeURIComponent(sortOrder);

    return $q(function promise(resolve, reject) {

      $http({
        method: 'GET',
        url: KNACK.url + page + '/views/' + view + '/records?rows_per_page=' + recordPerPage +
                '&filters=' + filterValEnc + "&sort_field=" + sortFEnc + "&sort_order=" +
                sortOEnc,
        headers: KNACK.headers
      }).then(
        function success(response) {

          resolve(response.data);
        },
        function fail(response) {

          reject(response.data);
        }
      );
    });
  }

  function findById(page, view, id) {

    return $q(function promise(resolve, reject) {

      $http({
        method: 'GET',
        url: KNACK.url  + page + '/views/' + view + '/records/' + id,
        headers: KNACK.headers
      }).then(
        function success(response) {

          resolve(response.data);
        },
        function fail(response) {

          reject(response.data);
        }
      );
    });
  }

  function create(page, view, data) {

    return $q(function promise(resolve, reject) {

      $http({
        method: 'POST',
        url: KNACK.url  + page + '/views/' + view + '/records',
        headers: KNACK.headers,
        data: data
      }).then(
        function success(response) {

          resolve(response.data);
        },
        function fail(response) {

          reject(response.data);
        }
      );
    });
  }

  function update(page, view, id, data) {

    return $q(function promise(resolve, reject) {

      $http({
        method: 'PUT',
        url: KNACK.url  + page + '/views/' + view + '/records/' + id,
        headers: KNACK.headers,
        data: data
      }).then(
        function success(response) {

          resolve(response.data);
        },
        function fail(response) {

          reject(response.data);
        }
      );
    });
  }

  function remove(page, view, id, data) {

    return $q(function promise(resolve, reject) {

      $http({
        method: 'DELETE',
        url: KNACK.url  + page + '/views/' + view + '/records/' + id,
        headers: KNACK.headers,
      }).then(
        function success(response) {

          resolve(response.data);
        },
        function fail(response) {

          reject(response.data);
        }
      );
    });
  }

  function getFieldValue(object, field, type) {

    if (!object) {
      return object;
    }

    if (type === 'raw' || type === 'number') {
        return object[field + '_raw'];
    }

    if (type === 'date') {
      var val = object[field + '_raw'];

      if (!val) {
        return {};
      }

      return val;
    }

    if (type === 'name') {
      var val = object[field + '_raw'];

      if (!val) {
        return { first: '', last: '' };
      }

      return val;
    }

    if (type === 'email') {
      var val = object[field + '_raw'];

      return val && val.email;
    }

    if (type === 'connection') {
      var val = object[field + '_raw'];
      var nullVal = { id: null, identifier: '' };

      if (!val) {
          return nullVal;
      }

      if (angular.isArray(val)) {
          if (val.length < 1) {
              return nullVal;
          }

          return val.length === 1 ? val[0] : val;
      }

      return val;
    }

    return object[field];
  }

  function handleError(err) {

    if (typeof err === 'string') {
      $ionicPopup.alert({
        title: 'Error',
        template: err
      });

      return;
    }

    // TODO: update this
  }

  function sendEmail(action, payload) {
    return $q(function promise(resolve, reject) {

      $http({
        method: 'POST',
        url: 'https://redmethods.email/' + action,
        headers: {
          'Authorization': 'Bearer 9C1XT3KQUAAJQuGAgct8Vej9j8Es5E2v',
          'Content-Type': 'application/json; charset=utf-8'
        },
        data: JSON.stringify(payload)
      }).then(
        function success(response) {

          resolve(response.data);
        },
        function fail(response) {

          reject(response.data);
        }
      );
    });
  }

  return {
    find: find,
    findById: findById,
    getFieldValue: getFieldValue,
    create: create,
    update: update,
    remove: remove,
    handleError: handleError,
    sendEmail: sendEmail
  };
    
}]);