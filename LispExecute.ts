namespace LispExecute
{
    export interface SymPair
    {
        key:string;
        val:any;
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
                 //如果val是object就转换为Table
                if(sym.val instanceof Table)
                {
                    //如果是表就直接加入 否则封装为LispObject
                    this.TopContainer.set(sym.key,sym.val);
                }
                else
                {
                    let lobj=new LispObject(sym.val);
                    this.TopContainer.set(sym.key,lobj);
                }
        }
        /**
         * 获取一个符号代表的变量 自动类型转换
         * @param name 获取的变量的名字
         */
        public GetSymbol(name:string)
        {
            if(!this.TopContainer.has(name)) return null;
            let obj=this.TopContainer.get(name);
            if(obj.Type=="object")
            {
                let oobj=obj as LispObject;
                return oobj.Object;
            }
            return obj;
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