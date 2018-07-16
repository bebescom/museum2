(function ($) {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function CreateIndentityWindowId() {
        return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    $.window = function (options) {
        if (!options.url && !options.contents) {
            top.$.messager.alert("提示", "缺少必要参数!(url or contents)");
            return false;
        }
        var windowId = CreateIndentityWindowId();
        if (options.winId) {
            windowId = options.winId;
            top.$('#' + windowId).dialog("destroy");
        } else {
            options.winId = windowId;
        }

        options = $.extend({}, $.window.defaults, options || {});
        var defaultBtn = [
            {
                iconCls: 'icon-cancel',
                text: '关闭',
                handler: function () {
                    dialog.dialog("destroy");
                }
            }
        ];
        if (options.buttons) {
            options.buttons = $.merge(options.buttons || [], defaultBtn);
        }

        if (options.isMax) {
            options.draggable = false;
            options.closed = true;
        }
        var dialog = top.$('<div/>');
        top.$(options.target).append(dialog);

        dialog.dialog($.extend({}, options, {
            onClose: function () {
                if (typeof options.onClose == "function") {
                    options.onClose.call(dialog, $);
                }
                dialog.dialog('destroy');
            }
        }));
        dialog.attr('id', windowId);

        if (options.align) {
            var w = dialog.closest(".window");
            switch (options.align) {
                case "right":
                    dialog.dialog("move", {
                        left: w.parent().width() - w.width() - 20
                    });
                    break;
                case "tright":
                    dialog.dialog("move", {
                        left: w.parent().width() - w.width() - 20,
                        top: 0
                    });
                    break;
                case "bright":
                    dialog.dialog("move", {
                        left: w.parent().width() - w.width() - 20,
                        top: w.parent().height() - w.height() - 20
                    });
                    break;
                case "left":
                    dialog.dialog("move", {
                        left: 0
                    });
                    break;
                case "tleft":
                    dialog.dialog("move", {
                        left: 0,
                        top: 0
                    });
                    break;
                case "bleft":
                    dialog.dialog("move", {
                        left: 0,
                        top: w.parent().height() - w.height() - 10
                    });
                    break;
                case "top":
                    dialog.dialog("move", {
                        top: 0
                    });
                    break;
                case "bottom":
                    dialog.dialog("move", {
                        top: w.parent().height() - w.height() - 10
                    });
                    break;
            }
        }
        if (options.isMax) {
            dialog.dialog("maximize");
            dialog.dialog("open");
        }

        if (options.contents) {
            ajaxSuccess(options.contents);
        } else {
            if (!options.isIframe) {
                $.ajax({
                    url: options.url,
                    type: options.ajaxType || "POST",
                    data: options.data || '',
                    success: function (date) {
                        try {
                            var json = $.parseJSON(date);
                            if (json && json.error) {
                                //$('#loading_win').dialog('destroy');
                                top.$.messager.alert('提示', json.msg);
                                dialog.dialog('destroy');
                                return false;
                            }
                        } catch (e) {
                            ajaxSuccess(date);
                        }

                    }
                });
            } else {
                ajaxSuccess();
            }
        }

        return dialog;

        function ajaxSuccess(date) {

            if (options.isIframe && !date) {
                dialog.html('<iframe width="100%" height="100%" frameborder="0" src="' + options.url + '" ></iframe>');
            } else {
                dialog.html(date);
            }
            top.$.parser.parse('#' + windowId);

            dialog.dialog("open");

            dialog.find('.close').on('click', function () {
                dialog.dialog('destroy');
            });

            if (options.buttonCenter) {
                dialog.find('.dialog-button').css('text-align', 'center');
            }

            if (!options.align) {
                dialog.dialog('center');
            }

            options.onComplete.call(dialog, $);
        }
    };

    $.window.defaults = $.extend({}, $.fn.dialog.defaults, {
        url: '',
        data: '',
        contents: '',
        ajaxType: "POST",
        target: 'body',
        height: 'auto',
        width: 400,
        align: false,
        isMax: false,
        collapsible: false,
        minimizable: false,
        maximizable: false,
        closable: true,
        closed: true,
        modal: false,
        shadow: false,
        buttons: false,
        buttonCenter: false,
        isIframe: false,
        onComplete: function (topjQuery) {
        }
    });
})(jQuery);