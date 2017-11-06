/* @ngInject */
function UserManagementController($uibModal, userService, parseLinksService, $filter, pageInfo, notifyService) {
    var vm = this;
    vm.users = [];
    vm.roles = pageInfo.roles;
    vm.page = 1;
    vm.itemsPerPage = 10;

    vm.loadAll = loadAll;
    vm.setActive = setActive;
    vm.clear = clear;
    vm.save = save;
    vm.create = create;
    vm.edit = edit;
    vm.search = search;
    vm.changePassword = changePassword;

    vm.loadAll();

    function loadAll() {
        userService.query({
            page: vm.page - 1, size: vm.itemsPerPage
        }, function(result, headers) {
            vm.links = parseLinksService.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');
            vm.users = result;
        });
    }

    function setActive(user, isActivated) {
        user.activated = isActivated;
        userService.update(user, function() {
            loadAll();
            clear();
        });
    }

    function clear() {
        vm.user = null;
    }

    function onSaveSuccess() {
        vm.isSaving = false;
        vm.user = null;
        loadAll();
    }

    function onSaveError(result) {
        vm.isSaving = false;
        loadAll();

        if (!isEmailCorrect(result)) {
            notifyService.error('Email address is incorrect!');

            return;
        }

        notifyService.error('User is not saved due to server error!');
    }

    function isEmailCorrect(result) {
        return !(result.data && _.find(result.data.fieldErrors, {field: 'email'}));
    }

    function save() {
        vm.isSaving = true;
        if (vm.user.id) {
            userService.update(vm.user, onSaveSuccess, onSaveError);
        } else {
            userService.save(vm.user, onSaveSuccess, onSaveError);
        }
    }

    function create() {
        vm.user = {
            id: null,
            login: null,
            firstName: null,
            lastName: null,
            email: null,
            activated: true,
            roles: null,
            group: null
        };
    }

    function edit(user) {
        if (user.group) {
            user.group = {
                name: user.group
            };
        }
        loadAll();
        vm.user = _.extend({}, user);
    }

    function search() {
        userService.query({
            page: vm.page - 1, size: 20
        }, function(result, headers) {
            vm.links = parseLinksService.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');
            vm.users = $filter('filter')(result, vm.searchText);
        });
    }

    function changePassword() {
        $uibModal.open({
            animation: true,
            size: 'sm',
            template: require('./user-management-password-dialog.html'),
            controllerAs: 'vm',
            controller: function($scope, $uibModalInstance) {
                var vm = this;
                vm.cancel = cancel;
                vm.ok = ok;

                function cancel() {
                    $uibModalInstance.dismiss('cancel');
                }

                function ok() {
                    $uibModalInstance.close(vm.password);
                }
            }
        }).result.then(function(password) {
            vm.user.password = password;
        });
    }
}

module.exports = UserManagementController;
