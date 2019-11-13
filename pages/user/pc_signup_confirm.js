// pc_signup_confirm.js
var http = require('../../_libs/http.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        is_valid_code: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _page = this
        _page.setData(getApp().getLogin())

        if (!options.code) { // public key
            wx.navigateBack({})
        }
        else {
            http.post({
                url: 'user/checksigninqrcode',
                data: { publickey: options.code },
                success: function (res) {
                    if (res.data.error_code == 0) {
                        _page.setData({ is_valid_code: true, code: res.data.code }) // private key
                    }
                },
            })
        }
    },

    login_confirm: function (e) {
        http.post({
            url: 'user/signinwithqrcode',
            data: { privatekey: this.data.code },// private key
            success: function (res) {
                if (res.data.error_code == 0) {
                    wx.navigateBack({})
                }
            },
        })
    },

    login_cancel: function (e) {
        wx.navigateBack({})
    },

})