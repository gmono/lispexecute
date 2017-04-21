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
    }
    /**
     * 提供顶层环境和外部接口
     */
    export class Lisp
    {
        public TopContainer:Map<string,Table>=new Map<string,Table>();
        protected AddPreSymbols()
        {
            this.SetSymbol(<SymPair>{key:'+',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let sum=typeof args[0] =="number"? 0:"";
                for(let t of args)
                {
                    sum+=t;
                }
                return sum;
            }});
            //减法只能用于数字
            this.SetSymbol(<SymPair>{key:'-',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    sum-=t;
                }
                return sum;
            }});
            //乘法可以用于重复语义和数字
            this.SetSymbol(<SymPair>{key:'*',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                   let sum=typeof args[0]=="number" ? 0:args[0];
                   //注意 第一个参数为字符串则整体为重复语义 数字则为乘法语义
                   if(typeof sum=="string")
                   {
                       //重复语义
                       let nowblock=sum;
                       for(let a of args.slice(1,args.length))
                       {
                           if(typeof a !="number") throw new Error("错误！重复语义乘法除第一个参数外必须都为Number型!");
                           for(let i=0;i<a;++i)
                           {
                               sum+=nowblock;
                           }
                           nowblock=sum;
                       }
                   }
                   else if(typeof sum=="number")
                   {
                       for(let a of args.slice(1,args.length))
                       {
                           sum*=a;
                       }
                   }
                   else return null;
                   return sum;
               }});
            this.SetSymbol(<SymPair>{key:'/',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    sum/=t;
                }
                return sum;
            }});
        }
        public constructor(initstate?:SymPair[])
        {
            //先加入预定义符号 加减乘除等
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
                    let func=new LispRawProcess(fun.name,fun,sym.isneedcircum,sym.callthis,sym.isneedcal);
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
            return this.ToRaw(ret);
        }
    }
}