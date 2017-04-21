var LispExecute;
(function (LispExecute) {
    /**
     * 提供顶层环境和外部接口
     */
    var Lisp = (function () {
        function Lisp(initstate) {
            this.TopContainer = new Map();
            //先加入预定义符号 加减乘除等
            this.AddPreSymbols();
            if (initstate != null)
                for (var _i = 0, initstate_1 = initstate; _i < initstate_1.length; _i++) {
                    var t = initstate_1[_i];
                    this.SetSymbol(t);
                }
        }
        Lisp.prototype.AddPreSymbols = function () {
            this.SetSymbol({ key: '+', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var sum = typeof args[0] == "number" ? 0 : "";
                    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                        var t = args_1[_a];
                        sum += t;
                    }
                    return sum;
                } });
            //减法只能用于数字
            this.SetSymbol({ key: '-', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        sum -= t;
                    }
                    return sum;
                } });
            //乘法可以用于重复语义和数字
            this.SetSymbol({ key: '*', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var sum = typeof args[0] == "number" ? 0 : args[0];
                    //注意 第一个参数为字符串则整体为重复语义 数字则为乘法语义
                    if (typeof sum == "string") {
                        //重复语义
                        var nowblock = sum;
                        for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                            var a = _b[_a];
                            if (typeof a != "number")
                                throw new Error("错误！重复语义乘法除第一个参数外必须都为Number型!");
                            for (var i = 0; i < a; ++i) {
                                sum += nowblock;
                            }
                            nowblock = sum;
                        }
                    }
                    else if (typeof sum == "number") {
                        for (var _c = 0, _d = args.slice(1, args.length); _c < _d.length; _c++) {
                            var a = _d[_c];
                            sum *= a;
                        }
                    }
                    else
                        return null;
                    return sum;
                } });
            this.SetSymbol({ key: '/', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        sum /= t;
                    }
                    return sum;
                } });
            this.SetSymbol({ key: '>', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        sum /= t;
                    }
                    return sum;
                } });
        };
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
                var func = new LispExecute.LispRawProcess(fun.name, fun, sym.isneedcircum, sym.callthis, sym.isneedcal);
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
//# sourceMappingURL=LispExecute.js.map