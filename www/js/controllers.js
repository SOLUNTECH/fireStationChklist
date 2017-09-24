angular.module('fireStation.controllers', [])


.controller('AppCtrl', function($scope, $state) {
 
            
})

.controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state) {
    $scope.data = {};
 
    $scope.login = function() {
        LoginService.loginUser($scope.data.name, $scope.data.password)
            .then(function() {
                    $state.go('app.formList');
                }, function() {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Login failed!',
                        template: 'Please check your credentials!'
                    });
    
                });
    };
})

.controller('FormCtrl', function($scope, $state) {
  
    $scope.data = { apparatus: 1};
    $scope.apparatusList = [{id: 1, name: 'prueba'}];
    
    $scope.submit = function() {
        
        $state.go('app.submitted');
    };
            
})

.controller('FormlistsCtrl', function($scope, $state) {
  
    $scope.goToForm = function() {
        
        $state.go('app.form');
    };
    
    
            
});

//.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
//  $scope.loginData = {};
//
//  // Create the login modal that we will use later
//  $ionicModal.fromTemplateUrl('templates/login_legacy.html', {
//    scope: $scope
//  }).then(function(modal) {
//    $scope.modal = modal;
//  });
//
//  // Triggered in the login modal to close it
//  $scope.closeLogin = function() {
//    $scope.modal.hide();
//  };
//
//  // Open the login modal
//  $scope.login = function() {
//    $scope.modal.show();
//  };
//
//  // Perform the login action when the user submits the login form
//  $scope.doLogin = function() {
//    console.log('Doing login', $scope.loginData);
//
//    // Simulate a login delay. Remove this and replace with your login
//    // code if using a login system
//    $timeout(function() {
//      $scope.closeLogin();
//    }, 1000);
//  };
//})



//.controller('FormlistCtrl', function($scope, $stateParams) {
//});
