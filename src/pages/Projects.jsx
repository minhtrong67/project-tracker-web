import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {CalendarDays,FolderKanban,Layers,Plus,SearchX,Sparkles,UserRound} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,catKey,toolKey,locale} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0P} from '../hooks'
import {Acts,Btn,CardSkeleton,Confirm,Empty,Fab,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {ProjectDialog} from '../components/forms'

const ST={active:'bg-primary/10 text-primary-text',paused:'bg-amber-500/10 text-amber-700 dark:text-amber-300',done:'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',cancelled:'bg-muted text-muted-foreground'}
const Tag=({icon:I,tone,children})=><span className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${tone}`}><I className="size-3.5 shrink-0"/><span className="truncate">{children}</span></span>

const Item=memo(function Item({p,accMap,view,i,onEdit,onDelete}){
 const {t,lang}=useT(),accs=(p.userIds||[]).map(x=>accMap[x]).filter(Boolean),first=accs[0],list=view==='list'
 const tools=p.tools||[],tags=p.tags||[]
 const created=p.createdAt?.toDate&&t('item.created',{d:p.createdAt.toDate().toLocaleDateString(locale(lang))})
 const head=<div className="flex items-start justify-between gap-3"><div className="min-w-0">
   <h3 className="line-clamp-2 break-words font-semibold leading-snug">{p.name}</h3>
   {created&&<p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5 shrink-0"/>{created}</p>}</div>
  <span className={`badge ${ST[p.status]||ST.active}`}><i className="size-1.5 rounded-full bg-current"/>{t('status.'+p.status)}</span></div>
 const meta=<div className="flex flex-wrap gap-1.5"><Tag icon={Layers} tone="bg-secondary text-secondary-foreground border-transparent">{t('cat.'+catKey(p.category))}</Tag>
  {tools.slice(0,3).map(x=><Tag key={x} icon={Sparkles} tone="bg-background text-foreground">{toolKey(x)==='Other'?t('other'):x}</Tag>)}
  {tools.length>3&&<span className="chip">+{tools.length-3}</span>}</div>
 const desc=p.desc&&<p className="line-clamp-2 whitespace-pre-line break-words text-sm text-muted-foreground">{p.desc}</p>
 const hash=!!tags.length&&<div className="flex flex-wrap gap-1.5">{tags.slice(0,6).map(x=><span key={x} className="chip bg-primary/10 text-primary-text">#{x}</span>)}{tags.length>6&&<span className="chip">+{tags.length-6}</span>}</div>
 const who=<div className="flex min-w-0 flex-1 items-center gap-2.5">{first
  ?<><span className="flex shrink-0 -space-x-2">{accs.slice(0,3).map(a=><span key={a.id} title={a.name||a.email} className="avatar">{(a.name||a.email)[0]}</span>)}</span>
    <div className="min-w-0"><p className="truncate text-sm font-medium leading-tight">{first.name||first.email}{accs.length>1&&<span className="ml-1 font-normal text-muted-foreground">+{accs.length-1}</span>}</p>
     {first.name&&<p className="truncate text-xs text-muted-foreground">{first.email}</p>}</div></>
  :<><span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><UserRound className="size-4"/></span><p className="truncate text-sm text-muted-foreground">{t('item.noacc')}</p></>}</div>
 return <article style={{animationDelay:`${Math.min(i,8)*28}ms`}} className={`card card-item card-hover anim-up min-w-0 p-4 sm:p-5 ${list?'flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_15rem_auto] md:items-center md:gap-x-6':'flex flex-col gap-3'}`}>
  <div className="flex min-w-0 flex-col gap-3">{head}{meta}{desc}{hash}</div>
  <div className={`mt-auto flex items-center gap-2 border-t border-border pt-3 ${list?'md:contents':''}`}>{who}<Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/></div></article>})

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
 const tags=[...(f.status!=='all'?[{k:'s',label:t('status.'+f.status),off:()=>set({status:'all'})}]:[]),...(f.cat?[{k:'c',label:t('cat.'+f.cat),off:()=>set({cat:''})}]:[]),...(f.sort!=='new'?[{k:'o',label:t('sort.'+f.sort),off:()=>set({sort:'new'})}]:[])]
 const del=async()=>{setBusy(true);try{await removeProject(ask.id);toast(t('deleted'));setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const grid=view==='grid'?'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3':'flex flex-col gap-3'
 return <>
  <PageHead title={t('nav.projects')} sub={projects&&t('projects.count',{n:projects.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <Toolbar ph={t('projects.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0P)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.status')} value={f.status} onChange={status=>set({status})} options={[['all',t('all')],...STATUS_KEYS.map(k=>[k,t('status.'+k)])]}/>
   <Chips label={t('flt.category')} value={f.cat} onChange={cat=>set({cat})} options={[['',t('all')],...CAT_KEYS.map(k=>[k,t('cat.'+k)])]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={6} lines={4}/></div>
   :!projects.length?<Empty icon={FolderKanban} text={t('projects.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :<div className={grid}>{shown.map((p,i)=><Item key={p.id} p={p} i={i} view={view} accMap={accMap} onEdit={setDlg} onDelete={setAsk}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addProject')}/>
  {dlg&&<ProjectDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delProject',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
