import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {AlertCircle,Check,CheckCircle2,ChevronDown,Info,ListChecks,Loader2,Pencil,Plus,Trash2,X,Download} from 'lucide-react'
import {useT} from './i18n'

const ToastCtx=createContext()
export const useToast=()=>useContext(ToastCtx)
const TI={success:[CheckCircle2,'text-emerald-500'],error:[AlertCircle,'text-red-500'],info:[Info,'text-accent-500']}
export function ToastProvider({children}){
 const [list,setList]=useState([])
 const push=useCallback((msg,type='success')=>{const id=Math.random();setList(x=>[...x.slice(-2),{id,msg,type}]);setTimeout(()=>setList(x=>x.filter(i=>i.id!==id)),type==='error'?4500:3000)},[])
 return <ToastCtx.Provider value={push}>{children}
  <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
   {list.map(i=>{const [I,c]=TI[i.type]||TI.info;return <div key={i.id} role="status" className="anim-up pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"><I className={`mt-0.5 size-5 shrink-0 ${c}`}/><span>{i.msg}</span></div>})}
  </div></ToastCtx.Provider>}

export function Btn({variant='primary',icon:I,loading,disabled,children,className='',...p}){
 return <button type="button" disabled={loading||disabled} className={`btn btn-${variant} ${className}`} {...p}>
  {loading?<Loader2 className="size-4 animate-spin"/>:I&&<I className="size-4"/>}{children}</button>}
export const Field=({label,children})=><label className="mb-4 block"><span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>{children}</label>
export const Input=({invalid,className='',...p})=><input {...p} aria-invalid={!!invalid} className={`input ${invalid?'input-bad':''} ${className}`}/>
export const Textarea=({invalid,className='',...p})=><textarea {...p} aria-invalid={!!invalid} className={`input ${invalid?'input-bad':''} ${className}`}/>
export const Select=({className='',children,...p})=><select {...p} className={`input pr-8 ${className}`}>{children}</select>
export const Skeleton=({n=3,className='h-32'})=>Array.from({length:n},(_,i)=><div key={i} className={`skeleton ${className}`}/>)
export const Avatar=({a})=><span title={a.name||a.email} className="avatar -ml-2 first:ml-0">{(a.name||a.email||'?')[0]}</span>

export function Segmented({value,onChange,options,label}){
 return <div role="group" aria-label={label} className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">{options.map(([k,l,I])=>
  <button key={k} type="button" aria-pressed={value===k} aria-label={l} title={l} onClick={()=>onChange(k)}
   className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition ${value===k?'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white':'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
   {I&&<I className="size-4"/>}{l&&<span className={I?'hidden sm:inline':''}>{l}</span>}</button>)}</div>}

export function Dialog({title,onClose,footer,full,children}){
 const {t}=useT()
 useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);const o=document.body.style.overflow;document.body.style.overflow='hidden'
  return()=>{removeEventListener('keydown',k);document.body.style.overflow=o}},[onClose])
 const head=<div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 md:px-6"><h2 className="text-lg font-semibold">{title}</h2>
  <button type="button" aria-label={t('close')} title={`${t('close')} (Esc)`} onClick={onClose} className="grid size-10 place-items-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="size-5"/></button></div>
 const bar="flex gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 [&>*]:flex-1 md:[&>*]:flex-none md:justify-end"
 // render qua portal để không bị bottom bar / header (z-30) của trang che
 return createPortal(full
  ?<div role="dialog" aria-modal="true" aria-label={title} className="anim-up fixed inset-0 z-50 flex h-dvh flex-col bg-white dark:bg-zinc-950">
    {head}<div className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6">{children}</div></div>
    {footer&&<div className="shrink-0 border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950"><div className={`mx-auto max-w-2xl px-4 md:px-6 ${bar}`}>{footer}</div></div>}</div>
  :<div className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="anim-up flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-lg sm:rounded-2xl">
     {head}<div className="min-h-0 overflow-y-auto px-4 py-5 md:px-6">{children}</div>
     {footer&&<div className={`shrink-0 border-t border-zinc-100 px-4 dark:border-zinc-800 md:px-6 ${bar}`}>{footer}</div>}</div></div>,document.body)}

