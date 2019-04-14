// var Rev = require('revised');

UE.plugin.register('revised', function () {
    var me = this;
    var domUtils = UE.domUtils;
    var utils = UE.utils;
    var rev;

    return {
        bindEvents: {
            'ready': function () {
                rev = REV.getInstance(me);//new Rev(me);
            }
        },
        outputRule: function (root) {
        },
        inputRule: function (root) {
        },
        commands: {
            // 'insert': {
            //     execCommand: function (cmd, name) {
            //         if(rev) rev.insert();
            //     }
            // }
        }
    }
});
