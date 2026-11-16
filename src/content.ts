import site from '../content/site.json'
export type Bi={en:string;ar:string}
export type Project={id:string;order:number;year:string;title:Bi;category:Bi;description:Bi;cover?:string;images?:string[];client?:string;role?:Bi;overview?:Bi;challenge?:Bi;concept?:Bi;direction?:Bi;process?:Bi}
const mods=import.meta.glob('../content/projects/*.json',{eager:true}) as Record<string,{default:Omit<Project,'id'>}>
export const projects:Project[]=Object.entries(mods).map(([f,m])=>({id:f.split('/').pop()!.replace('.json',''),...m.default})).sort((a,b)=>(a.order??0)-(b.order??0))
export {site}
