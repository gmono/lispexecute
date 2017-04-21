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
            if (sym.type != "symbol") {
                throw "计算错误，计算表第一个元素必须是符号引用";
            }
            var name = sym.name;
            //得到符号引用 找到符号实体 调用符号实体的Call
            var func = circum(name);
            if (func.type == "process") {
                //构造参数表
                var pars = new Table();
                pars.childs = this.childs.slice(1, this.childs.length);
                //调用Process
                return func.Call(circum, pars);
            }
            //如果不是process则错误
            throw "错误，计算式必须引用一个过程";
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
        LispNumber.prototype.Calculate = function (circum) {
            return this;
        };
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
        LispString.prototype.Calculate = function (circum) {
            return this;
        };
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
        /**
         * 根据自身符号从环境中找到Table然后返回
         * @param circum 环境
         */
        LispSymbolRefence.prototype.Calculate = function (circum) {
            var ret = circum(this.name);
            if (ret == null)
                throw "符号引用错误！不存在这样的符号！";
            return ret;
        };
        return LispSymbolRefence;
    }(Table));
    LispExecute.LispSymbolRefence = LispSymbolRefence;
    /**
     * 特殊表 过程 过程的结构为((name par1 par2.....)(body))
     */
    var LispProcess = (function (_super) {
        __extends(LispProcess, _super);
        function LispProcess(def) {
            var _this = _super.call(this) || this;
            _this.self = null;
            _this.type = "process";
            //保存过程定义
            if (def == null || def.childs.length != 2)
                throw "过程定义错误！";
            _this.self = def;
            return _this;
        }
        Object.defineProperty(LispProcess.prototype, "Define", {
            get: function () {
                return this.self.childs[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispProcess.prototype, "ParsTable", {
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
        Object.defineProperty(LispProcess.prototype, "Name", {
            get: function () {
                return this.self.childs[0].childs[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispProcess.prototype, "ParsCount", {
            get: function () {
                return this.self.childs[0].childs.length - 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LispProcess.prototype, "Body", {
            get: function () {
                return this.self.childs[1];
            },
            enumerable: true,
            configurable: true
        });
        LispProcess.prototype.Calculte = function (circum) {
            throw "错误，不能直接计算Process表,应使用Call方法调用";
        };
        /**
         * 此为过程调用
         * 形式与普通的表计算有区别
         * 这将创建一层新的环境
         * @param circum 上层环境
         * @param pars 参数表 取其childs对形参表做替换
         */
        LispProcess.prototype.Call = function (circum, pars) {
            //构造此层搜索函数和环境
            var thiscir = new Map();
            var searfun = function (name) {
                if (thiscir.has(name))
                    return thiscir.get(name);
                return circum(name);
            };
            //将参数加入环境
            if (pars == null || pars.childs.length < this.ParsCount)
                throw "错误！调用参数过少！";
            for (var i = 0; i < this.self.childs.length; ++i) {
                //加入环境
                thiscir.set(this.ParsTable[i], pars[i]);
            }
            //使用新的环境搜索函数计算body表
            return this.Body.Calculate(searfun);
        };
        return LispProcess;
    }(Table));
    LispExecute.LispProcess = LispProcess;
    /**
     * 特殊过程：原生过程
     */
    var LispPreProcess = (function (_super) {
        __extends(LispPreProcess, _super);
        function LispPreProcess() {
            return _super.call(this, new Table) || this;
        }
        return LispPreProcess;
    }(LispProcess));
    LispExecute.LispPreProcess = LispPreProcess;
})(LispExecute || (LispExecute = {}));
