var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LispExecute;
(function (LispExecute) {
    var LimitNumber;
    (function (LimitNumber_1) {
        /**
         * 通用限长数字类
         * limit为长度 位index从0->limit-1
         * 这个类提供静态函数对number进行linmitnumber操作
         */
        var LimitNumber = /** @class */ (function () {
            /**
             * 初始化
             * @param limit 数据长度
             */
            function LimitNumber(limit, isreadonly, num) {
                this.limit = limit;
                this.isreadonly = isreadonly;
                this.num = num;
            }
            /**
             * 取位 失败返回-1 成功返回0或1
             * @param index 从0开始的位置号
             */
            LimitNumber.prototype.GetBit = function (index) {
                if (index >= this.limit)
                    return -1;
                var tnum = this.num;
                var mask = 1 << index;
                return (tnum & mask) > 0 ? 1 : 0;
            };
            /**
             * SetBit
             * @param index 从0开始的位置号
             */
            LimitNumber.prototype.SetBit = function (index, data) {
                if (index >= this.limit)
                    return -1;
                var xdata;
                if (typeof data == "boolean")
                    xdata = data;
                else if (data > 1 || data < 0)
                    return -1;
                else
                    xdata = data == 1;
                var ndata = this.num;
                if (xdata) {
                    ndata |= 1 << index;
                }
                else {
                    ndata &= ~(1 << index);
                }
                this.num = ndata;
            };
            //多位取 置函数
            /**
             * SetLimitBits
             * 设置几个位
             */
            LimitNumber.prototype.SetLimitBits = function (start, end, val) {
                //设置几个位
                if (this.ReadOnly)
                    throw "错误，只读值";
                if (start < 0 || start > this.limit || end > this.limit || end < start)
                    throw "取位长度超限";
                var tv = new DWord(true, val);
                for (var i = start; i <= end; ++i) {
                    var rindex = i - start; //得到val中的索引
                    var bit = tv.GetBit(rindex);
                    if (bit > 0)
                        this.num |= 1 << i;
                    else
                        this.num &= ~(1 << i);
                }
            };
            /**
             * GetLimitBits
             * 取几个位
             */
            LimitNumber.prototype.GetLimitBits = function (start, end) {
                if (start < 0 || start > this.limit || end > this.limit || end < start)
                    throw "取位长度超限";
                var ret = 0;
                for (var i = start; i <= end; ++i) {
                    var rindex = i - start;
                    var bit = this.GetBit(i);
                    if (bit > 0)
                        ret |= 1 << rindex;
                    else
                        ret &= ~(1 << rindex);
                }
                return ret;
            };
            Object.defineProperty(LimitNumber.prototype, "Value", {
                get: function () {
                    return this.num;
                },
                set: function (num) {
                    if (this.isreadonly)
                        return;
                    this.num = num;
                    this.num &= 0xffffffff << (32 - this.limit); //取低limit位
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(LimitNumber.prototype, "ReadOnly", {
                get: function () {
                    return this.isreadonly;
                },
                enumerable: false,
                configurable: true
            });
            return LimitNumber;
        }());
        LimitNumber_1.LimitNumber = LimitNumber;
        var Byte = /** @class */ (function (_super) {
            __extends(Byte, _super);
            function Byte(isreadonly, num) {
                return _super.call(this, 8, isreadonly, num) || this;
            }
            return Byte;
        }(LimitNumber));
        LimitNumber_1.Byte = Byte;
        var Word = /** @class */ (function (_super) {
            __extends(Word, _super);
            function Word(isreadonly, num) {
                return _super.call(this, 16, isreadonly, num) || this;
            }
            Word.prototype.ToBytes = function () {
                return [new Byte(false, this.GetLimitBits(0, 7)), new Byte(false, this.GetLimitBits(8, 15))];
            };
            Word.prototype.FromBytes = function (data) {
                this.SetLimitBits(0, 7, data[0].Value);
                this.SetLimitBits(8, 15, data[1].Value);
            };
            return Word;
        }(LimitNumber));
        LimitNumber_1.Word = Word;
        var DWord = /** @class */ (function (_super) {
            __extends(DWord, _super);
            function DWord(isreadonly, num) {
                return _super.call(this, 32, isreadonly, num) || this;
            }
            DWord.prototype.ToWords = function () {
                return [new Word(false, this.GetLimitBits(0, 15)), new Word(false, this.GetLimitBits(16, 31))];
            };
            DWord.prototype.FromWords = function (data) {
                this.SetLimitBits(0, 15, data[0].Value);
                this.SetLimitBits(16, 31, data[1].Value);
            };
            DWord.prototype.ToBytes = function () {
                var temp = this.ToWords();
                return temp[0].ToBytes().concat(temp[1].ToBytes());
            };
            DWord.prototype.FromBytes = function (data) {
                var w1 = new Word(true, 0);
                w1.FromBytes(data);
                var w2 = new Word(true, 0);
                w2.FromBytes(data.slice(2, 3));
                this.FromWords([w1, w2]);
            };
            return DWord;
        }(LimitNumber));
        LimitNumber_1.DWord = DWord;
    })(LimitNumber = LispExecute.LimitNumber || (LispExecute.LimitNumber = {}));
})(LispExecute || (LispExecute = {}));
//# sourceMappingURL=LimitNumber.js.map