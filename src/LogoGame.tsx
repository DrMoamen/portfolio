import {useCallback,useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {X,Volume2,VolumeX} from 'lucide-react'

type Lang='en'|'ar'
type Phase='idle'|'opening'|'intro'|'playing'|'result'|'closing'
type Tg={id:number;x:number;y:number}

const T={
 en:{found:'Found it!',sub:'Catch as many circles as you can in 15 seconds',start:'START',done:"Time's up! Your score",best:'Best',again:'PLAY AGAIN',close:'CLOSE',score:'Score',circle:'Circle',sound:'Sound',dlg:'Hidden mini game'},
 ar:{found:'لقيتها!',sub:'اصطاد أكبر عدد من الدواير في 15 ثانية',start:'ابدأ اللعبة',done:'خلصت! نتيجتك',best:'أفضل نتيجة',again:'العب تاني',close:'إغلاق',score:'النقاط',circle:'دايرة',sound:'الصوت',dlg:'لعبة مخفية'}}

const GAME_SECONDS=15
const SIZE=60
const BEST_KEY='mm-logo-game-best'

/* ---------- sound (WebAudio, no files needed) ---------- */
let ac:AudioContext|null=null
let muted=false
function ctx(){
 if(!ac){const C=window.AudioContext||(window as any).webkitAudioContext;if(C){try{ac=new C()}catch{}}}
 if(ac&&ac.state==='suspended')ac.resume()
 return ac}
function note(f:number,t0:number,dur:number,type:OscillatorType,vol:number){
 const a=ctx();if(!a||muted)return
 const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+t0
 o.type=type;o.frequency.value=f
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur)
 o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.05)}
const fanfare=()=>{note(392,0,.14,'square',.1);note(523,.13,.14,'square',.1);note(659,.26,.14,'square',.1);[523,659,784,1047].forEach(f=>note(f,.42,.9,'triangle',.12))}
const blip=()=>{note(880,0,.08,'square',.07);note(1320,.05,.1,'square',.06)}
const lose=()=>{note(392,0,.15,'triangle',.12);note(330,.14,.15,'triangle',.12);note(262,.28,.4,'triangle',.12)}

