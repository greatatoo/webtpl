jqe.register('log_test_ebus');

var pageEl = $('#page_test_ebus');
var hostName = location.hostname;

$('.tf-ip', pageEl).val(hostName);

//EBus Object
var myEbus = null;

pageEl
    //connected
    .on('ebusConnected', function (e, ebus) {
        if (myEbus !== ebus)
            return;

        jqe.trigger('log_test_ebus', '[' + ebus.getBrowserIp() + '] ebus connected ');

        $('.tf-ip', pageEl).prop('disabled', true);
        $('.btn-connect', pageEl).hide();
        $('.btn-disconnect', pageEl).show();
        $('.tf-send', pageEl).focus();
    })
    //disconnected
    .on('ebusDisconnected', function (e, ebus) {
        if (myEbus !== ebus)
            return;

        jqe.trigger('log_test_ebus', 'ebus disconnected');

        $('.tf-ip', pageEl).prop('disabled', false);
        $('.btn-connect', pageEl).show();
        $('.btn-disconnect', pageEl).hide();
    })
    //received message
    .on('ebusMessage', function (e, ebus, msg) {
        if (myEbus !== ebus)
            return;
        try {
            var jsonStr = JSON.stringify(msg);
            jqe.trigger('log_test_ebus', jsonStr.substr(0, 100) + ' received');
        } catch (e) {
            console.log('ebusMessage json error', msg);
        }
    })
    .on('page_test_ebus', function () {
        this.show();
    });

//button for connection
$('.btn-connect', pageEl)
    .click(function () {
        var mqIp = $('.tf-ip', pageEl).val();
        if (!$.trim(mqIp)) {
            util.notify(trans('dashboard.ebus.no_server_ip'));
            $('.tf-ip', pageEl).focus();
            return false;
        }

        if (myEbus != null)
            myEbus.dispose();

        myEbus = EBus({
            ip: mqIp
        });
        myEbus.connect();
    });

//button for disconnection
$('.btn-disconnect', pageEl)
    .click(function () {
        if (myEbus == null)
            return;

        myEbus.disconnect();
        myEbus = null;
    });

//button for clear
$('.btn-clear', pageEl)
    .click(function () {
        $('.log-container', pageEl).empty();
    });

//button for subscribtion
$('.btn-subscribe', pageEl)
    .click(function () {
        if (myEbus == null || !myEbus.isConnected()) {
            util.notify(trans('dashboard.ebus.not_connected_yet'));
            return;
        }

        var chann = $.trim($('.tf-subscribe', pageEl).val());
        if (!chann) {
            util.notify(trans('dashboard.ebus.no_channel_specified'));
            $('.tf-subscribe', pageEl).focus();
            return false;
        }

        if (!(chann.startsWith('/topic/') || chann.startsWith('/queue/'))) {
            util.notify(trans('dashboard.ebus.channel_start_with'));
            $('.tf-subscribe', pageEl).val('/topic/').focus();
            return false;
        }

        myEbus.subscribe(chann);
        jqe.trigger('log_test_ebus', chann + ' subscribed');
    });

//cancel subscribtion
$('.btn-unsubscribe', pageEl)
    .click(function () {
        if (myEbus == null || !myEbus.isConnected()) {
            util.notify(trans('dashboard.ebus.not_connected_yet'));
            return;
        }

        var chann = $.trim($('.tf-subscribe', pageEl).val());
        if (!chann) {
            util.notify(trans('dashboard.ebus.no_channel_specified'));
            $('.tf-subscribe', pageEl).focus();
            return false;
        }

        if (!(chann.startsWith('/topic/') || chann.startsWith('/queue/'))) {
            util.notify(trans('dashboard.ebus.channel_start_with'));
            $('.tf-subscribe', pageEl).focus();
            return false;
        }

        myEbus.unsubscribe(chann);
        jqe.trigger('log_test_ebus', chann + ' unsubscribed');
    });

//send message
$('.btn-send', pageEl)
    .click(function () {
        if (myEbus == null || !myEbus.isConnected()) {
            util.notify(trans('dashboard.ebus.not_connected_yet'));
            return;
        }

        var chann = $.trim($('.tf-subscribe', pageEl).val());
        if (!chann) {
            util.notify(trans('dashboard.ebus.no_channel_specified'));
            $('.tf-subscribe', pageEl).focus();
            return false;
        }

        if (!(chann.startsWith('/topic/') || chann.startsWith('/queue/'))) {
            util.notify(trans('dashboard.ebus.channel_start_with'));
            $('.tf-subscribe', pageEl).focus();
            return false;
        }

        var msg = $.trim($('.tf-send', pageEl).val());
        if (!msg) {
            util.notify(trans('dashboard.ebus.enter_message'));
            $('.tf-send', pageEl).focus();
            return false;
        }

        myEbus.send(chann, {
            message: msg
        });

        jqe.trigger('log_test_ebus', 'sent "' + msg + '"');
        $('.tf-send', pageEl).val('');
    });


$('.tf-ip', pageEl)
    .on('keypress', function (e) {
        if (e.which == 13) {
            $('.btn-connect', pageEl).click();
        }
    });

$('.tf-send', pageEl)
    .on('keypress', function (e) {
        if (e.which == 13) {
            $('.btn-send', pageEl).click();
        }
    });

//logs
$('.log-container', pageEl)
    .on('log_test_ebus', function (e, logStr) {
        var ts = new Date().getTime() / 1000;
        var dt = util.timestampToDateTime(ts);
        var clock = util.timestampToClock(ts);
        var row = '<div class="log-row">';
        row += '<span class="log-time" title="' + dt + '">' + clock + '</span>';
        row += '<span class="log-msg">' + logStr + '</span>';
        row += '</div>';
        var row = $(row);
        $(this).prepend(row);
        window.setTimeout(function () {
            row.addClass('fade-color');
        }, 30);

        //keep last 30 logs
        $(this).find('.log-row').slice(30).remove();

    });
