import {useRef,useState} from 'react'
import {Check,Download,LogOut,Monitor,Moon,RotateCcw,Smartphone,Sun,Upload,Palette,Database,UserRound,Info} from 'lucide-react'
import {signOut} from 'firebase/auth'
import {auth} from '../firebase'
import {useT} from '../i18n'
import {useData} from '../data'
import {ACCENTS,useInstall,useSettings} from '../hooks'
import {dl} from '../io'
import {normalize,rec,useTransfer} from '../transfer'
import {useFormats} from '../components/Toolbar'
import {Btn,Confirm,Credit,ExportMenu,Segmented,Select,useToast} from '../ui'

const Section=({icon:I,title,desc,children})=><section className="card p-5 md:p-6"><div className="mb-4 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"><I className="size-5"/></span>
 <div><h2 className="font-semibold">{title}</h2>{desc&&<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>}</div></div>{children}</section>
const Row=({label,children})=><div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><span className="text-sm font-medium">{label}</span>{children}</div>

function Transfer({type}){
 const {t}=useT(),{projects,accounts}=useData(),items=type==='projects'?projects:accounts
 const {busy,exportAs,importFile}=useTransfer(type,items),fileRef=useRef(),formats=useFormats()
 return <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
  <div><p className="text-sm font-medium">{t('nav.'+type)}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{items?t(type+'.count',{n:items.length}):'…'}</p></div>
  <div className="flex gap-2"><input ref={fileRef} type="file" hidden accept=".csv,.json,.xlsx" onChange={e=>{const f=e.target.files[0];e.target.value='';f&&importFile(f)}}/>
   <Btn variant="outline" icon={Upload} disabled={busy} onClick={()=>fileRef.current.click()}>{t('import')}</Btn><ExportMenu formats={formats} onPick={exportAs} busy={busy}/></div></div>}