/* ---------- component ---------- */
export default function LogoGame({lang}:{lang:Lang}){
 const t=T[lang]
 const markRef=useRef<HTMLElement>(null)
 const bgRef=useRef<HTMLDivElement>(null)
 const anim=useRef<Animation|null>(null)
 const origin=useRef({x:0,y:0,r:0})
 const resetT=useRef(0),spawnT=useRef(0),tick=useRef(0)
 const idRef=useRef(0),scoreRef=useRef(0),phaseRef=useRef<Phase>('idle')

 const [clicks,setClicks]=useState(0)
 const [phase,setPhaseState]=useState<Phase>('idle')
 const [score,setScore]=useState(0)
 const [left,setLeft]=useState(GAME_SECONDS)
 const [best,setBest]=useState(0)
 const [mute,setMute]=useState(false)
 const [tgs,setTgs]=useState<Tg[]>([])
 const [rings,setRings]=useState<Tg[]>([])

 const setPhase=(p:Phase)=>{phaseRef.current=p;setPhaseState(p)}
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches
 const circle=(r:number)=>`circle(${r}px at ${origin.current.x}px ${origin.current.y}px)`

 useEffect(()=>{try{setBest(Number(localStorage.getItem(BEST_KEY))||0)}catch{}},[])
 useEffect(()=>{muted=mute},[mute])

 const stopTimers=()=>{clearInterval(tick.current);clearTimeout(spawnT.current)}
 useEffect(()=>()=>{stopTimers();clearTimeout(resetT.current)},[])

 /* lock page scroll while the overlay is open */
 useEffect(()=>{
  if(phase==='idle')return
  const prev=document.body.style.overflow
  document.body.style.overflow='hidden'
  return()=>{document.body.style.overflow=prev}},[phase==='idle'])

 /* ---- opening: orange circle grows from the logo until it fills the screen ---- */
 const open=()=>{
  const m=markRef.current!.getBoundingClientRect()
  const x=m.left+m.width/2,y=m.top+m.height/2
  const W=document.documentElement.clientWidth,H=window.innerHeight
  origin.current={x,y,r:Math.hypot(Math.max(x,W-x),Math.max(y,H-y))+4}
  ctx();fanfare()
  markRef.current!.animate([{transform:'rotate(0) scale(1)'},{transform:'rotate(360deg) scale(1.3)',offset:.6},{transform:'rotate(360deg) scale(1)'}],{duration:800,easing:'ease-in-out'})
  setScore(0);setLeft(GAME_SECONDS);setTgs([]);setRings([])
  setPhase('opening')}

 useEffect(()=>{
  const el=bgRef.current;if(!el)return
  if(phase==='opening'){
   anim.current?.cancel()
   anim.current=el.animate([{clipPath:circle(0)},{clipPath:circle(origin.current.r)}],{duration:reduced()?1:800,easing:'cubic-bezier(.6,.05,.2,1)',fill:'forwards'})
   anim.current.onfinish=()=>setPhase('intro')}
  if(phase==='closing'){
   anim.current?.cancel()
   anim.current=el.animate([{clipPath:circle(origin.current.r)},{clipPath:circle(0)}],{duration:reduced()?1:600,easing:'cubic-bezier(.6,.05,.2,1)',fill:'forwards'})
   anim.current.onfinish=()=>{anim.current?.cancel();anim.current=null;setPhase('idle');setClicks(0)}}
 },[phase])

 const close=useCallback(()=>{
  if(phaseRef.current==='idle'||phaseRef.current==='closing'||phaseRef.current==='opening')return
  stopTimers();setTgs([]);setRings([]);setPhase('closing')},[])

 useEffect(()=>{
  if(phase==='idle')return
  const k=(e:KeyboardEvent)=>{if(e.key==='Escape')close()}
  addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[phase==='idle',close])

 /* ---- the game ---- */
 const spawn=()=>{
  if(phaseRef.current!=='playing')return
  const W=document.documentElement.clientWidth,H=window.innerHeight
  const id=++idRef.current
  const x=12+Math.random()*(W-SIZE-24),y=84+Math.random()*(H-SIZE-110)
  setTgs(a=>[...a,{id,x,y}])
  spawnT.current=window.setTimeout(spawn,420+Math.random()*380)}

 const endGame=()=>{
  stopTimers();setTgs([]);setRings([])
  const s=scoreRef.current
  setBest(b=>{const nb=Math.max(b,s);try{localStorage.setItem(BEST_KEY,String(nb))}catch{};return nb})
  setLeft(0);setPhase('result');lose()}

 const startGame=()=>{
  ctx();stopTimers()
  scoreRef.current=0;setScore(0);setLeft(GAME_SECONDS);setTgs([]);setRings([])
  setPhase('playing')
  const end=performance.now()+GAME_SECONDS*1000
  tick.current=window.setInterval(()=>{
   const r=(end-performance.now())/1000
   if(r<=.001)endGame();else setLeft(r)},100)
  spawnT.current=window.setTimeout(spawn,300)}

 const hit=(e:React.PointerEvent,g:Tg)=>{
  e.preventDefault()
  if(phaseRef.current!=='playing')return
  scoreRef.current++;setScore(scoreRef.current);blip()
  setTgs(a=>a.filter(x=>x.id!==g.id))
  setRings(a=>[...a,g])}

 /* ---- 3 quick clicks on the logo ---- */
 const onLogo=()=>{
  if(phaseRef.current!=='idle')return
  clearTimeout(resetT.current)
  const n=clicks+1
  if(n>=3){setClicks(3);open();return}
  setClicks(n)
  resetT.current=window.setTimeout(()=>setClicks(0),2000)}

 const showPanel=phase==='intro'||phase==='playing'||phase==='result'

 return <>
  <a href="#top" className="brand" onClick={onLogo}>
   <i className="mark" ref={markRef} style={{width:16,height:30}}/>
   <span>Mohamed Momen</span>
   <span className="lg-dots" aria-hidden="true" data-on={clicks>0&&phase==='idle'}>{[0,1,2].map(i=><b key={i} className={i<clicks?'on':''}/>)}</span>
  </a>

  {phase!=='idle'&&createPortal(
   <div className="lg-root" role="dialog" aria-modal="true" aria-label={t.dlg}>
    <div className="lg-bg" ref={bgRef} style={{clipPath:circle(0)}}/>
    {showPanel&&<div className="lg-panel">
     <div className="lg-hud">
      <span>{t.score}: <b>{score}</b></span>
      <span className="lg-time" aria-live="off">{phase==='playing'?Math.ceil(left-.001):''}</span>
      <span className="lg-ctl">
       <button className="lg-ib" onClick={()=>setMute(m=>!m)} aria-label={t.sound} aria-pressed={!mute}>{mute?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>
       <button className="lg-ib" onClick={close} aria-label={t.close}><X size={18}/></button>
      </span>
     </div>

     {phase==='intro'&&<div className="lg-center">
      <i className="mark lg-pf" style={{background:'#0B0B0D'}}/>
      <h2>{t.found}</h2><p>{t.sub}</p>
      <button className="lg-b" autoFocus onClick={startGame}>{t.start}</button>
     </div>}

     {phase==='result'&&<div className="lg-center">
      <p>{t.done}</p><div className="lg-fs">{score}</div><p>{t.best}: {best}</p>
      <div className="lg-row">
       <button className="lg-b" autoFocus onClick={startGame}>{t.again}</button>
       <button className="lg-b o" onClick={close}>{t.close}</button>
      </div>
     </div>}

     {tgs.map(g=><button key={g.id} className="lg-t" aria-label={t.circle} style={{left:g.x,top:g.y}}
       onPointerDown={e=>hit(e,g)} onAnimationEnd={()=>setTgs(a=>a.filter(x=>x.id!==g.id))}/>)}
     {rings.map(g=><div key={g.id} className="lg-ring" style={{left:g.x,top:g.y}} onAnimationEnd={()=>setRings(a=>a.filter(x=>x.id!==g.id))}/>)}
    </div>}
   </div>,document.body)}
 </>}
