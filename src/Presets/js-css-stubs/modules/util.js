var Noty = require('noty');

var util = {
    randStr: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    strReplace: function (str, param) {
        for (var key in param)
            str = str.replaceAll(key, param[key]);
        return str;
    },
    notify: function (message, type) {
        //https://ned.im/noty/#/
        if (!['alert', 'success', 'error', 'warning', 'info'].includes(type))
            type = 'success';
        new Noty({
            text: message,
            type: type,
            closeWith: ['click'],//click, button
            progressBar: false,
            theme: 'sunset',
            layout: 'topRight',
            timeout: 3000,
        })
            .show();
    },
    /**
     * yyyy/mm/dd -> timestamp
     * @param {Object} dateStr
     */
    dateToTimestamp: function (dateStr) {
        if (!dateStr)
            return undefined;
        var d = dateStr.match(/\d+/g);
        var date = new Date(d[0], d[1] - 1, d[2], 0, 0, 0);
        return date.getTime() / 1000;
    },
    timestampToClock: function (ts) {
        if (!ts)
            return undefined;
        var date = new Date(ts * 1000);
        var h = date.getHours();
        var m = date.getMinutes();
        var t = h >= 12 ? 'pm' : 'am';
        if (h > 12)
            h -= 12;
        if (m < 10)
            m = '0' + m;
        return h + ':' + m + ' ' + t;
    },
    /**
     * timestamp -> yyyy/mm/dd
     * @param {Object} ts second
     * @return yyyy/mm/dd
     */
    timestampToDate: function (ts) {
        if (!ts)
            return '';
        var date = new Date(ts * 1000);
        var y = date.getFullYear();
        var M = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        if (M < 10)
            M = '0' + M;
        if (d < 10)
            d = '0' + d;
        return y + '/' + M + '/' + d;
    },
    /**
     * timestamp -> yyyy/mm/dd hh:mm:ss
     * @param {Object} ts second
     * @return yyyy/mm/dd hh:mm:ss
     */
    timestampToDateTime: function (ts) {
        if (!ts)
            return '';
        var date = new Date(ts * 1000);
        var y = date.getFullYear();
        var M = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        if (M < 10)
            M = '0' + M;
        if (d < 10)
            d = '0' + d;
        if (h < 10)
            h = '0' + h;
        if (m < 10)
            m = '0' + m;
        if (s < 10)
            s = '0' + s;

        return y + '/' + M + '/' + d + ' ' + h + ':' + m + ':' + s;
    },
};

module.exports = util;