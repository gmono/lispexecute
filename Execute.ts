namespace LispExecute
{
    export interface SymPair
    {
        key:string;
        val:any;
        //下面是函数专属属性
        isNeedStore?:boolean;
        Callthis?:any;
        isNeedCal?:boolean;
        isNeedTrans?:boolean;
    }
    //符号装饰器集合
    export class SymDecorator
    {
        static SymbolDef(name:string,NeedStore:boolean,thisobj:any,NeedCalPars:boolean,NeedTransObject:boolean)
        {
            let sym=<SymPair>{
                key:name,
                isNeedStore:NeedStore,
                Callthis:thisobj,
                isNeedCal:NeedCalPars,
                isNeedTrans:NeedTransObject
            };
            //此处不能使用箭头函数
            //此处的this对象为Executer对象
            return function(target:Executer, propertyKey: string, descriptor: PropertyDescriptor){
                sym.val=target[propertyKey];
                if(target.symbols==null) target.symbols=[];
                target.symbols.push(sym);
            };
        }
        /**
         * 原生函数封装装饰器 提供和原生js函数一样的执行环境
         */
        static RawFunction(name:string)
        {
            return function(target:Executer, propertyKey: string, descriptor: PropertyDescriptor){
                let func=SymDecorator.SymbolDef(name,false,target,true,true);
                return func(target,propertyKey,descriptor);
            }
        }
        /**
         * 定义一个直接处理Lisp内部类型的js原生函数
         * 其参数会被计算 但是不转换
         * 不提供store 这是主要区别，store会打乱正常js函数的参数序列
         */
        static LispRawFunc(name:string)
        {
            return function(target:Executer, propertyKey: string, descriptor: PropertyDescriptor){
                let func=SymDecorator.SymbolDef(name,false,target,true,false);
                return func(target,propertyKey,descriptor);
            }
        }
        /**
         * 纯操作符（加减乘除等只进行与传入数据对象相关操作的函数)
         * 不提供this对象
         * 不提供除参数外的任何内容
         */
        static OperaSymbol(name:string)
        {
            return SymDecorator.SymbolDef(name,false,null,true,true);
        }
        /**
         * 这是全功能表处理符号
         * 提供store 不进行任何转换 参数不计算
         */
        static TableSymbol(name:string)
        {
            return function(target:Executer, propertyKey: string, descriptor: PropertyDescriptor){
                let func=SymDecorator.SymbolDef(name,true,target,false,false);
                return func(target,propertyKey,descriptor);
            }
        }
        /**
         * 内部过程定义
         * 定义一个Lisp内部过程
         * 其参数自动计算 类型不进行转换
         */
        static InnerFunc(name:string)
        {
            return function(target:Executer, propertyKey: string, descriptor: PropertyDescriptor){
                let func=SymDecorator.SymbolDef(name,true,target,true,false);
                return func(target,propertyKey,descriptor);
            }
        }
        
    }
    export class LinkContainer extends Store
    {
        public constructor(public LinkObject:any=null)
        {
            super();
        }
        public TrySearch(name:string)
        {
            let ret=super.TrySearch(name);
            if(ret!=undefined) return ret;
            //分解名字

            if(this.LinkObject!=null)
            {
                let paths=name.split('.');
                let now=this.LinkObject;
                let old;
                for(let t of paths)
                {
                    old=now;
                    now=now[t];
                    if(now==null)
                    {
                        return undefined;
                    }
                }
                if(typeof now!="function")
                    return new LispObject(this.LinkObject[name]);
                else return new LispRawProcess(name,now,false,old);
            }
            return undefined;
            
        }
        public RawTrySearch(name:string)
        {
            return super.TrySearch(name);
        }
    }
    /**
     * 提供顶层环境和外部接口
     */
    export abstract class Executer
    {
        public TopContainer:LinkContainer;
        public symbols:SymPair[];
        protected  AddPreSymbols()
        {
            for(let t of this.symbols)
            {
                this.SetSymbol(t);
            }
        }
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
         * 为一个符号设置别名
         * @param sname 原名
         * @param nname 新名
         */
        public SetOtherName(sname:string,nname:string)
        {
            let obj=this.TopContainer.RawTrySearch(sname);
            if(obj!=null)
            {
                this.TopContainer.Set(nname,obj);
            }
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
        public ToString(obj:Table)
        {
            //内部计算函数
            let infun=(tobj:Table)=>{
                let res="";
                if(tobj.Type=="normal")
                {
                    let nowres="";
                    for(let t of tobj.childs)
                    {
                        nowres+=`${infun(t)} `;
                    }
                    //这一步去掉末尾空格
                    nowres=nowres.slice(0,nowres.length-1);
                    res=`(${nowres})`;
                }
                else if(tobj.Type=="symbol")
                {
                    //处理符号 符号表示为符号名字
                    res=(<LispSymbolRefence>tobj).name;
                }
                else if(tobj.Type=="process")
                {
                    res=`#process:${(<LispProcess>tobj).Name}`;
                }
                else
                {
                    //为数据对象时就调用json转换为文本
                    res=JSON.stringify(this.ToRaw(tobj));
                }
                return res;
            };
            let result=infun(obj);
            if(obj.Type!="object"&&obj.Type!="process")
            {
                result=`'${result}`;
            }
            return result;
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
                    let func=new LispRawProcess(sym.key,fun,sym.isNeedStore,sym.Callthis,sym.isNeedCal,sym.isNeedTrans);
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
        public Run(obj:Table,isstring:boolean=false)
        {
            let ret=obj.Calculate(this.TopContainer);
            if(!isstring) return this.ToRaw(ret);
            else
            {
                return this.ToString(ret);
            }
        }
    }
}