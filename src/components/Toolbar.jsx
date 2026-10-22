import {useId,useState} from 'react'
import {ChevronDown,File,FileImage,FileJson,FileSpreadsheet,FileText,LayoutGrid,List,RotateCcw,Search,SlidersHorizontal,X} from 'lucide-react'
import {useT} from '../i18n'
import {Btn,Segmented} from '../ui'
export const useFormats=()=>{const {t}=useT();return [['csv',t('x.fmt.csv'),FileText],['json',t('x.fmt.json'),FileJson],['xlsx',t('x.fmt.xlsx'),FileSpreadsheet],['pdf',t('x.fmt.pdf'),File],['png',t('x.fmt.png'),FileImage]]}

// Bố cục: mobile = hàng 1 ô tìm kiếm (full), hàng 2 nút Bộ lọc (giãn đầy) + đổi dạng xem. Từ sm: tất cả trên 1 hàng.
// Mọi control cùng chiều cao. Bộ lọc đang bật hiện thành chip có thể bấm xoá từng cái ngay bên dưới.
export default function Toolbar({ph,q,setQ,count,active,clear,view,setView,tags=[],children}){
 const {t}=useT(),[open,setOpen]=useState(false),panel=useId(),filtering=!!q||active>0
 return <div className="mb-5">
  <div className="flex flex-wrap items-center gap-2">
   <div className="relative min-w-0 basis-full sm:basis-0 sm:flex-1">
    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder={ph} aria-label={ph} enterKeyHint="search" autoComplete="off" spellCheck={false} className="input pl-9 pr-10"/>
    {q&&<button type="button" aria-label={t('clear')} title={t('clear')} onClick={()=>setQ('')} className="icon-btn absolute right-1 top-1/2 !size-8 -translate-y-1/2"><X className="size-4"/></button>}</div>
   <Btn variant={open||active?'soft':'outline'} icon={SlidersHorizontal} className="min-w-0 flex-1 sm:flex-none" aria-expanded={open} aria-controls={panel} onClick={()=>setOpen(!open)}>
    {t('filter')}{!!active&&<span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold leading-none text-primary-foreground">{active}</span>}
    <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${open?'rotate-180':''}`}/></Btn>
   <Segmented iconOnly value={view} onChange={setView} label="view" options={[['list',t('viewList'),List],['grid',t('viewGrid'),LayoutGrid]]}/></div>
  <div id={panel} inert={open?undefined:''} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open?'grid-rows-[1fr]':'grid-rows-[0fr]'}`}>
   <div className="min-h-0 overflow-hidden"><div className="pt-3"><div className="card space-y-5 p-4 sm:p-5">{children}</div></div></div></div>
  {filtering&&<div className="anim-fade mt-3 flex flex-wrap items-center gap-2">
   <span className="mr-1 text-sm text-muted-foreground tabular-nums">{t('results',{n:count??0})}</span>
   {tags.map(g=><span key={g.k} className="anim-fade inline-flex h-7 max-w-full items-center gap-0.5 rounded-full bg-primary/10 pl-2.5 pr-1 text-xs font-medium text-primary-text"><span className="truncate">{g.label}</span>
    <button type="button" aria-label={`${t('clear')}: ${g.label}`} onClick={g.off} className="grid size-5 shrink-0 place-items-center rounded-full transition-colors hover:bg-primary/15"><X className="size-3"/></button></span>)}
   <button type="button" onClick={clear} className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><RotateCcw className="size-3"/>{t('clearFilter')}</button></div>}</div>}

export const Chips=({label,value,onChange,options})=><div role="group" aria-label={label}><p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
 <div className="flex flex-wrap gap-2">{options.map(([k,l])=><button key={k||'all'} type="button" aria-pressed={value===k} onClick={()=>onChange(k)}
  className={`pill ${value===k?'border-primary bg-primary text-primary-foreground shadow-xs':'border-input bg-background text-foreground hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50'}`}>{l}</button>)}</div></div>
