// Ionic myVault App

angular.module('myVault', ['ionic', 'myVault.services','myVault.controllers'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'views/sidebar.html',
        controller: 'SidebarController'
      })

      .state('app.pinned', {
        url: '/pinned',
        views: {
          'mainContent': {
            templateUrl: 'views/pinned.html',
            controller: 'PinnedController'
          }
        }
      })
      .state('app.notes', {
        url: '/notes',
        views: {
          'mainContent': {
            templateUrl: 'views/notes.html',
            controller: 'NotesController'
          }
        }
      })
      .state('app.pwords', {
        url: '/pwords',
        views: {
          'mainContent': {
            templateUrl: 'views/pwords.html',
            controller: 'PwordsController'
          }
        }
      })
      .state('app.cards', {
        url: '/cards',
        views: {
          'mainContent': {
            templateUrl: 'views/cards.html',
            controller: 'CardsController'
          }
        }
      })
    $urlRouterProvider.otherwise('/login');
  });