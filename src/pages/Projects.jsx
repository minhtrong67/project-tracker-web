import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {FolderKanban,Layers,Plus,SearchX,Sparkles} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,catKey,toolKey,locale} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0P} from '../hooks'
import {Acts,Btn,CardSkeleton,Confirm,Empty,Fab,PageHead,Select,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {ProjectDialog} from '../components/forms'

const ST={active:'bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300',paused:'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',done:'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',cancelled:'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}
const Tag=({icon:I,tone,children})=><span className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${tone}`}><I className="size-3.5 shrink-0"/><span className="truncate">{children}</span></span>

const Item=memo(function Item({p,accMap,view,i,onEdit,onDelete}){
 const {t,lang}=useT(),accs=(p.userIds||[]).map(x=>accMap[x]).filter(Boolean)
 const badge=<span className={`badge ${ST[p.status]||ST.active}`}><i className="size-1.5 rounded-full bg-current"/>{t('status.'+p.status)}</span>
 const chips=<div className="flex flex-wrap gap-1.5"><Tag icon={Layers} tone="bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">{t('cat.'+catKey(p.category))}</Tag>
  {(p.tools||[]).map(x=><Tag key={x} icon={Sparkles} tone="bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{toolKey(x)==='Other'?t('other'):x}</Tag>)}</div>
 const desc=p.desc&&<p className="whitespace-pre-line break-words text-sm text-zinc-600 dark:text-zinc-400">{p.desc}</p>
 const tags=!!p.tags?.length&&<div className="flex flex-wrap gap-1.5">{p.tags.map(x=><span key={x} className="chip text-accent-700 dark:text-accent-300">#{x}</span>)}</div>
 const people=accs.length?<ul className="space-y-2">{accs.map(a=><li key={a.id} className="flex items-center gap-2.5"><span className="avatar !ring-0">{(a.name||a.email)[0]}</span>
  <div className="min-w-0"><p className="break-words text-sm font-medium leading-tight">{a.name||a.email}</p>{a.name&&<p className="break-all text-xs text-zinc-500 dark:text-zinc-400">{a.email}</p>}</div></li>)}</ul>
  :<p className="text-sm text-zinc-500 dark:text-zinc-400">{t('item.noacc')}</p>
 const created=<span className="text-xs text-zinc-500 dark:text-zinc-400">{p.createdAt?.toDate&&t('item.created',{d:p.createdAt.toDate().toLocaleDateString(locale(lang))})}</span>
 const style={animationDelay:`${Math.min(i,10)*30}ms`}
 return view==='list'
  ?<div style={style} className="card anim-up flex flex-wrap gap-x-6 gap-y-4 p-4 card-hover md:p-5">
    <div className="min-w-0 flex-[2_1_20rem] space-y-2.5"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{p.name}</h3>{badge}</div>{chips}{desc}{tags}</div>
    <div className="min-w-0 flex-[1_1_14rem]">{people}</div>
    <div className="flex basis-full flex-col justify-between gap-3 md:basis-auto md:items-end">{created}<Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/></div></div>
  :<div style={style} className="card anim-up flex min-w-0 flex-col gap-3 p-5 card-hover">
    <div className="flex items-start justify-between gap-3"><h3 className="min-w-0 break-words font-semibold leading-snug">{p.name}</h3>{badge}</div>
    {chips}{desc}{tags}
    <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">{people}</div>
    <div className="mt-auto flex flex-col gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800 sm:flex-row sm:items-center"><div className="flex-1">{created}</div><Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/></div></div>})

export default function Projects({pending,setPending}){
 const {t}=useT(),toast=useToast(),{projects,accMap,removeProject}=useData()
 const [v,setV]=useSession('f:projects',V0P),[view,setView]=useLocal('view:projects','grid')
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false)
 const f={...V0P,...v},set=p=>setV({...f,...p}),dq=useDeferredValue(f.q)
 useEffect(()=>{if(pending==='project'){setDlg({});setPending(null)}},[pending,setPending])
 const shown=useMemo(()=>{if(!projects)return null;const s=dq.trim().toLowerCase()
  const r=projects.filter(p=>(f.status==='all'||p.status===f.status)&&(!f.cat||catKey(p.category)===f.cat)&&(!s||[p.name,p.desc,t('cat.'+catKey(p.category)),t('status.'+p.status),...(p.tags||[]),...(p.tools||[]),...(p.userIds||[]).flatMap(i=>[accMap[i]?.name,accMap[i]?.email])].join(' ').toLowerCase().includes(s)))
  const cmp={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0),az:(a,b)=>a.name.localeCompare(b.name)}[f.sort]
  return cmp?[...r].sort(cmp):r},[projects,accMap,dq,f.status,f.cat,f.sort,t])
 const active=(f.status!=='all')+!!f.cat+(f.sort!=='new')
 const del=async()=>{setBusy(true);try{await removeProject(ask.id);toast(t('deleted'));setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const grid=view==='grid'?'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3':'flex flex-col gap-3'
 return <>
  <PageHead title={t('nav.projects')} sub={projects&&t('projects.count',{n:projects.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <Toolbar ph={t('projects.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0P)} view={view} setView={setView}>
   <Chips label={t('flt.status')} value={f.status} onChange={status=>set({status})} options={[['all',t('all')],...STATUS_KEYS.map(k=>[k,t('status.'+k)])]}/>
   <div className="grid gap-3 sm:grid-cols-2">
    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('flt.category')}<Select className="mt-1.5 text-sm" value={f.cat} onChange={e=>set({cat:e.target.value})}><option value="">{t('flt.allcat')}</option>{CAT_KEYS.map(k=><option key={k} value={k}>{t('cat.'+k)}</option>)}</Select></label>
    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('flt.sort')}<Select className="mt-1.5 text-sm" value={f.sort} onChange={e=>set({sort:e.target.value})}>{['new','old','az'].map(k=><option key={k} value={k}>{t('sort.'+k)}</option>)}</Select></label></div></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={6} lines={4}/></div>
   :!projects.length?<Empty icon={FolderKanban} text={t('projects.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :<div className={grid}>{shown.map((p,i)=><Item key={p.id} p={p} i={i} view={view} accMap={accMap} onEdit={setDlg} onDelete={setAsk}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addProject')}/>
  {dlg&&<ProjectDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delProject',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
