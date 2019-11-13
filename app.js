var core = require('_libs/core.js')

//app.js
App({

    onLaunch: function(options) {

        console.debug(options)
        console.debug("App launch...")
        core.init(this)

        wx.onNetworkStatusChange(function(res) {
            console.debug(res.isConnected)
            console.debug(res.networkType)
            if (!res.isConnected) {
                wx.showToast({
                    title: '网络不可用',
                    duration: 2000,
                })
            } else if (res.networkType != 'wifi' && res.networkType != '4g') {
                wx.showToast({
                    title: '网络比较差',
                    duration: 2000,
                })
            }
        })
    },

    onShow(options) {
        this.show(options)
    },
    onHide() {
        this.hide()
    },
    onError(msg) {
        console.log(msg)
    },
})