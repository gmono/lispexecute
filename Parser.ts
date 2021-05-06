import { Table, LispObject, LispSymbolRefence } from "./DataType";

/**
 * 此为一个结构体 用于Parse过程
 */
interface ReadStruct {
    obj: Table;
    nowptr: number;
}
/**
 * 此为解析工具包对外公开几个静态函数 用于将lisp代码转换为表
 */
export class Parser {

    public static Parse(code: string): Table {
        //递归实现
        //跳过第一个括号
        code = code.trim();
        //这里应该指向code的末尾或者第一个非空字符
        //如果这个非空字符不是表的开始 就返回空
        let nowptr = 0;
        if (code.length == nowptr) {
            return null;
        }
        // if(code[nowptr]!='('&&code[nowptr]!="'")
        // {
        //     //认为是单纯的 值
        //     return this.ReadValue(code);
        // }
        let ret = this.ParseCode(code, nowptr);
        if (ret == null) return null;
        return ret.obj;
    }
    /**
     * 字面量读取函数
     * @param val 字面量
     */
    protected static ReadValue(val: string): Table {
        val = val.trim();
        let c = val[0];
        if (c == "{" || c == "[" || c == "\"" || val == "true" || val == "false") {
            //读取字符串
            //切片去掉前后引号
            return new LispObject(JSON.parse(val));
        }
        else {
            let num = null;
            let sign = "box";
            for (let c of sign) {
                if (val.indexOf(c) != -1 && val.lastIndexOf(c) == val.indexOf(c)) {
                    num = parseInt(val);
                    break;
                }
            }
            if (num == null) {
                //处理#号
                if (val[0] == '#') {
                    let nval = "0x" + val.slice(1, val.length);
                    num = parseInt(nval);
                }
                else num = parseFloat(val);
            }
            if (isNaN(num)) {
                //此字面量为符号
                return new LispSymbolRefence(val);
            }
            else {
                //此字面量为数字
                return new LispObject(num);
            }
        }
    }
    /**
     * 解析代码的递归函数 约定：返回位置总是在此函数读取的最后一个字符后面
     * 总是从ptr指向的位置开始读取
     * @param code 代码
     * @param ptr  当前读取位置
     */
    protected static ParseCode(code: string, ptr: number): ReadStruct {
        code = code.trim();
        code = `${code} `;
        let container = new Table();
        //扫描
        //当前字面量缓存
        let nowval: string = "";
        let isinread = false;
        //是否是读取了表的
        //如果是读取的值 这里为false  则返回容器的第一个子元素
        let isreadtb = false;
        //json读取计数器
        let objssize = 0;//对象模式计数器 以左大括号+1 右大括号减1
        //如果没有进入表读取 则此值一直为true
        let isok = true;
        //此处逻辑为 isok为指示表是否读取完成的标志 如果没有进入表读取
        //自然一直为true
        //如果遇到第一个左括号，则认为进入了表读取，isreadtb为真
        //isok为false 因为表读取没有结束
        //如果遇到右括号，则认为读取完成 isok为true
        //但是这是表读取完成 所以 还是表读取 isreadtb为true
        //下面 如果是表读取就返回容器（一个子元素列表）
        //否则就因为值是被放入容器里的
        //将容器的第一个元素作为数据对象返回
        for (; ptr < code.length; ++ptr) {
            let c = code[ptr];
            if (objssize != 0) {
                //定义json读取的唯一出口 
                if (c == "}" || c == "]" || c == "\"") {
                    objssize--;
                }
                nowval += c;
                continue;
            }



            if (c == " " || c == "\t") {
                //这里逻辑为 如果在读取状态遇到空格意味着读取结束 
                //否则直接跳过
                if (isinread) {
                    let obj = this.ReadValue(nowval);
                    container.childs.push(obj);
                    nowval = "";
                    isinread = false;
                }
                //如果在读取表的状态就继续读取否则就读取结束
                if (isreadtb) continue;
                break;
            }


            if (c == "(") {
                //如果第一次遇到左括号
                //就设定正在读取表的标志 isok
                //以及此函数读取了一个表的标志 isreadtb
                if (isok) { isok = false; isreadtb = true; continue; }
                //递归调用读取一个子复合表
                let res = this.ParseCode(code, ptr);
                //从新的位置开始读取
                ptr = res.nowptr;
                //由于ptr指向已经读取字符的后面 又因为循环体会让ptr++
                //这里平衡
                ptr--;
                container.childs.push(res.obj);
                continue;
            }



            if (c == ")") {
                //处理 如果根本没有进入读取表模式
                if (!isreadtb) {
                    //这里逻辑为 如果在读取状态遇到空格意味着读取结束 
                    //否则直接跳过
                    if (isinread) {
                        let obj = this.ReadValue(nowval);
                        container.childs.push(obj);
                        nowval = "";
                        isinread = false;
                    }
                    break;
                }
                //如果遇到表结束
                //并且此时并没有读取完值
                if (isinread) {
                    let obj = this.ReadValue(nowval);
                    container.childs.push(obj);
                }
                //统一 出循环后应指向读到的最后一个字符后面
                ptr++;
                //标识为正常结束
                isok = true;
                break;
            }


            if (c == "'") {
                //S表达式读取将Table包装为一个quote表
                let table = this.ParseCode(code, ptr + 1);
                let quotetable = new Table();
                quotetable.childs.push(new LispSymbolRefence("quote"));
                quotetable.childs.push(table.obj);
                ptr = table.nowptr - 1 //同样为了平衡循环增量;
                container.childs.push(quotetable);
                if (isreadtb) continue;
                break;
            }

            ///
            //普通字面量
            if (!isinread) {
                isinread = true;
                if (c == "{" || c == "[" || c == "\"") {
                    //开启读取字符串模式
                    objssize++;
                }
            }
            nowval += c;
        }
        if (!isok) throw new Error("解析错误！解析过程未正常结束！");
        if (!isreadtb) return <ReadStruct>{ nowptr: ptr, obj: container.childs[0] };
        return <ReadStruct>{ nowptr: ptr, obj: container };
    }
}
