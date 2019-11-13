//_layout/components / pagenite.js
var base = require('../../_libs/base.js')
var util = require('../../_libs/util.js')
const app = getApp()

Component({
    /**
     * Component properties
     */
    properties: {
        datalist: {
            type: Array,
            value: []
        },
        pagesize: {
            type: Number,
            value: 10
        },
        nopaging: {
            type: Boolean,
            value: false
        },
        tabs: {
            type: Array,
            value: []
        },
        activeTabIndex: {
            type: Number,
            value: 0
        },
        hidden: {
            type: Boolean,
            value: false,
        },
        showtab: {
            type: Boolean,
            value: true,
        },
        // 显示搜索框
        showfilter: {
            type: Boolean,
            value: true,
        },
        // 显示高级搜索按钮
        showadvance: {
            type: Boolean,
            value: false,
        },
        headTop: {
            type: Number,
            value: 0
        },
        reloadontaptab: {
            type: Boolean,
            value: true,
        },
    },

    /**
     * Component initial data
     */
    data: {
        datalist: [],
        pageindex: 0,
        pageCount: 1, // Not unsupported
        keyword: '',
        filters: [],
        inputshown: false,
        advanceshown: false,
        showmoretip: true, // 默认显示下拉加载的提示
        norecord: false,
        reachtail: false, // 有更多分页数据?
        headTop: 0, // pixel fixed top of head
        bodyTop: 0, // pixel fixed top of body below head
        hidden: false,
        showtab: true,
        showfilter: true,
        showadvance: false,
    },

    attached: function() {
        let mt = 110 + parseInt(this.data.headTop)
        if (!this.data.showtab) mt -= 50
        if (!this.data.showfilter) mt -= 48
        this.setData({
            bodyTop: mt
        })
    },

    /**
     * Component methods
     */
    methods: {

        first: function() {
            this.go(0)
        },
        prev: function() {
            if (this.data.pageindex <= 0) return
            this.go(--this.data.pageindex)
        },
        go: function(index) {
            this.setData({
                pageindex: index
            })

            let arg = {
                pageindex: index
            }

            this.triggerEvent('pageing', arg)

            if (this.data.pageindex == 0) this.setData({
                datalist: []
            })

            let tab = this.data.tabs[this.data.activeTabIndex || 0]
            arg.filters = tab.filters || []
            arg.api = tab.api
            arg.pageindex = this.data.pageindex
            arg.pagesize = this.data.pagesize

            var sk = arg.filters.find(c => c.key == "keyword")
            if (sk) {
                sk.value = this.data.keyword
            } else {
                arg.filters.push({
                    key: 'keyword',
                    value: this.data.keyword
                })
            }

            tab.filters = arg.filters

            if (this.data.userfilters) {
                this.data.userfilters.forEach(f => {
                    var exist = arg.filters.find(e => e.key == f.key)
                    if (exist)
                        exist.value = f.value
                    else
                        arg.filters.push(f)
                })
            }

            this._request(arg)
        },
        next: function() {
            //if (this.data.pageindex >= this.data.pageCount - 1) return
            this.go(++this.data.pageindex)
        },
        last: function() {
            //this.go(this.data.pageCount - 1)
            console.debug('unsupported')
        },
        filter: function(item, flush) {
            if (!this.data.userfilters) this.data.userfilters = []
            var exist = this.data.userfilters.find(f => f.key == item.key)
            if (exist)
                exist.value = item.value
            else
                this.data.userfilters.push(item)
            if (flush) this.first()
        },
        append: function(items) {
            if (!this.data.datalist) this.data.datalist = []
            var records = items ? this.data.datalist.concat(items) : []

            this.triggerEvent('dataloading', items) // page records

            this.setData({
                datalist: records,
                norecord: !records || records.length == 0,
                reachtail: !items || items.length < this.data.pagesize
            })

            this.triggerEvent('dataloaded', records) // all records

            if (items) this.setData({
                showmoretip: !(this.data.pageindex > 0 && items.length < this.data.pagesize)
            })
        },
        activeTab: function(index) {
            if (index < this.data.tabs.length) {
                this.setData({
                    activeTabIndex: index,
                })
                this.triggerEvent('tabchanged', {
                    activeTabIndex: this.data.activeTabIndex
                })
                if (this.data.reloadontaptab === true) {
                    this.setData({
                        datalist: []
                    })
                    this.first()
                }
            }
        },

        refreshCount: function() {
            let ctrl = this
            ctrl.data.tabs.forEach(t => {
                if (!t.msgid) return
                app.messageService.send({
                    msgid: t.msgid,
                    data: {},
                    handler: function(res) {
                        t.recordsCount = res.recordsCount
                        ctrl.setData({
                            tabs: ctrl.data.tabs
                        })
                    }
                })
            })
        },

        _request: function(opt) {
            if (!opt) {
                console.error("options not specified!")
                return
            }
            if (!opt.api || opt.api.length == 0) {
                console.error("api not specified!")
                return
            }

            this.triggerEvent('predataload', opt)

            var _data = {}
            var _filters = opt.filters || []

            _filters.forEach(f => _data[f.key] = f.value)

            var that = this
            that.setData({
                norecord: false,
                reachtail: false,
                showmoretip: false,
            })
            util.load({
                key: base.encode(JSON.stringify(opt)),
                cachable: opt.cachable,
                url: opt.api,
                data: _data,
                pageIndex: opt.pageindex || 0,
                pageSize: opt.pagesize || 10,
                useLoading: opt.useLoading,
                background: opt.background,
                success: function(res) {
                    if (res.data.error_code == 0) that.append(res.data.data)
                },
                fail: function(res) {
                    console.error(res)
                },
            })
        },

        _onActiveTab: function(e) {
            this.activeTab(e.currentTarget.dataset.idx)
        },
        _onTypeing: function(e) {
            this.setData({
                keyword: e.detail.value
            })
        },
        _onClearInput: function(e) {
            this.setData({
                keyword: ''
            })
        },
        _onShowInput: function(e) {
            this.setData({
                inputshown: true
            })
        },
        _onHideInput: function(e) {
            this.setData({
                inputshown: false
            })
        },
        _onSearch: function(e) {
            this.triggerEvent('search', {
                keyword: this.data.keyword
            })
            this.first()
        },
        _onShowAdvance: function(e) {
            this.setData({
                advanceshown: !this.data.advanceshown
            })
            this.triggerEvent('advanceshown', {
                advanceshown: this.data.advanceshown
            })
        },
        _onNext: function() {
            this.next()
        },
    }
})