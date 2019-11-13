var base = require('./base.js')
var svcs = require('./svcs.js')
var http = require('./http.js')
var onfire = require('./onfire.js')
let um = wx.getUpdateManager()

var _app = {
    version: '3.5.2.361',

    init: function(app) {
        base.copy(this, app)
        app.use('cacheService').init()
        app.use('messageService').init({
            url: base.wsroot,
        })
        app.onfire = new onfire.default()
        app.onfire.un = app.onfire.off // 

        wx.getSystemInfo({
            success: function(res) {
                app.systemInfo = res
            },
        })

        return app
    },

    use: function(serviceName) {
        var _p = this[serviceName]
        if (!_p) {
            _p = svcs.services.find(p => p.name == serviceName)
            this[serviceName] = _p
        }
        return _p
    },

    update: function() {
        if (this.hasUpdate) {
            wx.clearStorage()
            um.applyUpdate()
            wx.showToast({
                title: '已更新',
            })
        }
    },

    show: function(options) {
        let that = this
        console.log(`检测是否有更新...`)
        um.onCheckForUpdate(function(res) {
            that.hasUpdate = res.hasUpdate
            console.log(`${res.hasUpdate ? "有新版" : "无新版"}`)
        })

        um.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        that.update()
                    }
                }
            })
        })
    },

    hide: function() {
        //nothing to do
    },

    redirectAuth: function(cb) {
        let that = this
        that.onfire.once('authorized', function(userInfo) {
            cb && cb(userInfo)
        })
        wx.navigateTo({
            url: `/pages/user/authorize_form`,
        })
    },

    redirectHome: function() {
        wx.redirectTo({
            url: '/pages/index/index',
        })
    },
    redirectRegister: function(openId) {
        wx.redirectTo({
			url: `/pages/user/register_form?openId=${openId}`
        })
    },

    getLogin: function() {
        if (this.login == undefined) {
            this.login = getApp().cacheService._get('__CURRENT_LOGIN__')
        }
        return this.login
    },

    setLogin: function(login, success) {
        if (!login) {
            console.error('缺少登录信息')
            return
        }
        login.DisplayName = login.Status == 2 ? login.FullName : login.NickName

        this.login = login
        if (login.Status == 2) getApp().cacheService._set('__CURRENT_LOGIN__', login, 7200)

        this.sessionKey = login.SessionKey

        if (success) {
            success()
            return
        }
        this.redirectHome()
    },

    setAsDefaultEntity: function() {
        wx.setStorageSync('__DEFAULT_ENTITY__', this.login.ActiveEntity.Id)
    },

    signIn: function(options) {
        var opt = options || {}
        let activeEntityId = opt.activeEntityId || wx.getStorageSync('__DEFAULT_ENTITY__') || 0
        wx.login({
            success: function(result) {
                http.post({
                    url: `user/login?code=${result.code}&activeEntityId=${activeEntityId}`,
                    success: function(res) {
                        _signIn(res.data, opt)
                    },
                    fail: opt.fail
                })
            },
            fail: opt.fail,
        })
    },

    switchEntity: function(options) {
        var opt = options || {}
        let login = this.getLogin()
        if (!login) {
            opt.fail && opt.fail()
            return
        }
        http.post({
            url: `user/switchEntity?activeEntityId=${opt.activeEntityId || -1}&impersonate=${login.IsImpersonated}&impersonatedId=${login.IsImpersonated===true ? login.Id : 0 }`,
            success: function(res) {
                _signIn(res.data, opt)
            },
            fail: opt.fail
        })
    },
}

function _signIn(data, opt) {
    let app = getApp()
    var cb = opt.success || function() {
        if (opt.returnUrl) wx.redirectTo({
            url: opt.returnUrl,
        })
        else app.redirectHome()
    }
    if (data.error_code == 0) {
        if (!data.data || data.data.Status <= 1) {
            app.redirectRegister()
            return
        }
        app.setLogin(data.data, cb)
        return
    }
    opt.fail && opt.fail()
}

module.exports = {
    init: function(app) {
        _app.init(app)
    }
}