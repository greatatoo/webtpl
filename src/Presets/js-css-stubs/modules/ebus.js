/**
 * Register jQuery Special Event for EBus
 * Listen to EBus
 * $(obj).on('ebusConnected',function(e, ebus){});
 * $(obj).on('ebusDisconnected',function(e, ebus){});
 * $(obj).on('ebusMessage',function(e, messageObj){});
 * 
 * Dependencies
 * 1. Stomp
 * 2. jqe
 */
jqe.register('ebusConnected');
jqe.register('ebusDisconnected');
jqe.register('ebusMessage');

function EBus(properties) {

    if (!(this instanceof EBus))
        return new EBus(properties);

    var self = this;
    this.isDebug = false;
    /** connection object */
    this.connection;
    /** heartbeat*/
    this.heartbeatTimer;
    /** subscribed channels*/
    this.channels = {};
    /** callback listeners */
    this.listeners = [];
    /** default properties */
    this.properties = {
        ip: this.getBrowserIp(),
        port: 61616,
        user: 'artemis',
        pincode: 'simetraehcapa',
        heartbeat: 180000,
        autoconnect: true,
        autointerval: 3000,
        subscribe: []
    };
    $.extend(this.properties, properties);

    /** subscribed channel callback*/
    this.mqHandler = function (message) {
        if (message.body) {
            var obj = null;
            try {
                obj = $.parseJSON(message.body);
            } catch (e) {
                obj = {
                    'message': message.body,
                };
            }
            //trigger by jqe
            jqe.trigger('ebusMessage', self, obj);
            //trigger for listeners
            self.listeners.forEach(function (listener) {
                var isOk = true;
                for (var key in listener.filter) {
                    var value = listener.filter[key];
                    if (obj[key] != value) {
                        isOk = false;
                        break;
                    }
                }
                if (isOk)
                    listener(obj);
            });
        } else {
            console.log('mq no data');
        }
    }
}

/**
 * get EBus properties
 */
EBus.prototype.getProperties = function () {
    return this.properties;
};

/**
 * set EBus properties
 * @param {Object} properties
 */
EBus.prototype.setProperties = function (properties) {
    $.extend(this.properties, properties);
};

/**
  * ebusObj.addMessageListener(function(message){
 * 	//without filter. it'll receive all messages.
 * });
 * ebusObj.addMessageListener({event:'MyEvent'},function(message){
 * 	//only messages containing 'event:MyEvent' will be received.
 * });
 */
EBus.prototype.addMessageListener = function (arg1, arg2) {
    var filter = arguments.length > 1 ? arguments[0] : {};
    var fn = arguments[arguments.length > 1 ? 1 : 0];

    if (typeof fn != 'function') {
        console.log('listener is not a function');
        return;
    }
    if (!(filter instanceof Object))
        filter = {};
    fn.filter = filter;
    this.listeners.push(fn);
};

/**
 * remove listeners
 * @param {Function} fn
 */
EBus.prototype.removeMessageListener = function () {
    var each, arg = arguments, len = arg.length, ax;
    while (len && this.listeners.length) {
        each = arg[--len];
        while ((ax = this.listeners.indexOf(each)) !== -1) {
            this.listeners.splice(ax, 1);
        }
    }
};

/**
 * connect to mq server
 * @param {Function} successFn callback for success
 * @param {Function} errorFn callback for error
 * @return {Object} EBus
 */
EBus.prototype.connect = function (successFn, errorFn) {
    var self = this;
    this.successFn = successFn;
    this.errorFn = errorFn;

    var protocol = location.protocol == 'https:' ? 'wss' : 'ws';
    var port = location.protocol == 'https:' ? 61617 : 61616;

    //stomp connection
    this.connection = Stomp.client(protocol + '://' + this.properties.ip + ':' + port + '/stomp');
    if (this.properties.heartbeat >= 300000)
        this.properties.heartbeat = 280000;
    this.connection.heartbeat.incoming = this.properties.heartbeat;
    this.connection.heartbeat.outgoing = this.properties.heartbeat;
    //tweak stomp debug
    var proto = Object.getPrototypeOf(this.connection);
    proto.debug = function (msg) {
        if (!self.isDebug)
            return;
        console.log('( EBus )', msg);
    };

    console.log(protocol + '://' + this.properties.ip + ':' + port + '/stomp');
    console.log(this.connection);
    this.connection.connect(
        this.properties.user,
        this.properties.pincode,
        function () {
            console.log('ebus connection ok');
            jqe.trigger('ebusConnected', self);

            //start heartbeat timer
            self.heartbeatTimer = window.setInterval(
                function () {
                    self.send('/topic/heartbeat', {/*heartbeat content*/ });
                },
                self.properties.heartbeat
            );
            console.log('heartbeat id=' + self.heartbeatTimer + ' started');
            //subscribe
            self.properties.subscribe.forEach(function (channel) {
                self.subscribe(channel);
            });
            //success callback
            if (successFn) {
                successFn(self.connection);
            }
        },
        function (error) {
            console.log('error: ' + error);
            jqe.trigger('ebusDisconnected', self);

            //remove all channel records
            self.channels = {};
            //stop heartbeat timer
            window.clearInterval(self.heartbeatTimer);
            if (errorFn)
                errorFn(error);
            //auto reconnect
            if (self.properties.autoconnect) {
                console.log('auto reconnect');
                window.setTimeout(
                    function () {
                        if (!self.properties.autoconnect)
                            return;
                        self.connect(self.successFn, self.errorFn)
                    },
                    self.properties.autointerval
                );
            }
        }
    );
    return self;
};

