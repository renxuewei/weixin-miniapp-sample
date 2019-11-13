var base = require("base.js")

function api(route) {
    var url = /(http|ftp|https):\/\/([\w.]+\/?)\S*/.test(route) ? route : base.apiroot + route
    if (url.indexOf('user/login?code=') >= 0) return url

    var login = getApp().getLogin()
    //if (login.Locked == true) return null

    var session_key = "123"; // use 123 for debug mode
    if (login && login.SessionKey && login.SessionKey.length > 20) session_key = login.SessionKey

    url += (route.indexOf('?') > 0) ? "&" : "?";
    url += 'session_key=' + session_key
    return url
}

function post(option) {
    option.method = option.method || 'POST'
    option.header = {
        'content-type': 'application/json'
    }
    request(option)
}

function request(option) {

    if (wx.showNavigationBarLoading) wx.showNavigationBarLoading()
    if (!option.background && option.useLoading !== false) {
        if (wx.showLoading) { // 6.5.6
            wx.showLoading({
                title: "正在处理...",
                mask: true
            })
        }
    }

    var that = this
    var opt = {}

    opt.url = api(option.url)
    if (!opt.url) return //nothing todo

    if (option.pageIndex) opt.url += '&pageIndex=' + option.pageIndex
    if (option.pageSize) opt.url += '&pageSize=' + option.pageSize

    opt.data = option.data || {}
    opt.method = option.method || 'GET'
    opt.header = option.header || option.header || {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
    }

    var requestKey = JSON.stringify(opt)
    var app = getApp()
    if (!Array.isArray(app.__request_queue__)) app.__request_queue__ = []
    var requestQueue = app.__request_queue__

    // 给串行请求加锁避免重复提交数据
    if (!opt.skiplock) {
        if (requestQueue.includes(requestKey)) {
            console.debug("repeat request")
            return
        }
        requestQueue.push(requestKey)
    }

    var handlers = {
        success: function(res) {
            if (option.useLoading !== false && wx.hideLoading) wx.hideLoading()
            if (wx.hideNavigationBarLoading) wx.hideNavigationBarLoading()

            // 服务接口调用失败
            if (res.statusCode != 200) {
                console.error(res)
                if (option.fail) option.fail(res)
                wx.showToast({
                    title: "服务暂不可用-" + res.statusCode,
                    icon: 'loading',
                    duration: 3000
                })
            } else {

                if (res.data.error_code == 0 && option.approve) {
                    wx.showModal({
                        title: '提示',
                        content: '提交成功，请等待钉钉审批结果。',
                        showCancel: false
                    })
                }

                if (option.success) {
                    if (!option.success(res) && res.data.error_code != 0) {
                        wx.showToast({
                            title: res.data.err_message,
                            icon: 'loading',
                            duration: 3000
                        })
                    }
                }
            }
        },
        fail: function(res) {
            if (option.useLoading !== false && wx.hideLoading) wx.hideLoading()
            console.error(res)
            if (option.fail) option.fail(res)

            if (wx.hideNavigationBarLoading) wx.hideNavigationBarLoading()
            wx.showToast({
                title: '出现错误',
                icon: 'loading',
                duration: 2000
            })
        },
        complete: function() {
            if (requestQueue.includes(requestKey)) requestQueue.remove(requestKey)
        }
    }
    if (app.systemInfo) opt.header.__userenv__ = base.encode(JSON.stringify(app.systemInfo))
    if (app.sessionKey) opt.header.sid = app.sessionKey

    console.debug(opt)
    base.copy(handlers, opt)
    wx.request(opt) // request via wx

}


// 实用接口
module.exports = {
    post: post,
    request: request,
}