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
    }
};

module.exports = util;