/**
 * disconnect
 */
EBus.prototype.disconnect = function () {
    if (!this.connection) {
        console.log('null connection');
        return;
    }
    if (this.heartbeatTimer) {
        window.clearInterval(this.heartbeatTimer);
        console.log('heartbeat id=' + this.heartbeatTimer + ' stopped');
    }
    if (this.connection.connected) {
        this.connection.disconnect();
        console.log('disconnected');
    }
    jqe.trigger('ebusDisconnected', this);
};

/**
 * dispose EBus
 */
EBus.prototype.dispose = function () {
    this.properties.autoconnect = false;
    this.disconnect();
};

/**
 * subscribe EBus channel
 * @param {String} channel
 * example:  '/topic/my/channel'  or '/queue/my/channel'
 * @return {String} id (internal use)
 */
EBus.prototype.subscribe = function (channel) {
    console.log('subscribe channel=' + channel);
    if (channel.indexOf('/topic/') !== 0 && channel.indexOf('/queue/') !== 0)
        return -1;

    if (!this.connection) {
        console.log('null connection');
        return -1;
    }
    if (this.channels.hasOwnProperty(channel))
        return 0;
    var id = this.connection.subscribe(channel, this.mqHandler);
    this.channels[channel] = id;
    if (this.properties.subscribe.indexOf(channel) == -1)
        this.properties.subscribe.push(channel);
    console.log("subscribe=", channel, ' id=', id);
    return id;
};

/**
 * unsubscribe EBus channel
 * @param {String} channel
 */
EBus.prototype.unsubscribe = function (channel) {
    console.log('unsubscribe channel=' + channel);
    if (!this.connection) {
        console.log('null connection');
        return false;
    }
    if (!this.channels.hasOwnProperty(channel))
        return false;
    this.connection.unsubscribe(this.channels[channel].id);
    delete this.channels[channel];
    var delIndex = this.properties.subscribe.indexOf(channel);
    if (delIndex >= 0)
        this.properties.subscribe.splice(delIndex, 1);
    console.log("unsubscribe " + channel);
    return true;
};

/**
 * send message to a channel
 * @param {String} channel
 * @param {Object} obj
 */
EBus.prototype.send = function (channel, obj) {
    if (!obj.channel)
        obj.channel = channel;

    if (!this.connection) {
        console.log('null connection');
        return;
    }
    this.connection.send(
        channel,
        {
            priority: 9
        },
        JSON.stringify(obj)
    );
};

/**
 * connection status
 * @return {Boolean} isConnected
 */
EBus.prototype.isConnected = function () {
    if (!this.connection) {
        console.log('null connection');
        return false;
    }
    return this.connection.connected;
};

/**
 *get current subscribed channels
 * @return {Array} subscribed channels
 */
EBus.prototype.getSubscribe = function () {
    console.log(this.channels);
    return this.properties.subscribe;
};

/**
 * debug output to console
 * @param isDebug
 */
EBus.prototype.debug = function (isDebug) {
    if (!this.connection) {
        console.log('null connection');
        return;
    }
    this.isDebug = isDebug == undefined || isDebug == true;
};

/**
 * get browser IP
 * @return {String} IP
 */
EBus.prototype.getBrowserIp = function () {
    return location.hostname;
};

/**
 * get MQ server IP
 * @return IP
 */
EBus.prototype.getServerIp = function () {
    return this.properties.ip;
};

module.exports = EBus;