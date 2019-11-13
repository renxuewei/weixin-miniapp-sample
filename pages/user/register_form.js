// register_form.js
var util = require('../../_libs/util.js')
var http = require('../../_libs/http.js')
var base = require('../../_libs/base.js')
var pagex = require('../../_libs/pagex.js')
let app = getApp()

pagex.extend(Page, {
    Class: 'form',
    /**
     * 页面的初始数据
     */
    data: {
        Mobile: '',
        MobileCode: '',

        mobile_invalid: false,
        mobile_code_invalid: false,

        sumbit_disabled: true,
        loading: false,

        error_message: '',
    },

    onLoad: function(options) {
        base.copy(options, this.data)
    },

    onShow: function() {
        let that = this

        var login = app.getLogin()
        if (login && login.Status == 2) {
            app.redirectHome()
            return
        }
    },

    redirect_auth: function() {
        let that = this
        app.redirectAuth(function(userInfo) {
            that.setData({
                userInfo: userInfo
            })
        })
    },

    onBeforeSubmit: function() {
        return {
            hidden: true
        }
    },

    onValidate: function(e) {
        var _page = this
        if (!_page._checkMobile() || !_page._checkMobileCode()) {
            e.valid = false
            return
        }
        _page.confirm_dialog.triggerEvent('success', {
            confirm: true
        }, {})
    },

    continue_submit(e) {
        if (!e.detail.confirm) return

        var _page = this
        var userInfo = _page.data.userInfo
        http.post({
            url: `user/register?formId=${e.detail.formId}`,
            data: {
                Code: userInfo.code,
                NickName: userInfo.nickName,
                HeadImg: userInfo.avatarUrl,
                Mobile: _page.data.Mobile,
                MobileCode: _page.data.MobileCode,
                InviteCode: _page.data.invite_code,
                InvitedOn: _page.data.t,
                MPOpenId: _page.data.mpopenid,
                LegalEntityId: _page.data.eid,
            },
            success: function(res) {
                if (res.data.error_code != 0) {
                    _page.setData({
                        error_message: res.data.err_message
                    })
                    return
                }
                getApp().signIn()
            }
        })
    },

    onUnload: function() {
        var _page = this
        if (_page.data.idel) clearInterval(_page.data.idel)
    },

    refresh_login: function(e) {
        wx.clearStorageSync()
        wx.showToast({
            title: '正在刷新页面...',
        })
        app.redirectHome()
    },

    getmobilecode: function(e) {
        var _page = this
        _page.setData({
            error_message: ''
        })
        if (!_page._checkMobile()) return

        if (_page.data.expr > 0) return

        _page.setData({
            MobileCode: '',
            sumbit_disabled: true,
            loading: true,
            expr: 120
        })

        http.post({
            background: true,
            url: 'shared/getmobilecode',
            data: {
                mobile: _page.data.Mobile
            },
            success: function(res) {
                if (res.data.error_code != 0) _page.setData({
                    error_message: res.data.err_message,
                    expr: 0
                })
                _page.setData({
                    loading: false
                })
            },
        })

        _page.data.idel = setInterval(function() {
            if (_page.data.expr <= 0) {
                clearInterval(_page.data.idel)
                return
            }
            _page.setData({
                expr: --_page.data.expr
            })
        }, 1000)
    },

    type_mobile: function(e) {
        this.setData({
            Mobile: e.detail.value
        })
        this._checkMobile()
    },

    _checkMobile: function() {
        var invalid = !util.checkMobile(this.data.Mobile)
        this.setData({
            mobile_invalid: invalid
        })
        return !invalid
    },
    type_mobile_code: function(e) {
        this.setData({
            MobileCode: e.detail.value
        })
        this._checkMobileCode()
    },

    _checkMobileCode: function() {
        var invalid = this.data.MobileCode.length <= 3
        this.setData({
            mobile_code_invalid: invalid,
            sumbit_disabled: invalid
        })
        return !invalid
    },

})