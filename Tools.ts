import { Table } from "./DataType";

export interface Paramter {
  validator: (t: Table) => boolean
}
/**
 * 接收一定的类型 校验 否则返回false accept返回一个类型转换过的序列
 * @param seq 一个类型序列 规定要给的类型 比如 symbol symbol normal
 */
export function accept(seq: string[], args: Table[]) {

}