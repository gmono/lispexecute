# lispexecute
ts实现Lisp解释器
# 实现介绍
## DataType
DataType为核心数据体系，其定义为表结构，求值模型等 
其中Table为全局基类 
代表常规表 常规表为一个子表的集合 
object symbolrefence继承于Table 
number string 继承于object 
Process继承于Table 为过程的抽象基类 
Process分为定义的（复合）Process和原生（环境提供）的Process 
其中object求值得自身，symbolrefence求值得其引用的Table 
常规Table求值则为计算式求值 
Process不可求值，只能通过Call方法进行调用 
不管是Calculate求值还是Call调用 都要提供一个“环境查询函数”，来链接到上层作用域 
Call内将单独创建一个作用域，而Calculate将不创建直接沿用传入的查询函数 

## Lisp
叫Lisp但是实际上和Lisp语法没有任何关系，其提供一个顶层容器，对外公开注册符号和获取符号的接口，最重要的是对外公开了Run方法，可以对一个Table进行求值 

## Parser
此为将Lisp语法文本解析为Table树的解析器，理论上可以将各种语法的代码解析为Table树，使用Lisp模块运行 

# 说明
DateType核心提供了很方便的对外部函数进行封装的RawProcess类，并且其中所有的预定义符号都是后期通过此类进行注册的，这样保证了灵活性

# 进展
目前除了添加各种预定义符号外，就只剩尾递归没有实现了 
将CircumStance改名为Store 完全独立出来提供各种功能 
# 展望
考虑在Store中加上通用的“对象层次访问语法” 即 xx.xx.xx的形式进行对象访问。。
考虑规定一个通用的层次下降接口 并以此为基类
考虑实现数组访问语法[] 并进一步考虑实现“操作符形式化”这样就可以使用操作符重载等 
同时对对象提供基础操作支持 可能包括上述的层次语法 
## 遥远的展望
将Table和普通JS对象提供完全相同的访问接口 这样就可以实现真正的数据程序一体化
## 重新规划
首先Table是作为程序的表，而数据全都是LispObject，LispObject可以接受任何数据对象，当然也包括Table，将数据和程序互相转换也就是将LispObject包装的Table和Table类型之间互相转换，通过特定操作符实现
## 第二规划
第二种规划，是不区分Object和Table 因为Object本身也继承于Table，LispObject为原子表，即object型，Table为复合表，即normal型，Table只是可以被计算，但是否计算，由程序解释器内部决定