import { Store, Table, LispSymbolRefence, LispObject } from "./DataType";
import { SymDecorator } from "./Execute";
import { LispExecuter } from "./LispExecuter";

/**
 * 一种测试性质的媒体控制语言
 */
export class MediaControlExecuter extends LispExecuter {
  /**
   * 定义一个资源 参数为 ：  type url（http file） 测试代码 (media video "http://xxxx")
   * @param cir 环境
   * @param args 参数
   */
  @SymDecorator.TableSymbol("media")
  public Video(cir: Store, ...args) {
    let [type, url] = args as Table[];
    if (type.Type == "symbol") {
      let t = type as LispSymbolRefence;
      let u = url as LispObject;
      if (t.name == "video") {
        //测试
        let s = u.Object as string;
        alert("type:video " + "url:" + s);
      }
    } else {

    }
  }
}