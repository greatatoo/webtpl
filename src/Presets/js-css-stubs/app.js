require('./bootstrap');

/**
 * You may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 * Add more common libraries here.
 */
require('datatables.net-bs4');
require('noty');
require('../../node_modules/stomp-websocket/lib/stomp.min');
window.jqe = require('./modules/jqe');
window.EBus = require('./modules/ebus');
window.trans = require('./modules/trans');
window.util = require('./modules/util');