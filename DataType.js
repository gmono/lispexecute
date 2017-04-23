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
     * 一般环境提供者
     * 一般来说 子类只需要重写TrySearch方法和 TrySet方法即可即可
     * TrySearch中进行具体操作 TrySet中进行存在检测
     */
    var Circumstance = (function () {
        function Circumstance(supercir) {
            if (supercir === void 0) { supercir = null; }
            this.supercir = supercir;
            this.selfmap = new Map();
        }
        /**
         * 搜索一个符号 搜索不到抛出错误
         * @param name 符号名
         */
        Circumstance.prototype.Search = function (name) {
            var ret = this.TrySearch(name);
            if (ret == undefined)
                throw new Error("符号引用错误！");
            return ret;
        };
        /**
         * 搜索一个符号 搜索不到返回undefined
         * @param name 符号名
         */
        Circumstance.prototype.TrySearch = function (name) {
            if (this.selfmap.has(name))
                return this.selfmap.get(name);
            if (this.supercir != null)
                return this.supercir.TrySearch(name);
            return undefined;
        };
        /**
         * 设置一个符号 允许覆盖
         * @param name 符号名
         * @param value 新符号值
         */
        Circumstance.prototype.Set = function (name, value) {
            this.selfmap.set(name, value);
        };
        /**
         * 设置一个符号 不允许覆盖
         * @param name 符号名
         * @param value 新值
         */
        Circumstance.prototype.TrySet = function (name, value) {
            if (this.TrySearch(name) == undefined) {
                this.Set(name, value);
            }
        };
        return Circumstance;
    }());
    LispExecute.Circumstance = Circumstance;
    /**
     * 基本数据类型：表
     * 此表为通用表 特殊表可以有自己专属的方法 供装饰内部符号使用
     * 此处明确一个概念 表这是一种通用数据结构
     * 并不代表一个计算式 只有在Calculate函数中使用它时，才会被作为一个计算式
     * 自然的 并不是每个表都确定一个环境，仅在Process调用时会创建一层新环境
     * 表作为计算式计算时是由外部提供搜索符号的接口而非自己创建一个环境
     */
    var Table = (function () {
        function Table() {
            //childs默认为空 即此表为空表 所有特殊表都为空表
            this.childs = [];
            //此为表类型标注 正常表为normal
            //特殊表为自定义
            this.type = "normal";
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
         * 以下过程说明 对于常规（复合）表而言 计算就是过程调用
         */
        Table.prototype.Calculate = function (circum) {
            if (this.childs == null || this.childs.length == 0)
                return this;
            //得到第一个子表 此表必须是一个符号引用
            var sym = this.childs[0];
            // while(sym.type!="process"&&sym.type!="object")
            // {
            //     sym=sym.Calculate(circum);
            // }
            if (sym.type != "object")
                sym = sym.Calculate(circum);
            //知道追溯符号到尽头
            //对表求值 得到一个process而不管其如何得到
            if (sym.type == "process") {
                //构造参数表
                var pars = new Table();
                pars.childs = this.childs.slice(1, this.childs.length);
                //调用Process
                return sym.Call(circum, pars);
            }
            //如果不是process则错误
            throw new Error("错误，只能对过程执行计算!");
        };
        return Table;
    }());
    LispExecute.Table = Table;
    /**
     * 此为对数据对象的统一封装
     * 计算为直接返回自己
     * 注意存在特殊值：undefined与空表不同 也算作object的一部分
     * 因此LispObject实际代表了除了DataType内部类型和function外的所有外部类型
     */
    var LispObject = (function (_super) {
        __extends(LispObject, _super);
        function LispObject(value) {
            var _this = _super.call(this) || this;
            //数据对象通用的保存数据的成员
            _this.Object = null;
            _this.Object = value;
            _this.type = "object";
            return _this;
        }
        LispObject.prototype.Calculate = function (circum) {
            return this;
        };
        return LispObject;
    }(Table));
    LispExecute.LispObject = LispObject;
    /**
     * 符号引用
     * 此处可以在Calculate函数中进行特殊处理
     * 这样来将一个符号关联到某个js对象的成员集合中
     */
    var LispSymbolRefence = (function (_super) {
        __extends(LispSymbolRefence, _super);
        function LispSymbolRefence(name) {
            var _this = _super.call(this) || this;
            _this.name = name;
            _this.type = "symbol";
            return _this;
        }
        /**
         * 根据自身符号从环境中找到Table然后返回
         * @param circum 环境
         */
        LispSymbolRefence.prototype.Calculate = function (circum) {
            var ret = circum.Search(this.name);
            if (ret == null)
                throw new Error("符号引用错误！不存在这样的符号！");
            return ret;
        };
        return LispSymbolRefence;
    }(Table));
    LispExecute.LispSymbolRefence = LispSymbolRefence;
    var LispProcess = (function (_super) {
        __extends(LispProcess, _super);
        function LispProcess() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return LispProcess;
    }(Table));
    LispExecute.LispProcess = LispProcess;
    /**
     * 定义过程 过程的表结构为((name par1 par2.....)(body))
     */
    var LispDefProcess = (function (_super) {
        __extends(LispDefProcess, _super);
        function LispDefProcess(def) {
            var _this = _super.call(this) || this;
            _this.self = null;
            _this.type = "process";
            //保存过程定义
            if (def == null || def.childs.length != 2)
                throw new Error("过程定义错误！");
            //检测参数表
            var deftable = def.childs[0];
            if (deftable.Type != "normal")
                throw new Error("过程定义符号表必须为Normal型!");
            for (var _i = 0, _a = deftable.childs; _i < _a.length; _i++) {
                var a = _a[_i];
                if (!(a instanceof LispSymbolRefence)) {
                    throw new Error("错误！过程声明中必须全为SymbolRefence");
                }
            }
            _this.self = def;
            return _this;
        }
        Object.defineProperty(LispDefProcess.prototype, "Define", {
            get: function () {
                return this.self.childs[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispDefProcess.prototype, "ParsTable", {
            get: function () {
                //从定义表中取出参数表
                var ret = this.self.childs[0].childs;
                ret = ret.slice(1, ret.length);
                var res = new Table();
                res.childs = ret;
                return res;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispDefProcess.prototype, "Name", {
            get: function () {
                //匿名函数
                // if(this.self.childs[0].Empty()) return "";
                var t = this.self.childs[0].childs[0];
                return t.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispDefProcess.prototype, "ParsCount", {
            get: function () {
                return this.self.childs[0].childs.length - 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispDefProcess.prototype, "Body", {
            get: function () {
                return this.self.childs[1];
            },
            enumerable: true,
            configurable: true
        });
        LispDefProcess.prototype.Calculte = function (circum) {
            return this;
        };
        /**
        * 此为过程调用
        * 形式与普通的表计算有区别
        * 这将创建一层新的环境
        * @param circum 上层环境
        * @param pars 参数表 取其childs对形参表做替换
        */
        LispDefProcess.prototype.Call = function (circum, pars) {
            //构造此层搜索函数和环境
            var searfun = new Circumstance(circum);
            //添加自身
            searfun.Set("this", this);
            //将参数加入环境
            if (pars == null || pars.childs.length < this.ParsCount)
                throw "错误！调用参数过少！";
            for (var i = 0; i < this.ParsTable.childs.length; ++i) {
                //计算每个参数 注意计算参数时以上层的环境为环境
                var res = pars.childs[i].Calculate(circum);
                //加入环境
                searfun.Set(this.ParsTable.childs[i].name, res);
            }
            //使用新的环境搜索函数计算body表
            return this.Body.Calculate(searfun);
        };
        return LispDefProcess;
    }(LispProcess));
    LispExecute.LispDefProcess = LispDefProcess;
    /**
     * 此为用于链接RawProcess与内部环境的环境
     * 此环境为一个链接层 本身并不保存任何符号
     * 因此这里的trysearch和set都直接链接
     */
    var RawCircum = (function (_super) {
        __extends(RawCircum, _super);
        function RawCircum(circum, rfuncbody) {
            var _this = _super.call(this, circum) || this;
            _this.rfuncbody = rfuncbody;
            return _this;
        }
        RawCircum.prototype.TrySearch = function (name) {
            if (name == "this") {
                return this.rfuncbody;
            }
            return this.supercir.TrySearch(name);
        };
        RawCircum.prototype.TrySet = function (name, value) {
            return this.supercir.TrySet(name, value);
        };
        RawCircum.prototype.Set = function (name, value) {
            return this.supercir.Set(name, value);
        };
        return RawCircum;
    }(Circumstance));
    ;
    /**
     * 特殊过程：原生过程
     * 此类接收一个函数 并代表这个函数
     * 一般来说只有对函数进行简单封装时才使用这个类
     */
    var LispRawProcess = (function (_super) {
        __extends(LispRawProcess, _super);
        /**
         *
         * @param Name 此过程的名字 与环境无关 仅仅作为一个属性
         * @param rawFunc 封装的原生函数
         * @param IsNeedCircum 是否需要第一个参数传circum回调函数
         *
         */
        function LispRawProcess(Name, rawFunc, IsNeedCircum, CallThis, IsNeedCal, IsNeedTrans) {
            if (IsNeedCircum === void 0) { IsNeedCircum = false; }
            if (CallThis === void 0) { CallThis = null; }
            if (IsNeedCal === void 0) { IsNeedCal = true; }
            if (IsNeedTrans === void 0) { IsNeedTrans = true; }
            var _this = _super.call(this) || this;
            _this.Name = Name;
            _this.rawFunc = rawFunc;
            _this.IsNeedCircum = IsNeedCircum;
            _this.CallThis = CallThis;
            _this.IsNeedCal = IsNeedCal;
            _this.IsNeedTrans = IsNeedTrans;
            _this.type = "process";
            return _this;
        }
        LispRawProcess.prototype.Call = function (circum, pars) {
            //构造链接层
            var thiscircum = new RawCircum(circum, this);
            //转换参数
            var rarr = [];
            if (this.IsNeedCircum)
                rarr.push(thiscircum);
            for (var _i = 0, _a = pars.childs; _i < _a.length; _i++) {
                var v = _a[_i];
                //根据是否需要计算的标记 选择计算还是保持原值(原表结构)
                var vobj = v;
                if (this.IsNeedCal) {
                    //计算参数以上层环境为环境
                    vobj = v.Calculate(circum);
                }
                //当vboj是一个对象并且需要转换时 转换为js原生对象
                if (vobj.Type == "object" && this.IsNeedTrans) {
                    var t = vobj;
                    rarr.push(t.Object);
                    continue;
                }
                //对于非数据对象 或者不需要转换的数据对象 就只能传原始值了
                //然后就是不用计算的也是原始值
                rarr.push(vobj);
            }
            //调用
            var ret = this.rawFunc.apply(this.CallThis, rarr);
            //返回是表就不做处理
            if (ret instanceof Table)
                return ret;
            //做对应处理
            switch (typeof ret) {
                case "function":
                    return new LispRawProcess("", ret);
                default:
                    return new LispObject(ret);
            }
            //注意这里处理函数的方法
            //采用默认参数 也就是this对象为null不提供环境 先计算参数(应用序 常规过程调用模式)
        };
        LispRawProcess.prototype.Calculate = function (circum) {
            return this;
        };
        return LispRawProcess;
    }(LispProcess));
    LispExecute.LispRawProcess = LispRawProcess;
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=DataType.js.map