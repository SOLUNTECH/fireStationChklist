angular.module('fireStation.services', [])
    
.service('LoginService', function($q, $http, KNACK) {
    
    return {
        
        loginUser: function(username, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            
            $http({
                method: 'POST',
                headers: 'Content-Type: application/json',
                url: 'https://api.knack.com/v1/applications/' + KNACK.applicationID + '/session',
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
                
            });
            
            return promise;
        }
    };
})

.service('KnackService', ['KNACK', '$http', '$q', '$ionicPopup',
function KnackService(KNACK, $http, $q, $ionicPopup) {

  function find(objectId, filters, sortField, sortOrder, recordPerPage) {
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
        headers: KNACK.headers,
        url: KNACK.url + 'objects/' + objectId + '/records?rows_per_page=' + recordPerPage +
                '&filters=' + filterValEnc + "&sort_field=" + sortFEnc + "&sort_order=" +
                sortOEnc
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

  function findById(objectId, id) {
    
      return $q(function promise(resolve, reject) {
          $http({
            method: 'GET',
            url: KNACK.url + 'objects/' + objectId + '/records/' + id,
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

  function create(objectId, data) {
    return $q(function promise(resolve, reject) {
      $http({
        method: 'POST',
        url: KNACK.url + 'objects/' + objectId + '/records',
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


  function update(objectId, id, data) {
    return $q(function promise(resolve, reject) {
      $http({
        method: 'PUT',
        url: KNACK.url + objectId + '/records/' + id,
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

//  function sendEmail(action, payload) {
//    return $q(function promise(resolve, reject) {
//
//      $http({
//        method: 'POST',
//        url: 'https://redmethods.email/' + action,
//        headers: {
//          'Authorization': 'Bearer 9C1XT3KQUAAJQuGAgct8Vej9j8Es5E2v',
//          'Content-Type': 'application/json; charset=utf-8'
//        },
//        data: JSON.stringify(payload)
//      }).then(
//        function success(response) {
//
//          resolve(response.data);
//        },
//        function fail(response) {
//
//          reject(response.data);
//        }
//      );
//    });
//  }

  return {
    find: find,
    findById: findById,
    getFieldValue: getFieldValue,
    create: create,
    update: update,
    remove: remove,
    handleError: handleError,
//    sendEmail: sendEmail
  };
}])

.service('Utils', ['KNACK', '$ionicPopup', '$ionicHistory',
function Utils(KNACK, $ionicPopup, $ionicHistory) {

  function getStatusCSS(status) {

    var css;

    if (status === 'Green') {
      css = 'balanced';
    }
    else if (status === 'Yellow') {
      css = 'energized';
    }
    else if (status === 'Red') {
      css = 'assertive';
    }

    return css;
  }

  function checkRequiredFields(data, requiredFields, title) {

    var hasError = false;
    var errorItem;

    title = title || 'Error';

    requiredFields.forEach(function (requiredField) {

      if (hasError) {
        return;
      }

      var val = data[requiredField.field];

      if (!val) {
        hasError = true;
        errorItem = requiredField;
      }
    });

    if (hasError) {
      $ionicPopup.alert({
        title: errorItem.title || title,
        template: errorItem.template
      });
    }

    return hasError;
  }

  function disableBackButton() {

    $ionicHistory.nextViewOptions({ historyRoot: true });
  }

  function clearCache(callback) {

    $ionicHistory.clearCache().then(function () {
        callback();
    });
  }

  return {
    getStatusCSS: getStatusCSS,
    checkRequiredFields: checkRequiredFields,
    disableBackButton: disableBackButton,
    clearCache: clearCache
  };
}])

.factory('CACHE', ['$rootScope', '$q', 'KnackService',
function CACHE($rootScope, $q, KnackService) {

//  var initiative = null;
//  var initiatives = null;
//  var departments = null;
//  var owners = null;
//  var documents = null;
//  var tasks = null;
  var user = null;
//  var task = null;
//  var domain = null;
//  var bookingTargets = null;

  return {
//    getInitiative: function (id) {
//
//      return $q(function promise(resolve, reject) {
//
//        if (initiative) {
//          return resolve(initiative);
//        }
//
//        KnackService.findById('scene_278', 'view_591', id).then(
//          function (record) {
//
//            initiative = record;
//            resolve(record);
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getDomain: function (id) {
//
//      return $q(function promise(resolve, reject) {
//
//        if (domain) {
//          return resolve(domain);
//        }
//
//        KnackService.findById('scene_278', 'view_657', id).then(
//          function (record) {
//
//            domain = record;
//            resolve(record);
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getTask: function (id) {
//
//      return $q(function promise(resolve, reject) {
//
//        if (task) {
//          return resolve(task);
//        }
//
//        KnackService.findById('scene_278', 'view_590', id).then(
//          function (record) {
//
//            task = record;
//            resolve(record);
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getUser: function (id) {
//
//      return $q(function promise(resolve, reject) {
//
//        if (user) {
//          return resolve(user);
//        }
//
//        KnackService.findById('scene_278', 'view_597', id).then(
//          function success(record) {
//
//            user = record;
//            resolve(record);
//          },
//          function fail(error) {
//
//            reject(error);
//          }
//        );
//      });
//    },
//    getDepartments: function (companyId) {
//
//      return $q(function (resolve, reject) {
//
//        function done(result) {
//
//          resolve(result.records.filter(function (record) {
//
//            if (companyId) {
//              return KnackService.getFieldValue(record, 'field_143', 'connection').id === companyId;
//            }
//
//            return true;
//          }));
//        }
//
//        if (departments && departments.records) {
//          return done(departments);
//        }
//
//        KnackService.find('scene_278', 'view_598').then(
//          function (response) {
//
//            departments = response;
//            done(response)
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getBookingTargets: function (companyId) {
//
//      return $q(function (resolve, reject) {
//
//        function done(result) {
//
//          resolve(result.records.filter(function (record) {
//
//            if (companyId) {
//              return KnackService.getFieldValue(record, 'field_248', 'connection').id === companyId;
//            }
//
//            return true;
//          }));
//        }
//
//        if (bookingTargets && bookingTargets.records) {
//          return done(bookingTargets);
//        }
//
//        KnackService.find('scene_278', 'view_592', [], 'field_245', 'asc').then(
//          function (response) {
//
//            bookingTargets = response;
//            done(response)
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getOwners: function (companyId) {
//
//      return $q(function (resolve, reject) {
//
//        function done(response) {
//
//          resolve(response.records.filter(function (record) {
//
//            if (companyId) {
//              return KnackService.getFieldValue(record, 'field_202', 'connection').id === companyId;
//            }
//
//            return true;
//          }));
//        }
//
//        if (owners && owners.records) {
//          return done(owners);
//        }
//
//        KnackService.find('scene_278', 'view_597').then(
//          function (response) {
//
//            owners = response;
//            done(response)
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getDocuments: function (initiativeId, taskId) {
//
//      return $q(function (resolve, reject) {
//
//        function done(response) {
//
//          resolve(response.records.filter(function (record) {
//
//            if (initiativeId) {
//              return KnackService.getFieldValue(record, 'field_262', 'connection').id === initiativeId;
//            }
//
//            if (taskId) {
//              return KnackService.getFieldValue(record, 'field_249', 'connection').id === taskId;
//            }
//
//            return true;
//          }));
//        }
//
//        if (documents && documents.records) {
//          return done(documents);
//        }
//
//        KnackService.find('scene_278', 'view_596').then(
//          function (response) {
//
//            documents = response;
//            done(response)
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getTasks: function (initiativeId, companyId) {
//
//      return $q(function (resolve, reject) {
//
//        if (!initiativeId && !companyId) {
//          return resolve([]);
//        }
//
//        function done(response) {
//
//          resolve(response.records.filter(function (record) {
//
//            if (initiativeId) {
//              return KnackService.getFieldValue(record, 'field_83', 'connection').id === initiativeId;
//            }
//
//            if (companyId) {
//              return KnackService.getFieldValue(record, 'field_149', 'connection').id === companyId;
//            }
//
//            return true;
//          }));
//        }
//
//        if (tasks && tasks.records) {
//          return done(tasks);
//        }
//
//        KnackService.find('scene_278', 'view_590', [{
//          field: 'field_149',
//          operator: 'is',
//          value: companyId
//        }])
//        .then(
//          function (response) {
//
//            tasks = response;
//            done(response)
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
//    getInitiatives: function (companyId) {
//
//      return $q(function (resolve, reject) {
//
//        if (!companyId) {
//          return resolve([]);
//        }
//
//        function done(response) {
//
//          resolve(response.records.filter(function (record) {
//
//            if (companyId) {
//              return KnackService.getFieldValue(record, 'field_158', 'connection').id === companyId;
//            }
//
//            return true;
//          }));
//        }
//
//        if (initiatives && initiatives.records) {
//          return done(initiatives);
//        }
//
//        KnackService.find('scene_278', 'view_591', [{
//          field: 'field_158',
//          operator: 'is',
//          value: companyId
//        }])
//        .then(
//          function (response) {
//
//            initiatives = response;
//            done(response)
//          },
//          function (err) {
//
//            reject(err);
//          }
//        );
//      });
//    },
    clear: function () {

      var self = this;

//      initiative = null;
//      departments = null;
//      documents = null;
//      owners = null;
//      tasks = null;
//      initiatives = null;
//      task = null;
//      bookingTargets = null;
//      domain = null;

      return $q(function (resolve, reject) {

        $q.all({
//          owners: self.getOwners(),
//          tasks: self.getTasks(),
//          departments: self.getDepartments(),
//          documents: self.getDocuments(),
//          initiatives: self.getInitiatives(),
//          bookingTargets: self.getBookingTargets(),
        }).finally(
          function always() {

            resolve();
          }
        );
      });
    },
//    setInitiative: function (record) {
//
//      initiative = record;
//    },
//    setInitiatives: function (value) {
//
//      initiatives = value;
//    },
//    setTasks: function (value) {
//
//      tasks = value;
//    },
    setUser: function (record) {

      user = record;
    }
//    setTask: function (record) {
//
//      task = record;
//    },
//    setDomain: function (record) {
//
//      domain = record;
//    }
  };
}])

.service('AuthService', ['$q', '$window', '$http', 'KNACK', 'KnackService', 'CACHE', 'Utils',
function AuthService($q, $window, $http, KNACK, KnackService, CACHE, Utils) {

  var LOCAL_TOKEN_KEY = 'firestation';
  var isAuthenticated = false;
  var userId;
  var userName = "";
  var userValues = {};
  var authToken;
  var loginUrl = 'https://api.knackhq.com/v1/applications/' + KNACK.applicationId + '/session';

  function loadUserCredentials() {

    var data = $window.localStorage.getItem(LOCAL_TOKEN_KEY);

    if (data) {
      userCredentials(JSON.parse(data));
    }
  }

  function storeUserCredentials(data) {

    window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(data));
    userCredentials(data);
  }

  function getUser() {

    return CACHE.getUser(userId);
  }

  function updatePassword(currentPwd, newPwd) {

    return $q(function promise(resolve, reject) {

      getUser().then(
        function success(user) {

          var email = KnackService.getFieldValue(user, 'field_51', 'email');
          var headers = KNACK.headers;

          // Avoid interceptors
          headers['X-Requested-With'] = 'updatePassword';

          // Check current password
          $http({
            method: 'POST',
            url: loginUrl,
            headers: headers,
            data: { email: email, password: currentPwd }
          })
          .then(
            function loginSuccess(response) {

              // Update new password
              KnackService.update('scene_278', 'view_597', userId, {
                field_52: {
                  password: newPwd,
                  password_confirmation: newPwd
                }
              }).then(
                function success() {

                  resolve();
                },
                function error(err) {

                  reject(err);
                }
              )
            },
            function loginError() {

              reject('Current password is incorrect.');
            }
          );
        },
        function error(err) {

          reject(err);
        }
      );
    });
  }

  function userCredentials(data) {

    isAuthenticated = true;
    authToken = data.token;
    userId = data.id;
    userName = data.values.name.first + ' ' + data.values.name.last;
    userValues = data.values;

    $http.defaults.headers.common['Authorization'] = authToken;
  }

  function destroyUserCredentials() {

    CACHE.setUser(null);
    authToken = undefined;
    userId = null;
    userName = "";
    userValues = {};
    isAuthenticated = false;
    $http.defaults.headers.common['Authorization'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  function login(email, password) {

    return $q(function promise(resolve, reject) {

      var headers = KNACK.headers;

      // Avoid interceptors
      headers['X-Requested-With'] = 'try-login';

      $http({
        method: 'POST',
        url: loginUrl,
        headers: headers,
        data: { email: email, password: password }
      })
      //$http.post(loginUrl, { email: email, password: password })
      .then(
        function loginSuccess(response) {

          storeUserCredentials(response.data.session.user);
          resolve('Login success.');
        },
        function loginFailed(response) {

          var data = response.data;
          var errors = data && data.errors;
          var message = 'Invalid credentials';

          if (angular.isArray(errors)) {
            message = errors[0] && errors[0].message;
          }

          reject(message);
        }
      );
    });
  }

  function getFirestationId() {

    return userValues.field_75[0];
  }

  function getUserId() {

    return userId;
  }
    
  function getUserName() {
      
      return userName;
  }

//  function isReadOnlyUser() {
//
//    return userValues.field_213 === 'Read-Only';
//  }

  function logout() {
    return $q(function promise(resolve, reject) {
      CACHE.clear();
      Utils.clearCache(function () {
        destroyUserCredentials();
        resolve();
      });
    });
  }

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthenticated: function() {

      return isAuthenticated;
    },
    getUser: getUser,
    getUserValues: function getUserValues() {

      return userValues;
    },
    getFirestationId: getFirestationId,
    getUserId: getUserId,
    getUserName: getUserName,
    updatePassword: updatePassword,
//    isReadOnlyUser: isReadOnlyUser
  };
}]);