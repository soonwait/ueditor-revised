// var Rev = require('revised');

UE.plugin.register('revised', function () {
    var me = this;
    var domUtils = UE.domUtils;
    var utils = UE.utils;
    // var rev = Rev.getInstance(me.body);
    var rev;

    return {
        bindEvents: {
            'ready': function () {
                rev = new Rev(me);
            }
        },
        outputRule: function (root) {
        },
        inputRule: function (root) {
        },
        commands: {
            'insert': {
                execCommand: function (cmd, name) {
                    if(rev) rev.insert();
                }
            }
        }
    }
});
