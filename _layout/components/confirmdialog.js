// _layout/components/confirmdialog.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: '确认以下信息无误后再提交',
        },
        hidden: {
            type: Boolean,
            value: true
        },
        texts: {
            type: Array,
            value: []
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        show: function(options) {
            var opt = options || {
                hidden: false
            }
            if (opt.hidden === undefined) opt.hidden = false
            this.setData(opt)
        },

        hide: function() {
            this.setData({
                hidden: true
            })
        },

        onConfirm: function(e) {
            this.hide()
            e.confirm = true
            this.triggerEvent('success', e, {})
        },

        onCancel: function(e) {
            this.hide()
            e.confirm = false
            this.triggerEvent('success', e, {})
        },
    }
})