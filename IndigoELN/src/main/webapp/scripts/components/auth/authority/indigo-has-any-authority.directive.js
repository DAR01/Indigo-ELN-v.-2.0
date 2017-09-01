(function() {
    angular
        .module('indigoeln')
        .directive('indigoHasAnyAuthority', indigoHasAnyAuthority);

    /* @ngInject */
    function indigoHasAnyAuthority(Principal) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var authorities = $attrs.indigoHasAnyAuthority.replace(/\s+/g, '').split(',');

                if (authorities.length > 0) {
                    defineVisibility(true);
                }

                function setVisible() {
                    $element.removeClass('hidden');
                }

                function defineVisibility(reset) {
                    if (reset) {
                        setVisible();
                    }

                    Principal.hasAnyAuthority(authorities).then(function(result) {
                        $element.toggleClass('hidden', !result);
                    });
                }
            }
        };
    }
})();
