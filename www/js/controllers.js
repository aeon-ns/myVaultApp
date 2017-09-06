angular.module('myVault.controllers', ['ionic', 'ngCordova'])

    .controller('LoginController', ['$scope', '$state', '$cordovaToast', 'loginService', 'regService', function ($scope, $state, $cordovaToast, loginService, regService) {
        $scope.user = {};
        $scope.signin = true;
        $scope.submit = function () {
            $scope.signin ? loginService.signIn($scope.user.username, $scope.user.password) : regService.signUp($scope.user.username, $scope.user.password);
        };
        $scope.switchMode = function () {
            $scope.signin = !$scope.signin;
        };
        $scope.$on('reg-success', function (event, res) {
            console.log('reg-success---->');
            $cordovaToast
                .show('Registration Done! Please Sign In with your new credentials', 'long', 'bottom')
                .then(function (success) { console.log('Toast ----> success'); }, function (error) { console.log('Toast ----> error'); });
            $scope.signin = true;
            event.preventDefault();
        });
        $scope.$on('reg-fail', function (event, res) {
            console.log('reg-fail---->');
            $cordovaToast
                .show('Registration Failed!', 'long', 'bottom')
                .then(function (success) { console.log('Toast ----> success'); }, function (error) { console.log('Toast ----> error'); });
            event.preventDefault();
        });
        $scope.$on('login-fail', function (event, res) {
            console.log('login-fail---->');
            $cordovaToast
                .show('Couldn\'t Login! Please check your username/password.', 'long', 'bottom')
                .then(function (success) { console.log('Toast ----> success'); }, function (error) { console.log('Toast ----> error'); });
            event.preventDefault();
        });
    }])

    .controller('SidebarController', ['$scope', 'accService', 'logoutService', '$cordovaToast', '$localStorage', 'notesRepo', 'pwordsRepo', 'cardsRepo', function ($scope, accService, logoutService, $cordovaToast, $localStorage, notesRepo, pwordsRepo, cardsRepo) {

        $scope.account = accService.getCurrent();
        notesRepo.startFetching();
        pwordsRepo.startFetching();
        cardsRepo.startFetching();

        $scope.username = $localStorage.fetch('username');

        $scope.setAccount = function (value) {
            $scope.account = value;
            accService.setCurrent(value);
            $scope.$broadcast('acc-change', value);
        };

        $scope.logout = function () {
            logoutService.signOut();
        };

        $scope.$on('show-msg', function (event, msg) {
            $cordovaToast
                .show(msg.msg, 'long', 'center')
                .then(function (success) { console.log('Toast ----> success'); }, function (error) { console.log('Toast ----> error'); });
            event.preventDefault();
        });

    }])

    .controller('PinnedController', ['$scope', '$timeout', '$ionicModal', '$ionicPopover', 'accService', 'ops', 'parse', 'resources', 'notesRepo', 'pwordsRepo', 'cardsRepo', 'validate', function ($scope, $timeout, $ionicModal, $ionicPopover, accService, ops, parse, resources, notesRepo, pwordsRepo, cardsRepo, validate) {

        $scope.account = accService.getCurrent();
        $scope.$on('acc-change', function (event, value) {
            $scope.account = value;
        });

        $scope.notes = notesRepo.get();
        $scope.pwords = pwordsRepo.get();
        $scope.cards = cardsRepo.get();

        $scope.$on('notes-ready', function (event, data) {
            $scope.notes = data;
            event.preventDefault();
            console.log('PinnedControl:: Received Notes ----->');
            $scope.$broadcast('scroll.refreshComplete');
        });
        $scope.$on('pwords-ready', function (event, data) {
            $scope.pwords = data;
            event.preventDefault();
            console.log('PinnedControl:: Received Pwords ----->');
            $scope.$broadcast('scroll.refreshComplete');
        });
        $scope.$on('cards-ready', function (event, data) {
            $scope.cards = data;
            event.preventDefault();
            console.log('PinnedControl:: Received Cards ----->');
            $scope.$broadcast('scroll.refreshComplete');
        });

        $scope.unpin = function (obj, type) {
            obj.pinned = !obj.pinned;
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
        $scope.remove = function (obj, type) {
            switch (type) {
                default:
                case 0://Note Resource
                    var index = $scope.notes.indexOf(obj);
                    ops.remove(obj._id, resources.getNoteResource(), notesRepo);
                    $scope.notes.splice(index, 1);
                    break;
                case 1://Password Resource
                    var index = $scope.pwords.indexOf(obj);
                    ops.remove(obj._id, resources.getPwordResource(), pwordsRepo);
                    $scope.pwords.splice(index, 1);
                    break;
                case 2://Cards Resource
                    var index = $scope.cards.indexOf(obj);
                    ops.remove(obj._id, resources.getCardResource(), cardsRepo);
                    $scope.cards.splice(index, 1);
                    break;
            }
        };
        $scope.refresh = function () {
            notesRepo.startFetching();
            pwordsRepo.startFetching();
            cardsRepo.startFetching();
        };
        $scope.showPopover = function ($event) {
            $ionicPopover.fromTemplateUrl('views/add-popover.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.addPopover = popover;
                $scope.addPopover.show($event);
            });
        };
        //-------------------Modals--Common--------------------------
        $scope.editing = false;
        $scope.edit = function () {
            $scope.editing = true;
        };
        //---------------------Pword & Card Common-------------------------------------
        $scope.show = false;
        $scope.toggleShow = function () {
            $scope.show = !$scope.show;
        };
        $scope.addField = function () {
            var field = { key: '', value: '' };
            if (!$scope.obj.hasCustom) $scope.obj.hasCustom = true;
            $scope.obj.customFields.push(field);
        };
        $scope.delField = function (index) {
            $scope.obj.customFields.splice(index, 1);
            $scope.obj.hasCustom = $scope.obj.customFields.length != 0;
        };
        $scope.newNote = function () {
            $scope.addPopover.hide();
            $scope.addPopover.remove();
            $timeout(function () {
                //--------------------NOTE--Modal------------------------
                $ionicModal.fromTemplateUrl('views/modals/note.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.noteModal = modal;
                    $scope.close = function () {
                        $scope.noteModal.hide();
                        $scope.noteModal.remove();
                    };
                    $scope.save = function () {
                        var valid = validate.note($scope.obj);
                        if (valid) {
                            var resource = resources.getNoteResource();
                            ($scope.obj.mode === 'new') ? ops.save(parse.note($scope.obj), resource, notesRepo) : ops.update(parse.note($scope.obj), resource, notesRepo);
                            $scope.close();
                        }
                    };
                    $scope.noteModal.show();
                });
            }, 10);
            //-------------------------------------------------------
            $scope.editing = true;
            $scope.obj = { account: true, mode: 'new', hasCustom: false, customFields: [] };
        };
        $scope.showNote = function (note) {
            //--------------------NOTE--Modal------------------------
            $ionicModal.fromTemplateUrl('views/modals/note.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.noteModal = modal;
                $scope.close = function () {
                    $scope.noteModal.hide();
                    $scope.noteModal.remove();
                };
                $scope.save = function () {
                    var valid = validate.note($scope.obj);
                    if (valid) {
                        var resource = resources.getNoteResource();
                        ($scope.obj.mode === 'new') ? ops.save(parse.note($scope.obj), resource, notesRepo) : ops.update(parse.note($scope.obj), resource, notesRepo);
                        $scope.close();
                    }

                };
                $scope.noteModal.show();
            });
            //-------------------------------------------------------
            $scope.editing = false;
            $scope.obj = note;
        };
        //-------------------------------------------------------
        $scope.newPword = function () {
            $scope.addPopover.hide();
            $scope.addPopover.remove();
            $timeout(function () {
                //--------------------Pword------Modal------------------------
                $ionicModal.fromTemplateUrl('views/modals/pword.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.pwordModal = modal;
                    $scope.close = function () {
                        $scope.pwordModal.hide();
                        $scope.pwordModal.remove();
                    };
                    $scope.save = function () {
                        var valid = validate.pword($scope.obj);
                        if (valid) {
                            var resource = resources.getPwordResource();
                            ($scope.obj.mode === 'new') ? ops.save(parse.pword($scope.obj), resource, pwordsRepo) : ops.update(parse.pword($scope.obj), resource, pwordsRepo);
                            $scope.close();
                        }
                    };
                    $scope.pwordModal.show();
                });
            }, 10);
            $scope.editing = true;
            $scope.obj = { account: true, mode: 'new', hasCustom: false, customFields: [] };
        };
        $scope.showPword = function (pword) {
            //--------------------Pword------Modal------------------------
            $ionicModal.fromTemplateUrl('views/modals/pword.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.pwordModal = modal;
                $scope.close = function () {
                    $scope.pwordModal.hide();
                    $scope.pwordModal.remove();
                };
                $scope.save = function () {
                    var valid = validate.pword($scope.obj);
                    if (valid) {
                        var resource = resources.getPwordResource();
                        ($scope.obj.mode === 'new') ? ops.save(parse.pword($scope.obj), resource, pwordsRepo) : ops.update(parse.pword($scope.obj), resource, pwordsRepo);
                        $scope.close();
                    }

                };
                $scope.pwordModal.show();
            });
            $scope.editing = false;
            $scope.obj = pword;
        };
        //-------------------------------------------------------------
        $scope.newCard = function () {
            $scope.addPopover.hide();
            $scope.addPopover.remove();
            $timeout(function () {
                //______________________Card____Modal__________________________
                $ionicModal.fromTemplateUrl('views/modals/card.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.cardModal = modal;
                    $scope.close = function () {
                        $scope.cardModal.hide();
                        $scope.cardModal.remove();
                    };
                    $scope.save = function () {
                        var valid = validate.card($scope.obj);
                        if (valid) {
                            var resource = resources.getCardResource();
                            ($scope.obj.mode === 'new') ? ops.save(parse.card($scope.obj), resource, cardsRepo) : ops.update(parse.card($scope.obj), resource, cardsRepo);
                            $scope.close();
                        }
                    };
                    $scope.cardModal.show();
                });
                //_____________________________________________________________
            }, 10);
            $scope.editing = true;
            $scope.obj = { account: true, mode: 'new', hasCustom: false, customFields: [], exp: new Date() };
        };
        $scope.showCard = function (card) {
            //______________________Card____Modal__________________________
            $ionicModal.fromTemplateUrl('views/modals/card.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.cardModal = modal;
                $scope.close = function () {
                    $scope.cardModal.hide();
                    $scope.cardModal.remove();
                };
                $scope.save = function () {
                    var valid = validate.card($scope.obj);
                    if (valid) {
                        var resource = resources.getCardResource();
                        ($scope.obj.mode === 'new') ? ops.save(parse.card($scope.obj), resource, cardsRepo) : ops.update(parse.card($scope.obj), resource, cardsRepo);
                        $scope.close();
                    }
                };
                $scope.cardModal.show();
            });
            //_____________________________________________________________
            $scope.editing = false;
            $scope.obj = card;
            $scope.obj.exp = new Date(card.exp);
        };
        //_______________________________________________________________
    }])

    .controller('NotesController', ['$scope', '$ionicModal', 'accService', 'ops', 'parse', 'resources', 'notesRepo', 'validate', function ($scope, $ionicModal, accService, ops, parse, resources, notesRepo, validate) {
        $scope.account = accService.getCurrent();
        $scope.$on('acc-change', function (event, value) {
            $scope.account = value;
        });

        $scope.notes = notesRepo.get();

        $scope.$on('notes-ready', function (event, data) {
            $scope.notes = data;
            event.preventDefault();
            console.log('NotesControl:: Received Notes ----->');
            $scope.$broadcast('scroll.refreshComplete');
        });

        $scope.refresh = function () {
            notesRepo.startFetching();
        };
        $scope.remove = function (index) {
            ops.remove($scope.nres[index]._id, resources.getNoteResource(), notesRepo);
            $scope.notes.splice(index, 1);
        };
        $scope.togglePin = function (note) {
            note.pinned = !note.pinned;
            //Save
            var object = { _id: note._id, pinned: note.pinned };
            ops.update(object, resources.getNoteResource(), notesRepo);
        };

        //--------------------------Modal------------------------
        $scope.editing = false;
        $ionicModal.fromTemplateUrl('views/modals/note.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.noteModal = modal;
        });
        $scope.close = function () {
            $scope.noteModal.hide();
        };
        $scope.save = function () {
            var valid = validate.note($scope.obj);
            if (valid) {
                var resource = resources.getNoteResource();
                ($scope.obj.mode === 'new') ? ops.save(parse.note($scope.obj), resource, notesRepo) : ops.update(parse.note($scope.obj), resource, notesRepo);
                $scope.close();
            }
        };
        $scope.edit = function () {
            $scope.editing = true;
        }
        //-------------------------------------------------------
        $scope.newNote = function () {
            $scope.editing = true;
            $scope.obj = { account: true, mode: 'new', hasCustom: false, customFields: [] };
            $scope.noteModal.show();
        };
        $scope.showNote = function (note) {
            $scope.editing = false;
            $scope.obj = note;
            $scope.noteModal.show();
        };
    }])
    .controller('PwordsController', ['$scope', '$ionicModal', 'accService', 'ops', 'parse', 'resources', 'pwordsRepo', 'validate', function ($scope, $ionicModal, accService, ops, parse, resources, pwordsRepo, validate) {
        $scope.account = accService.getCurrent();
        $scope.$on('acc-change', function (event, value) {
            $scope.account = value;
            event.preventDefault();
        });

        $scope.pwords = pwordsRepo.get();
        $scope.$on('pwords-ready', function (event, data) {
            $scope.pwords = data;
            event.preventDefault();
            console.log('PwordsControl:: Received Pwords ----->');
            $scope.$broadcast('scroll.refreshComplete');
        });

        $scope.refresh = function () {
            pwordsRepo.startFetching();
        };
        $scope.remove = function (index) {
            ops.remove($scope.pres[index]._id, resources.getPwordResource(), pwordsRepo);
            $scope.pwords.splice(index, 1);

        };
        $scope.togglePin = function (pword) {
            pword.pinned = !pword.pinned;
            var object = { _id: pword._id, pinned: pword.pinned };
            ops.update(object, resources.getPwordResource(), pwordsRepo);
        };

        $scope.obj = { account: true };

        //--------------------------Modal------------------------
        $scope.editing = false;
        $scope.show = false;
        $ionicModal.fromTemplateUrl('views/modals/pword.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.pwordModal = modal;
        });
        $scope.close = function () {
            $scope.pwordModal.hide();
        };
        $scope.save = function () {
            var valid = validate.pword($scope.obj);
            if (valid) {
                var resource = resources.getPwordResource();
                ($scope.obj.mode === 'new') ? ops.save(parse.pword($scope.obj), resource, pwordsRepo) : ops.update(parse.pword($scope.obj), resource, pwordsRepo);
                $scope.close();
            }
        };
        $scope.toggleShow = function () {
            $scope.show = !$scope.show;
        };
        $scope.edit = function () {
            $scope.editing = true;
        };
        $scope.addField = function () {
            var field = { key: '', value: '' };
            if (!$scope.obj.hasCustom) $scope.obj.hasCustom = true;
            $scope.obj.customFields.push(field);
        };
        $scope.delField = function (index) {
            $scope.obj.customFields.splice(index, 1);
            $scope.obj.hasCustom = $scope.obj.customFields.length != 0;
        };
        //-------------------------------------------------------
        $scope.newPword = function () {
            $scope.editing = true;
            $scope.obj = { account: true, mode: 'new', hasCustom: false, customFields: [] };
            $scope.pwordModal.show();
        };
        $scope.showPword = function (pword) {
            $scope.editing = false;
            $scope.obj = pword;
            $scope.pwordModal.show();
        };
    }])
    .controller('CardsController', ['$scope', '$ionicModal', 'accService', 'ops', 'parse', 'resources', 'cardsRepo', 'validate', function ($scope, $ionicModal, accService, ops, parse, resources, cardsRepo, validate) {
        $scope.account = accService.getCurrent();
        $scope.$on('acc-change', function (event, value) {
            $scope.account = value;
        });

        $scope.cards = cardsRepo.get();
        $scope.$on('cards-ready', function (event, data) {
            $scope.cards = data;
            event.preventDefault();
            console.log('CardsControl:: Received Cards ----->');
            $scope.$broadcast('scroll.refreshComplete');
        });

        $scope.refresh = function () {
            cardsRepo.startFetching();
        };
        $scope.remove = function (index) {
            ops.remove($scope.cres[index]._id, resources.getCardResource(), cardsRepo);
            $scope.cards.splice(index, 1);
        };
        $scope.togglePin = function (card) {
            card.pinned = !card.pinned;
            //Save
            var object = { _id: card._id, pinned: card.pinned };
            ops.update(object, resources.getCardResource(), cardsRepo);
        };

        $scope.obj = { account: true };
        //__________________________Modal__________________________
        $scope.editing = false;
        $ionicModal.fromTemplateUrl('views/modals/card.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.cardModal = modal;
        });
        $scope.close = function () {
            $scope.cardModal.hide();
        };
        $scope.save = function () {
            var valid = validate.card($scope.obj);
            if (valid) {
                var resource = resources.getCardResource();
                ($scope.obj.mode === 'new') ? ops.save(parse.card($scope.obj), resource, cardsRepo) : ops.update(parse.card($scope.obj), resource, cardsRepo);
                $scope.close();
            }
        };
        $scope.edit = function () {
            $scope.editing = true;
        };
        $scope.addField = function () {
            var field = { key: '', value: '' };
            if (!$scope.obj.hasCustom) $scope.obj.hasCustom = true;
            $scope.obj.customFields.push(field);
        };
        $scope.delField = function (index) {
            $scope.obj.customFields.splice(index, 1);
            $scope.obj.hasCustom = $scope.obj.customFields.length != 0;
        };
        //_____________________________________________________________
        $scope.newCard = function () {
            $scope.editing = true;
            $scope.obj = { account: true, mode: 'new', hasCustom: false, customFields: [], exp: new Date() };
            $scope.cardModal.show();
        };
        $scope.showCard = function (card) {
            $scope.editing = false;
            $scope.obj = card;
            $scope.obj.exp = new Date(card.exp);
            $scope.cardModal.show();
        };
    }])
    ;