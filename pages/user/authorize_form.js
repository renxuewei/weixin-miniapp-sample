// shared/pages/authorize_form.js
var app = getApp()
Page({
    data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
    },
    onUnload: function() {
        app.onfire.off('authorized')
    },
    get_user_info: function(e) {
        if (!e.detail.userInfo) {
            wx.showToast({
                title: '已取消授权',
            })
            return
        }
        wx.login({
            success: function(result) {
                wx.navigateBack({})
                e.detail.userInfo.code = result.code
                app.onfire.fire('authorized', e.detail.userInfo)
            },
        })
    },
})