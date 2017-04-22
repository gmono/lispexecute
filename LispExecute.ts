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
                if(typeof args[0]!="number"&&typeof args[0]!="string") throw new Error("错误！运算对象类型错误！");
                let sum=typeof args[0] =="number"? 0:"";
                for(let t of args)
                {
                    if(typeof t!="number"&&typeof t!="string") throw new Error("错误！运算对象类型错误！");
                    sum+=<any>t;
                }
                return sum;
            }});
            //减法只能用于数字
            this.SetSymbol(<SymPair>{key:'-',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                    sum-=t;
                }
                return sum;
            }});
            //乘法可以用于重复语义和数字
            this.SetSymbol(<SymPair>{key:'*',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                   let sum=args[0];
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
                   else throw new Error("错误！运算对象类型错误！");;
                   return sum;
               }});
            this.SetSymbol(<SymPair>{key:'/',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                let sum=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(typeof args[0]!="number") throw new Error("错误！运算对象类型错误！");
                    sum/=t;
                }
                return sum;
            }});
            //比较操作部分
            this.SetSymbol(<SymPair>{key:'>',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old>t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'<',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old<t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'=',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old==t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'>=',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old>=t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'<=',isneedcircum:false,callthis:null,isneedcal:true,val:(...args)=>{
                let old=args[0];
                for(let t of args.slice(1,args.length))
                {
                    if(!(old<=t)) return false;
                    old=t;
                }
                return true;
            }});
            this.SetSymbol(<SymPair>{key:'do',isneedcircum:true,callthis:null,isneedcal:false,val:(circum:SymbolFunc,...args)=>{
                //此过程对接收的每个参数求值 后返回最后一个求值的结果
                //此过程用于将多个Table联合在一起作为一个Table求值
                let ret:Table;
                for(let a  of args)
                {
                    ret=(<Table>a).Calculate(circum);
                }
                return ret.Calculate(circum);
            }});
            this.SetSymbol(<SymPair>{key:'define',isneedcircum:true,callthis:null,isneedcal:false,val:(circum:SymbolFunc,...args)=>{
                //这里来构造一个process
                //先构造body
                let bodylist=args.slice(1,args.length);//得到body序列
                //合成一个body
                let body=new Table();
                body.childs.push(new LispSymbolRefence("do"));//使用do操作符连接多个table
                body.childs=body.childs.concat(bodylist);
                let def=new Table();
                def.childs[0]=args[0];
                def.childs[1]=body;
                let proc=new LispDefProcess(def);
                //加入环境
                circum(proc.Name,proc);
            }});
            this.SetSymbol(<SymPair>{key:'if',isneedcircum:true,callthis:null,isneedcal:false,val:(circum:SymbolFunc,...args)=>{
                //这里来判断条件
                if(args.length<2) throw new Error("错误！IF操作参数过少！");
                let p=args[0] as Table;
                let res=p.Calculate(circum);
                let bres=true;
                if(res.Type=="object")
                {
                    let rres=res as LispObject;
                    if(rres.Object==false) bres=false;
                    //除了false其他都被作为true
                }
                //如果条件为真则执行A 否则如果有B则执行B 没有就返回空表
                let A=args[1] as Table;
                if(bres)
                {
                    return A.Calculate(circum);
                }
                if(args.length>=3)
                {
                    let B=args[2] as Table;
                    return B.Calculate(circum);
                }
                else return undefined;
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
        /**
         * 
         * @param obj 要计算的顶层表
         * @param link 要链接到的js顶层对象
         */
        public Run(obj:Table,link?:object)
        {
            let func=(name:string,val?:Table)=>{
                if(val==null)
                {
                    if(this.TopContainer.has(name)) return this.TopContainer.get(name);
                    if(link!=null)
                    {
                        let now=link;
                        let old;
                        let paths=name.split('.');
                        let isok=true;//是否成功找到
                        for(let i=0;i<paths.length;++i)
                        {
                            old=now;
                            now=now[paths[i]];
                            if(now==null)
                            {
                                isok=false;
                                break;
                            }
                        }
                        if(isok)
                        {
                            let func=now as Function;
                            let proc=new LispRawProcess(func.name,func,false,old,true,true);
                            return proc;
                        }
                    }
                    return undefined;
                }
                this.TopContainer.set(name,val);
            };
            let ret=obj.Calculate(func);
            return this.ToRaw(ret);
        }
    }
}