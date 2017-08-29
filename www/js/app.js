// Ionic myVault App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
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
        views: {
          'mainContent': {
            templateUrl: 'templates/login.html'
          }
        }
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/sidebar.html',
        controller: 'AppCtrl'
      })

      .state('app.home', {
        url: '/home',
        views: {
          'mainContent': {
            templateUrl: 'templates/pinned.html'
          }
        }
      })

      // .state('app.welcome', {
      //   url: '/welcome',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/home.html',
      //       controller: 'IndexController',
      //       //Task 1 Assignment 3
      //       resolve: {
      //         leaders: ['corporateFactory', function (corporateFactory) {
      //           //return corporateFactory.get({ id: 3 });
      //           // return corporateFactory.query({ featured: true });
      //         }],
      //         dishes: ['menuFactory', function (menuFactory) {
      //           //return menuFactory.get({ id: 0 });
      //           // return menuFactory.query({ featured: true });
      //         }],
      //         promotions: ['promotionFactory', function (promotionFactory) {
      //           //return promotionFactory.get({ id: 0 });
      //           // return promotionFactory.query({ featured: true });
      //         }]
      //       }
      //     }
      //   }
      // })

      // .state('app.aboutus', {
      //   url: '/aboutus',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/aboutus.html',
      //       controller: 'AboutController',
      //       //Task 1 Assignment 3
      //       // resolve: {
      //       //   leaders: ['corporateFactory', function (corporateFactory) {
      //       //     return corporateFactory.query();
      //       //   }]
      //       // }
      //     }
      //   }
      // })

      // .state('app.contactus', {
      //   url: '/contactus',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/contactus.html',
      //       controller: 'ContactController'
      //     }
      //   }
      // })

      // .state('app.menu', {
      //   url: '/menu',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/menu.html',
      //       controller: 'MenuController',
      //       //Task 1 Assignment 3
      //       // resolve: {
      //       //   dishes: ['menuFactory', function (menuFactory) {
      //       //     return menuFactory.query();
      //       //   }]
      //       // }
      //     }
      //   }
      // })

      // .state('app.dishdetails', {
      //   url: '/menu/:id',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/dishdetail.html',
      //       controller: 'DishDetailController',
      //       // resolve: {
      //       //   dish: ['$stateParams', 'menuFactory', function ($stateParams, menuFactory) {
      //       //     return menuFactory.get({ id: $stateParams.id });
      //       //   }]
      //       // }
      //     }
      //   }
      // })
      // .state('app.favorites', {
      //   url: '/favorites',
      //   views: {
      //     'mainContent': {
      //       templateUrl: 'templates/favorites.html',
      //       controller: 'FavoritesController',
      //       // resolve: {
      //       //   dishes: ['menuFactory', function (menuFactory) {
      //       //     return menuFactory.query();
      //       //   }],
      //       //   favorites: ['favoriteFactory', function (favoriteFactory) {
      //       //     return favoriteFactory.getFavorites();
      //       //   }]
      //       // }
      //     }
      //   }
      // });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });