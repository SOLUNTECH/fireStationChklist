angular.module('fireStation.controllers', [])


.controller('AppCtrl', function($scope, $state, AUTH_EVENTS, $ionicLoading, AuthService, $ionicHistory) {

    $scope.logout = function logout() {

        //Clear authentication data
        AuthService.logout();

        // Redirect to login view
        $state.go('login');
    };
})

.controller('LoginCtrl', function loginCtrl($scope, $state, LoginService, AuthService, $ionicPopup,  $ionicLoading) {

    $scope.data = {};

    $scope.login = function login() {

        if (!$scope.data || !$scope.data.username || !$scope.data.password) {
            return $ionicPopup.alert({
                title: 'Enter your credentials to login',
            });
        }

        $ionicLoading.show();
        AuthService
        .login($scope.data.username, $scope.data.password)
        .then(function success() {

            // Go dashboard
            $state.go('app.formList');
        }, function error(message) {

            $ionicPopup.alert({
                title: 'Login failed',
                template: message
            });
        }
        ).finally(function always() {

            $scope.data.password = '';
            $ionicLoading.hide();
        });
    };
})

.controller('FormCtrl', function formCtrl($scope, $state, $ionicLoading, KnackService, AuthService, KNACK, KNACK_OBJECTS) {

    var fireStation = AuthService.getFirestationId();

    $scope.who = AuthService.getUserName();
    $scope.apparatusList = [];
    $scope.staffList = [];
    $scope.data = {
        firestation: fireStation,
        dateOfRepairRequest: new Date()
    };

    KnackService.findById(KNACK_OBJECTS.Firestations, fireStation)
    .then(function (response) {

        $scope.instructions = response.field_102;
        $scope.repairWorkflow = response.field_103;

        KnackService.find(KNACK_OBJECTS.Assets, [{
            field: 'field_2',
            operator: 'is',
            value: 'Apparatus'
        },
        {
            field: 'field_14',
            operator: 'is',
            value: fireStation
        }])
        .then(function (response) {

            response.records.forEach(function (record){

                $scope.apparatusList.push({
                    id: record.id,
                    name: record.field_1
                });
            });

            KnackService.find(KNACK_OBJECTS.Accounts, [{
                field: 'field_75',
                operator: 'is',
                value: fireStation
            },
            {
                field: 'field_36',
                operator: 'is not',
                value: 'Customer'
            },
            {
                field: 'field_36',
                operator: 'is not',
                value: 'Super Admin'
            }])
            .then(function (response) {

                response.records.forEach(function (record){

                    $scope.staffList.push({
                        id: record.id,
                        name: record.field_32
                    });
                });
            });
        });
    });

    $scope.submit = function () {

        //Parse data object for Knack
        var knackData = {
            field_99: $scope.data.firestation,
            field_23: $scope.data.apparatusInRepair,
            field_20: $scope.data.dateOfRepairRequest,
            field_100: $scope.who,
            field_101: $scope.data.apparatusServiceStatus,
            field_26: $scope.data.short,
            field_27: $scope.data.repairComment,
            field_29: $scope.data.status,
            field_92: $scope.data.whoClosed,
            field_93: $scope.data.whatRepaired,
            field_94: $scope.data.costRepair,
            field_95: $scope.data.timeRepair
        };

        KnackService.create(KNACK_OBJECTS.ApparatusRepair, knackData)
        .then(function success(response) {

            $state.go('app.submitted', { id: response.id });
        },
        function error(err) {
            KnackService.handleError(err);
        })
        .finally(function always() {
           $ionicLoading.hide();
        });
    };
})

.controller('FormlistsCtrl', function($scope, $state) {

    $scope.goToForm = function() {

        $state.go('app.form');
    };

    $scope.upload = function() {

        $state.go('app.submitted', { id: '59cd9febd91ee026589706f6' });
    };
})

.controller('FormSubmittedCtrl', function ($scope, $state, Utils, $stateParams, $ionicLoading, KnackService,
    KNACK_OBJECTS) {

    var apparatusRepairId = $stateParams.id;
    var createAttachment = function (responseFile) {

        return KnackService.create(KNACK_OBJECTS.ApparatusRepairAttachment, {
            field_110: apparatusRepairId,
            field_111: responseFile.id
        });
    };

    $scope.upload = function () {

        Utils
        .upload()
        .then(function (response) {

            if (response && response.filename) {
                createAttachment(response)
                .then(function (attachment) {

                    $scope.files.push({
                        filename: response.filename
                    });
                })
                .finally(function () {

                    $ionicLoading.hide();
                })
            }
            else {
                $ionicLoading.hide();
                return;
            }
        });
    };

    $scope.files = [];
});

