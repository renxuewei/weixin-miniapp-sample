// my_form.js
var app = getApp()
var base = require('../../_libs/base.js')
var http = require('../../_libs/http.js')
var pagex = require('../../_libs/pagex.js')

pagex.extend(Page, {

    Class: 'form',
    data: {},

    onLoad: function(options) {
        this.setData({
            login: getApp().getLogin()
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

    onBeforeSubmit: function() {
        var _page = this
        return {
            texts: [{
                    name: '姓名',
                    text: _page.data.login.FullName
                },
                {
                    name: '手机号',
                    text: _page.data.login.Mobile
                },
                {
                    name: '邮箱',
                    text: _page.data.login.Email
                },
            ]
        }
    },

    onValidate: function(e) {
        var _page = this
        if (!_page._checkMobile() || !_page._checkEmail() || !_page._checkFullName()) {
            e.valid = false
        }
    },

    continue_submit(e) {
        if (!e.detail.confirm) return
        var _page = this
        var postData = {
            Id: _page.data.login.Id,
            Mobile: _page.data.login.Mobile,
            Email: _page.data.login.Email,
            FullName: _page.data.login.FullName,
            NickName: _page.data.userInfo.nickName,
            HeadImg: _page.data.userInfo.avatarUrl,
        }
        http.post({
            url: 'user/update?formId=' + e.detail.formId,
            data: postData,
            success: function(res) {
                var login = getApp().getLogin()
                base.copy(postData, login)
                wx.navigateBack({})
            }
        })
    },
    redirect_invite_user: function(e) {
        wx.redirectTo({
            url: 'invite_user',
        })
    },

    type_fullname: function(e) {
        this.data.login.FullName = e.detail.value
        this._checkFullName()
    },
    _checkFullName: function() {
		var invalid = !this.data.login.FullName || this.data.login.FullName.length < 2//TODO: use regx
        this.setData({
            fullname_invalid: invalid
        })
        return !invalid
    },
    type_mobile: function(e) {
		this.data.login.Mobile = e.detail.value
        this._checkMobile()
    },
    _checkMobile: function() {
		var invalid = !this.data.login.Mobile || this.data.login.Mobile.length < 11//TODO: use regx
        this.setData({
            mobile_invalid: invalid
        })
        return !invalid
    },
    type_email: function(e) {
		this.data.login.Email = e.detail.value
        this._checkEmail()
    },
    _checkEmail: function() {
		var invalid = !this.data.login.Email || this.data.login.Email.length < 5//TODO: use regx
        this.setData({
            email_invalid: invalid
        })
        return !invalid
    },
})