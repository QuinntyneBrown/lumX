/* global angular */
'use strict'; // jshint ignore:line

angular.module('lumx.ripple', [])
    .directive('lxRipple', ['$window', '$document', '$timeout', function ($window, $document, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                function createElement(element) {
                    return angular.element(element);
                }

                function getElementOffset(element) {
                    var de = $document[0].documentElement;
                    var box = element.getBoundingClientRect();
                    var top = box.top + $window.pageYOffset - de.clientTop;
                    var left = box.left + $window.pageXOffset - de.clientLeft;
                    return { top: top, left: left };
                }

                var timeout;
                element
                    .css({
                        position: 'relative',
                        overflow: 'hidden'
                    })
                    .on('mousedown', function (e) {
                        var ripple;

                        if (element.find('.ripple').length === 0) {
                            ripple = createElement('<span></span>').addClass('ripple');

                            if (attrs.lxRipple) {
                                ripple.addClass('bgc-' + attrs.lxRipple);
                            }

                            element.prepend(ripple);
                        }
                        else {
                            ripple = createElement(element[0].querySelector('.ripple'));
                        }

                        ripple.removeClass('ripple--is-animated');

                        var clientRect = ripple[0].getBoundingClientRect();

                        if (!clientRect.height && !clientRect.width) {
                            var diameter = Math.max(element[0].offsetWidh, element[0].offsetHeight);

                            ripple.css({ height: diameter, width: diameter });
                        }

                        var x = e.pageX - getElementOffset(element[0]).left - clientRect.width / 2;
                        var y = e.pageY - getElementOffset(element[0]).top - clientRect.height / 2;

                        ripple.css({ top: y + 'px', left: x + 'px' }).addClass('ripple--is-animated');

                        timeout = $timeout(function () {
                            ripple.removeClass('ripple--is-animated');
                        }, 651);
                    });

                scope.$on('$destroy', function () {
                    $timeout.cancel(timeout);
                });

            }
        };
    }]);