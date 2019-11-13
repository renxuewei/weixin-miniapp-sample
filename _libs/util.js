var base = require("base.js")
var http = require("http.js")

// 从缓存获取数据，如果没有就通过接口请求数据并做缓存
// options{key, url, data, success, expire, cachable}
function load(options) {
    var svc = getApp().cacheService
    var res = svc.get(options.key)
    if (res) {
        if (options.success) {
            options.success(res, true) 
            return
        }
    }
    if (options.url) {
        var opt = base.clone(options)
        opt.success = function(res) {
            if (options.cachable) svc.set(options.key, res, options.expire)
            if (options.success) options.success(res)
        }
        http.post(opt)
    }
}

function scanCode(cb) {
    wx.scanCode({
        scanType: ['barCode'],
        success: function(res) {
            if (res.scanType == 'QR_CODE' || res.scanType == 'DATA_MATRIX' || res.scanType == 'PDF_417' || res.scanType == 'WX_CODE') {
                wx.showToast({
                    title: '不是条码',
                })
                return
            }
            if (res.result) cb && cb(res.result)
        },
        fail: function(res) {
            console.log(res)
            wx.showToast({
                title: '扫码失败',
            })
        },
    })
}


// 实用接口
module.exports = {
    load: load,
    scanCode: scanCode
}