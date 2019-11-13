// user_modules/pages/login_form.js

var http = require('../../_libs/http.js')
var pagex = require('../../_libs/pagex.js')
let app = getApp()

pagex.extend(Page, {
    Class: 'form',
    /**
     * 页面的初始数据
     */
    data: {

        uid: '',
        pwd: '',

        username_invalid: false,
        password_invalid: false,

        loading: false,

        error_message: '',
    },

    onLoad: function(options) {
        if (options.uid) {
            this.setData({
                _uid: options.uid,
                uid: options.uid,
            })
        }
        if (options.aid) this.setData({
            aid: options.aid
        })
    },

    onShow: function() {
        let that = this

        if (!that.data.userInfo) {
            app.redirectAuth(function(userInfo) {
                that.setData({
                    userInfo: userInfo
                })
            })
        }
    },

    signin: function(e) {
        var _page = this
        http.post({
            url: `user/loginbyid`,
            data: {
                //code: _page.data.userInfo.code,
                uid: _page.data.uid,
                pwd: _page.data.pwd,
            },
            success: function(res) {
                if (res.data.error_code != 0) {
                    _page.setData({
                        error_message: res.data.err_message
                    })
                    return
                }
                getApp().setLogin(res.data.data)
            }
        })
    },

    type_username: function(e) {
        this.data.uid = e.detail.value
        this._checkUserName()
    },

    _checkUserName: function() {
        var invalid = this.data.uid.length < 6
        this.setData({
            username_invalid: invalid
        })
        return !invalid
    },

    type_password: function(e) {
        this.data.pwd = e.detail.value
        this._checkPassword()
    },

    _checkPassword: function() {
        var invalid = this.data.pwd.length < 6
        this.setData({
            password_invalid: invalid
        })
        return !invalid
    },

})