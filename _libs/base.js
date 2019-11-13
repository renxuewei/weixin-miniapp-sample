var __base = 'http://localhost:8021/'
var __base__url = __base + 'api/'
var __base_ws = 'wss://ws.mstyles.com.cn/'

function __ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function(bit) {
            return (bit.toString(10))
        }
    )
    return hexArr;
}

function __ab2str(buf, def) {
    try {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
		
    } catch (ex) {
        return def
    }
}

function __str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function encode(str) {
    if (!str || str.length == 0) return ''
    return wx.arrayBufferToBase64(__str2ab(str))
}

function decode(str) {
    if (!str || str.length == 0) return ''
    return __ab2str(wx.base64ToArrayBuffer(str), str)
}

function _clone(src) {
    if (!src) return src
    var res = JSON.parse(JSON.stringify(src))
    return res
}

function _copy(src, des, res) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) des[key] = src[key]
    }
    if (res) _copy(res, des)
}

Array.prototype.remove = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            this.splice(i, 1)
            break
        }
    }
}
Array.prototype.removeAt = function(index) {
    this.splice(index, 1)
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function(item) {
        var exist = this.find(o => o === item)
        return typeof(exist) === 'object' && exist
    }
}

function _showLoading(opt, callback) {
    if (wx.showLoading) wx.showLoading(opt)
    callback && callback(function() {
        if (wx.hideLoading) wx.hideLoading()
    })
}

function _showToast(opt) {
    wx.showToast(opt)
}

module.exports = {
    domain: __base,
    apiroot: __base__url,
    wsroot: __base_ws,
    ab2hex: __ab2hex,
    encode: encode,
    decode: decode,
    clone: _clone,
    copy: _copy,
    showLoading: _showLoading,
    showToast: _showToast,
}