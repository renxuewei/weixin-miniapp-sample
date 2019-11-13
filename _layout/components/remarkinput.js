// _layout/components/remarkinput.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		title: { type: String, value: '文本' },
		texts: { type: String, value: '' },
		hidden: { type: Boolean, value: true },
		readonly: { type: Boolean, value: false },
	},

	data: {
		textsCount: 0,
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		setValue: function (val, display) {
			var value = val || ''
			this.setData({ hidden: !display, texts: value, textsCount: value.length })
		},

		onTextChange: function (e) {
			this.data.texts = e.detail.value
			this.setData({ textsCount: e.detail.value.length })
		},

		onConfirm: function (e) {
			this.triggerEvent('change', { value: this.data.texts }, {})
			this.setData({ hidden: true })
		},

		onCancel: function (e) {
			this.setData({ hidden: true })
		},
	}
})
