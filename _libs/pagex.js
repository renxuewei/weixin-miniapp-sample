var base = require('base.js')
var util = require('util.js')
var http = require('http.js')
var app = getApp()

// 规范1：wxml文件里bind的事件名称规范：do_action
// 规范2：js文件里自定义函数名称规范：doAction
// 规范3: 列表文件名称：entity_list, 表单文件名称: entity_form

// TypePage override from TypePage
var __override__ = function(bso, opt) {
    if (bso.handlers) {
        if (!opt.handlers) opt.handlers = {}
        for (var key in bso.handlers) {
            opt[key] = opt.handlers[key] || bso.handlers[key]
        }
    }
    if (bso.properties) {
        if (!opt.data) opt.data = {}
        if (!opt.properties) opt.properties = {}
        for (var key in bso.properties) {
            opt.data[key] = opt.properties[key] || bso.properties[key]
        }
    }
    opt.base = bso
    return opt
}
// Page extend from TypePage
var __extend__ = function(bso, opt) {
    for (var p in bso) {
        if (opt[p] === undefined &&
            p != 'handlers' &&
            p != 'properties' &&
            p != 'identifier' &&
            p != 'base') opt[p] = bso[p]
    }
    for (var key in (bso.handlers || [])) {
        if (opt[key] === undefined) opt[key] = bso.handlers[key]
    }
    for (var key in (bso.properties || [])) {
        if (opt.data[key] === undefined) opt.data[key] = bso.properties[key]
    }
    opt.base = bso
    return opt
}

/// onLoad->[onAuth->onInit]->onShow->onReady
/// onAuth: check login status
/// onInit:
///		skip: do not check login status
///		success: callback executed when auth check passed
var TypePage = function() {
    var __base__ = {
        identifier: '__base__',
        properties: {},
        handlers: {
            onAuth: function(options) {
                if (options && options.skip) return
                console.debug(`对页面进行身份验证`)
                if (this.onInit) this.onInit(options)
                if (!app.getLogin) console.error("login module not defined!")
                var login = app.getLogin()
                if (login) {
                    console.debug(`页面身份验证通过`)
                    this.setData({
                        login: login
                    })
                    options.success && options.success()
                    return
                }
                console.debug(`向服务器请求身份验证`)
                if (!options) options = {}
                options.returnUrl = `/${this.route}`
                if (app.signIn) app.signIn(options)
            },
            onShow: function() {
                var page = this
                var sw = app.systemInfo
                if (sw) {
                    page.setData({
                        windowWidth: sw.windowWidth,
                        windowHeight: sw.windowHeight
                    });
                }
            }
        },
    }

    return {
        register: function(options) {
            if (!options) {
                console.error('register:Options is undefined.')
                return
            }
            if (!options.identifier) {
                console.error('register:identifier not specified.')
                return
            }
            if (this[options.identifier]) {
                console.error('register:identifier is already registered.')
                return
            }
            if (options.inherit && options.inherit != '__base__') options = __override__(this[options.inherit], options) // inherit inherit
            this[options.identifier] = __override__(__base__, options) // inherit base
        }
    }
}()

// properties配置优先级： 页面参数（query）>页面配置（opt）>默认（defaults）
// onload->onauth->oninit->onafterload
TypePage.register({
    identifier: 'list',

    properties: {
        tabs: [],
        activeTabIndex: 0,
        datalist: [], // 主数据列表,
        lazyLoad: false, // 默认正常加载分页数据，true表示页面打开时不加载分页数据
        //background: false, // 不出现加载效果
        //useLoading: true,
    },

    handlers: {
        onLoad: function(options) {
            var page = this
            page.pagenite = page.selectComponent('#pagenite')
            page.pagenite.setData({
                tabs: page.data.tabs
            })

            page.onAuth(options)

            if (!app.getLogin() || app.getLogin().Locked) {
                app.redirectHome()
                return
            }

            // load first page on load
            if (!page.data.lazyLoad) page.pagenite.first()
            if (page.onAfterLoad) page.onAfterLoad(options)

            if (options) page.setData(options)
        },
        onShow: function() {
            this.pagenite && this.pagenite.refreshCount()
        },
        // 下拉刷新首页
        onPullDownRefresh: function() {
            if (!this.pagenite || this.pagenite.data.hidden === true) return
            this.pagenite.first()
            if (wx.stopPullDownRefresh) wx.stopPullDownRefresh()
        },
        // 上拉追加新页
        onReachBottom: function() {
            if (!this.pagenite || this.pagenite.data.hidden === true) return
            this.pagenite.next()
        },
        //@pagenite event
        onTabChanged: function(e) {
            this.setData({
                activeTabIndex: e.detail.activeTabIndex
            })
        },
        //@pagenite event
        onSearch: function(e) {
            console.debug('onSearch', e)
        },
        //@pagenite event
        onFilterChanged: function(e) {
            console.debug('onFilterChanged', e)
        },
        //@pagenite event
        onAdvanceShown: function(e) {
            console.debug('onAdvanceShown', e)
        },
        //@pagenite event
        onPaging: function(e) {
            console.debug('onPaging', e)
        },
        //@pagenite event
        onPreDataLoad: function(e) {
            console.debug('onPreDataLoad', e)
        },
        //@pagenite event
        onDataLoading: function(e) {
            console.debug('onDataLoading')
        },
        //@pagenite event
        onDataLoaded: function(e) {
            console.debug('onDataLoaded')
            this.setData({
                datalist: this.pagenite.data.datalist
            })
        },
        onShowItemMenu: function(e) {
            console.debug('onShowItemMenu')
        },
        // 设置查询条件
        setFilter: function(filter, flush) {
            this.pagenite.filter(filter, flush)
        },
        // 重新绑定全部数据
        update: function() {
            this.setData({
                datalist: this.data.datalist
            })
        },
    },
})

