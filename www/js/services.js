angular.module('fireStation.services', [])

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


    return {
        find: find,
        findById: findById,
        getFieldValue: getFieldValue,
        create: create,
        update: update,
        remove: remove,
        handleError: handleError
    };
}])

.service('Utils', ['KNACK', '$ionicPopup', '$ionicHistory', '$q', '$ionicLoading',
function Utils(KNACK, $ionicPopup, $ionicHistory, $q, $ionicLoading) {

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

    function getContentTypeByExt(ext) {

        var extToMimes = {
            'pdf': 'application/pdf',
            'img': 'image/jpeg',
            'png': 'image/png',
            'csv': 'text/csv',
            'apk': 'application/vnd.android.package-archive',
            'jpeg': 'image/jpeg',
            'jpg': 'image/jpeg',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
            'ppt': 'application/vnd.ms-powerpoint',
            'doc': 'application/msword'
        };  // http://www.freeformatter.com/mime-types-list.html

        if (extToMimes.hasOwnProperty(ext)) {
            return extToMimes[ext];
        }

        return false;
    }

    function getExtension(filename) {

        var ext = filename.split('.').pop();
        return ext;
    }

    function upload() {

        return $q(function promise(resolve, reject) {

            var completeUpload = function (filepath) {

                var options = new FileUploadOptions();
                var ft = new FileTransfer();
                var filename = filepath.substr(filepath.lastIndexOf('/') + 1);
                // var ext = getExtension(filename);
                // var fileType = getContentTypeByExt(ext);
                // var type = fileType.indexOf('image') >= 0 ? 'image' : 'file';
                var type = 'file';
                var uri = KNACK.url + 'applications/' + KNACK.headers['X-Knack-Application-Id'] +
                            '/assets/' + type + '/upload';

                options.fileKey = 'files';
                options.fileName = filename;
                options.params = {
                    headers: {
                        'X-Knack-Application-Id': KNACK.headers['X-Knack-Application-Id'],
                        'X-Knack-REST-API-Key': KNACK.headers['X-Knack-REST-API-Key']
                    }
                };

                ft.upload(filepath, uri, function (result) {

                    resolve(JSON.parse(result.response));
                }, function (error) {

                    reject(error);
                }, options);
            };

            var errorCallback = function (err) {

                $ionicLoading.hide();
            };

            if (ionic.Platform.isAndroid()) {
                cordova
                .plugins
                .diagnostic
                .requestExternalStorageAuthorization(function () {

                    fileChooser.open(function (uri) {

                        if (!uri) {
                            return resolve(null);
                        }

                        $ionicLoading.show();
                        window.FilePath.resolveNativePath(uri, function (filepath) {

                            return completeUpload(filepath);
                        });
                    }, function () {

                        resolve(null);
                    }, function () {

                        resolve(null);
                    });
                }, errorCallback);
            }
            else {
                FilePicker.isAvailable(function (avail) {

                    if (!avail) {
                        return;
                    }

                    // Pick file
                    FilePicker.pickFile(function (uri) {

                        $ionicLoading.show();

                        return completeUpload(uri);
                    }, errorCallback, ['public.disk-image', 'public.image', 'public.data']);
                });
            }
        });
    }

    return {
        getStatusCSS: getStatusCSS,
        checkRequiredFields: checkRequiredFields,
        disableBackButton: disableBackButton,
        clearCache: clearCache,
        getContentTypeByExt: getContentTypeByExt,
        getExtension: getExtension,
        upload: upload
    };
}])

.factory('CACHE', ['$rootScope', '$q', 'KnackService',
function CACHE($rootScope, $q, KnackService) {

    var user = null;

    return {
        clear: function () {

            var self = this;

            return $q(function (resolve, reject) {

                $q.all({
                }).finally(
                function always() {
                    resolve();
                });
            });
        },
        setUser: function (record) {

            user = record;
        }
    };
}])

.service('AuthService', ['$q', '$window', '$http', 'KNACK', 'KnackService', 'Utils',
function AuthService($q, $window, $http, KNACK, KnackService, Utils) {

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

        return isAuthenticated ? userId : null;
    }

    function getUserName() {

        return userName;
    }

    function logout() {

        return $q(function promise(resolve, reject) {

            destroyUserCredentials();
            resolve();
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
        updatePassword: updatePassword
    };
}]);
