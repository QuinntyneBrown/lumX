/* global angular */
/* global window */
'use strict'; // jshint ignore:line

angular.module('lumx.notification', [])
    .provider('LxNotificationService', function () {
        var notificationOffset;

        this.setNotificationOffset = function (value) {
            notificationOffset = value;
        };
        this.$get = ['$injector', '$rootScope', '$timeout', function ($injector, $rootScope, $timeout) {

            notificationOffset = notificationOffset || 24;
            //
            // PRIVATE MEMBERS
            //
            var notificationList = [],
                dialogFilter,
                dialog;

            //
            // NOTIFICATION
            //

            // private
            function getElementHeight(elem) {
                return parseFloat(window.getComputedStyle(elem, null).height);
            }

            // private
            function moveNotificationUp() {
                var newNotifIndex = notificationList.length - 1;
                notificationList[newNotifIndex].height = getElementHeight(notificationList[newNotifIndex].elem[0]);

                var upOffset = 0;

                for (var idx = newNotifIndex; idx >= 0; idx--) {
                    if (notificationList.length > 1 && idx !== newNotifIndex) {
                        upOffset = notificationOffset + notificationList[newNotifIndex].height;

                        notificationList[idx].margin += upOffset;
                        notificationList[idx].elem.css('marginBottom', notificationList[idx].margin + 'px');
                    }
                }
            }

            // private
            function deleteNotification(notification) {
                var notifIndex = notificationList.indexOf(notification);

                var dnOffset = notificationOffset + notificationList[notifIndex].height;

                for (var idx = 0; idx < notifIndex; idx++) {
                    if (notificationList.length > 1) {
                        notificationList[idx].margin -= dnOffset;
                        notificationList[idx].elem.css('marginBottom', notificationList[idx].margin + 'px');
                    }
                }

                notification.elem.remove();
                notificationList.splice(notifIndex, 1);
            }

            function notify(text, icon, sticky, color) {
                var notificationTimeout;
                var notification = createElement('<div></div>').addClass('notification');

                var notificationText = createElement('<span></span>')
                    .addClass('notification__content');
                notificationText.html(text);

                if (angular.isDefined(icon)) {
                    var notificationIcon = createElement('<i></i>')
                        .addClass('notification__icon mdi mdi-' + icon);

                    notification
                        .addClass('notification--has-icon')
                        .append(notificationIcon);
                }

                if (angular.isDefined(color)) {
                    notification.addClass('notification--' + color);
                }

                notification.append(notificationText);

                var body = getBodyElement()
                    .append(notification);

                var data = { elem: notification, margin: 0 };
                notificationList.push(data);
                moveNotificationUp();

                notification.on('click', function () {
                    deleteNotification(data);

                    if (angular.isDefined(notificationTimeout)) {
                        $timeout.cancel(notificationTimeout);
                    }
                });

                if (angular.isUndefined(sticky) || !sticky) {
                    notificationTimeout = $timeout(function () {
                        deleteNotification(data);
                    }, 6000);
                }
            }

            function success(text, sticky) {
                notify(text, 'check', sticky, 'green');
            }

            function error(text, sticky) {
                notify(text, 'alert-circle', sticky, 'red');
            }

            function warning(text, sticky) {
                notify(text, 'alert', sticky, 'orange');
            }

            function info(text, sticky) {
                notify(text, 'information-outline', sticky, 'blue');
            }

            //
            // ALERT & CONFIRM
            //

            // private
            function buildDialogHeader(title) {
                // DOM elements
                var dialogHeader = createElement('<div></div>')
                    .addClass('dialog__header p++ fs-title');
                dialogHeader.html(title);

                return dialogHeader;
            }

            // private
            function buildDialogContent(text) {
                // DOM elements
                var dialogContent = createElement('<div></div>')
                    .addClass('dialog__content p++ pt0 tc-black-2');
                dialogContent.html(text);

                return dialogContent;
            }

            // private
            function buildDialogActions(buttons, callback) {
                var $compile = $injector.get('$compile');

                // DOM elements
                var dialogActions = createElement('<div></div>')
                    .addClass('dialog__actions');

                var dialogLastBtn = createElement('<button></button>')
                    .addClass('btn btn--m btn--blue btn--flat');
                dialogLastBtn.html(buttons.ok);

                // Cancel button
                if (angular.isDefined(buttons.cancel)) {
                    // DOM elements
                    var dialogFirstBtn = createElement('<button></button>')
                        .addClass('btn btn--m btn--red btn--flat');
                    dialogFirstBtn.html(buttons.cancel);
                    dialogFirstBtn.attr('lx-ripple', '');
                    // Compilation
                    $compile(dialogFirstBtn)($rootScope);

                    // DOM link
                    dialogActions.append(dialogFirstBtn);

                    // Event management
                    dialogFirstBtn.on('click', function () {
                        callback(false);
                        closeDialog();
                    });
                }

                // Compilation
                dialogLastBtn.attr('lx-ripple', '');
                $compile(dialogLastBtn)($rootScope);

                // DOM link
                dialogActions.append(dialogLastBtn);

                // Event management
                dialogLastBtn.on('click', function () {
                    callback(true);
                    closeDialog();
                });

                return dialogActions;
            }

            function confirm(title, text, buttons, callback) {
                // DOM elements
                dialogFilter = createElement('<div></div>');
                dialogFilter.addClass('dialog-filter');

                dialog = createElement('<div></div>');
                dialog.addClass('dialog dialog--alert');

                var dialogHeader = buildDialogHeader(title);
                var dialogContent = buildDialogContent(text);
                var dialogActions = buildDialogActions(buttons, callback);

                // DOM link
                var body = getBodyElement().append(dialogFilter);

                dialog
                    .append(dialogHeader)
                    .append(dialogContent)
                    .append(dialogActions);

                body.append(dialog);
                dialog.css('display', 'block');

                // Starting animaton
                $timeout(function () {
                    dialogFilter.addClass('dialog-filter--is-shown');
                    dialog.addClass('dialog--is-shown');
                }, 100);
            }

            function alert(title, text, button, callback) {
                // DOM elements
                dialogFilter = createElement('<div></div>')
                    .addClass('dialog-filter');

                dialog = createElement('<div></div>')
                    .addClass('dialog dialog--alert');

                var dialogHeader = buildDialogHeader(title);
                var dialogContent = buildDialogContent(text);
                var dialogActions = buildDialogActions({ ok: button }, callback);

                // DOM link
                var body = getBodyElement()
                    .append(dialogFilter);

                dialog
                    .append(dialogHeader)
                    .append(dialogContent)
                    .append(dialogActions);
                body.append(dialog);
                dialog.css('display', 'block');

                // Starting animaton
                $timeout(function () {
                    dialogFilter.addClass('dialog-filter--is-shown');
                    dialog.addClass('dialog--is-shown');
                }, 100);
            }

            // private
            function closeDialog() {
                // Starting animaton
                dialogFilter.removeClass('dialog-filter--is-shown');
                dialog.removeClass('dialog--is-shown');

                // After animaton
                $timeout(function () {
                    dialogFilter.remove();
                    dialog.remove();
                }, 600);
            }

            function getBodyElement() {
                return createElement(window.document.body);
            }

            function createElement(element) {
                return angular.element(element);
            }

            // Public API
            return {
                alert: alert,
                confirm: confirm,
                error: error,
                info: info,
                notify: notify,
                success: success,
                warning: warning
            };
        }];
    });