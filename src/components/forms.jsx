import {useMemo,useState} from 'react'
import {Save,X} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,TOOLS,catKey,toolKey} from '../i18n'
import {useData,clean,EMAIL_RE} from '../data'
import {useLocal} from '../hooks'
import {Btn,Dialog,Dropdown,Field,Input,Textarea,useToast} from '../ui'

const TAG_RE=/^[\p{L}\p{N}._+-]{1,30}$/u
const SUGGEST=['react','vite','tailwind','firebase','typescript','nodejs','nextjs','python','tauri','supabase']
function TagInput({tags,setTags,toast,suggest}){
 const {t}=useT(),[v,setV]=useState(''),list=suggest.filter(s=>!tags.includes(s)).slice(0,10)
 const add=raw=>{const next=[...tags]
  for(const x of raw.split(/[\s,#]+/).map(i=>i.toLowerCase()).filter(Boolean)){
   if(!TAG_RE.test(x)){toast(t('e.tags.bad'),'error');continue}
   if(next.length>=10){toast(t('e.tags.max'),'error');break}
   if(!next.includes(x))next.push(x)}
  setTags(next);setV('')}
 return <div className="mb-4"><span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('f.tags')}</span>
  <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 transition focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/15 dark:border-zinc-800 dark:bg-zinc-900">
   {tags.map(x=><span key={x} className="anim-fade inline-flex h-7 items-center gap-1 rounded-lg bg-accent-50 pl-2.5 pr-1 text-sm text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">#{x}
    <button type="button" aria-label={`${t('delete')} ${x}`} onClick={()=>setTags(tags.filter(i=>i!==x))} className="grid size-5 place-items-center rounded-md hover:bg-accent-500/20"><X className="size-3.5"/></button></span>)}
   <input value={v} placeholder={tags.length?t('f.tags.more'):t('f.tags.ph')} className="min-w-32 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
    onChange={e=>/[\s,]/.test(e.target.value)?add(e.target.value):setV(e.target.value.replace(/#/g,''))}
    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();v&&add(v)}else if(e.key==='Backspace'&&!v&&tags.length)setTags(tags.slice(0,-1))}} onBlur={()=>v&&add(v)}/></div>
  {!!list.length&&<p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t('f.tags.recent')}</p>}<div className="mt-1.5 flex flex-wrap gap-1.5">{list.map(s=><button type="button" key={s} onClick={()=>tags.length<10&&setTags([...tags,s])} className="h-7 rounded-lg border border-zinc-200 px-2 text-xs text-zinc-500 dark:text-zinc-400 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">+ #{s}</button>)}</div></div>}

export function ProjectDialog({init,onClose}){
 const {t}=useT(),toast=useToast(),{projects,accounts,saveProject}=useData(),[recent,setRecent]=useLocal('recent-tags',[])
 const [f,setF]=useState({name:init?.name||'',desc:init?.desc||'',status:init?.status||'active',category:catKey(init?.category||'web'),tool:toolKey(init?.tools?.[0]||''),userId:init?.userIds?.[0]||''})
 const [tags,setTags]=useState(init?.tags||[]),[busy,setBusy]=useState(false),[bad,setBad]=useState('')
 // gợi ý: hashtag dùng gần đây -> hashtag đã có trong các dự án -> gợi ý mặc định
 const suggest=useMemo(()=>[...new Set([...recent,...(projects||[]).flatMap(p=>p.tags||[]),...SUGGEST])],[recent,projects])
 const submit=async()=>{
  const name=clean(f.name),desc=f.desc.trim()
  const err=!name?['name','e.name.req']:name.length<2||name.length>80?['name','e.name.len']
   :(projects||[]).some(p=>p.id!==init?.id&&p.name.toLowerCase()===name.toLowerCase())?['name','e.name.dup']:desc.length>500?['desc','e.desc.len']:null
  if(err){setBad(err[0]);toast(t(err[1]),'error');return}
  setBusy(true)
  try{await saveProject({name,desc,status:f.status,category:f.category,tools:f.tool?[f.tool]:[],tags,userIds:f.userId&&accounts.some(a=>a.id===f.userId)?[f.userId]:[]},init?.id)
   setRecent([...new Set([...tags,...recent])].slice(0,30));toast(t('saved'));onClose()}
  catch(e){toast(e.message,'error');setBusy(false)}}
 const none=['',t('none')]
 return <Dialog full title={t(init?'dlg.editProject':'dlg.addProject')} onClose={onClose} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn><Btn icon={Save} loading={busy} onClick={submit}>{t('save')}</Btn></>}>
  <Field label={t('f.pname')}><Input autoFocus invalid={bad==='name'} value={f.name} maxLength={120} placeholder={t('f.pname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
  <Field label={t('f.desc')}><Textarea rows={3} invalid={bad==='desc'} value={f.desc} placeholder={t('f.desc.ph')} onChange={e=>{setBad('');setF({...f,desc:e.target.value})}}/></Field>
  <div className="grid gap-x-4 sm:grid-cols-2">
   <Dropdown label={t('f.status')} value={f.status} onChange={status=>setF({...f,status})} options={STATUS_KEYS.map(k=>[k,t('status.'+k)])}/>
   <Dropdown label={t('f.category')} value={f.category} onChange={category=>setF({...f,category})} options={CAT_KEYS.map(k=>[k,t('cat.'+k)])}/></div>
  <TagInput tags={tags} setTags={setTags} toast={toast} suggest={suggest}/>
  <Dropdown label={t('f.tools')} placeholder={t('f.tools.ph')} value={f.tool} onChange={tool=>setF({...f,tool})} options={[none,...TOOLS.map(x=>[x,x==='Other'?t('other'):x])]}/>
  <Dropdown label={t('f.accounts')} placeholder={t('f.accounts.ph')} value={f.userId} onChange={userId=>setF({...f,userId})} options={[none,...(accounts||[]).map(a=>[a.id,a.name?`${a.name} · ${a.email}`:a.email])]}/>
  {!accounts?.length&&<p className="-mt-2 mb-4 text-xs text-zinc-500 dark:text-zinc-400">{t('f.accounts.empty')}</p>}</Dialog>}

export function AccountDialog({init,onClose}){
 const {t}=useT(),toast=useToast(),{accounts,saveAccount}=useData()
 const [f,setF]=useState({name:init?.name||'',email:init?.email||'',note:init?.note||''}),[busy,setBusy]=useState(false),[bad,setBad]=useState('')
 const submit=async()=>{
  const name=clean(f.name),email=f.email.trim().toLowerCase(),note=f.note.trim()
  const err=!email?['email','e.email.req']:!EMAIL_RE.test(email)||email.length>100?['email','e.email.bad']
   :(accounts||[]).some(a=>a.id!==init?.id&&a.email.toLowerCase()===email)?['email','e.email.dup']:name.length>60?['name','e.aname.len']:note.length>200?['note','e.note.len']:null
  if(err){setBad(err[0]);toast(t(err[1]),'error');return}
  setBusy(true)
  try{await saveAccount({name,email,note},init?.id);toast(t('saved'));onClose()}catch(e){toast(e.message,'error');setBusy(false)}}
 return <Dialog title={t(init?'dlg.editAccount':'dlg.addAccount')} onClose={onClose} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn><Btn icon={Save} loading={busy} onClick={submit}>{t('save')}</Btn></>}>
  <Field label={t('f.aname')}><Input autoFocus invalid={bad==='name'} value={f.name} placeholder={t('f.aname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}}/></Field>
  <Field label={t('f.email')}><Input type="email" inputMode="email" invalid={bad==='email'} value={f.email} placeholder={t('f.email.ph')} onChange={e=>{setBad('');setF({...f,email:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
  <Field label={t('f.note')}><Textarea rows={3} invalid={bad==='note'} value={f.note} placeholder={t('f.note.ph')} onChange={e=>{setBad('');setF({...f,note:e.target.value})}}/></Field></Dialog>}
