angular.module('fireStation.routes', [])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html'
            }
        }
    })

    .state('app.submitted', {
        url: '/submitted/:id',
        views: {
            'menuContent': {
                templateUrl: 'templates/formSubmitted.html',
                controller: 'FormSubmittedCtrl'
            }
        }
    })

    .state('app.formList', {
        url: '/formList',
        views: {
            'menuContent': {
                templateUrl: 'templates/formList.html',
                controller: 'FormlistsCtrl'
            }
        }
    })

    .state('app.form', {
        url: '/form',
        views: {
            'menuContent': {
                templateUrl: 'templates/form.html',
                controller: 'FormCtrl'
            }
      }
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
}]);
