namespace LispExecute {
    /**
     * 一般环境提供者
     * 一般来说 子类只需要重写TrySearch方法和 TrySet方法即可即可
     * TrySearch中进行具体操作 TrySet中进行存在检测
     */
    export class Store
    {
        protected selfmap:Map<string,Table>=new Map<string,Table>();
        public constructor(protected supercir:Store=null)
        {
        }
        /**
         * 搜索一个符号 搜索不到抛出错误
         * @param name 符号名
         */
        public Search(name:string)
        {
            let ret=this.TrySearch(name);
            if(ret==undefined) throw new Error("符号引用错误！");
            return ret;
        }
        /**
         * 搜索一个符号 搜索不到返回undefined
         * @param name 符号名
         */
        public TrySearch(name:string)
        {
            if(this.selfmap.has(name))
                return this.selfmap.get(name);
            if(this.supercir!=null) return this.supercir.TrySearch(name);
            return undefined;
        }
        /**
         * 设置一个符号 允许覆盖
         * @param name 符号名
         * @param value 新符号值
         */
        public Set(name:string,value:Table)
        {
            this.selfmap.set(name,value);
        }
        /**
         * 设置一个符号 不允许覆盖
         * @param name 符号名
         * @param value 新值
         */
        public TrySet(name:string,value:Table)
        {
            if(this.TrySearch(name)==undefined)
            {
                this.Set(name,value);
            }
        }
        /**
         * Delete一个符号
         * @param isthrow 是否向上级传递如果这级找不到的话
         */
        public Delete(name:string,isthrow:boolean) {
            if(this.selfmap.has(name))
            {
                this.selfmap.delete(name);
            }
            else if(isthrow&&this.supercir!=null)
            {
                this.supercir.Delete(name,isthrow);
            }
        }
    }
    /**
     * 基本数据类型：表
     * 此表为通用表 特殊表可以有自己专属的方法 供装饰内部符号使用
     * 此处明确一个概念 表这是一种通用数据结构
     * 并不代表一个计算式 只有在Calculate函数中使用它时，才会被作为一个计算式
     * 自然的 并不是每个表都确定一个环境，仅在Process调用时会创建一层新环境
     * 表作为计算式计算时是由外部提供搜索符号的接口而非自己创建一个环境
     */
    export class Table
    {
        //childs默认为空 即此表为空表 所有特殊表都为空表
        public childs: Table[] = [];
        //此为表类型标注 正常表为normal
        //特殊表为自定义
        protected type: string = "normal";
        public Empty(): boolean
        {
            return this.childs.length == 0;
        }
        public get Type(): string
        {
            return this.type;
        }
        /**
         * 计算这个表 特殊表直接返回自己或者进行内部操作后返回一个表
         * 复合表会计算后返回
         * 以下过程说明 对于常规（复合）表而言 计算就是过程调用
         */
        public Calculate(circum: Store): Table
        {
            if (this.childs == null || this.childs.length == 0) return this;
            //得到第一个子表 此表必须是一个符号引用
            let sym: Table = this.childs[0];
            // while(sym.type!="process"&&sym.type!="object")
            // {
            //     sym=sym.Calculate(circum);
            // }
            if(sym.type!="object") sym=sym.Calculate(circum);
            //知道追溯符号到尽头
            //对表求值 得到一个process而不管其如何得到
            if (sym.type == "process")
            {
                //构造参数表
                let pars = new Table();
                pars.childs = this.childs.slice(1, this.childs.length);
                //调用Process
                return (<LispProcess>sym).Call(circum, pars);
            }
            //如果不是process则错误
            throw new Error("错误，只能对过程执行计算!");
        }

    }
    /**
     * 此为对数据对象的统一封装
     * 计算为直接返回自己
     * 注意存在特殊值：undefined与空表不同 也算作object的一部分
     * 因此LispObject实际代表了除了DataType内部类型和function外的所有外部类型
     */
    export class LispObject extends Table
    {
        //数据对象通用的保存数据的成员
        public Object:any=null;
        public constructor(value:any)
        {
            super();
            this.Object=value;
            this.type="object";
        }
        public Calculate(circum: Store): Table
        {
            return this;
        }
    }
    /**
     * 符号引用
     * 此处可以在Calculate函数中进行特殊处理
     * 这样来将一个符号关联到某个js对象的成员集合中
     */
    export class LispSymbolRefence extends Table
    {
        public constructor(public name: string)
        {
            super();
            this.type = "symbol";
        }
        /**
         * 根据自身符号从环境中找到Table然后返回
         * @param circum 环境
         */
        public Calculate(circum: Store): Table
        {
            let ret = circum.Search(this.name);
            if (ret == null) throw new Error("符号引用错误！不存在这样的符号！");
            return ret;
        }
    }
    export abstract class LispProcess extends Table
    {