export function Dropdown({label,value,onChange,options,placeholder}){
 const [open,setOpen]=useState(false),ref=useRef(),sel=options.find(o=>o[0]===value)
 useEffect(()=>{if(!open)return;ref.current?.scrollIntoView({block:'nearest',behavior:'smooth'})
  const k=e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}};addEventListener('keydown',k,true);return()=>removeEventListener('keydown',k,true)},[open])
 return <div className="relative mb-4"><span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
  <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(!open)} className="input flex items-center justify-between gap-2 text-left">
   <span className={`truncate ${sel&&sel[0]?'':'text-zinc-400 dark:text-zinc-600'}`}>{sel&&sel[0]?sel[1]:placeholder}</span><ChevronDown className={`size-4 shrink-0 text-zinc-400 transition-transform ${open?'rotate-180':''}`}/></button>
  {open&&<><div className="fixed inset-0 z-10" onClick={()=>setOpen(false)}/>
   <ul ref={ref} role="listbox" className="anim-up absolute inset-x-0 z-20 mt-1.5 max-h-60 overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
    {options.map(([k,l])=><li key={k||'none'}><button type="button" role="option" aria-selected={k===value} onClick={()=>{onChange(k);setOpen(false)}} className="menu-item justify-between"><span className="truncate">{l}</span>{k===value&&<Check className="size-4 shrink-0 text-accent-600"/>}</button></li>)}</ul></>}</div>}

export function Confirm({title,message,confirmLabel,busy,onConfirm,onClose,danger=true}){
 const {t}=useT()
 return <Dialog title={title} onClose={()=>!busy&&onClose()} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn>
  <Btn variant={danger?'danger':'primary'} icon={danger?Trash2:undefined} loading={busy} onClick={onConfirm}>{confirmLabel}</Btn></>}>
  <p className="text-zinc-600 dark:text-zinc-400">{message}</p></Dialog>}

export function ExportMenu({formats,onPick,busy}){
 const {t}=useT(),[open,setOpen]=useState(false),[up,setUp]=useState(false)
 return <div className="relative">
  <Btn variant="outline" icon={Download} loading={busy} aria-expanded={open} onClick={e=>{setUp(e.currentTarget.getBoundingClientRect().bottom>innerHeight*.6);setOpen(!open)}}>{t('export')}</Btn>
  {open&&<><div className="fixed inset-0 z-30" onClick={()=>setOpen(false)}/>
   <div className={`anim-up absolute right-0 z-40 w-56 ${up?'bottom-full mb-2':'top-full mt-2'} rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900`}>
    {formats.map(([k,l,I])=><button key={k} type="button" className="menu-item" onClick={()=>{setOpen(false);onPick(k)}}><I className="size-4 text-zinc-500 dark:text-zinc-400"/>{l}</button>)}</div></>}</div>}

export function PageHead({title,sub,onAdd,addLabel,children}){
 return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>{sub&&<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{sub}</p>}</div>
  <div className="flex items-center gap-2">{children}{onAdd&&<Btn icon={Plus} onClick={onAdd} className="hidden md:inline-flex">{addLabel}</Btn>}</div></div>}
export const Fab=({onClick,label})=><button type="button" aria-label={label} title={label} onClick={onClick} className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-20 grid size-14 place-items-center rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/30 transition active:scale-90 md:hidden"><Plus className="size-6"/></button>
export const Empty=({icon:I,text,action})=><div className="anim-fade flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700"><span className="grid size-12 place-items-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800"><I className="size-6"/></span><p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{text}</p>{action}</div>
export const Acts=({onEdit,onDelete})=>{const {t}=useT();return <div className="grid grid-cols-2 gap-2 sm:flex"><Btn variant="soft" icon={Pencil} className="btn-sm" onClick={onEdit}>{t('edit')}</Btn><Btn variant="danger-soft" icon={Trash2} className="btn-sm" onClick={onDelete}>{t('delete')}</Btn></div>}
export const Credit=({className=''})=>{const {t}=useT();return <p className={`text-xs leading-6 text-zinc-500 dark:text-zinc-400 ${className}`}>{t('credit.by')} <b className="rounded-md bg-accent-50 px-1.5 py-0.5 font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">minhtrong67</b> · {t('credit.with')} <b className="rounded-md bg-orange-50 px-1.5 py-0.5 font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">Claude</b></p>}

export const Logo=({className='size-9'})=><span className={`${className} grid shrink-0 place-items-center rounded-xl bg-accent-600 text-white shadow-sm shadow-accent-600/30`}><ListChecks className="size-1/2"/></span>
export const CardSkeleton=({n=6,lines=3})=>Array.from({length:n},(_,i)=><div key={i} aria-hidden="true" className="card space-y-3 p-5">
 <div className="flex items-center justify-between gap-3"><div className="skeleton h-5 w-2/3"/><div className="skeleton h-6 w-20"/></div>
 <div className="flex gap-2"><div className="skeleton h-6 w-20"/><div className="skeleton h-6 w-24"/></div>
 {Array.from({length:lines-1},(_,k)=><div key={k} className={`skeleton h-4 ${k?'w-1/2':'w-full'}`}/>)}<div className="skeleton h-10 w-full"/></div>)