export default function Settings({user}){
 const {t}=useT(),toast=useToast(),{s,set,reset}=useSettings(),inst=useInstall(),{projects,accounts,accMap,importRecords}=useData()
 const [busy,setBusy]=useState(false),[ask,setAsk]=useState(false),[out,setOut]=useState(false),fileRef=useRef()
 const exportBackup=()=>{if(!projects||!accounts)return
  dl(new Blob([JSON.stringify({app:'VibeLedger',version:1,exportedAt:new Date().toISOString(),accounts:accounts.map(rec.accounts),projects:projects.map(p=>rec.projects(p,accMap))},null,2)],{type:'application/json'}),`vibeledger-backup-${new Date().toISOString().slice(0,10)}.json`);toast(t('x.exported'))}
 const importBackup=async file=>{setBusy(true)
  try{if(!file.name.toLowerCase().endsWith('.json'))throw new Error('x.badfile')
   const j=JSON.parse(await file.text()),a=normalize('accounts',j.accounts||[]),p=normalize('projects',j.projects||[])
   if(!a.recs.length&&!p.recs.length)throw new Error('x.nodata')
   toast(t('x.imported',{...await importRecords({accounts:a.recs,projects:p.recs}),skipped:a.skipped+p.skipped}))}
  catch(e){toast(t(e.message||'x.err'),'error')}setBusy(false)}
 const modes=[['light',t('theme.light'),Sun],['dark',t('theme.dark'),Moon],['system',t('theme.system'),Monitor]]
 return <div className="mx-auto max-w-3xl space-y-5">
  <h1 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">{t('nav.settings')}</h1>
  {!inst.done&&<section className="anim-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 via-accent-600 to-accent-800 p-6 text-white shadow-lg shadow-accent-600/25">
   <Smartphone className="absolute -right-4 -top-4 size-36 rotate-12 text-white/10"/>
   <div className="relative"><h2 className="text-lg font-semibold">{t('st.install')}</h2><p className="mt-1 max-w-md text-sm text-white/80">{t('st.install.desc')}</p>
    {inst.canPrompt?<button type="button" onClick={inst.install} className="btn mt-4 bg-white text-accent-700 hover:bg-accent-50"><Download className="size-4"/>{t('st.install.btn')}</button>
     :<p className="mt-4 rounded-xl bg-white/15 p-3 text-sm">{inst.ios?t('st.install.ios'):t('st.install.manual')}</p>}</div></section>}
  <Section icon={Palette} title={t('st.appearance')}>
   <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
    <Row label={t('st.theme')}><Segmented label="theme" value={s.mode} onChange={mode=>set({mode})} options={modes}/></Row>
    <Row label={t('st.lang')}><Segmented label="language" value={s.lang} onChange={l=>set({lang:l})} options={[['vi','Tiếng Việt'],['en','English']]}/></Row>
    <Row label={t('st.accent')}><div className="flex flex-wrap gap-2">{ACCENTS.map(c=><button key={c} type="button" title={t('accent.'+c)} aria-label={t('accent.'+c)} aria-pressed={s.accent===c} onClick={()=>set({accent:c})} style={{background:`var(--color-${c}-500)`}}
     className={`grid size-9 place-items-center rounded-full text-white transition active:scale-90 ${s.accent===c?'ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-zinc-900':''}`}>{s.accent===c&&<Check className="size-4"/>}</button>)}</div></Row>
    <div className="py-3"><Row label={`${t('st.fontsize')}: ${s.fs}px`}><input type="range" aria-label={t('st.fontsize')} min="14" max="20" step="1" value={s.fs} onChange={e=>set({fs:+e.target.value})} className="w-48 accent-accent-600"/></Row><p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('st.preview')}</p></div>
    <Row label={t('st.home')}><Select className="!w-48" value={s.home} onChange={e=>set({home:e.target.value})}>{['projects','accounts','stats','settings'].map(k=><option key={k} value={k}>{t('nav.'+k)}</option>)}</Select></Row></div></Section>
  <Section icon={Database} title={t('st.data')} desc={t('st.data.desc')}>
   <input ref={fileRef} type="file" hidden accept=".json" onChange={e=>{const f=e.target.files[0];e.target.value='';f&&importBackup(f)}}/>
   <div className="divide-y divide-zinc-100 dark:divide-zinc-800"><Transfer type="projects"/><Transfer type="accounts"/>
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3"><p className="text-sm font-medium">JSON · {t('st.data')}</p>
     <div className="flex gap-2"><Btn variant="outline" icon={Upload} loading={busy} onClick={()=>fileRef.current.click()}>{t('import')}</Btn><Btn variant="outline" icon={Download} onClick={exportBackup} disabled={!projects||!accounts}>{t('export')}</Btn></div></div></div></Section>
  <Section icon={RotateCcw} title={t('st.reset')} desc={t('st.reset.desc')}><Btn variant="danger-soft" icon={RotateCcw} onClick={()=>setAsk(true)} className="border border-red-200 dark:border-red-500/30">{t('st.reset')}</Btn></Section>
  <Section icon={UserRound} title={t('st.account')}><div className="flex flex-wrap items-center justify-between gap-3"><span className="break-all text-sm">{user.email}</span>
   <Btn variant="outline" icon={LogOut} loading={out} onClick={async()=>{setOut(true);await signOut(auth);setOut(false)}}>{t('st.logout')}</Btn></div></Section>
  <Section icon={Info} title={t('st.about')}><p className="text-sm text-zinc-500 dark:text-zinc-400">VibeLedger · {t('st.version')} 1.0.0</p><Credit className="mt-2"/></Section>
  {ask&&<Confirm danger={false} title={t('st.reset')} message={t('st.reset.desc')} confirmLabel={t('st.reset')} onClose={()=>setAsk(false)} onConfirm={()=>{reset();setAsk(false);toast(t('st.reset.done'))}}/>}</div>}
