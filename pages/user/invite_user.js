// invite_user.js
var base = require('../../_libs/base.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        invite_wxacode_url: '',
        invite_customer_id: 0,
        login: {},
        canIUse: wx.canIUse('button.open-type.share'),
    },

    onShareAppMessage: function() {
        return {
            title: 'Weixin Mini App',
            desc: '邀请注册',
            path: this.getRegisterPath()
        }
    },

    getRegisterPath: function() {
        var login = getApp().getLogin()
        let path = `/user_modules/pages/register_form?invite_code=${login.OpenId}&t=${Date.now()}`
        console.debug(path)
        return path
    },

    preview_qrcode: function(e) {
        wx.previewImage({
            urls: [this.getQrCodeUrl(600)]
        })
    },

    getQrCodeUrl: function(width) {
        var login = getApp().getLogin()
        //let url = `${base.apiroot}media/getregisterqrcode?session_key=${login.SessionKey}&width=${width || 300}`
        console.debug(url)
        return url
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            invite_wxacode_url: this.getQrCodeUrl(),
            login: getApp().getLogin()
        })
        this.data.invite_customer_id = options.id
    },
})