TypePage.register({
    identifier: 'form',
    properties: {},
    handlers: {
        onLoad: function(options) {
            //注意： 确保 confirm_dialog 不被wx:if逻辑过滤掉的（不会渲染DOM对象）
            this.onAuth(options)
        },
        /// 绑定到form的bindsubmit事件
        submit_request: function(e) {
            var _page = this

            if (!e.detail) console.warn("可能没有定义form元素")
            else if (!e.detail.formId) console.warn("可能没有定义form的bindsubmit事件")
            else console.debug(`formId: ${e.detail.formId}`)

            _page.confirm_dialog = _page.selectComponent('#confirm_dialog');

            e.valid = true // valid by default
            if (_page.onValidate) _page.onValidate(e)
            if (!e.valid) return

            var opt = _page.onBeforeSubmit ? _page.onBeforeSubmit(e) : {}
            if (opt.confirm === true) {
                _page.confirm_dialog.onConfirm(e)
                return
            }
            _page.confirm_dialog.show(opt)
        },
    },
})

TypePage.register({
    identifier: 'tab',
    properties: {
        tabs: {
            "selectedColor": "#00C1DE",
            "backgroundColor": "#fff",
            "list": [
                {
                    "pagePath": "pages/index/index",
                    "text": "工作",
                    "iconPath": "resources/icon-desktop-default.png",
                    "selectedIconPath": "resources/icon-desktop-active.png",
                    selected: true,
                    badge_totals: 0,
                },
                {
					"pagePath": "pages/user/my_index",
                    "text": "我的",
                    "iconPath": "resources/icon-my-default.png",
                    "selectedIconPath": "resources/icon-my-active.png",
                    selected: false,
                    badge_totals: 0,
                }
            ]
        }
    },
    handlers: {
        initTabs: function() {
            var page = this
            var pages = getCurrentPages();
            page.data.tabs.list.find(t => {
                t.selected = (t.pagePath == pages[pages.length - 1].route)
            })
        },

        onLoad: function(options) {
            var page = this
            this.onAuth(options)
            if (page.onAfterLoad) page.onAfterLoad(options)
        },

        switch_footer_tab: function(e) {
            this.setActiveFooterTab(e.currentTarget.dataset.idx)
        },
        setActiveFooterTab: function(index) {
            var page = this
            var tab = page.data.footer_tabs.list[index]
            if (tab.selected) return

            page.data.tabs.list.forEach(t => t.selected = false)
            tab.selected = true

            wx.redirectTo({
                url: '/' + tab.pagePath,
            })
        },

        refresh: function(cb) {
            var page = this
            var login = getApp().getLogin()
            if (!login || !login.OpenId) {
                console.debug("匿名访问工作台")
                cb && cb()
                return
            }
            console.debug("正在加载工作界面")
			cb && cb()
        }
    }
})

// 接口
module.exports = {
    extend: function(page, options) {
        if (!options) {
            console.warn('extend:Options is undefined.')
            page && page({})
        }
        if (!options.Class) {
            console.warn('extend:Class not specified.')
            page && page({})
        }

        if (options.Class) options = __extend__(TypePage[options.Class], options)
        page && page(options)
    },
    register: function(options) {
        TypePage.register(options)
    }
}