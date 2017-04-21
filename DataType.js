var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LispExecute;
(function (LispExecute) {
    /**
     * 基本数据类型：表
     * 此表为通用表 特殊表可以有自己专属的方法 供装饰内部符号使用
     */
    var Table = (function () {
        function Table() {
            //childs默认为空 即此表为空表 所有特殊表都为空表
            this.childs = [];
            //此为表类型标注 正常表为normal
            //特殊表为自定义
            this.type = "normal";
            /**
             * 此为在内环境中找不到符号引用时对外请求搜索的回调函数
             */
            this.onSearchSymbol = null;
        }
        Table.prototype.Empty = function () {
            return this.childs.length == 0;
        };
        Object.defineProperty(Table.prototype, "Type", {
            get: function () {
                return this.type;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 计算这个表 特殊表直接返回自己或者进行内部操作后返回一个表
         * 复合表会计算后返回
         */
        Table.prototype.Calculate = function (circum) {
            if (this.childs == null || this.childs.length == 0)
                return this;
            //得到第一个子表 此表必须是一个符号引用
            var sym = this.childs[0];
            if (sym.type != "symbol") {
                throw "计算错误，计算表第一个元素必须是符号引用";
            }
            var name = sym.name;
            //得到符号引用 找到符号实体 调用符号实体的Call
            var func = circum.has(name) ? circum.get(name) : this.onSearchSymbol(name);
            func.Call(this.childs.slice(1, this.childs.length));
        };
        return Table;
    }());
    LispExecute.Table = Table;
    /**
     * 特殊表：数值
     */
    var LispNumber = (function (_super) {
        __extends(LispNumber, _super);
        function LispNumber(value) {
            var _this = _super.call(this) || this;
            _this.value = value;
            _this.type = "number";
            return _this;
        }
        return LispNumber;
    }(Table));
    LispExecute.LispNumber = LispNumber;
    /**
     * 特殊表：字符串
     */
    var LispString = (function (_super) {
        __extends(LispString, _super);
        function LispString(value) {
            var _this = _super.call(this) || this;
            _this.value = value;
            _this.type = "string";
            return _this;
        }
        return LispString;
    }(Table));
    LispExecute.LispString = LispString;
    /**
     * 符号引用
     */
    var LispSymbolRefence = (function (_super) {
        __extends(LispSymbolRefence, _super);
        function LispSymbolRefence(name) {
            var _this = _super.call(this) || this;
            _this.name = name;
            _this.type = "symbol";
            return _this;
        }
        return LispSymbolRefence;
    }(Table));
    LispExecute.LispSymbolRefence = LispSymbolRefence;
    /**
     * 符号实体
     * 符号有符号名和符号计算两个方法
     * 这里的符号指的是符号的实体 而非引用
     */
    var LispSymbol = (function () {
        function LispSymbol(key, names, tar) {
            this.Key = null;
            this.Target = null;
            this.Names = null;
            this.Key = key;
            this.Target = tar;
            this.Names = names;
        }
        /**
         * 调用这个符号
         * 使用传入的参数数组根据参数名数组
         * @param pars 参数数组 也可以无参数
         */
        LispSymbol.prototype.Call = function (pars) {
            if (pars != null && pars.length == this.Names.length) {
                //有参数调用
            }
            else if ((pars == null || pars.length == 0) && this.Names == null) {
                //无参数调用
            }
        };
        return LispSymbol;
    }());
    LispExecute.LispSymbol = LispSymbol;
    /**
     * 特殊表：预定义符号实体
     */
    var LispPreSymbol = (function (_super) {
        __extends(LispPreSymbol, _super);
        function LispPreSymbol(key, names) {
            return _super.call(this, key, names, null) || this;
        }
        return LispPreSymbol;
    }(LispSymbol));
    LispExecute.LispPreSymbol = LispPreSymbol;
})(LispExecute || (LispExecute = {}));
