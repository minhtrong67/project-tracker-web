import {useState} from 'react'
import {File,FileImage,FileJson,FileSpreadsheet,FileText,LayoutGrid,List,RotateCcw,Search,SlidersHorizontal,X} from 'lucide-react'
import {useT} from '../i18n'
import {Btn,Segmented} from '../ui'
export const useFormats=()=>{const {t}=useT();return [['csv',t('x.fmt.csv'),FileText],['json',t('x.fmt.json'),FileJson],['xlsx',t('x.fmt.xlsx'),FileSpreadsheet],['pdf',t('x.fmt.pdf'),File],['png',t('x.fmt.png'),FileImage]]}
// Hàng 1 (mobile): ô tìm kiếm. Hàng 2: Bộ lọc, Xoá lọc, nút đổi dạng xem nằm bên phải. Desktop: tất cả trên 1 hàng.
export default function Toolbar({ph,q,setQ,count,active,clear,view,setView,children}){
 const {t}=useT(),[open,setOpen]=useState(false)
 return <div className="relative z-20 mb-5">
  <div className="flex flex-wrap items-center gap-2">
   <div className="relative order-1 w-full md:w-auto md:flex-1"><Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-zinc-400"/>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder={ph} aria-label={ph} className="input pl-10 pr-10"/>
    {q&&<button type="button" aria-label={t('clear')} onClick={()=>setQ('')} className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="size-4"/></button>}</div>
   <Btn variant={open||active?'soft':'outline'} icon={SlidersHorizontal} className="order-2" aria-expanded={open} onClick={()=>setOpen(!open)}>{t('filter')}
    {!!active&&<span className="grid min-w-5 place-items-center rounded-full bg-accent-600 px-1 text-xs text-white">{active}</span>}</Btn>
   {(active>0||q)&&<Btn variant="ghost" icon={RotateCcw} className="order-3" onClick={clear}>{t('clearFilter')}</Btn>}
   <div className="order-4 ml-auto md:ml-0"><Segmented value={view} onChange={setView} label="view" options={[['list',t('viewList'),List],['grid',t('viewGrid'),LayoutGrid]]}/></div></div>
  <div className={`grid transition-all duration-300 ${open?'mt-3 grid-rows-[1fr]':'grid-rows-[0fr]'}`}><div className="overflow-hidden"><div className="card space-y-4 p-4">{children}</div></div></div>
  {(q||active>0)&&<p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t('results',{n:count??0})}</p>}</div>}
export const Chips=({label,value,onChange,options})=><div><p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p><div className="flex flex-wrap gap-2">{options.map(([k,l])=><button key={k} type="button" onClick={()=>onChange(k)} className={`h-9 rounded-lg border px-3 text-sm transition ${value===k?'border-accent-600 bg-accent-600 text-white':'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}>{l}</button>)}</div></div>
