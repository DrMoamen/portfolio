import {useEffect,useRef,useState,type ReactNode} from 'react'
import {motion} from 'framer-motion'
import {ArrowRight,Menu,X} from 'lucide-react'
import {site,projects,type Project} from './content'
import {UI} from './ui'
type Lang='en'|'ar'
const Arrow=()=><ArrowRight size={16} strokeWidth={2.5}/>
function Img({src,alt='',cls='',onOpen}:{src?:string;alt?:string;cls?:string;onOpen?:()=>void}){
 const [ok,setOk]=useState(!!src)
 const act=ok&&onOpen
 return <div className={`ph ${cls}${act?' zoom':''}`} data-l={`REPLACE · ${src||'add image in admin'}`} {...(act?{role:'button',tabIndex:0,'aria-label':'View full image',onClick:onOpen,onKeyDown:(e:{key:string})=>{if(e.key==='Enter')onOpen()}}:{})}>{ok&&<img src={src} alt={alt} loading="lazy" decoding="async" onError={()=>setOk(false)}/>}</div>}
const Rv=({className='',children}:{className?:string;children:ReactNode})=><motion.div className={className} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,ease:[.2,.7,.2,1]}}>{children}</motion.div>
function Cursor(){
 const el=useRef<HTMLDivElement>(null)
 useEffect(()=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return
  let x=0,y=0,tx=0,ty=0,raf=0
  const mv=(e:PointerEvent)=>{tx=e.clientX;ty=e.clientY;el.current?.classList.toggle('big',!!(e.target as HTMLElement).closest('a,button'))}
  const loop=()=>{x+=(tx-x)*.2;y+=(ty-y)*.2;if(el.current)el.current.style.transform=`translate(${x-7}px,${y-7}px)`;raf=requestAnimationFrame(loop)}
  addEventListener('pointermove',mv);loop()
  return()=>{removeEventListener('pointermove',mv);cancelAnimationFrame(raf)}},[])
 return <div id="cur" ref={el}/>}
