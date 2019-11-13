var base = require('base.js')

const __LIST_PREFIX__ = '_DictDataQueue_'
const __EXPIRE_TIME__ = 7200

var __key__ = function(key) {
    let app = getApp() //set app as needed
    if (!app || !app.getLogin) return key
    let login = app.getLogin()
    if (!login || !login.ActiveEntity) return key
    return `${key}_${login.ActiveEntity.Id}`
}

var cacheService = function() {

    var __list__ = function() {
        return wx.getStorageSync(__LIST_PREFIX__) || []
    }
    var __reset__ = function(list) {
        wx.setStorageSync(__LIST_PREFIX__, list)
    }
    var __remove__ = function(key) {
        wx.removeStorageSync(key)
        var list = __list__()
        list.remove(list.find(item => item.k == key))
        __reset__(list)
        return list
    }

    var __exp__ = function(item, ver) {
        return (new Date() - new Date(item.t)) / 1000 > item.e || item.v != ver
    }
    var __item__ = function(key, val) {
        var list = __list__()
        var exist = list.find(item => item.k == key)
        return exist || val
    }
    return {
        name: 'cacheService',
        version: '1.2.1.11',

        _get: function(key, val) {
            let that = this
            let result = val

            var exist = __item__(key, val)
            if (!exist) return val

            if (__exp__(exist, that.version)) {
                __remove__(key)
            } else {
                result = wx.getStorageSync(key)
            }
            return result
        },

        get: function(key, val) {
            return this._get(__key__(key), val)
        },

        _set: function(key, val, expire) {
            let that = this
            let list = null
            if (__item__(key))
                list = __remove__(key)
            else
                list = __list__()

            list.push({
                k: key,
                e: expire || __EXPIRE_TIME__,
                t: new Date(),
                v: that.version
            })
            __reset__(list)
            wx.setStorageSync(key, val)
        },

        set: function(key, val, expire) {
            this._set(__key__(key), val, expire)
        },
        remove: function(key) {
            __remove__(__key__(key))
        },
        clear: function() {
            __list__().forEach(item => wx.removeStorageSync(item.k))
            __reset__([])
        },
        init: function(opt) {
            let that = this
            __list__()
                .filter(item => __exp__(item, that.version))
                .forEach(item => __remove__(item.k))
        }
    }
}()

var messageService = {
    name: 'messageService',
    version: '1.0',
    queue: [],
    events: {},

    init: function(opt) {
        var svc = this
        opt = opt || {}
        svc.url = opt.url || 'ws://localhost:8766/'

        wx.onSocketError(function(res) {
            console.debug(`WS服务发生错误:${res.errMsg}`)
            svc.status = 'fail'
        })
        wx.onSocketClose(function() {
            console.debug(`WS服务已关闭`)
            svc.status = 'closed'
        })
        wx.onSocketOpen(function() {
            console.debug(`WS服务已打开`)
            svc.status = 'opened'
            svc.queue.forEach(arg => svc.onPush(arg))
            svc.queue = []
        })
        wx.onSocketMessage(function(res) {
            var result = JSON.parse(res.data)
            console.debug(`接收到${result.msgid}的WS服务消息`)
            var handler = svc.events[result.msgid]
            if (handler) {
                handler(result)
                handler = null
            }
        })
    },

    send: function(arg) {
        this.onPush(arg)
    },

    onConnect: function() {
        var svc = this
        if (svc.status == 'opened' || svc.status == 'connecting') return

        svc.status = 'connecting'
        console.log('正在连接WS服务...')
        wx.connectSocket({
            url: svc.url,
            header: {
                'content-type': 'application/json'
            },
        })
    },

    onPush: function(arg) {
        var svc = this
        if (!arg) return
        if (svc.status != 'opened') {
            if (!svc.queue.find(m => m.msgid == arg.msgid)) svc.queue.push(arg)
            svc.onConnect()
            return
        }
        console.log('正在发送数据给WS服务接口...')
        wx.sendSocketMessage({
            data: JSON.stringify({
                msgid: arg.msgid,
                content: arg.data || {}
            }),
            success: function() {
                svc.events[arg.msgid] = arg.handler
            }
        })
    },
}


module.exports = {
    services: [
        cacheService,
        messageService,
    ]
}