import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"']+)/g;
function safeUrl(value: string) {
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}
function anchor(href: string, label: React.ReactNode, key: string | number) {
  return <a key={key} href={href} target="_blank" rel="noopener noreferrer"
    className="text-primary underline hover:text-primary/80 break-words" onClick={e=>e.stopPropagation()}>{label}</a>;
}
function plain(text: string, key: string) {
  return text.split(URL_REGEX).map((part,index)=> {
    const clean = part.replace(/[),.;]+$/, "");
    const url = safeUrl(clean);
    return url ? <React.Fragment key={key+index}>{anchor(url,clean,key+index)}{part.slice(clean.length)}</React.Fragment> : part;
  });
}
/** Preserve calendar text and every safe link, without rendering source HTML. */
export function linkifyText(text: string): React.ReactNode {
  if (!/<[a-z][\s\S]*>/i.test(text)) return plain(text,"text");
  const document = new DOMParser().parseFromString(text,"text/html");
  function render(node: Node, key: string): React.ReactNode {
    if (node.nodeType === 3) return plain(node.textContent || "",key);
    if (node.nodeType !== 1) return null;
    const element = node as Element;
    if (["SCRIPT","STYLE","IFRAME"].includes(element.tagName)) return null;
    if (element.tagName === "BR") return <br key={key}/>;
    const children = Array.from(node.childNodes).map((child,index)=>render(child,key+"-"+index));
    const url = element.tagName === "A" ? safeUrl(element.getAttribute("href") || "") : undefined;
    if (url) return anchor(url,element.textContent || url,key);
    return <React.Fragment key={key}>{children}{["DIV","P","LI"].includes(element.tagName) && <br/>}</React.Fragment>;
  }
  return Array.from(document.body.childNodes).map((node,index)=>render(node,String(index)));
}
