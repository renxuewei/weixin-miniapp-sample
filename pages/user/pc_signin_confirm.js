var http = require('../../_libs/http.js')
Page({
	data: {
		tips: '正在处理',
		is_valid_code: false,
	},

	onLoad: function (options) {
		var _page = this
		_page.setData({ postData: options, login: getApp().getLogin() })
		http.post({
			url: 'user/checkqrcodesigninticket',
			data: _page.data.postData,
			success: function (res) {
				if (res.data.error_code == 0) {
					_page.setData({ is_valid_code: true, tips: '确定以登录管理后台' })
				}
			}
		})
	},

	login_confirm: function (e) {
		http.post({
			url: 'user/confirmqrcodetosignin',
			data: this.data.postData,
			success: function (res) {
				wx.navigateBack({})
			}
		})
	},

	login_cancel: function (e) {
		wx.navigateBack({})
	},
})