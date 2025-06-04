// export default function getChildIndex(node) {
//   return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
// }
export default function getChildIndex(node, fltFn = false) {
  return fltFn
    ? Array.from(node.parentNode.childNodes).filter(fltFn).indexOf(node)
    : Array.from(node.parentNode.childNodes).indexOf(node)
  // return Array.prototype.indexOf.call(, );
}