        public abstract Call(circum: Store, pars: Table): Table;
        public abstract get Name(): string;
    }
    /**
     * 定义过程 过程的表结构为((name par1 par2.....)(body))
     */
    export class LispDefProcess extends LispProcess
    {
        public self: Table = null;
        public constructor(def: Table)
        {
            super();
            this.type = "process";
            //保存过程定义
            if (def == null || def.childs.length != 2) throw new Error("过程定义错误！");
            //检测参数表
            let deftable=def.childs[0];
            if(deftable.Type!="normal") throw new Error("过程定义符号表必须为Normal型!");
            for(let a of deftable.childs)
            {
                if(!(a instanceof LispSymbolRefence))
                {
                    throw new Error("错误！过程声明中必须全为SymbolRefence");
                }
            }
            this.self = def;
        }
        public get Define(): Table
        {
            return this.self.childs[0];
        }
        public get ParsTable(): Table
        {
            //从定义表中取出参数表
            let ret = this.self.childs[0].childs;
            ret = ret.slice(1, ret.length);
            let res = new Table();
            res.childs = ret;
            return res;
        }
        public get Name(): string
        {
            //匿名函数
            // if(this.self.childs[0].Empty()) return "";
            let t = this.self.childs[0].childs[0] as LispSymbolRefence;
            return t.name;
        }
        public get ParsCount()
        {
            return this.self.childs[0].childs.length - 1;
        }
        public get Body()
        {
            return this.self.childs[1];
        }
        public Calculte(circum: Store): Table
        {
            return this;
        }
         /**
         * 此为过程调用
         * 形式与普通的表计算有区别 
         * 这将创建一层新的环境
         * @param circum 上层环境
         * @param pars 参数表 取其childs对形参表做替换
         */
        public Call(circum: Store, pars: Table): Table
        {
            //构造此层搜索函数和环境
            let searfun=new Store(circum);
            //添加自身
            searfun.Set("this",this);
            //将参数加入环境
            if (pars == null || pars.childs.length < this.ParsCount) throw "错误！调用参数过少！";
            for (let i = 0; i < this.ParsTable.childs.length; ++i)
            {
                //计算每个参数 注意计算参数时以上层的环境为环境
                let res=pars.childs[i].Calculate(circum);
                //加入环境
                searfun.Set((<LispSymbolRefence>this.ParsTable.childs[i]).name, res);
            }
            //使用新的环境搜索函数计算body表
            return this.Body.Calculate(searfun);
        }
    }



/**
 * 此为用于链接RawProcess与内部环境的环境
 * 此环境为一个链接层 本身并不保存任何符号
 * 这个链接层 不是每个原生过程都需要
 * 因此这里的trysearch和set都直接链接
 */
    class RawCircum extends Store
    {
        public constructor(circum:Store,protected rfuncbody:LispRawProcess)
        {
            super(circum);
        }
        public TrySearch(name:string)
        {
            if(name=="this")
            {
                return this.rfuncbody;
            }
            return this.supercir.TrySearch(name);
        }
        public TrySet(name:string,value:Table)
        {
            return this.supercir.TrySet(name,value);
        }
        public Set(name:string,value:Table)
        {
            return this.supercir.Set(name,value);
        }
        
    };
    /**
     * 特殊过程：原生过程
     * 此类接收一个函数 并代表这个函数
     * 一般来说只有对函数进行简单封装时才使用这个类
     */
    export class LispRawProcess extends LispProcess
    {

            public Call(circum: Store, pars: Table): Table
            {
                //构造链接层
                // let thiscircum=new RawCircum(circum,this);
                let thiscircum=circum;
                //转换参数
                let rarr=[];
                if(this.IsNeedCircum) rarr.push(thiscircum);
                for(let v of pars.childs)
                {
                    //根据是否需要计算的标记 选择计算还是保持原值(原表结构)
                    let vobj=v;
                    if(this.IsNeedCal)
                    {
                        //计算参数以上层环境为环境
                        vobj=v.Calculate(circum);
                    }
                        //当vboj是一个对象并且需要转换时 转换为js原生对象
                        if(vobj.Type=="object"&&this.IsNeedTrans)
                        {
                            let t:LispObject=vobj as LispObject;
                            rarr.push(t.Object);
                            continue;
                        }
                    //对于非数据对象 或者不需要转换的数据对象 就只能传原始值了
                    //然后就是不用计算的也是原始值
                    rarr.push(vobj);
                }
                //调用
                let ret= this.rawFunc.apply(this.CallThis,rarr);
                //返回是表就不做处理
                if(ret instanceof Table) return ret;
                //做对应处理
                switch(typeof ret)
                {
                    case "function":
                    return new LispRawProcess("",ret);
                    default:
                    return new LispObject(ret);
                }
                //注意这里处理函数的方法
                //采用默认参数 也就是this对象为null不提供环境 先计算参数(应用序 常规过程调用模式)
            }
        /**
         * 
         * @param Name 此过程的名字 与环境无关 仅仅作为一个属性
         * @param rawFunc 封装的原生函数
         * @param IsNeedCircum 是否需要第一个参数传circum回调函数
         * 
         */
        public constructor(public Name: string, public rawFunc: Function,public IsNeedCircum:boolean=false,public CallThis:any=null,public IsNeedCal=true,public IsNeedTrans=true)
        {
            super();
            this.type="process";
        }

        public Calculate(circum:Store)
        {
            return this;
        }
        
    }
}