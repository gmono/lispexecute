namespace LispExecute
{
    export interface SymPair
    {
        key:string;
        val:any;
        //下面是函数专属属性
        isneedcircum?:boolean;
        callthis?:any;
        isneedcal?:boolean;
        isneedtrans?:boolean;
    }
    export class LinkContainer extends Circumstance
    {
        public constructor(public LinkObject:any=null)
        {
            super();
        }
        public TrySearch(name:string)
        {
            let ret=super.TrySearch(name);
            if(ret!=undefined) return ret;
            if(this.LinkObject!=null&&name in this.LinkObject)
            {
                return new LispObject(this.LinkObject[name]);
            }
            return undefined;
            
        }
    }
    /**
     * 提供顶层环境和外部接口
     */
    export abstract class Executer
    {
        public TopContainer:LinkContainer;
        protected abstract AddPreSymbols();
        public constructor(link:any=null,initstate?:SymPair[])
        {
            //先加入预定义符号 加减乘除等
            this.TopContainer=new LinkContainer(link);
            this.AddPreSymbols();
            if(initstate!=null) for(let t of initstate)
            {
                this.SetSymbol(t);
            }
        }
        /**
         * 设置一个符号 可以覆盖
         * @param sym 符号
         */
        public SetSymbol(sym:SymPair)
        {
            this.TopContainer.Set(sym.key,this.ToTable(sym));
        }
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        public GetSymbol(name:string):any
        {
            let obj=this.TopContainer.TrySearch(name);
            if(obj==undefined) return undefined;
            return this.ToRaw(obj);

        }
        public ToRaw(obj:Table)
        {
            if(obj.Type=="object")
            {
                let oobj=obj as LispObject;
                return oobj.Object;
            }
            else if(obj instanceof LispRawProcess)
            {
                let fun=obj as LispRawProcess;
                return fun.rawFunc;
            }
            //不需要转换就直接返回
            return obj;
        }
        /**
         * 此处sympair中仅val和函数专属的属性有效key可以为null
         * @param sym 符号 key无用
         */
        public ToTable(sym:SymPair)
        {
                             //如果val是object就转换为Table
                if(sym.val instanceof Table)
                {
                    //如果是表就直接加入 否则封装为LispObject
                    return sym.val;
                }
                else if(typeof sym.val=="function")
                {
                    //封装函数
                    let fun:Function=sym.val as Function;
                    let func=new LispRawProcess(fun.name,fun,sym.isneedcircum,sym.callthis,sym.isneedcal,sym.isneedtrans);
                    return func;
                }
                else
                {
                    let lobj=new LispObject(sym.val);
                    return lobj;
                }
        }
        /**
         * 
         * @param obj 要计算的顶层表
         * @param link 要链接到的js顶层对象
         */
        public Run(obj:Table)
        {
            let ret=obj.Calculate(this.TopContainer);
            return this.ToRaw(ret);
        }
    }
}