// Ionic FireStation App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('fireStation', ['ionic', 'fireStation.controllers', 'fireStation.services', 'fireStation.routes'])

.constant('KNACK', {
    applicationId: '59821baba236484fa1983bdf',
    url: 'https://api.knack.com/v1/',
    headers: {
        'X-Knack-Application-Id': '59821baba236484fa1983bdf',
        'X-Knack-REST-API-Key': '4fd32d80-77e7-11e7-9bae-8394b17d8066',
        'Content-Type': 'application/json'
    }
})

.constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

.constant('KNACK_OBJECTS', {
    Assets: 'object_1',
    Accounts: 'object_4',
    Firestations: 'object_3',
    ApparatusRepair: 'object_2',
    FormInstructions: 'object_15',
    ApparatusRepairAttachment: 'object_17'
})

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
        }
    });
});
