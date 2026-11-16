import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react'

type Tok={k:'t';units:{s:string;i:number}[]}|{k:'e';tag:string;cls:string;ch:Tok[]}

function parse(html:string,lang:'en'|'ar'){
 const root=new DOMParser().parseFromString(`<div>${html}</div>`,'text/html').body.firstElementChild as HTMLElement
 let i=0
 const walk=(nodes:NodeListOf<ChildNode>):Tok[]=>{
  const out:Tok[]=[]
  nodes.forEach(n=>{
   if(n.nodeType===3){
    const txt=n.textContent||''
    // Arabic: type word by word so letters keep joining; English: letter by letter
    const parts=lang==='ar'?txt.split(/(\s+)/).filter(Boolean):Array.from(txt)
    out.push({k:'t',units:parts.map(s=>({s,i:i++}))})
   }else if(n.nodeType===1){
    const el=n as HTMLElement
    out.push({k:'e',tag:el.tagName.toLowerCase(),cls:el.className,ch:walk(el.childNodes)})
   }
  })
  return out
 }
 const tree=walk(root.childNodes)
 return {tree,total:i,plain:root.textContent||''}
}

export default function Typewriter({html,lang,instant,onDone}:{html:string;lang:'en'|'ar';instant:boolean;onDone:()=>void}){
 const {tree,total,plain}=useMemo(()=>parse(html,lang),[html,lang])
 const reduce=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches
 const skip=instant||reduce
 const [n,setN]=useState(skip?total:0)
 const [caret,setCaret]=useState(!skip)
 const cb=useRef(onDone);cb.current=onDone
 const sk=useRef(skip);sk.current=skip

 useEffect(()=>{
  if(sk.current){setN(total);setCaret(false);cb.current();return}
  setN(0);setCaret(true)
  let i=0,t=0,t2=0
  const base=lang==='ar'?170:52
  const step=()=>{
   i++;setN(i)
   if(i>=total){cb.current();t2=window.setTimeout(()=>setCaret(false),1600);return}
   t=window.setTimeout(step,base+Math.random()*base*.6)
  }
  t=window.setTimeout(step,500)
  return()=>{clearTimeout(t);clearTimeout(t2)}
 },[html,lang,total])

 const done=n>=total
 const caretEl=<span className={`tw-caret${n===0||done?' idle':''}`} aria-hidden="true"/>
 const render=(toks:Tok[]):ReactNode=>toks.map((tk,a)=>{
  if(tk.k==='t')return tk.units.map(u=>(
   <span key={u.i} className={`u${u.i<n?' show':''}${u.i===total-1?' last':''}`}>
    {caret&&u.i===n&&caretEl}{u.s}
   </span>))
  const Tag=tk.tag as 'b'|'span'
  return <Tag key={a} className={tk.cls}>{render(tk.ch)}</Tag>
 })

 return <h1 className={`tw${done?' done':''}`} aria-label={plain}>
  <span aria-hidden="true">{render(tree)}{caret&&done&&caretEl}</span>
 </h1>
}
