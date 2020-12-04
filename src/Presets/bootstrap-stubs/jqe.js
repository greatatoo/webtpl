var _pagePool = {};
var _jqePool = {};

window.jqe = {
    /**
     * jQuery Special Event
     * @param {Event} or {String} event
     */
    register: function (evt) {
        var eventName = evt instanceof $.Event ? evt.type : evt;
        if ($.event.special[eventName])
            return;
        _jqePool[eventName] = [];

        $.event.special[eventName] = {
            add: function (handleObj) {
                var isExisted = false;
                for (var i = 0; i < _jqePool[eventName].length; i++) {
                    var srcObj = _jqePool[eventName][i][0];
                    var handler = _jqePool[eventName][i][1];
                    if (this === srcObj && handleObj.handler === handler) {
                        isExisted = true;
                        break;
                    }
                }
                if (!isExisted) {
                    _jqePool[eventName].push([this, handleObj.handler]);
                }
            },
            remove: function (handleObj) {
                var i = 0;
                for (; i < _jqePool[eventName].length; i++) {
                    var srcObj = _jqePool[eventName][i][0];
                    var handler = _jqePool[eventName][i][1];
                    if (this === srcObj && handleObj.handler === handler) {
                        _jqePool[eventName].splice(i, 1);
                        break;
                    }
                }
            }
        };
    },
    /**
     * Trigger jQuery Special Event
     * @param {Event} or {String} event
     * @param {Anything} [param1],[param2]...
     * @see https://api.jquery.com/trigger/
     */
    trigger: function (evt) {
        if (!(evt instanceof $.Event))
            evt = $.Event(evt);
        if (!$.event.special[evt.type])
            return;
        var args = [evt];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        _jqePool[evt.type].forEach(function (arr) {
            srcObj = arr[0];
            handler = arr[1];
            handler.apply(srcObj, args);
        });
    }
};