(function() {
    angular
        .module('indigoeln')
        .directive('indigoDatePicker', indigoDatePicker);

    /* @ngInject */
    function indigoDatePicker(formUtils) {
        return {
            restrict: 'E',
            replace: true,
            require: '?^form',
            scope: {
                indigoLabel: '@',
                indigoLabelVertical: '=',
                indigoName: '@',
                indigoModel: '=',
                indigoReadonly: '=',
                indigoType: '@',
                indigoValidationRequired: '=',
                indigoClasses: '@'
            },
            compile: compile,
            templateUrl: 'scripts/components/form/elements/date-picker/date-picker.html'
        };

        /* @ngInject */
        function compile(tElement, tAttrs) {
            formUtils.doVertical(tAttrs, tElement);
            tElement.find('input').attr('timezone', moment.tz.guess());

            return {
                post: function(scope, iElement, iAttrs, formCtrl) {
                    if (scope.indigoModel) {
                        scope.ctrl = {};
                        scope.ctrl.model = moment(scope.indigoModel);
                        scope.$watch('ctrl.model', function(date) {
                            scope.indigoModel = date ? date.toISOString() : null;
                        });
                    }
                    formUtils.showValidation(iElement, scope, formCtrl);
                }
            };
        }
    }
})();
