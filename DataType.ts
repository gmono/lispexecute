namespace LispExecute
{
    export type Circumtance=Map<string,LispSymbol>;
    /**
     * 基本数据类型：表
     * 此表为通用表 特殊表可以有自己专属的方法 供装饰内部符号使用
     */
    export class Table
    {
        //childs默认为空 即此表为空表 所有特殊表都为空表
        public childs:Table[]=[];
        //此为表类型标注 正常表为normal
        //特殊表为自定义
        protected type:string="normal";
        public Empty():boolean
        {
            return this.childs.length==0;
        }
        public get Type():string
        {
            return this.type;
        }
        /**
         * 此为在内环境中找不到符号引用时对外请求搜索的回调函数
         */
        public onSearchSymbol:(symbol:string)=>LispSymbol=null;
        /**
         * 计算这个表 特殊表直接返回自己或者进行内部操作后返回一个表
         * 复合表会计算后返回
         */
        public Calculate(circum:Circumtance):Table
        {
            if(this.childs==null||this.childs.length==0) return this;
            //得到第一个子表 此表必须是一个符号引用
            let sym:LispSymbolRefence=this.childs[0] as LispSymbolRefence;
            if(sym.type!="symbol")
            {
                throw "计算错误，计算表第一个元素必须是符号引用";
            }
            let name=sym.name;
            //得到符号引用 找到符号实体 调用符号实体的Call
            let func=circum.has(name)? circum.get(name):this.onSearchSymbol(name);
            func.Call(this.childs.slice(1,this.childs.length));
        }

    }
    /**
     * 特殊表：数值
     */
    export class LispNumber extends Table
    {
        public constructor(public value:number)
        {
            super();
            this.type="number";
        }
    }
    /**
     * 特殊表：字符串
     */
    export class LispString extends Table
    {
        public constructor(public value:string)
        {
            super();
            this.type="string";
        }
    }
    /**
     * 符号引用
     */
    export class LispSymbolRefence extends Table
    {
        public constructor(public name:string)
        {
            super();
            this.type="symbol";
        }
    }
    /**
     * 符号实体
     * 符号有符号名和符号计算两个方法
     * 这里的符号指的是符号的实体 而非引用
     */
    export class LispSymbol
    {
        public readonly Key:string=null;
        public readonly Target:Table=null;
        public readonly Names:string[]=null;
        public constructor(key:string,names?:string[],tar?:Table)
        {
            this.Key=key;
            this.Target=tar;
            this.Names=names;
        }
        /**
         * 调用这个符号
         * 使用传入的参数数组根据参数名数组
         * @param pars 参数数组 也可以无参数
         */
        public Call(pars?:Table[]):Table
        {
            if(pars!=null&&pars.length==this.Names.length)
            {
                //有参数调用
            }
            else if((pars==null||pars.length==0)&&this.Names==null)
            {
                //无参数调用
            }
        }

    }
    /**
     * 特殊表：预定义符号实体
     */
    export class LispPreSymbol extends LispSymbol
    {
        public constructor(key:string,names?:string[])
        {
            super(key,names,null);
        }
    }
}