/* @ngInject */
function appNavbar() {
    return {
        restrict: 'E',
        controller: NavbarController,
        controllerAs: 'vm',
        template: require('./app-navbar.html'),
        bindToController: true,
        scope: {
            onToggleSidebar: '&'
        }
    };

    function NavbarController($scope, $state, principalService, authService, entitiesCache) {
        var vm = this;

        vm.logout = logout;
        vm.search = search;

        init();

        function init() {
            principalService.identity().then(function(user) {
                vm.user = user;
            });

            $scope.$on('$destroy', function() {
                entitiesCache.clearAll();
            });
        }

        function logout() {
            authService.logout();
            entitiesCache.clearAll();
            $state.go('login');
        }

        function search() {
            vm.query = (vm.query || '').trim().toLowerCase();
            $state.go('entities.search-panel', {query: vm.query});
        }
    }
}

module.exports = appNavbar;
