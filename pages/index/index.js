//index.js
//获取应用实例
var base = require('../../_libs/base.js')
var util = require('../../_libs/util.js')
var http = require('../../_libs/http.js')
var pagex = require('../../_libs/pagex.js')
var app = getApp()

const debug_modules = [
]

pagex.extend(Page, {
    Class: 'tab',
    data: {
        conn_timeout: false,
        desktop_display: false,
        entities_panel_display: false,
        totals: {},
        swiper_items: [],
        modules: [],
    },

    onInit: function(options) {
        var _page = this
        options.success = function() {
            _page.initTabs()
            _page._refresh()
        }

        options.fail = function() {
            _page._refresh()
        }
    },

    refresh_manually: function(e) {
        app.redirectHome()
    },

    _refresh: function() {
        var _page = this
        _page.setData({
            conn_timeout: false
        })
        setTimeout(function() {
            if (_page.desktop_display) return
            _page.setData({
                conn_timeout: true
            })
        }, 1000 * 20)

        _page.refresh(function(opt) {
            var login = app.getLogin()
            if (!login || login.IsGuest) return

            var isAdmin = login.Roles && login.Roles.indexOf('A') >= 0
            var modules = []
            var list = opt.Modules
            if (list) {
                list.forEach(function(item) {
                    if (!item.Deleted && !isAdmin && (!login.ActiveEntity || login.ActiveEntity.Status != 200)) return
                    modules.push(item)
                })
            }

            if (!login.ActiveEntity || login.ActiveEntity.Id == 0) modules.push(add_module) // '入驻' 入口

            _page.setData({
                login: login,
                modules: modules,
                desktop_display: true,
            })
        })
    },

    redirect_login_pass: function(e) {
        wx.navigateTo({
            url: '/user_modules/pages/login_form',
        })
    },

    refresh_status: function() {
        app.signIn()
    }
})