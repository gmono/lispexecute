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
    var LinkContainer = (function (_super) {
        __extends(LinkContainer, _super);
        function LinkContainer(LinkObject) {
            if (LinkObject === void 0) { LinkObject = null; }
            var _this = _super.call(this) || this;
            _this.LinkObject = LinkObject;
            return _this;
        }
        LinkContainer.prototype.TrySearch = function (name) {
            var ret = _super.prototype.TrySearch.call(this, name);
            if (ret != undefined)
                return ret;
            if (this.LinkObject != null && name in this.LinkObject) {
                return new LispExecute.LispObject(this.LinkObject[name]);
            }
            return undefined;
        };
        return LinkContainer;
    }(LispExecute.Circumstance));
    LispExecute.LinkContainer = LinkContainer;
    /**
     * 提供顶层环境和外部接口
     */
    var Executer = (function () {
        function Executer(link, initstate) {
            if (link === void 0) { link = null; }
            //先加入预定义符号 加减乘除等
            this.TopContainer = new LinkContainer(link);
            this.AddPreSymbols();
            if (initstate != null)
                for (var _i = 0, initstate_1 = initstate; _i < initstate_1.length; _i++) {
                    var t = initstate_1[_i];
                    this.SetSymbol(t);
                }
        }
        /**
         * 设置一个符号 可以覆盖
         * @param sym 符号
         */
        Executer.prototype.SetSymbol = function (sym) {
            this.TopContainer.Set(sym.key, this.ToTable(sym));
        };
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        Executer.prototype.GetSymbol = function (name) {
            var obj = this.TopContainer.TrySearch(name);
            if (obj == undefined)
                return undefined;
            return this.ToRaw(obj);
        };
        Executer.prototype.ToRaw = function (obj) {
            if (obj.Type == "object") {
                var oobj = obj;
                return oobj.Object;
            }
            else if (obj instanceof LispExecute.LispRawProcess) {
                var fun = obj;
                return fun.rawFunc;
            }
            //不需要转换就直接返回
            return obj;
        };
        /**
         * 此处sympair中仅val和函数专属的属性有效key可以为null
         * @param sym 符号 key无用
         */
        Executer.prototype.ToTable = function (sym) {
            //如果val是object就转换为Table
            if (sym.val instanceof LispExecute.Table) {
                //如果是表就直接加入 否则封装为LispObject
                return sym.val;
            }
            else if (typeof sym.val == "function") {
                //封装函数
                var fun = sym.val;
                var func = new LispExecute.LispRawProcess(fun.name, fun, sym.isneedcircum, sym.callthis, sym.isneedcal, sym.isneedtrans);
                return func;
            }
            else {
                var lobj = new LispExecute.LispObject(sym.val);
                return lobj;
            }
        };
        /**
         *
         * @param obj 要计算的顶层表
         * @param link 要链接到的js顶层对象
         */
        Executer.prototype.Run = function (obj) {
            var ret = obj.Calculate(this.TopContainer);
            return this.ToRaw(ret);
        };
        return Executer;
    }());
    LispExecute.Executer = Executer;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=Execute.js.map