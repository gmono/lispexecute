var LispExecute;
(function (LispExecute) {
    /**
     * 提供顶层环境和外部接口
     */
    var Lisp = (function () {
        function Lisp(initstate) {
            this.TopContainer = new Map();
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
        Lisp.prototype.SetSymbol = function (sym) {
            this.TopContainer.set(sym.key, this.ToTable(sym));
        };
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        Lisp.prototype.GetSymbol = function (name) {
            if (!this.TopContainer.has(name))
                return null;
            var obj = this.TopContainer.get(name);
            return this.ToRaw(obj);
        };
        Lisp.prototype.ToRaw = function (obj) {
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
        Lisp.prototype.ToTable = function (sym) {
            //如果val是object就转换为Table
            if (sym.val instanceof LispExecute.Table) {
                //如果是表就直接加入 否则封装为LispObject
                return sym.val;
            }
            else if (typeof sym.val == "function") {
                //封装函数
                var fun = sym.val;
                var func = new LispExecute.LispRawProcess(fun.name, fun, sym.isneedcircum, sym.callthis);
                return func;
            }
            else {
                var lobj = new LispExecute.LispObject(sym.val);
                return lobj;
            }
        };
        Lisp.prototype.Run = function (obj) {
            var _this = this;
            var func = function (name, val) {
                if (val == null)
                    return _this.TopContainer.has(name) ? _this.TopContainer.get(name) : null;
                _this.TopContainer.set(name, val);
            };
            var ret = obj.Calculate(func);
            return this.ToRaw(ret);
        };
        return Lisp;
    }());
    LispExecute.Lisp = Lisp;
})(LispExecute || (LispExecute = {}));
