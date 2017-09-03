"use strict";

angular.module('myVault.services',[])

    .constant('MODE_EDIT', 0)
    .constant('MODE_NEW', 1)

    .constant('BASE_URL', 'https://vast-citadel-12459.herokuapp.com/')
    // .constant('BASE_URL', 'http://localhost:3000/')

    .factory('action', ['noteModal', 'pwordModal', 'cardModal', 'ops', 'parse', 'resources', 'notesRepo', 'pwordsRepo', 'cardsRepo', '$timeout', function (noteModal, pwordModal, cardModal, ops, parse, resources, notesRepo, pwordsRepo, cardsRepo, $timeout) {
        var fac = {};
        fac.openNote = function (scope, note, mode) {
            var modal = noteModal.newNote(scope, note);
            var resource = resources.getNoteResource();
            modal.result.then(
                function (newNote) {
                    newNote = parse.note(newNote);
                    if (mode) {
                        console.log('Making New Note!');
                        ops.save(newNote, resource, notesRepo);
                    } else {
                        console.log('Saving the note!');
                        ops.update(newNote, resource, notesRepo);
                    }
                },
                function (reason) {
                    console.log('Modal Dismissed');
                }
            );
        };
        fac.openPword = function (scope, pword, mode) {
            var modal = pwordModal.newPword(scope, pword);
            var resource = resources.getPwordResource();
            modal.result.then(
                function (newPword) {
                    newPword = parse.pword(newPword);
                    if (mode) {
                        console.log('Making New Pword!');
                        ops.save(newPword, resource, pwordsRepo);
                    } else {
                        console.log('Saving the pword!');
                        ops.update(newPword, resource, pwordsRepo);
                    }
                },
                function (reason) {
                    console.log('Modal Dismissed');
                }
            );
        };
        fac.openCard = function (scope, card, mode) {
            var modal = cardModal.newCard(scope, card);
            var resource = resources.getCardResource();
            modal.result.then(
                function (newCard) {
                    newCard = parse.card(newCard);
                    if (mode) {
                        console.log('Making New Card!');
                        ops.save(newCard, resource, cardsRepo);
                    } else {
                        console.log('Saving the card!');
                        ops.update(newCard, resource, cardsRepo);
                    }
                },
                function (reason) {
                    console.log('Modal Dismissed');
                }
            );
        };
        fac.pinIt = function (obj, type) {
            var object = { _id: obj._id, pinned: obj.pinned };
            switch (type) {
                case 0://Note
                    ops.update(object, resources.getNoteResource(), notesRepo);
                    break;
                case 1://Pword
                    ops.update(object, resources.getPwordResource(), pwordsRepo);
                    break;
                case 2://Card
                    ops.update(object, resources.getCardResource(), cardsRepo);
                    break;
            }
        };
        fac.delIt = function (scope, index, type) {
            switch (type) {
                default:
                case 0://Note Resource
                    ops.remove(scope.nresults[index]._id, resources.getNoteResource(), notesRepo);
                    scope.notes.splice(index, 1);
                    break;
                case 1://Password Resource
                    ops.remove(scope.presults[index]._id, resources.getPwordResource(), pwordsRepo);
                    scope.pwords.splice(index, 1);
                    break;
                case 2://Cards Resource
                    ops.remove(scope.cresults[index]._id, resources.getCardResource(), cardsRepo);
                    scope.cards.splice(index, 1);
                    break;
            }
        };
        return fac;
    }])
    .factory('modalOpts', [function () {
        return {
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            size: 'md',
            controllerAs: '$ctrl'
        };
    }])
    .factory('msgModal', ['$ionicModal', 'modalOpts', function ($ionicModal, modalOpts) {
        var fac = {};
        var modalOptions = modalOpts;
        fac.open = function (scope, msg) {
            var modal = {};
            modalOptions.templateUrl = '../views/modals/msg.html';
            modalOptions.controller = 'MsgModalController';
            modalOptions.scope = scope;
            modalOptions.resolve = { msg: msg, type: 0 };
            modal = $ionicModal.open(modalOptions);
            return modal;
        };
        return fac;
    }])
    .factory('noteModal', ['$ionicModal', 'parse', 'modalOpts', function ($ionicModal, parse, modalOpts) {
        var fac = {};
        var modalOptions = modalOpts;
        fac.newNote = function (scope, note) {
            var noteModal = {};
            modalOptions.controller = 'ModalController';
            modalOptions.templateUrl = '../views/modals/note.html',
                modalOptions.scope = scope;
            modalOptions.resolve = {};
            modalOptions.resolve.object = parse.note(note);
            noteModal = $ionicModal.open(modalOptions);
            return noteModal;
        };
        return fac;
    }])
    .factory('pwordModal', ['$ionicModal', 'parse', 'modalOpts', function ($ionicModal, parse, modalOpts) {
        var fac = {};
        var modalOptions = modalOpts;
        fac.newPword = function (scope, pword) {
            var pwordModal = {};
            modalOptions.controller = 'ModalController';
            modalOptions.templateUrl = '../views/modals/pword.html';
            modalOptions.scope = scope;
            modalOptions.resolve = {};
            modalOptions.resolve.object = parse.pword(pword);
            pwordModal = $ionicModal.open(modalOptions);
            return pwordModal;
        };
        return fac;
    }])
    .factory('cardModal', ['$ionicModal', 'parse', 'modalOpts', function ($ionicModal, parse, modalOpts) {
        var fac = {};
        var modalOptions = modalOpts;
        fac.newCard = function (scope, card) {
            var cardModal = {};
            modalOptions.controller = 'ModalController';
            modalOptions.templateUrl = '../views/modals/card.html';
            modalOptions.scope = scope;
            modalOptions.resolve = {};
            modalOptions.resolve.object = parse.card(card);
            cardModal = $ionicModal.open(modalOptions);
            return cardModal;
        };
        return fac;
    }])
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
            notes = [];
        };
        fac.startFetching = startFetching;
        return fac;
    }])
    .factory('handle', ['token', '$state', '$rootScope', function (token, $state, $rootScope) {
        return function (op, res) {
            var modal = {};
            var msg = '';
            if (res.status == 401) {
                if (token.get() === null)
                    msg = 'Unauthorized Access! Please Login/Register!';
                else {
                    msg = 'Session timedout! Please login again!';
                    //Try to renew it! TODO
                }
            } else {
                msg = 'Sorry! Couldn\'t ' + op + '! Please try again!';
            }
            console.log('<--- broadcasting new-msg --->');
            $rootScope.$broadcast('new-msg', { msg: msg }, function (modal) {
                modal.result.then(function (res) { },
                    function (result) { if (res.status == 401) $state.transitionTo('login'); });
            });
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
                cardNo: card.cardNo,
                exp: card.exp,
                cvv: card.cvv,
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
    .service('loginService', ['resources', 'token', '$rootScope', '$state', function (resources, token, $rootScope, $state) {
        var resource = resources.getLoginResource();
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
                    token.set(res.token, true);
                    //state transition to welcome
                    $state.transitionTo('app');
                },
                function (res) {
                    console.log('Login Failed!');
                    //Show login failed msg to user
                    $rootScope.$broadcast('login-fail', res);
                }
                );
        };
    }])
    .service('logoutService', ['resources', '$state', '$timeout', 'token', 'notesRepo', 'pwordsRepo', 'cardsRepo', function (resources, $state, $timeout, token, notesRepo, pwordsRepo, cardsRepo) {
        this.signOut = function () {
            resources.getLogoutResource().get();
            token.set(null, false);
            notesRepo.reset();
            pwordsRepo.reset();
            cardsRepo.reset();
            $timeout(function () {
                $state.transitionTo('login');
                $timeout.flush();
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
                    $rootScope.$broadcast('reg-fail', res);
                }
                );
        };
    }])
;