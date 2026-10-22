import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Plus,SearchX,Users} from 'lucide-react'
import {useT} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0A} from '../hooks'
import {Acts,Btn,CardSkeleton,Confirm,Empty,Fab,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {AccountDialog} from '../components/forms'

const Item=memo(function Item({a,projects,view,i,onEdit,onDelete}){
 const {t}=useT(),projs=(projects||[]).filter(p=>p.userIds?.includes(a.id)),style={animationDelay:`${Math.min(i,10)*30}ms`}
 const head=<div className="flex min-w-0 items-center gap-3"><span className="avatar !size-11 !text-base !ring-0">{(a.name||a.email)[0]}</span>
  <div className="min-w-0"><h3 className="truncate font-semibold">{a.name||a.email}</h3>{a.name&&<p className="truncate text-xs text-muted-foreground ">{a.email}</p>}</div></div>
 const chips=<div className="flex flex-wrap items-center gap-1.5">{projs.slice(0,3).map(p=><span key={p.id} className="chip max-w-40">{p.name}</span>)}
  {projs.length>3&&<span className="chip">+{projs.length-3}</span>}{!projs.length&&<span className="text-xs text-muted-foreground ">{t('item.noproj')}</span>}</div>
 const list=view==='list'
 return <article style={style} className={`card card-item card-hover anim-up min-w-0 p-4 sm:p-5 ${list?'flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-x-6':'flex flex-col gap-3'}`}>
  <div className="flex min-w-0 flex-col gap-3">{head}{a.note&&<p className="line-clamp-2 break-words text-sm text-muted-foreground">{a.note}</p>}</div>
  <div className="min-w-0">{chips}</div>
  <div className={`mt-auto flex items-center gap-2 border-t border-border pt-3 ${list?'md:contents':''}`}><span className={`flex-1 text-xs text-muted-foreground ${list?'md:hidden':''}`}>{t('item.nprojects',{n:projs.length})}</span><Acts onEdit={()=>onEdit(a)} onDelete={()=>onDelete(a)}/></div></article>})

export default function Accounts({pending,setPending}){
 const {t}=useT(),toast=useToast(),{projects,accounts,removeAccount}=useData()
 const [v,setV]=useSession('f:accounts',V0A),[view,setView]=useLocal('view:accounts','grid')
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false)
 const f={...V0A,...v},set=p=>setV({...f,...p}),dq=useDeferredValue(f.q)
 useEffect(()=>{if(pending==='account'){setDlg({});setPending(null)}},[pending,setPending])
 const of=id=>(projects||[]).filter(p=>p.userIds?.includes(id))
 const shown=useMemo(()=>{if(!accounts)return null;const s=dq.trim().toLowerCase()
  const r=accounts.filter(a=>(f.part==='all'||(f.part==='free')===(of(a.id).length===0))&&(!s||[a.name,a.email,a.note].join(' ').toLowerCase().includes(s)))
  const cmp={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0),az:(a,b)=>(a.name||a.email).localeCompare(b.name||b.email),most:(a,b)=>of(b.id).length-of(a.id).length}[f.sort]
  return cmp?[...r].sort(cmp):r},[accounts,projects,dq,f.part,f.sort])
 const active=(f.part!=='all')+(f.sort!=='new')
 const tags=[...(f.part!=='all'?[{k:'p',label:t('flt.'+f.part),off:()=>set({part:'all'})}]:[]),...(f.sort!=='new'?[{k:'o',label:t('sort.'+f.sort),off:()=>set({sort:'new'})}]:[])]
 const del=async()=>{setBusy(true);try{await removeAccount(ask.id);toast(t('deleted'));setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const grid=view==='grid'?'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3':'flex flex-col gap-3'
 return <>
  <PageHead title={t('nav.accounts')} sub={accounts&&t('accounts.count',{n:accounts.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <Toolbar ph={t('accounts.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0A)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.part')} value={f.part} onChange={part=>set({part})} options={[['all',t('all')],['busy',t('flt.busy')],['free',t('flt.free')]]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az','most'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={6} lines={2}/></div>
   :!accounts.length?<Empty icon={Users} text={t('accounts.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :<div className={grid}>{shown.map((a,i)=><Item key={a.id} a={a} i={i} view={view} projects={projects} onEdit={setDlg} onDelete={setAsk}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addAccount')}/>
  {dlg&&<AccountDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delAccount',{name:ask.name||ask.email})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