function Case({id,L,onClose,onOpen}:{id:string|null;L:Lang;onClose:()=>void;onOpen:(id:string)=>void}){
 const t=UI[L],ref=useRef<HTMLDivElement>(null),last=useRef<Project>()
 const [lb,setLb]=useState<number|null>(null),lbRef=useRef<number|null>(null)
 lbRef.current=lb
 const p=projects.find(x=>x.id===id);if(p)last.current=p
 const sp=last.current
 useEffect(()=>{setLb(null);document.body.style.overflow=id?'hidden':'';if(id)ref.current?.scrollTo(0,0)
  const k=(e:KeyboardEvent)=>{if(e.key==='Escape'&&id){if(lbRef.current!==null)setLb(null);else onClose()}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[id])
 const keys=['overview','challenge','concept','direction','process'] as const
 const imgs=sp?.images?.length?sp.images:['','']
 const all=[sp?.cover,...(sp?.images||[])].filter(Boolean) as string[]
 const step=(d:number)=>setLb(i=>i===null?i:(i+d+all.length)%all.length)
 const open=(s:string)=>s?()=>setLb(all.indexOf(s)):undefined
 useEffect(()=>{if(lb===null)return
  const k=(e:KeyboardEvent)=>{const f=L==='ar'?-1:1;if(e.key==='ArrowRight')step(f);if(e.key==='ArrowLeft')step(-f)}
  addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[lb===null,all.length,L])
 const gal:ReactNode[]=[]
 for(let j=0;j<imgs.length;j++){
  if(j%3===0)gal.push(<Img key={j} src={imgs[j]} cls="full" onOpen={open(imgs[j])}/>)
  else if(j%3===1)gal.push(imgs[j+1]!==undefined?<div className="two" key={j}><Img src={imgs[j]} cls="half" onOpen={open(imgs[j])}/><Img src={imgs[j+1]} cls="half" onOpen={open(imgs[j+1])}/></div>:<Img key={j} src={imgs[j]} cls="full" onOpen={open(imgs[j])}/>)}
 return <>
 <div id="case" ref={ref} className={id?'open':''} role="dialog" aria-modal="true" aria-hidden={!id}>
  <div className="top"><span className="m">{t.of} {sp?String(projects.indexOf(sp)+1).padStart(2,'0'):''} / {String(projects.length).padStart(2,'0')}</span>
   <button className="btn s" style={{padding:'8px 16px'}} onClick={onClose}><X size={16}/> {t.close}</button></div>
  {sp&&<div className="wrap cs">
   <p className="m ac">{sp.category[L]}</p><h1 style={{marginTop:14}}>{sp.title[L]}</h1>
   <div className="facts"><div><span className="m">{t.year}</span><br/>{sp.year}</div><div><span className="m">{t.client}</span><br/>{sp.client||'—'}</div><div><span className="m">{t.role}</span><br/>{sp.role?.[L]||'—'}</div></div>
   <Img src={sp.cover} alt={sp.title[L]} cls="full" onOpen={open(sp.cover)}/>
   {keys.map((k,j)=><div className="blk" key={k}><h3 className="m">0{j+1} — {t.sec[j]}</h3><p>{sp[k]?.[L]||t.fill}</p></div>)}
   <h3 className="m" style={{marginTop:50}}>{t.out}</h3>{gal}
   <h3 className="m" style={{marginTop:70}}>{t.rel}</h3>
   <div className="rel" style={{marginTop:16}}>{projects.filter(x=>x.id!==sp.id).slice(0,3).map(r=>
    <a key={r.id} href="#work" className="card in" style={{margin:0,gridColumn:'auto'}} onClick={e=>{e.preventDefault();onOpen(r.id)}}><Img src={r.cover} alt={r.title[L]}/><div className="meta"><h3 style={{fontSize:'1.2rem'}}>{r.title[L]}</h3></div><span className="m">{r.category[L]}</span></a>)}</div>
  </div>}</div>
 {lb!==null&&all[lb]&&<div className="lb" role="dialog" aria-modal="true" onClick={()=>setLb(null)}>
  <img src={all[lb]} alt=""/>
  <button className="lbx" aria-label="Close" onClick={()=>setLb(null)}><X size={22}/></button>
  {all.length>1&&<><button className="lbn p" aria-label="Previous" onClick={e=>{e.stopPropagation();step(-1)}}>‹</button><button className="lbn n" aria-label="Next" onClick={e=>{e.stopPropagation();step(1)}}>›</button></>}
  <span className="m lbc">{lb+1} / {all.length}</span></div>}
 </>}
export default function App(){
 const [L,setL]=useState<Lang>(()=>{try{return(localStorage.getItem('lang') as Lang)||'en'}catch{return'en'}})
 const [cur,setCur]=useState<string|null>(null),[menu,setMenu]=useState(false)
 const t=UI[L]
 useEffect(()=>{document.documentElement.lang=L;document.documentElement.dir=t.dir;try{localStorage.setItem('lang',L)}catch{}},[L,t.dir])
 useEffect(()=>{document.body.style.overflow=menu?'hidden':''},[menu])
 const ids=['work','about','experience','services','contact']
 const c=site.contact as Record<string,string>
 const url=(v:string,base:string)=>/^https?:\/\//.test(v)?v:base+v.replace(/^@/,'').replace(/^\//,'')
const href:Record<string,(v:string)=>string>={email:v=>'mailto:'+v,whatsapp:v=>'https://wa.me/'+v.replace(/\D/g,''),behance:v=>url(v,'https://www.behance.net/'),instagram:v=>url(v,'https://www.instagram.com/'),linkedin:v=>url(v,'https://www.linkedin.com/in/')}
const short=(k:string,v:string)=>k==='email'||k==='whatsapp'?v:v.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'').split('/').pop()||v
 const svc=site.services.map(s=>s[L])
 return <>
  <Cursor/>
  <nav aria-label="Main">
   <a href="#top" className="brand"><i className="mark" style={{width:16,height:30}}/><span>Mohamed Momen</span></a>
   <div className={`links${menu?' open':''}`} onClick={e=>{if((e.target as HTMLElement).tagName==='A')setMenu(false)}}>{t.nav.map((n,i)=><a key={i} href={'#'+ids[i]}>{n}</a>)}</div>
   <div className="tools"><button className="lang m" onClick={()=>setL(L==='en'?'ar':'en')} aria-label="Switch language">{t.toggle}</button>
    <button className="burger" onClick={()=>setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button></div>
  </nav>
  <main id="top">
   <header className="hero wrap"><div>
     <p className="m" style={{marginBottom:22}}>{t.label}</p>
     <h1 dangerouslySetInnerHTML={{__html:t.h1}}/>
     <p className="sub">{t.sub}</p>
     <div className="ctas"><a className="btn p" href="#work">{t.cta1} <Arrow/></a><a className="btn s" href="#contact">{t.cta2}</a></div></div>
    <div className="comp" aria-hidden="true">{[0,1,2].map(i=><div key={i} className={`f ph${i===1?' o':''}`} data-l={`REPLACE · ${projects[i]?.cover||'hero image'}`}>{projects[i]?.cover&&<img src={projects[i].cover} alt=""/>}</div>)}<div className="bigmark"/></div>
   </header>
   <div className="marq m" aria-hidden="true"><div>{(svc.join(' ✦ ')+' ✦ ').repeat(4)}</div></div>
   <section id="work" className="wrap"><div className="head"><h2>{t.workT}</h2><p className="m">({String(projects.length).padStart(2,'0')})</p></div>
    <div className="grid">{projects.map((p,i)=>
     <motion.a key={p.id} className="card in" href="#work" onClick={e=>{e.preventDefault();setCur(p.id)}} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.8,ease:[.2,.7,.2,1]}}>
      <div className="imgbox"><Img src={p.cover} alt={p.title[L]}/></div>
      <div className="meta"><h3>{p.title[L]}</h3><span className="m">{String(i+1).padStart(2,'0')} / {p.year}</span></div>
      <span className="m">{p.category[L]}</span><p>{p.description[L]}</p><span className="vp m">{t.view} <Arrow/></span></motion.a>)}</div></section>
   <section id="about" className="wrap"><div className="ab"><Rv><Img src={site.photo} alt="Mohamed Momen"/><p className="m" style={{marginTop:14}}>ASSIUT, EGYPT</p></Rv>
    <Rv><p className="m">{t.aboutL}</p><h2 style={{marginTop:14,fontSize:'clamp(1.8rem,4.6vw,4.2rem)'}}>{t.aboutT}</h2>
     {(['p1','p2','p3'] as const).map(k=><p key={k}>{site.about[k][L]}</p>)}
     <div className="chips">{site.skills.map(s=><span key={s}>{s}</span>)}</div></Rv></div></section>
   <section id="experience" className="wrap"><div className="head"><h2>{t.expT}</h2></div>
    {site.experience.map(e=><Rv key={e.company} className="row"><span className="m">{e.dates}</span><div><b>{e.company}</b><p className="m" style={{marginTop:8}}>{e.role[L]}</p></div><span className="ac">{e.duration[L]}</span></Rv>)}</section>
   <section id="services" className="wrap"><div className="head"><h2>{t.svT}</h2></div>
    {svc.map((s,i)=><Rv key={i} className="sv"><span className="m">0{i+1}</span>{s}</Rv>)}</section>
   <section id="contact" className="wrap ct"><p className="m">{t.ctL}</p><h2 style={{marginTop:16}} dangerouslySetInnerHTML={{__html:t.ctH}}/>
    <a className="btn p" href={c.email?'mailto:'+c.email:'#contact'}>{t.start}</a>
    <div className="cl">{Object.keys(t.cn).map(k=>c[k]?<a key={k} href={href[k](c[k])} target="_blank" rel="noopener"><span className="m">{t.cn[k as keyof typeof t.cn]}</span><b>{short(k,c[k])} ↗</b></a>:<div key={k}><span className="m">{t.cn[k as keyof typeof t.cn]}</span><b style={{opacity:.55}}>{t.ph}</b></div>)}</div></section>
  </main>
  <footer className="m"><span>© {new Date().getFullYear()} Mohamed Momen</span><span>{t.foot}</span></footer>
  <Case id={cur} L={L} onClose={()=>setCur(null)} onOpen={setCur}/>
 </>}
