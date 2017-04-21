namespace LispExecute
{
    export interface SymPair
    {
        key:string;
        val:any;
        //下面是函数专属属性
        isneedcircum?:boolean;
        callthis?:any;
    }
    /**
     * 提供顶层环境和外部接口
     */
    export class Lisp
    {
        public TopContainer:Map<string,Table>=new Map<string,Table>();
        public constructor(initstate?:SymPair[])
        {

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
            this.TopContainer.set(sym.key,this.ToTable(sym));
        }
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        public GetSymbol(name:string):any
        {
            if(!this.TopContainer.has(name)) return null;
            let obj=this.TopContainer.get(name);
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
                    let func=new LispRawProcess(fun.name,fun,sym.isneedcircum,sym.callthis);
                    return func;
                }
                else
                {
                    let lobj=new LispObject(sym.val);
                    return lobj;
                }
        }
        public Run(obj:Table)
        {
            let func=(name:string,val?:Table)=>{
                if(val==null) return this.TopContainer.has(name)? this.TopContainer.get(name):null;
                this.TopContainer.set(name,val);
            }
            let ret=obj.Calculate(func);
        }
    }
}