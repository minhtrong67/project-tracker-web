import {lazy,Suspense,useEffect,useMemo,useState} from 'react'
import {BarChart3,FolderKanban,Menu,Monitor,Moon,Plus,Search,Settings as Cog,Sun,Users,X} from 'lucide-react'
import {useT} from './i18n'
import {V0A,V0P,useSettings} from './hooks'
import {DataProvider,useData} from './data'
import {Logo,Skeleton} from './ui'
import Projects from './pages/Projects'
import Accounts from './pages/Accounts'
const Stats=lazy(()=>import('./pages/Stats'))
const Settings=lazy(()=>import('./pages/Settings'))

const NAV=[['projects',FolderKanban],['accounts',Users],['stats',BarChart3],['settings',Cog]]
const MODES=[['system',Monitor],['light',Sun],['dark',Moon]]

function Palette({items,onClose}){
 const {t}=useT(),[q,setQ]=useState(''),[i,setI]=useState(0)
 const list=items.filter(x=>x.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0,8),n=Math.max(list.length,1)
 useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose])
 const run=x=>{onClose();x.run()}
 return <div className="anim-fade fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[12vh]" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <div role="dialog" aria-modal="true" className="anim-up w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
   <div className="flex items-center gap-3 border-b border-border pl-4 pr-2 "><Search className="size-5 text-muted-foreground"/>
    <input autoFocus value={q} placeholder={t('pal.ph')} aria-label={t('pal.ph')} onChange={e=>{setQ(e.target.value);setI(0)}} className="h-12 flex-1 bg-transparent text-base outline-none md:text-sm placeholder:text-muted-foreground"
     onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setI((i+1)%n)}else if(e.key==='ArrowUp'){e.preventDefault();setI((i+n-1)%n)}else if(e.key==='Enter'&&list[i])run(list[i])}}/>
    <button type="button" aria-label={t('close')} onClick={onClose} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"><X className="size-5"/></button></div>
   <div className="max-h-80 overflow-auto p-2">{list.map((x,k)=>{const I=x.icon;return <button type="button" key={x.hint+x.label+k} onMouseEnter={()=>setI(k)} onClick={()=>run(x)}
    className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm ${k===i?'bg-accent text-accent-foreground':''}`}><I className="size-4 shrink-0"/><span className="flex-1 truncate">{x.label}</span><span className="text-xs text-muted-foreground">{x.hint}</span></button>})}
    {!list.length&&<p className="p-4 text-sm text-muted-foreground ">{t('pal.none')}</p>}</div></div></div>}

function SideNav({tab,go,user,rail}){
 const {t}=useT(),lbl=rail?'hidden lg:inline':'',pad=rail?'md:justify-center md:px-0 lg:justify-start lg:px-3':''
 return <div className="flex h-full flex-col"><div className={`flex h-16 items-center gap-3 px-5 ${rail?'md:justify-center md:px-0 lg:justify-start lg:px-5':''}`}><Logo/><span className={`text-base font-semibold tracking-tight ${lbl}`}>Project Tracker</span></div>
  <nav className="flex-1 space-y-1 px-3 py-2">{NAV.map(([k,I])=><button type="button" key={k} title={t('nav.'+k)} onClick={()=>go(k)} aria-current={tab===k?'page':undefined} className={`nav-item ${pad} ${tab===k?'nav-active':''}`}><I className="size-5 shrink-0"/><span className={lbl}>{t('nav.'+k)}</span></button>)}</nav>
  <div className={`border-t border-sidebar-border p-4 ${rail?'hidden lg:block':''}`}><p className="truncate text-xs text-muted-foreground ">{user.email}</p></div></div>}

function Shell({user}){
 const {t}=useT(),{s,set}=useSettings(),{projects,accounts}=useData()
 const [tab,setTab]=useState(s.home||'projects'),[nonce,setNonce]=useState(0),[drawer,setDrawer]=useState(false),[pal,setPal]=useState(false),[pending,setPending]=useState(null)
 const go=(k,reload)=>{setTab(k);setDrawer(false);reload&&setNonce(n=>n+1);scrollTo({top:0,behavior:'instant'})}
 const mi=Math.max(0,MODES.findIndex(m=>m[0]===s.mode)),ModeIcon=MODES[mi][1],nextMode=()=>set({mode:MODES[(mi+1)%3][0]})
 useEffect(()=>{const k=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPal(p=>!p)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[])
 const items=useMemo(()=>[
  ...NAV.map(([k,I])=>({label:t('nav.'+k),hint:t('pal.page'),icon:I,run:()=>go(k)})),
  {label:t('pal.addProject'),hint:t('pal.action'),icon:Plus,run:()=>{go('projects');setPending('project')}},
  {label:t('pal.addAccount'),hint:t('pal.action'),icon:Plus,run:()=>{go('accounts');setPending('account')}},
  {label:t('pal.theme'),hint:t('pal.action'),icon:Sun,run:nextMode},
  ...(projects||[]).map(p=>({label:p.name,hint:t('nav.projects'),icon:FolderKanban,run:()=>{sessionStorage.setItem('f:projects',JSON.stringify({...V0P,q:p.name}));go('projects',true)}})),
  ...(accounts||[]).map(a=>({label:a.name||a.email,hint:t('nav.accounts'),icon:Users,run:()=>{sessionStorage.setItem('f:accounts',JSON.stringify({...V0A,q:a.email}));go('accounts',true)}}))],[t,projects,accounts,s.mode])
 const iconBtn="grid size-10 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground active:scale-90"
 return <div className="md:pl-[4.5rem] lg:pl-60">
  <aside className="fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block md:w-[4.5rem] lg:w-60"><SideNav rail tab={tab} go={go} user={user}/></aside>
  <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar/95 backdrop-blur"><div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:px-5 lg:px-8">
   <button type="button" aria-label={t('menu.open')} title={t('menu.open')} onClick={()=>setDrawer(true)} className={`${iconBtn} md:hidden`}><Menu className="size-5"/></button>
   <span className="ml-1 flex-1 text-base font-semibold tracking-tight md:hidden">Project Tracker</span>
   <span className="hidden flex-1 text-sm font-medium text-muted-foreground md:block">{t('nav.'+tab)}</span>
   <button type="button" onClick={()=>setPal(true)} aria-label={t('search.title')} title={t('search.title')} className={`${iconBtn} md:hidden`}><Search className="size-5"/></button>
   <button type="button" onClick={()=>setPal(true)} className="hidden h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-xs transition hover:bg-accent hover:text-accent-foreground md:flex md:w-48 lg:w-72"><Search className="size-4"/><span className="min-w-0 flex-1 truncate text-left">{t('pal.ph').split('...')[0]}...</span><kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd></button>
   <button type="button" onClick={nextMode} aria-label={t('theme.now',{mode:t('theme.'+s.mode)})} title={t('theme.now',{mode:t('theme.'+s.mode)})} className={iconBtn}><ModeIcon className="size-5"/></button></div></header>
  <main className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-5 md:pb-12 md:pt-8 lg:px-8"><div key={`${tab}-${nonce}`} className="anim-fade">
   <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton n={6} className="h-44"/></div>}>
    {tab==='projects'&&<Projects pending={pending} setPending={setPending}/>}{tab==='accounts'&&<Accounts pending={pending} setPending={setPending}/>}
    {tab==='stats'&&<Stats/>}{tab==='settings'&&<Settings user={user}/>}</Suspense></div></main>
  <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-sidebar-border bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
   {NAV.map(([k,I])=><button type="button" key={k} onClick={()=>go(k)} aria-current={tab===k?'page':undefined} className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition active:scale-95 ${tab===k?'text-primary-text':'text-muted-foreground'}`}>
    <span className={`grid h-7 w-14 place-items-center rounded-full transition-colors duration-200 ${tab===k?'bg-primary/10':''}`}><I className="size-5"/></span>{t('nav.'+k)}</button>)}</nav>
  <div className={`fixed inset-0 z-50 md:hidden ${drawer?'':'pointer-events-none'}`}>
   <div onClick={()=>setDrawer(false)} className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${drawer?'opacity-100':'opacity-0'}`}/>
   <aside inert={drawer?undefined:''} className={`absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-300 ${drawer?'translate-x-0':'-translate-x-full'}`}>
    <button type="button" aria-label={t('close')} onClick={()=>setDrawer(false)} className={`${iconBtn} absolute right-3 top-3`}><X className="size-5"/></button><SideNav tab={tab} go={go} user={user}/></aside></div>
  {pal&&<Palette items={items} onClose={()=>setPal(false)}/>}</div>}

export default function Authed({user}){return <DataProvider uid={user.uid}><Shell user={user}/></DataProvider>}
