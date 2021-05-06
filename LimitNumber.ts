
/**
 * 通用限长数字类
 * limit为长度 位index从0->limit-1
 * 这个类提供静态函数对number进行linmitnumber操作
 */
export class LimitNumber {
    /**
     * 初始化
     * @param limit 数据长度
     */
    public constructor(public limit: number, protected isreadonly: boolean, protected num: number) { }
    /**
     * 取位 失败返回-1 成功返回0或1
     * @param index 从0开始的位置号
     */
    public GetBit(index: number): number {
        if (index >= this.limit) return -1;
        let tnum: number = this.num;
        let mask: number = 1 << index;
        return (tnum & mask) > 0 ? 1 : 0;
    }
    /**
     * SetBit
     * @param index 从0开始的位置号
     */
    public SetBit(index: number, data: boolean | number) {
        if (index >= this.limit) return -1;
        let xdata: boolean;
        if (typeof data == "boolean") xdata = data;
        else if (data > 1 || data < 0) return -1;
        else xdata = data == 1;

        let ndata = this.num;
        if (xdata) {
            ndata |= 1 << index;
        } else {
            ndata &= ~(1 << index);
        }
        this.num = ndata;

    }
    //多位取 置函数
    /**
     * SetLimitBits
     * 设置几个位
     */
    public SetLimitBits(start: number, end: number, val: number): void {
        //设置几个位
        if (this.ReadOnly) throw "错误，只读值";
        if (start < 0 || start > this.limit || end > this.limit || end < start) throw "取位长度超限";
        let tv = new DWord(true, val);
        for (let i = start; i <= end; ++i) {
            let rindex = i - start;//得到val中的索引
            let bit = tv.GetBit(rindex);
            if (bit > 0) this.num |= 1 << i;
            else this.num &= ~(1 << i);
        }
    }
    /**
     * GetLimitBits
     * 取几个位
     */
    public GetLimitBits(start: number, end: number): number {
        if (start < 0 || start > this.limit || end > this.limit || end < start) throw "取位长度超限";
        let ret = 0;
        for (let i = start; i <= end; ++i) {
            let rindex = i - start;
            let bit = this.GetBit(i);
            if (bit > 0) ret |= 1 << rindex;
            else ret &= ~(1 << rindex);
        }
        return ret;
    }

    public set Value(num: number) {
        if (this.isreadonly) return;
        this.num = num;
        this.num &= 0xffffffff << (32 - this.limit);//取低limit位
    }
    public get Value() {
        return this.num;
    }
    public get ReadOnly() {
        return this.isreadonly;
    }
}
export class Byte extends LimitNumber {
    public constructor(isreadonly: boolean, num: number) {
        super(8, isreadonly, num);
    }
}
export class Word extends LimitNumber {
    public constructor(isreadonly: boolean, num: number) {
        super(16, isreadonly, num);
    }
    public ToBytes(): Byte[] {
        return [new Byte(false, this.GetLimitBits(0, 7)), new Byte(false, this.GetLimitBits(8, 15))];
    }
    public FromBytes(data: Byte[]): void {
        this.SetLimitBits(0, 7, data[0].Value);
        this.SetLimitBits(8, 15, data[1].Value);
    }
}
export class DWord extends LimitNumber {
    public constructor(isreadonly: boolean, num: number) {
        super(32, isreadonly, num);
    }
    public ToWords(): Word[] {
        return [new Word(false, this.GetLimitBits(0, 15)), new Word(false, this.GetLimitBits(16, 31))];
    }
    public FromWords(data: Word[]) {
        this.SetLimitBits(0, 15, data[0].Value);
        this.SetLimitBits(16, 31, data[1].Value);
    }
    public ToBytes(): Byte[] {
        let temp = this.ToWords();
        return temp[0].ToBytes().concat(temp[1].ToBytes());
    }
    public FromBytes(data: Byte[]): void {
        let w1 = new Word(true, 0);
        w1.FromBytes(data);
        let w2 = new Word(true, 0);
        w2.FromBytes(data.slice(2, 3));
        this.FromWords([w1, w2]);
    }
}
