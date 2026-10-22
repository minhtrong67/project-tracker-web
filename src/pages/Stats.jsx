import {useMemo,useRef,useState} from 'react'
import {ChevronLeft,ChevronRight,FileImage,File,FolderKanban,Users,CheckCircle2,Activity,UserX,Gauge} from 'lucide-react'
import {useT,STATUS_KEYS,catKey,toolKey,locale} from '../i18n'
import {useData} from '../data'
import {useSession} from '../hooks'
import {exportNode} from '../io'
import {Btn,ExportMenu,PageHead,Segmented,Skeleton,Credit,useToast} from '../ui'
import {BarChart,PieChart} from '../components/charts'

function range(p,off){
 const n=new Date();let s,e
 if(p==='day'){s=new Date(n.getFullYear(),n.getMonth(),n.getDate()+off);e=new Date(s);e.setDate(e.getDate()+1)}
 else if(p==='week'){const d=(n.getDay()+6)%7;s=new Date(n.getFullYear(),n.getMonth(),n.getDate()-d+off*7);e=new Date(s);e.setDate(e.getDate()+7)}
 else if(p==='month'){s=new Date(n.getFullYear(),n.getMonth()+off,1);e=new Date(s.getFullYear(),s.getMonth()+1,1)}
 else{s=new Date(n.getFullYear()+off,0,1);e=new Date(s.getFullYear()+1,0,1)}
 return [s,e]}
const tally=arr=>Object.entries(arr.reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value)
const Card=({title,children,className=''})=><section className={`card min-w-0 overflow-hidden p-5 ${className}`}><h3 className="mb-4 text-sm font-semibold">{title}</h3>{children}</section>
const Stat=({icon:I,label,value})=><div className="card min-w-0 p-4"><span className="mb-3 grid size-9 place-items-center rounded-md bg-primary/10 text-primary-text"><I className="size-5"/></span><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground ">{label}</p></div>

export default function Stats(){
 const {t,lang}=useT(),toast=useToast(),{projects,accounts}=useData()
 const [f,setF]=useSession('f:stats',{p:'all',off:0}),ref=useRef(),[busy,setBusy]=useState(false),loc=locale(lang)
 const [s,e]=f.p==='all'?[null,null]:range(f.p,f.off)
 const list=useMemo(()=>(projects||[]).filter(p=>{if(!s)return true;const d=p.createdAt?.toDate?.()||new Date();return d>=s&&d<e}),[projects,f.p,f.off])
 if(!projects||!accounts)return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton n={6} className="h-40"/></div>
 const label=!s?t('p.all'):f.p==='day'?s.toLocaleDateString(loc,{dateStyle:'long'}):f.p==='week'?`${s.toLocaleDateString(loc,{day:'numeric',month:'short'})} – ${new Date(e-864e5).toLocaleDateString(loc,{day:'numeric',month:'short',year:'numeric'})}`:f.p==='month'?s.toLocaleDateString(loc,{month:'long',year:'numeric'}):String(s.getFullYear())
 const by=k=>list.filter(p=>p.status===k).length,links=list.reduce((n,p)=>n+(p.userIds?.length||0),0)
 const status=STATUS_KEYS.map(k=>({label:t('status.'+k),value:by(k)}))
 const cats=tally(list.map(p=>t('cat.'+catKey(p.category))))
 const tools=tally(list.flatMap(p=>(p.tools||[]).map(x=>toolKey(x)==='Other'?t('other'):x))).slice(0,8)
 const accs=accounts.map(a=>({label:a.name||a.email,value:list.filter(p=>p.userIds?.includes(a.id)).length})).filter(d=>d.value).sort((a,b)=>b.value-a.value).slice(0,8)
 const tags=tally(list.flatMap(p=>p.tags||[])).slice(0,12)
 const none=<p className="py-8 text-center text-sm text-muted-foreground ">{t('s.nodata')}</p>
 const exp=fmt=>{setBusy(true);exportNode(ref.current,fmt,`project-tracker-stats-${new Date().toISOString().slice(0,10)}`).then(()=>toast(t('x.exported'))).catch(x=>toast(x.message,'error')).finally(()=>setBusy(false))}
 const move=d=>setF({...f,off:f.off+d})
 return <>
  <PageHead title={t('nav.stats')} sub={t('s.sub')}><ExportMenu busy={busy} onPick={exp} formats={[['png',t('x.fmt.png'),FileImage],['pdf',t('x.fmt.pdf'),File]]}/></PageHead>
  <div className="mb-5 flex flex-wrap items-center gap-3">
   <div className="max-w-full overflow-x-auto"><Segmented label="period" value={f.p} onChange={p=>setF({p,off:0})} options={[['all',t('p.all')],['day',t('p.day')],['week',t('p.week')],['month',t('p.month')],['year',t('p.year')]]}/></div>
   {s&&<div className="flex items-center gap-1"><Btn variant="outline" className="btn-sm !px-2" aria-label={t('p.prev')} title={t('p.prev')} onClick={()=>move(-1)}><ChevronLeft className="size-4"/></Btn>
    <span className="min-w-32 px-2 text-center text-sm font-medium">{label}</span>
    <Btn variant="outline" className="btn-sm !px-2" aria-label={t('p.next')} title={t('p.next')} onClick={()=>move(1)}><ChevronRight className="size-4"/></Btn></div>}</div>
  <div ref={ref} className="min-w-0 space-y-4 bg-background p-1">
   <div className="flex flex-wrap items-baseline justify-between gap-2 px-1"><p className="text-sm font-semibold">Project Tracker · {t('s.report')}</p><p className="text-xs text-muted-foreground ">{label}</p></div>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
    <Stat icon={FolderKanban} label={t('s.total')} value={list.length}/><Stat icon={Activity} label={t('status.active')} value={by('active')}/><Stat icon={CheckCircle2} label={t('status.done')} value={by('done')}/>
    <Stat icon={Users} label={t('s.accounts')} value={accounts.length}/><Stat icon={UserX} label={t('s.unassigned')} value={list.filter(p=>!p.userIds?.length).length}/><Stat icon={Gauge} label={t('s.avg')} value={list.length?(links/list.length).toFixed(1):'0'}/></div>
   <div className="grid min-w-0 gap-4 xl:grid-cols-2">
    <Card title={t('s.byStatus')}>{list.length?<BarChart data={status}/>:none}</Card>
    <Card title={t('s.byCat')}>{cats.length?<PieChart data={cats}/>:none}</Card>
    <Card title={t('s.byTool')}>{tools.length?<BarChart data={tools}/>:none}</Card>
    <Card title={t('s.byAcc')}>{accs.length?<PieChart data={accs}/>:none}</Card></div>
   <Card title={t('s.tags')}>{tags.length?<div className="flex flex-wrap gap-2">{tags.map(x=><span key={x.label} className="inline-flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">#{x.label}<b className="tabular-nums">{x.value}</b></span>)}</div>:none}</Card>
   <Credit className="px-1"/></div></>}
