"use strict";

angular.module('myVault.services', ['ngResource'])

    .constant('BASE_URL', 'https://vast-citadel-12459.herokuapp.com/')
    // .constant('BASE_URL', 'http://192.168.1.4:3000/')

    .factory('$localStorage', ['$window', function ($window) {
        return {
            store: function (key, value) {
                $window.localStorage[key] = value;
            },
            fetch: function (key, value) {
                return $window.localStorage[key] || value;
            },
            storeObj: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            fetchObj: function (key, value) {
                return JSON.parse($window.localStorage[key] || value);
            }
        };
    }])
    .factory('token', ['$localStorage', function ($localStorage) {
        var token = null;
        var fetched = false;
        return {
            set: function (toke, isFetched) {
                token = toke;
                $localStorage.store('token', token);
                fetched = isFetched;
            },
            get: function () {
                return fetched ? token : token = $localStorage.fetch('token', null);
            }
        };
    }])
    .factory('resources', ['BASE_URL', '$resource', 'token', function (BASE_URL, $resource, token) {
        var fac = {};
        fac.getLoginResource = function () {
            return $resource(BASE_URL + 'users/signin', null, {
                save: { method: 'POST' }
            });
        };
        fac.getLogoutResource = function () {
            return $resource(BASE_URL + 'users/signout', null, {
                get: { method: 'GET', headers: { 'x-access-token': token.get() } }
            });
        };
        fac.getRegisterResource = function () {
            return $resource(BASE_URL + 'users/register', null, {
                save: { method: 'POST' }
            });
        };
        fac.getNoteResource = function () {
            return $resource(BASE_URL + 'notes/:id', null, {
                update: { method: 'PUT', headers: { 'x-access-token': token.get() } },
                get: { method: 'GET', headers: { 'x-access-token': token.get() } },
                save: { method: 'POST', headers: { 'x-access-token': token.get() } },
                query: { method: 'GET', headers: { 'x-access-token': token.get() }, isArray: true },
                remove: { method: 'DELETE', headers: { 'x-access-token': token.get() } }
            });
        };
        fac.getPwordResource = function () {
            return $resource(BASE_URL + 'pwords/:id', null, {
                update: { method: 'PUT', headers: { 'x-access-token': token.get() } },
                get: { method: 'GET', headers: { 'x-access-token': token.get() } },
                save: { method: 'POST', headers: { 'x-access-token': token.get() } },
                query: { method: 'GET', headers: { 'x-access-token': token.get() }, isArray: true },
                remove: { method: 'DELETE', headers: { 'x-access-token': token.get() } }
            });
        };
        fac.getCardResource = function () {
            return $resource(BASE_URL + 'cards/:id', null, {
                update: { method: 'PUT', headers: { 'x-access-token': token.get() } },
                get: { method: 'GET', headers: { 'x-access-token': token.get() } },
                save: { method: 'POST', headers: { 'x-access-token': token.get() } },
                query: { method: 'GET', headers: { 'x-access-token': token.get() }, isArray: true },
                remove: { method: 'DELETE', headers: { 'x-access-token': token.get() } }
            });
        };
        return fac;
    }])
    .factory('notesRepo', ['$rootScope', 'resources', 'handle', '$state', function ($rootScope, resources, handle, $state) {
        var notes = [], fetched = false;
        var fac = {};
        var startFetching = function () {
            $rootScope.$broadcast('show-loading');
            var resource = resources.getNoteResource();
            resource.query().$promise.then(
                function (res) {
                    notes = res;
                    fetched = true;
                    console.log('<-----notes ready broadcasting now----->');
                    $rootScope.$broadcast('notes-ready', notes);
                    $rootScope.$broadcast('hide-loading');
                },
                function (res) {
                    $rootScope.$broadcast('hide-loading');
                    handle('fetch notes', res);
                }
            );
        };
        fac.get = function () {
            if (!fetched)
                startFetching();
            return notes;
        };
        fac.reset = function () {
            fetched = false;
            notes = [];
        };
        fac.startFetching = startFetching;
        return fac;
    }])
    .factory('pwordsRepo', ['$rootScope', 'resources', 'handle', function ($rootScope, resources, handle) {
        var pwords = [], fetched = false;
        var fac = {};
        var startFetching = function () {
            $rootScope.$broadcast('show-loading');
            var resource = resources.getPwordResource();
            resource.query().$promise.then(
                function (res) {
                    pwords = res;
                    fetched = true;
                    console.log('<-----pwords ready broadcasting now----->');
                    $rootScope.$broadcast('pwords-ready', pwords);
                    $rootScope.$broadcast('hide-loading');
                },
                function (res) {
                    $rootScope.$broadcast('hide-loading');
                    handle('fetch passwords', res);
                }
            );
        };
        fac.get = function () {
            if (!fetched)
                startFetching();
            return pwords;
        };
        fac.reset = function () {
            fetched = false;
            pwords = [];
        };
        fac.startFetching = startFetching;
        return fac;
    }])
    .factory('cardsRepo', ['$rootScope', 'resources', 'handle', function ($rootScope, resources, handle) {
        var cards = [], fetched = false;
        var fac = {};
        var startFetching = function () {
            $rootScope.$broadcast('show-loading');
            var resource = resources.getCardResource();
            resource.query().$promise.then(
                function (res) {
                    cards = res;
                    fetched = true;
                    $rootScope.$broadcast('hide-loading');
                    console.log('<-----cards ready broadcasting now----->');
                    $rootScope.$broadcast('cards-ready', cards);
                },
                function (res) {
                    $rootScope.$broadcast('hide-loading');
                    handle('fetch cards', res);
                }
            );
        };
        fac.get = function () {
            if (!fetched)
                startFetching();
            return cards;
        };
        fac.reset = function () {
            fetched = false;
            cards = [];
        };
        fac.startFetching = startFetching;
        return fac;
    }])
    .factory('handle', ['token', '$state', '$rootScope', '$timeout', 'loginService', function (token, $state, $rootScope, $timeout, loginService) {
        return function (op, res) {
            var modal = {};
            var msg = '';
            if (res.status == 401) {
                if (token.get() === null) {
                    msg = 'Unauthorized Access! Please Login/Register!';
                    $rootScope.$broadcast('show-msg', { msg: msg });
                    $timeout(function () {
                        token.set(null, false);
                        $state.transitionTo('login');
                    }, 3000);
                } else {
                    msg = 'Session timedout! Please login again!';
                    loginService.renew(function () {
                        $rootScope.$broadcast('show-msg', { msg: msg });
                        $timeout(function () {
                            token.set(null, false);
                            $state.transitionTo('login');
                        }, 3000);
                    });
                }
            } else {
                msg = 'Sorry! Couldn\'t ' + op + '! Please try again!';
                $rootScope.$broadcast('show-msg', { msg: msg });
            }
            console.log('handle ----->', msg);
        };
    }])
    .factory('ops', ['$state', 'handle', function ($state, handle) {
        var fac = {};
        fac.save = function (object, resource, repo) {
            resource.save(JSON.stringify(object))
                .$promise
                .then(
                function (res) {
                    console.log('Saved!');
                    repo.startFetching();
                },
                function (res) {
                    console.log(res);
                    console.log('Error Saving!');
                    handle('save', res);
                }
                );
        };
        fac.remove = function (_id, resource, repo) {
            resource.remove({ id: _id })
                .$promise
                .then(
                function (res) {
                    console.log('Deleted id :', _id);
                    repo.startFetching();
                },
                function (res) {
                    console.log('Could not Delete id :', _id);
                    handle('delete', res);
                }
                );
        };
        fac.deleteAll = function (resource, repo) {
            resource.remove()
                .$promise
                .then(
                function (res) {
                    console.log('Deleted all!');
                    repo.reset();
                },
                function (res) {
                    console.log('Deletion of all failed!');
                    handle('delete', res);
                }
                );
        };
        fac.update = function (object, resource, repo) {
            resource.update({ id: object._id }, JSON.stringify(object))
                .$promise
                .then(
                function (res) {
                    console.log('Updated! id: ', object._id);
                    repo.startFetching();
                },
                function (res) {
                    console.log('Update failed! id: ', object._id);
                    handle('update', res);
                }
                );
        };
        return fac;
    }])
    .service('parse', [function () {
        this.note = function (note) {
            var n = {
                title: note.title,
                note: note.note,
                pinned: note.pinned,
                account: note.account
            };
            if (!angular.isUndefined(note._id))
                n._id = note._id;
            return n;
        };
        this.pword = function (pword) {
            var p = {
                title: pword.title,
                username: pword.username,
                password: pword.password,
                pinned: pword.pinned,
                account: pword.account,
                hasCustom: pword.hasCustom,
                customFields: pword.customFields
            };
            if (!angular.isUndefined(pword._id))
                p._id = pword._id;
            return p;
        };
        this.card = function (card) {
            
            var c = {
                title: card.title,
                cardNo: [parseInt(card.cardNo[0]),parseInt(card.cardNo[1]),parseInt(card.cardNo[2]),parseInt(card.cardNo[3])],
                exp: new Date(card.exp),
                cvv: parseInt(card.cvv),
                pinned: card.pinned,
                account: card.account,
                hasCustom: card.hasCustom,
                customFields: card.customFields
            };
            if (!angular.isUndefined(card._id))
                c._id = card._id;
            return c;
        };
    }])
    .service('accService', ['$localStorage', function ($localStorage) {
        var acc = true;
        this.getCurrent = function () {
            console.log('getCurrent---', acc);
            return acc;
        };
        this.setCurrent = function (value) {
            console.log('setCurrent---', value);
            acc = value;
        };
    }])
    .service('loginService', ['resources', 'token', '$rootScope', '$state', '$localStorage', function (resources, token, $rootScope, $state, $localStorage) {
        var resource = resources.getLoginResource();
        var BODY = {};
        this.signIn = function (username, password) {
            var body = {
                username: username,
                password: password
            };
            resource.save(JSON.stringify(body))
                .$promise
                .then(
                function (res) {
                    console.log('Login Successful!');
                    console.log(res.token);

                    $localStorage.store('username', username);

                    //Set login token
                    token.set(res.token, true);
                    BODY = body;
                    //Transition to app Pinned page
                    $state.transitionTo('app.pinned');
                },
                function (res) {
                    console.log('Login Failed!');
                    $rootScope.$broadcast('login-fail', res);
                }
                );
        };
        this.renew = function (fallback) {
            resource.save(JSON.stringify(body))
                .$promise
                .then(
                function (res) {
                    console.log('Renew Successful!');
                    console.log(res.token);
                    $localStorage.store('username', username);
                    //Set login token
                    token.set(res.token, true);
                },
                function (res) {
                    //Renewal failed!
                    fallback();
                });
        };
    }])
    .service('logoutService', ['resources', '$state', '$timeout', '$localStorage', 'token', 'notesRepo', 'pwordsRepo', 'cardsRepo', function (resources, $state, $timeout, $localStorage, token, notesRepo, pwordsRepo, cardsRepo) {
        this.signOut = function () {
            resources.getLogoutResource().get();
            token.set(null, false);
            notesRepo.reset();
            pwordsRepo.reset();
            cardsRepo.reset();
            $localStorage.store('username', null);
            $timeout(function () {
                $state.transitionTo('login');
            }, 10);
        };
    }])
    .service('regService', ['resources', '$rootScope', function (resources, $rootScope) {
        var resource = resources.getRegisterResource();
        this.signUp = function (username, password) {
            var body = {
                username: username,
                password: password
            };
            resource.save(JSON.stringify(body))
                .$promise
                .then(
                function (res) {
                    console.log('Registered Successfully!');
                    $rootScope.$broadcast('reg-success', body);
                },
                function (res) {
                    console.log('Registration Failed!');
                    $rootScope.$broadcast('reg-fail', res)
                }
                );
        };
    }])
    .service('validate', ['$rootScope', function ($rootScope) {
        var msg ='';
        this.note = function (note) {
            var valid = true;
            if (!note.title){
                msg = 'No Title! Please add a title!';
                valid = false;
            } 
            else if (!note.note){
                msg = 'No note! Please type a note to proceed';
                valid = false;
            } 
            if(!valid) $rootScope.$broadcast('show-msg', {msg: msg});
            return valid;
        };
        this.pword = function (obj) {
            var valid = true;
            if (!obj.title) {
                msg = 'No Title! Please add a title!';
                valid = false;
            }
            else if (!obj.password) {
                msg = 'Password field is empty! Its required to proceed.';
                valid = false;
            }
            else if(obj.hasCustom) {
                var i = 0;
                while(i<obj.customFields.length) {
                    if (!obj.customFields[i].key) {
                        msg = 'Field '+(i+1)+' missing! Please enter, its required, or swipe left to remove the field completely';
                        valid = false;
                        break;
                    }
                    else if (!obj.customFields[i].value) {
                        msg = 'Value '+(i+1)+' missing! Please enter, its required, or swipe left to remove the field completely';
                        valid = false;
                        break;
                    }
                    i++;
                }
            }
            if(!valid) $rootScope.$broadcast('show-msg', {msg: msg});
            return valid;
        };
        this.card = function (obj) {
            var valid = true;
            if (!obj.title) {
                msg = 'No Title! Please add a title!';
                valid = false;
            }
            else if (!obj.cardNo[0]||!obj.cardNo[1]||!obj.cardNo[2]||!obj.cardNo[3]) {
                msg = 'Card number is invalid! Please check.';
                valid = false;
            }
            // else if(obj.cardNo[0]>9999||obj.cardNo[1]>9999||obj.cardNo[2]>9999||obj.cardNo[3]>9999
            //     ||  obj.cardNo[0]<1000||obj.cardNo[1]>1000||obj.cardNo[2]>1000||obj.cardNo[3]>1000){
            //     msg = 'Invalid Card Number! Please check again.'
            //     valid = false;
            // }
            else if(obj.cvv && (obj.cvv<100||obj.cvv>999)) {
                msg= 'Invalid CVV! It must contain three digits only.';
                valid = false;
            }
            else if(obj.hasCustom) {
                var i = 0;
                while(i<obj.customFields.length) {
                    if (!obj.customFields[i].key) {
                        msg = 'Field '+(i+1)+' missing! Its required, or swipe left to remove the field completely';
                        valid = false;
                        break;
                    }
                    else if (!obj.customFields[i].value) {
                        msg = 'Value '+(i+1)+' missing! Its required, or swipe left to remove the field completely';
                        valid = false;
                        break;
                    }
                    i++;
                }
            }
            if(!valid) $rootScope.$broadcast('show-msg', {msg: msg});
            return valid;
        };
    }])
    ;