namespace LispExecute
{
    /**
     * 此为一个结构体 用于Parse过程
     */
         interface ReadStruct
        {
            obj:Table;
            nowptr:number;
        }
    /**
     * 此为解析工具包对外公开几个静态函数 用于将lisp代码转换为表
     */
    export class Parser
    {

        public static Parse(code:string):Table
        {
            //递归实现
            //跳过第一个括号
            let nowptr=0;
            for(;nowptr<code.length&&(code[nowptr]==' '||code[nowptr]=='\t');++nowptr);
            //这里应该指向code的末尾或者第一个非空字符
            //如果这个非空字符不是表的开始 就返回空
            if(code.length==nowptr)
            {
                return null;
            }
            else if(code[nowptr]!='(')
            {
                //认为是单纯的 值
                return this.ReadValue(code);
            }
            nowptr++;//指向括号后面
           let ret=this.ParseCode(code,nowptr);
           if(ret==null) return null;
           return ret.obj;
        }
        /**
         * 字面量读取函数
         * @param val 字面量
         */
        protected static ReadValue(val:string):Table
        {
            if(val[0]=='"')
            {
                //读取字符串
                //切片去掉前后引号
                let retstr=val.slice(1,val.length-1);
                return new LispObject(retstr);
            }
            else
            {
                let num=parseFloat(val);
                if(isNaN(num))
                {
                    //此字面量为符号
                    return new LispSymbolRefence(val);
                }
                else
                {
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
        protected static ParseCode(code:string,ptr:number):ReadStruct
        {
            let container=new Table();
            //扫描
            //当前字面量缓存
            let nowval:string="";
            let isinread=false;
            let isok=false;
            for(;ptr<code.length;++ptr)
            {
                let c=code[ptr];
                if(c==" "||c=="\t")
                {
                    //这里逻辑为 如果在读取状态遇到空格意味着读取结束 
                    //否则直接跳过
                    if(isinread)
                    {
                        let obj=this.ReadValue(nowval);
                        container.childs.push(obj);
                        nowval="";
                        isinread=false;
                    }
                    else continue;
                }
                else if(c=="(")
                {
                    //递归调用读取一个子复合表
                    let res=this.ParseCode(code,ptr+1);
                    //从新的位置开始读取
                    ptr=res.nowptr;
                    //由于ptr指向已经读取字符的后面 又因为循环体会让ptr++
                    //这里平衡
                    ptr--;
                    container.childs.push(res.obj);
                }
                else if(c==")")
                {
                    //如果遇到表结束
                    if(isinread)
                    {
                        let obj=this.ReadValue(nowval);
                        container.childs.push(obj);
                    }
                    //统一 出循环后应指向读到的最后一个字符后面
                    ptr++;
                    //标识为正常结束
                    isok=true;
                    break;
                }
                else
                {
                    //普通字面量
                    if(!isinread) isinread=true;
                    nowval+=c;
                }
            }
            if(!isok) return null;
            return <ReadStruct>{nowptr:ptr,obj:container};
        }
    }
}