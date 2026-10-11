import {useState} from 'react'
import {DICT,STATUS_KEYS,CAT_KEYS,catKey,toolKey,useT,locale} from './i18n'
import {dl,toCSV,parseCSV,toXLSX,fromXLSX,exportReport} from './io'
import {useData,clean,EMAIL_RE} from './data'
import {useToast} from './ui'
export const COLS={projects:[['name',28],['desc',40],['status',14],['category',16],['tags',24],['tools',24],['accounts',34],['created',14]],accounts:[['name',22],['email',32],['note',36],['count',12],['projects',36]]}
const ALIAS={name:['Tên dự án','Project name']}
export const rec={
 projects:(p,m)=>({name:p.name,desc:p.desc||'',status:p.status,category:catKey(p.category),tags:p.tags||[],tools:(p.tools||[]).map(toolKey),accounts:(p.userIds||[]).map(i=>m[i]?.email).filter(Boolean)}),
 accounts:a=>({name:a.name||'',email:a.email,note:a.note||''})}
const get=(o,k)=>{for(const n of [k,DICT.vi['col.'+k],DICT.en['col.'+k],...(ALIAS[k]||[])])if(o[n]!==undefined)return o[n]}
const list=x=>(Array.isArray(x)?x:String(x??'').split(/[,;\n]+/)).map(clean).filter(Boolean)
const tagList=x=>(Array.isArray(x)?x:String(x??'').split(/[\s,;]+/)).map(i=>String(i).replace(/^#+/,'').trim().toLowerCase()).filter(i=>/^[\p{L}\p{N}._+-]{1,30}$/u.test(i))
const match=(val,keys,pre)=>{const s=clean(val).toLowerCase();return keys.find(k=>k===s||['vi','en'].some(l=>DICT[l][pre+k].toLowerCase()===s))}
export function normalize(type,rows){
 const recs=[];let skipped=0
 rows.forEach(o=>{
  if(type==='accounts'){const email=clean(get(o,'email')).toLowerCase()
   if(!EMAIL_RE.test(email)||email.length>100){skipped++;return}
   recs.push({name:clean(get(o,'name')).slice(0,60),email,note:String(get(o,'note')??'').trim().slice(0,200)})}
  else{const name=clean(get(o,'name'))
   if(name.length<2||name.length>80){skipped++;return}
   const cat=get(o,'category')
   recs.push({name,desc:String(get(o,'desc')??'').trim().slice(0,500),status:match(get(o,'status'),STATUS_KEYS,'status.')||'active',
    category:match(cat,CAT_KEYS,'cat.')||catKey(clean(cat)),tags:[...new Set(tagList(get(o,'tags')))].slice(0,10),tools:list(get(o,'tools')).map(toolKey).map(x=>x.slice(0,40)),
    accounts:list(get(o,'accounts')).map(e=>e.toLowerCase()).filter(e=>EMAIL_RE.test(e))})}})
 return {recs,skipped}}
export async function readRows(file,type){
 const ext=file.name.split('.').pop().toLowerCase();let rows
 if(ext==='json'){const j=JSON.parse(await file.text());rows=Array.isArray(j)?j:j[type]||j.data||[]}
 else if(ext==='csv')rows=parseCSV(await file.text());else if(ext==='xlsx')rows=await fromXLSX(await file.arrayBuffer());else throw new Error('x.badfile')
 if(rows.length>400)throw new Error('x.max');return rows}
export function useTransfer(type,items){
 const {t,lang}=useT(),toast=useToast(),{accMap,projects,importRecords}=useData(),[busy,setBusy]=useState(false)
 const run=async fn=>{setBusy(true);try{toast(await fn())}catch(e){toast(t(e.message||'x.err'),'error')}setBusy(false)}
 const exportAs=fmt=>run(async()=>{
  if(!items?.length)throw new Error('x.empty')
  const cols=COLS[type].map(([k,w])=>[k,t('col.'+k),w]),loc=locale(lang),name=`vibeledger-${type}-${new Date().toISOString().slice(0,10)}`
  const rows=items.map(it=>type==='projects'
   ?{name:it.name,desc:it.desc||'',status:t('status.'+it.status),category:t('cat.'+catKey(it.category)),tags:(it.tags||[]).map(x=>'#'+x).join(' '),tools:(it.tools||[]).map(x=>toolKey(x)==='Other'?t('other'):x).join(', '),accounts:(it.userIds||[]).map(i=>accMap[i]?.email).filter(Boolean).join(', '),created:it.createdAt?.toDate?.().toLocaleDateString(loc)||''}
   :{name:it.name||'',email:it.email,note:it.note||'',count:projects.filter(p=>p.userIds?.includes(it.id)).length,projects:projects.filter(p=>p.userIds?.includes(it.id)).map(p=>p.name).join(', ')})
  const title=t('nav.'+type)
  if(fmt==='csv')dl(new Blob([toCSV(cols,rows)],{type:'text/csv;charset=utf-8'}),name+'.csv')
  else if(fmt==='json')dl(new Blob([JSON.stringify({app:'VibeLedger',type,exportedAt:new Date().toISOString(),data:items.map(it=>rec[type](it,accMap))},null,2)],{type:'application/json'}),name+'.json')
  else if(fmt==='xlsx')dl(await toXLSX(cols,rows,title),name+'.xlsx')
  else await exportReport(fmt,title,cols,rows,name)
  return t('x.exported')})
 const importFile=file=>run(async()=>{
  const {recs,skipped}=normalize(type,await readRows(file,type))
  if(!recs.length)throw new Error('x.nodata')
  return t('x.imported',{...await importRecords({[type]:recs}),skipped})})
 return {busy,exportAs,importFile}}
