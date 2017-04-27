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
    var LispExecuter = (function (_super) {
        __extends(LispExecuter, _super);
        function LispExecuter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //此处约定
        //非普通js函数语义的 一律不使用提前计算参数和
        //但是可以使用转化标记
        LispExecuter.prototype.AddPreSymbols = function () {
            this.SetSymbol({ key: '+', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (typeof args[0] != "number" && typeof args[0] != "string")
                        throw new Error("错误！运算对象类型错误！");
                    var sum = typeof args[0] == "number" ? 0 : "";
                    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                        var t = args_1[_a];
                        if (typeof t != "number" && typeof t != "string")
                            throw new Error("错误！运算对象类型错误！");
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
                    if (typeof args[0] != "number")
                        throw new Error("错误！运算对象类型错误！");
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (typeof args[0] != "number")
                            throw new Error("错误！运算对象类型错误！");
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
                    var sum = args[0];
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
                        throw new Error("错误！运算对象类型错误！");
                    ;
                    return sum;
                } });
            this.SetSymbol({ key: '/', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (typeof args[0] != "number")
                        throw new Error("错误！运算对象类型错误！");
                    var sum = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (typeof args[0] != "number")
                            throw new Error("错误！运算对象类型错误！");
                        sum /= t;
                    }
                    return sum;
                } });
            //比较操作部分
            this.SetSymbol({ key: '>', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old > t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '<', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old < t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '=', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old == t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '>=', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old >= t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: '<=', isneedcircum: false, callthis: null, isneedcal: true, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var old = args[0];
                    for (var _a = 0, _b = args.slice(1, args.length); _a < _b.length; _a++) {
                        var t = _b[_a];
                        if (!(old <= t))
                            return false;
                        old = t;
                    }
                    return true;
                } });
            this.SetSymbol({ key: 'do', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //此过程对接收的每个参数求值 后返回最后一个求值的结果
                    //此过程用于将多个Table联合在一起作为一个Table求值
                    var ret;
                    for (var _a = 0, args_2 = args; _a < args_2.length; _a++) {
                        var a = args_2[_a];
                        ret = a.Calculate(circum);
                    }
                    return ret.Calculate(circum);
                } });
            this.SetSymbol({ key: 'define', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //判断定义类型 如果def部分为normal表则为过程定义
                    //否则则为变量定义
                    //注意define操作符不返回值 即返回undefined
                    if (args.length < 2)
                        throw new Error("参数数量不正确");
                    var head = args[0];
                    if (head.Type == "symbol") {
                        //变量定义
                        if (args.length > 2)
                            throw new Error("变量定义形式错误！参数数量不正确");
                        var val = args[1];
                        circum.Set(head.name, val.Calculate(circum));
                        return undefined;
                    }
                    if (head.Type == "normal") {
                        //这里来构造一个process
                        //先构造body
                        var bodylist = args.slice(1, args.length); //得到body序列
                        //合成一个body
                        var body = new LispExecute.Table();
                        body.childs.push(new LispExecute.LispSymbolRefence("do")); //使用do操作符连接多个table
                        body.childs = body.childs.concat(bodylist);
                        var def = new LispExecute.Table();
                        def.childs[0] = args[0];
                        def.childs[1] = body;
                        var proc = new LispExecute.LispDefProcess(def);
                        //加入环境
                        circum.Set(proc.Name, proc);
                        return undefined;
                    }
                    throw new Error("符号定义错误！头部类型不正确");
                } });
            this.SetSymbol({ key: 'if', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //这里来判断条件
                    if (args.length < 2)
                        throw new Error("错误！IF操作参数过少！");
                    var p = args[0];
                    var res = p.Calculate(circum);
                    var bres = true;
                    if (res.Type == "object") {
                        var rres = res;
                        if (rres.Object == false)
                            bres = false;
                        //除了false其他都被作为true
                    }
                    //如果条件为真则执行A 否则如果有B则执行B 没有就返回空表
                    var A = args[1];
                    if (bres) {
                        return A.Calculate(circum);
                    }
                    if (args.length >= 3) {
                        var B = args[2];
                        return B.Calculate(circum);
                    }
                    else
                        return undefined;
                } });
            this.SetSymbol({ key: 'typeof', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    return args[0].Calculate(circum).Type;
                    //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
                } });
            this.SetSymbol({ key: 'objtype', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0].Calculate(circum);
                    if (temp.Type == "object") {
                        return new LispExecute.LispObject(typeof temp.Object);
                    }
                    throw new Error("错误！只能对数据对象使用objtype操作符");
                    //这里之所以不直接标记需要计算参数，原因是避免很多参数时进行大量的参数计算
                } });
            //直接返回表本身（用于提供不计算通道）
            this.SetSymbol({ key: 'quote', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    return args[0];
                } });
            this.SetSymbol({ key: 'lambda', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    //判断定义类型 如果def部分为normal表则为过程定义
                    //否则则为变量定义
                    //注意define操作符不返回值 即返回undefined
                    if (args.length < 2)
                        throw new Error("参数数量不正确");
                    var head = args[0];
                    if (head.Type != "normal" && head.Type != "symbol") {
                        throw new Error("符号定义错误！头部类型不正确");
                    }
                    //这里来构造一个process
                    //先构造body
                    var bodylist = args.slice(1, args.length); //得到body序列
                    //合成一个body
                    var body = new LispExecute.Table();
                    body.childs.push(new LispExecute.LispSymbolRefence("do")); //使用do操作符连接多个table
                    body.childs = body.childs.concat(bodylist);
                    var def = new LispExecute.Table();
                    var thead = new LispExecute.Table();
                    //添加匿名头
                    thead.childs.push(new LispExecute.LispSymbolRefence(""));
                    if (head.Type == "normal") {
                        thead.childs = thead.childs.concat(head.childs);
                    }
                    def.childs[0] = thead;
                    def.childs[1] = body;
                    var proc = new LispExecute.LispDefProcess(def);
                    return proc;
                } });
            //判断是否为基础数据类型 即是否为object型表
            this.SetSymbol({ key: 'atom', isneedcircum: false, callthis: null, isneedcal: true, isneedtrans: false, val: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0];
                    if (temp.Type == "object") {
                        return new LispExecute.LispObject(true);
                    }
                    else
                        return new LispExecute.LispObject(false);
                } });
            //下面为原生对象操作
            this.SetSymbol({ key: 'prop', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 2)
                        throw "参数数量错误！";
                    var temp = args[0].Calculate(circum);
                    if (temp.Type == "object") {
                        //数据对象进行取属性计算
                        var obj = temp.Object;
                        var pname = args[1];
                        pname = pname.Calculate(circum);
                        var name = void 0;
                        if (pname.Type == "object") {
                            name = pname.Object;
                        }
                        else
                            throw new Error("错误！属性名必须为字符串或符号引用");
                        if (name in obj) {
                            return new LispExecute.LispObject(obj[name]);
                        }
                        //调试用
                        throw new Error("\u9519\u8BEF\uFF01\u6307\u5B9A\u5BF9\u8C61\u4E2D\u4E0D\u5B58\u5728\u5C5E\u6027\uFF1A" + name);
                    }
                } });
            //将一个function数据对象变成一个process
            this.SetSymbol({ key: 'proc', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0];
                    if (temp.Type == "object" && typeof temp.Object == "function") {
                        return new LispExecute.LispRawProcess("", temp.Object, false);
                    }
                } });
            //取一个符号的名字
            this.SetSymbol({ key: 'symn', isneedcircum: true, callthis: null, isneedcal: false, isneedtrans: false, val: function (circum) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    if (args.length != 1)
                        throw "参数数量错误！";
                    var temp = args[0];
                    if (temp.Type == "symbol") {
                        return new LispExecute.LispObject(temp.name);
                    }
                    throw new Error("只能对符号执行字符串化!");
                } });
        };
        return LispExecuter;
    }(LispExecute.Executer));
    LispExecute.LispExecuter = LispExecuter;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=LispExecuter.js.map