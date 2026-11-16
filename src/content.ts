import rawSite from '../content/site.json'
export type Bi={en:string;ar:string}
export type Project={id:string;order:number;year:string;title:Bi;category:Bi;description:Bi;cover:string;images:string[];client:string;role:Bi;overview:Bi;challenge:Bi;concept:Bi;direction:Bi;process:Bi}
const bi=(v:any):Bi=>({en:v?.en??'',ar:v?.ar??''})
const str=(x:any)=>typeof x==='string'?x:(x&&(x.image||x.skill))||''
const mods=import.meta.glob('../content/projects/*.json',{eager:true}) as Record<string,{default:any}>
export const projects:Project[]=Object.entries(mods).map(([f,m])=>{const d=m.default||{}
 return {id:f.split('/').pop()!.replace('.json',''),order:d.order??0,year:d.year??'',title:bi(d.title),category:bi(d.category),description:bi(d.description),cover:d.cover||'',
  images:(d.images||[]).map(str).filter(Boolean),client:d.client||'',role:bi(d.role),overview:bi(d.overview),challenge:bi(d.challenge),concept:bi(d.concept),direction:bi(d.direction),process:bi(d.process)}
}).sort((a,b)=>a.order-b.order)
const r:any=rawSite||{}
export const site={photo:r.photo||'',
 contact:{email:r.contact?.email||'',whatsapp:r.contact?.whatsapp||'',behance:r.contact?.behance||'',instagram:r.contact?.instagram||'',linkedin:r.contact?.linkedin||''},
 about:{p1:bi(r.about?.p1),p2:bi(r.about?.p2),p3:bi(r.about?.p3)},
 skills:(r.skills||[]).map(str).filter(Boolean) as string[],
 services:(r.services||[]).map(bi) as Bi[],
 experience:(r.experience||[]).map((e:any)=>({company:e.company||'',role:bi(e.role),duration:bi(e.duration),dates:e.dates||''}))}
