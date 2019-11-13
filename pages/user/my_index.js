// my_index.js
var base = require('../../_libs/base.js')
var util = require('../../_libs/util.js')
var http = require('../../_libs/http.js')
var pagex = require('../../_libs/pagex.js')
const app = getApp()

pagex.extend(Page, {
    Class: 'tab',
    data: {
        login: null,
		version: app.version,
    },

    onInit: function(options) {
        var _page = this
        options.success = function() {
            _page.initTabs()
            _page.refresh()

            _page.setData({
				hasUpdate: app.hasUpdate
            })
        }
    },

    onShow: function() {
        this.setData({
			login: app.getLogin()
        })
    },

    clear_storage_data: function(e) {
        base.showLoading({
            title: '正在处理',
        }, function(cb) {
			app.cacheService.clear()
            cb && cb()
            base.showToast({
                title: '已清除',
                duration: 2000,
            })
        })
    },

    redirect_myform: function(e) {
        wx.navigateTo({
            url: 'my_form',
        })
    },
	
    scan_code: function(e) {

        wx.scanCode({
            success: (res) => {
                console.debug(res)
                try {
                    var content = JSON.parse(res.result);
                    if (content && content.code_type == "WIT") {
                        wx.navigateTo({
                            url: 'pc_signin_confirm?s=' + content.s + '&t=' + content.t,
                        })
                        return
                    }
                } catch (ex) {
                    console.error(ex)
                }

                wx.showModal({
                    title: '提示',
                    content: '暂不支持的二维码内容，请核对二维码。',
                    showCancel: false,
                })
            }
        })
    },

    check_upgrade: function(e) {
		app.update()
    },
})