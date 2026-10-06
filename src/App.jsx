import {useEffect,useMemo,useRef,useState} from 'react'
import {onAuthStateChanged,signInWithPopup,signOut} from 'firebase/auth'
import {collection,onSnapshot,addDoc,setDoc,doc,deleteDoc,writeBatch,arrayRemove,serverTimestamp,query,orderBy} from 'firebase/firestore'
import {auth,db,provider,configured} from './firebase'
import {dl,toCSV,parseCSV,toXLSX,fromXLSX,exportNode,exportReport} from './io'
import {Btn,Icon,Dialog,Field,Skeleton,ToastProvider,useToast,useTheme} from './ui'

const STATUS={active:'Đang làm',paused:'Tạm dừng',done:'Hoàn thành',cancelled:'Huỷ'}
const CATS=['Web app','Desktop app','Mobile app','Tool / CLI','Extension','Game','API / Backend','Khác']
const TOOLS=['ChatGPT','Claude','Claude Code','Gemini','Gemini CLI','AI Studio','Antigravity','Cursor','Windsurf','GitHub Copilot','Codex','Kiro','Trae','Lovable','Bolt','v0','Replit','Khác']
const HUES=[262,210,150,30,340]
const NAV=[['projects','Dự án','M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z'],
 ['accounts','Tài khoản','M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 2 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z'],
 ['stats','Thống kê','M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z'],
 ['settings','Cài đặt','M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z']]

const useCol=(uid,name)=>{const [d,setD]=useState(null)
 useEffect(()=>onSnapshot(query(collection(db,'users',uid,name),orderBy('createdAt','desc')),s=>setD(s.docs.map(x=>({id:x.id,...x.data()}))),()=>setD([])),[uid,name]);return d}
const Chip=({children,tonal})=><span className={`text-xs px-3 py-1 rounded-lg ${tonal?'bg-primary-container text-on-primary-container':'border border-outline text-on-surface-variant'}`}>{children}</span>

const Select=({label,children,...p})=><label className="block mb-3 text-xs text-on-surface-variant">{label}
 <select {...p} className="mt-1 w-full h-12 px-4 rounded-xl bg-surface-container text-on-surface text-base outline-none focus:ring-2 ring-primary">{children}</select></label>

function MultiSelect({label,placeholder,options,value,onChange,empty}){
 const [open,setOpen]=useState(false)
 const lab=Object.fromEntries(options)
 const tog=id=>onChange(value.includes(id)?value.filter(i=>i!==id):[...value,id])
 return <div className="mb-3"><p className="text-xs text-on-surface-variant mb-1">{label}</p>
  <button type="button" onClick={()=>setOpen(!open)} aria-expanded={open} className="w-full min-h-12 px-4 py-2 rounded-xl bg-surface-container flex items-center gap-2 text-left outline-none focus-visible:ring-2 ring-primary">
   <span className="flex-1 flex flex-wrap gap-1">{value.length?value.map(id=><span key={id} className="px-2 h-6 grid place-items-center rounded-md bg-primary-container text-on-primary-container text-xs">{lab[id]||id}</span>):<span className="text-on-surface-variant/70">{placeholder}</span>}</span>
   <Icon n="expand" className={`transition-transform ${open?'rotate-180':''}`}/></button>
  <div className={`grid transition-all duration-300 ${open?'grid-rows-[1fr] mt-2':'grid-rows-[0fr]'}`}><div className="overflow-hidden"><div className="max-h-48 overflow-auto rounded-xl bg-surface-container p-1">
   {options.length?options.map(([id,l])=><label key={id} className="flex items-center gap-3 px-3 h-10 rounded-lg cursor-pointer hover:bg-primary/10 text-sm"><input type="checkbox" checked={value.includes(id)} onChange={()=>tog(id)} className="size-4 accent-primary"/>{l}</label>)
    :<p className="p-3 text-sm text-on-surface-variant">{empty}</p>}</div></div></div></div>}

function ProjectForm({init,accounts,busy,onSave,onCancel}){
 const [f,setF]=useState({name:'',desc:'',status:'active',category:'Web app',tools:[],userIds:[],...init})
 const [tags,setTags]=useState(init?.tags||[])
 return <>
  <Field label="Tên dự án" placeholder="VD: Landing page quán cà phê" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
  <label className="block mb-3 text-xs text-on-surface-variant">Mô tả
   <textarea rows={3} placeholder="VD: Trang giới thiệu menu và đặt bàn online" value={f.desc} onChange={e=>setF({...f,desc:e.target.value})} className="mt-1 w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-base outline-none focus:ring-2 ring-primary resize-none"/></label>
  <div className="grid sm:grid-cols-2 sm:gap-3">
   <Select label="Trạng thái" value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{Object.entries(STATUS).map(([k,l])=><option key={k} value={k}>{l}</option>)}</Select>
   <Select label="Danh mục" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</Select></div>
  <TagInput tags={tags} setTags={setTags}/>
  <MultiSelect label="Công cụ AI vibe code" placeholder="Chọn một hoặc nhiều công cụ" options={TOOLS.map(t=>[t,t])} value={f.tools} onChange={tools=>setF({...f,tools})}/>
  <MultiSelect label="Tài khoản tham gia" placeholder="Chọn tài khoản Google" options={accounts.map(a=>[a.id,a.name||a.email])} value={f.userIds} onChange={userIds=>setF({...f,userIds})} empty="Hãy thêm tài khoản ở tab Tài khoản trước."/>
  <div className="flex justify-end gap-2 mt-5"><Btn variant="text" icon="close" disabled={busy} onClick={onCancel}>Huỷ</Btn>
   <Btn icon="save" loading={busy} disabled={!f.name.trim()} onClick={()=>onSave({name:f.name.trim(),desc:f.desc,status:f.status,category:f.category,tools:f.tools,tags,userIds:f.userIds},f.id)}>Lưu dự án</Btn></div></>}

function AccountForm({init,busy,onSave}){
 const [f,setF]=useState({name:'',email:'',note:'',...init})
 return <>
  <Field label="Tên" placeholder="VD: Tài khoản chính" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
  <Field label="Email Google" placeholder="ten@gmail.com" type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
  <Field label="Ghi chú" placeholder="VD: Dùng cho Gemini, hết quota ngày 20" value={f.note} onChange={e=>setF({...f,note:e.target.value})}/>
  <Btn className="w-full mt-2" icon="save" loading={busy} disabled={!f.email.trim()} onClick={()=>onSave({name:f.name.trim(),email:f.email.trim(),note:f.note},f.id)}>Lưu tài khoản</Btn></>}

const SUGGEST=['react','vite','tailwind','firebase','typescript','nodejs','nextjs','python','tauri','supabase']
function TagInput({tags,setTags}){
 const [t,setT]=useState('')
 const add=raw=>{const n=raw.split(/[\s,#]+/).map(x=>x.toLowerCase()).filter(Boolean);if(n.length)setTags([...new Set([...tags,...n])]);setT('')}
 return <div className="mb-3"><p className="text-xs text-on-surface-variant mb-1">Công nghệ (hashtag, không cần gõ #)</p>
  <div className="flex flex-wrap gap-2 items-center min-h-12 px-3 py-2 rounded-xl bg-surface-container focus-within:ring-2 ring-primary">
   {tags.map(x=><span key={x} className="anim-fade inline-flex items-center gap-1 pl-3 pr-1 h-8 rounded-lg bg-primary-container text-on-primary-container text-sm">#{x}
    <button type="button" aria-label={`Bỏ ${x}`} onClick={()=>setTags(tags.filter(i=>i!==x))} className="size-6 grid place-items-center rounded-full hover:bg-primary/20"><Icon n="close" className="size-4!"/></button></span>)}
   <input value={t} placeholder={tags.length?'Thêm...':'VD: react (nhấn Enter hoặc dấu cách)'} className="flex-1 min-w-32 bg-transparent outline-none text-base"
    onChange={e=>/[\s,]/.test(e.target.value)?add(e.target.value):setT(e.target.value.replace(/#/g,''))}
    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add(t)}else if(e.key==='Backspace'&&!t&&tags.length)setTags(tags.slice(0,-1))}} onBlur={()=>t&&add(t)}/></div>
  <div className="flex flex-wrap gap-1 mt-2">{SUGGEST.filter(s=>!tags.includes(s)).slice(0,6).map(s=><button type="button" key={s} onClick={()=>setTags([...tags,s])} className="px-2 h-7 rounded-lg text-xs border border-outline text-on-surface-variant hover:bg-primary/10 transition">+ #{s}</button>)}</div></div>}

function Toolbar({v,set,filters,sorts,cats,ph,count,extra}){
 const [open,setOpen]=useState(false)
 const active=(v.filter!=='all')+!!v.cat+(v.sort!=='new')
 const sel="mt-1 h-10 w-full rounded-xl bg-surface px-3 text-sm text-on-surface outline-none focus:ring-2 ring-primary"
 return <div className="relative z-10 mb-4 anim-fade">
  <div className="flex gap-2">
   <div className="relative flex-1"><Icon n="search" className="absolute left-4 top-3.5 text-on-surface-variant"/>
    <input value={v.q} onChange={e=>set({q:e.target.value})} placeholder={ph} className="w-full h-12 pl-12 pr-11 rounded-full bg-surface-container outline-none focus:ring-2 ring-primary"/>
    {v.q&&<button aria-label="Xoá tìm kiếm" onClick={()=>set({q:''})} className="absolute right-2 top-2 size-8 grid place-items-center rounded-full hover:bg-primary/10"><Icon n="close"/></button>}</div>
   {extra}
   <button onClick={()=>setOpen(!open)} aria-expanded={open} className={`h-12 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium border transition active:scale-95 ${open||active?'bg-primary-container text-on-primary-container border-transparent':'border-outline'}`}>
    <Icon n="filter"/><span className="hidden sm:inline">Bộ lọc</span>{!!active&&<span className="min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-on-primary text-xs">{active}</span>}</button></div>
  <div className={`grid transition-all duration-300 ${open?'grid-rows-[1fr] mt-3':'grid-rows-[0fr]'}`}><div className="overflow-hidden"><div className="bg-surface-container rounded-3xl p-4 space-y-4">
   <div><p className="text-xs text-on-surface-variant mb-2">{cats?'Trạng thái':'Tham gia dự án'}</p><div className="flex flex-wrap gap-2">{filters.map(([k,l])=><button key={k} onClick={()=>set({filter:k})} className={`px-3 h-8 rounded-lg text-sm transition ${v.filter===k?'bg-primary text-on-primary':'bg-surface hover:bg-primary/10'}`}>{l}</button>)}</div></div>
   <div className={`grid gap-3 ${cats?'sm:grid-cols-2':''}`}>
    {cats&&<label className="text-xs text-on-surface-variant">Danh mục<select value={v.cat} onChange={e=>set({cat:e.target.value})} className={sel}><option value="">Tất cả danh mục</option>{cats.map(c=><option key={c}>{c}</option>)}</select></label>}
    <label className="text-xs text-on-surface-variant">Sắp xếp<select value={v.sort} onChange={e=>set({sort:e.target.value})} className={sel}>{sorts.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label></div>
   <div className="flex justify-end"><Btn variant="text" icon="close" disabled={!active} onClick={()=>set({filter:'all',cat:'',sort:'new'})}>Đặt lại bộ lọc</Btn></div></div></div></div>
  {(v.q||active>0)&&<p className="text-xs text-on-surface-variant mt-2 px-1">{count??0} kết quả</p>}</div>}

function Stats({projects,accounts,nodeRef}){
 if(!projects||!accounts)return <Skeleton/>
 const cnt=(a,f=()=>true)=>projects.filter(p=>p.userIds?.includes(a.id)&&f(p)).length
 const tally=(arr,pre='')=>Object.entries(arr.filter(Boolean).reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{})).map(([l,n])=>({l:pre+l,n})).sort((a,b)=>b.n-a.n)
 const by=s=>projects.filter(p=>p.status===s).length
 const links=projects.reduce((n,p)=>n+(p.userIds?.length||0),0)
 const top=f=>accounts.map(a=>({l:a.name||a.email,n:cnt(a,f)})).filter(r=>r.n).sort((a,b)=>b.n-a.n).slice(0,5)
 const cards=[['Dự án',projects.length],['Tài khoản',accounts.length],['Đang làm',by('active')],['Hoàn thành',by('done')],['Tạm dừng',by('paused')],['Huỷ',by('cancelled')],['Chưa gán tài khoản',projects.filter(p=>!p.userIds?.length).length],['Tài khoản / dự án (TB)',projects.length?(links/projects.length).toFixed(1):'0']]
 const Bars=({title,rows})=>{const m=Math.max(1,...rows.map(r=>r.n));return <section className="bg-surface-container rounded-3xl p-5"><h3 className="font-medium mb-3">{title}</h3>
  {rows.map(r=><div key={r.l} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="break-all">{r.l}</span><span>{r.n}</span></div>
   <div className="h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-primary transition-all duration-700" style={{width:`${r.n/m*100}%`}}/></div></div>)}{!rows.length&&<p className="text-sm text-on-surface-variant">Chưa có dữ liệu.</p>}</section>}
 return <div ref={nodeRef} className="anim-up bg-surface p-1"><p className="text-xs text-on-surface-variant mb-3">VibeLedger · Báo cáo thống kê · {new Date().toLocaleDateString('vi-VN')}</p><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">{cards.map(([l,n])=><div key={l} className="bg-primary-container text-on-primary-container rounded-3xl p-5"><div className="text-4xl">{n}</div><div className="text-sm">{l}</div></div>)}</div>
  <div className="grid lg:grid-cols-2 gap-3">
   <Bars title="Dự án theo trạng thái" rows={Object.entries(STATUS).map(([k,l])=>({l,n:by(k)}))}/>
   <Bars title="Dự án theo danh mục" rows={tally(projects.map(p=>p.category))}/>
   <Bars title="Công cụ AI được dùng nhiều nhất" rows={tally(projects.flatMap(p=>p.tools||[])).slice(0,8)}/>
   <Bars title="Công nghệ phổ biến" rows={tally(projects.flatMap(p=>p.tags||[]),'#').slice(0,10)}/>
   <Bars title="Tài khoản tham gia nhiều dự án nhất" rows={top()}/>
   <Bars title="Tài khoản đang làm nhiều dự án nhất" rows={top(p=>p.status==='active')}/></div></div>}

const F={projects:[['all','Tất cả'],...Object.entries(STATUS)],accounts:[['all','Tất cả'],['busy','Đang tham gia'],['free','Chưa có dự án']]}
const S={projects:[['new','Mới nhất'],['old','Cũ nhất'],['az','Tên A-Z']],accounts:[['new','Mới nhất'],['old','Cũ nhất'],['az','Email A-Z'],['most','Nhiều dự án nhất']]}

const V0={q:'',sort:'new',filter:'all',cat:''}
const ST={active:'bg-primary-container text-on-primary-container',paused:'bg-amber-500/20 text-amber-800 dark:text-amber-300',done:'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300',cancelled:'bg-error/15 text-error'}
const MODES=[['system','Hệ thống','desktop'],['light','Sáng','sun'],['dark','Tối','moon']]
const EXP=[['csv','CSV (.csv)'],['json','JSON (.json)'],['xlsx','Excel (.xlsx)'],['pdf','PDF (.pdf)'],['png','Ảnh PNG (.png)']]
const COLS={projects:[['name','Tên dự án',28],['desc','Mô tả',40],['status','Trạng thái',14],['category','Danh mục',16],['tags','Công nghệ',24],['tools','Công cụ AI',24],['accounts','Tài khoản',34],['created','Ngày tạo',14]],
 accounts:[['name','Tên',22],['email','Email',32],['note','Ghi chú',36],['count','Số dự án',12],['projects','Dự án tham gia',36]]}
const Avatar=({a,i})=><span title={a.name||a.email} style={{marginLeft:i?-8:0}} className="size-8 shrink-0 rounded-full grid place-items-center text-xs font-medium uppercase bg-primary-container text-on-primary-container ring-2 ring-surface-container">{(a.name||a.email||'?')[0]}</span>
const Acts=({onEdit,onDelete})=><div className="ml-auto flex gap-1 shrink-0"><Btn size="sm" variant="tonal" icon="edit" onClick={onEdit}>Sửa</Btn><Btn size="sm" variant="danger" icon="delete" onClick={onDelete}>Xoá</Btn></div>
const Card=({children,foot})=><div className="anim-up bg-surface-container rounded-3xl p-5 flex flex-col gap-3 min-w-0 transition hover:shadow-lg">{children}<div className="mt-auto pt-3 border-t border-outline/30 flex items-center gap-2">{foot}</div></div>
const ProjectCard=({p,accs,onEdit,onDelete})=><Card foot={<><div className="flex items-center gap-2 min-w-0 flex-1">{accs.slice(0,3).map((a,i)=><Avatar key={a.id} a={a} i={i}/>)}
  <span className="text-xs text-on-surface-variant truncate">{accs.length?accs.map(a=>a.name||a.email).join(', '):'Chưa gán tài khoản'}</span></div><Acts onEdit={onEdit} onDelete={onDelete}/></>}>
 <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><h3 className="text-lg font-medium leading-snug break-words">{p.name}</h3>
  <p className="text-xs text-on-surface-variant mt-0.5">{[p.category,...(p.tools||[])].filter(Boolean).join(' · ')}</p></div>
  <span className={`shrink-0 px-3 h-7 grid place-items-center rounded-lg text-xs font-medium ${ST[p.status]}`}>{STATUS[p.status]}</span></div>
 {p.desc&&<p className="text-sm text-on-surface-variant line-clamp-2">{p.desc}</p>}
 {!!p.tags?.length&&<p className="text-xs text-primary line-clamp-1">{p.tags.map(t=>'#'+t).join(' ')}</p>}</Card>
const AccountCard=({a,projs,onEdit,onDelete})=><Card foot={<><span className="text-xs text-on-surface-variant">{projs.length} dự án</span><Acts onEdit={onEdit} onDelete={onDelete}/></>}>
 <div className="flex items-center gap-3"><span className="size-12 rounded-full grid place-items-center text-lg uppercase shrink-0 bg-primary-container text-on-primary-container">{(a.name||a.email)[0]}</span>
  <div className="min-w-0"><h3 className="text-lg font-medium truncate">{a.name||a.email}</h3>{a.name&&<p className="text-xs text-on-surface-variant truncate">{a.email}</p>}</div></div>
 {a.note&&<p className="text-sm text-on-surface-variant line-clamp-2">{a.note}</p>}
 <div className="flex flex-wrap gap-1">{projs.slice(0,3).map(p=><span key={p.id} className="text-xs px-3 py-1 rounded-lg bg-primary-container text-on-primary-container max-w-40 truncate">{p.name}</span>)}
  {projs.length>3&&<Chip>+{projs.length-3}</Chip>}{!projs.length&&<span className="text-xs text-on-surface-variant">Chưa tham gia dự án nào</span>}</div></Card>

function DataMenu({label='Dữ liệu',exports,onExport,onImport,busy}){
 const [open,setOpen]=useState(false)
 const item="w-full h-10 px-3 rounded-xl flex items-center gap-3 text-sm hover:bg-primary/10 text-left cursor-pointer"
 return <div className="relative">
  <button onClick={()=>setOpen(!open)} disabled={busy} aria-expanded={open} className="h-12 px-4 rounded-full inline-flex items-center gap-2 text-sm font-medium border border-outline transition active:scale-95 disabled:opacity-50">
   {busy?<span className="size-5 rounded-full border-2 border-current border-t-transparent animate-spin"/>:<Icon n="download"/>}<span className="hidden sm:inline">{label}</span></button>
  {open&&<><div className="fixed inset-0 z-40" onClick={()=>setOpen(false)}/>
   <div className="absolute right-0 top-14 z-50 w-60 rounded-2xl bg-surface border border-outline/40 shadow-xl p-2 anim-fade">
    {onImport&&<><p className="px-3 pt-1 text-xs text-on-surface-variant">Nhập dữ liệu</p>
     <label className={item}><Icon n="upload"/>CSV, JSON, Excel<input type="file" hidden accept=".csv,.json,.xlsx" onChange={e=>{const f=e.target.files[0];e.target.value='';setOpen(false);f&&onImport(f)}}/></label></>}
    <p className="px-3 pt-2 text-xs text-on-surface-variant">{onImport?'Xuất (theo bộ lọc hiện tại)':'Xuất báo cáo'}</p>
    {exports.map(([k,l])=><button key={k} onClick={()=>{setOpen(false);onExport(k)}} className={item}><Icon n="download"/>{l}</button>)}</div></>}</div>}

function Palette({items,onClose}){
 const [q,setQ]=useState(''),[i,setI]=useState(0)
 const list=items.filter(x=>x.label.toLowerCase().includes(q.toLowerCase())).slice(0,8),n=Math.max(list.length,1)
 useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose])
 const run=x=>{onClose();x.run()}
 return <div className="fixed inset-0 z-50 bg-black/40 anim-fade flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
  <div onClick={e=>e.stopPropagation()} className="anim-up w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden">
   <div className="flex items-center gap-3 pl-5 pr-2 h-14 border-b border-outline/30"><Icon n="search"/>
    <input autoFocus value={q} placeholder="Tìm trang, dự án, tài khoản..." onChange={e=>{setQ(e.target.value);setI(0)}} className="flex-1 bg-transparent outline-none text-base"
     onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setI((i+1)%n)}else if(e.key==='ArrowUp'){e.preventDefault();setI((i+n-1)%n)}else if(e.key==='Enter'&&list[i])run(list[i])}}/>
    <button aria-label="Đóng" onClick={onClose} className="size-10 grid place-items-center rounded-full hover:bg-primary/10"><Icon n="close"/></button></div>
   <div className="max-h-80 overflow-auto p-2">{list.map((x,k)=><button key={x.label+k} onMouseEnter={()=>setI(k)} onClick={()=>run(x)} className={`w-full h-12 px-3 rounded-xl flex items-center gap-3 text-left text-sm ${k===i?'bg-primary-container text-on-primary-container':''}`}>
    <Icon n={x.icon} d={x.d}/><span className="flex-1 truncate">{x.label}</span><span className="text-xs text-on-surface-variant">{x.hint}</span></button>)}
    {!list.length&&<p className="p-4 text-sm text-on-surface-variant">Không tìm thấy kết quả.</p>}</div></div></div>}

function Main({user,theme,setTheme}){
 const toast=useToast(),statsRef=useRef()
 const [tab,setTab]=useState('projects'),[dlg,setDlg]=useState(null),[busy,setBusy]=useState(false),[out,setOut]=useState(false),[ask,setAsk]=useState(null)
 const [drawer,setDrawer]=useState(false),[pal,setPal]=useState(false),[io,setIo]=useState(false),[v,setV]=useState(V0)
 const set=p=>setV(x=>({...x,...p})),go=k=>{setTab(k);setV(V0);setDrawer(false)}
 const projects=useCol(user.uid,'projects'),accounts=useCol(user.uid,'accounts')
 const accMap=useMemo(()=>Object.fromEntries((accounts||[]).map(a=>[a.id,a])),[accounts])
 const col=n=>collection(db,'users',user.uid,n)
 const cnt=id=>(projects||[]).filter(p=>p.userIds?.includes(id)).length
 const cur=MODES.find(m=>m[0]===theme.mode)||MODES[0],nextMode=()=>setTheme({mode:MODES[(MODES.indexOf(cur)+1)%3][0]})
 useEffect(()=>{const k=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPal(p=>!p)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[])
 const save=async(type,data,id)=>{setBusy(true)
  try{id?await setDoc(doc(col(type),id),data,{merge:true}):await addDoc(col(type),{...data,createdAt:serverTimestamp()});toast('Đã lưu');setDlg(null)}catch(e){toast(e.message,'error')}
  setBusy(false)}
 const doDelete=async()=>{const {type,item}=ask;setBusy(true)
  try{if(type==='accounts'){const b=writeBatch(db);b.delete(doc(col('accounts'),item.id))
    projects.filter(p=>p.userIds?.includes(item.id)).forEach(p=>b.update(doc(col('projects'),p.id),{userIds:arrayRemove(item.id)}));await b.commit()}
   else await deleteDoc(doc(col('projects'),item.id));toast('Đã xoá');setAsk(null)}catch(e){toast(e.message,'error')}
  setBusy(false)}
 const list=tab==='projects'?projects:accounts,s=v.q.trim().toLowerCase()
 const by={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0),az:(a,b)=>(a.name||a.email).localeCompare(b.name||b.email),most:(a,b)=>cnt(b.id)-cnt(a.id)}
 const shown=list&&list.filter(it=>tab==='projects'
   ?(v.filter==='all'||it.status===v.filter)&&(!v.cat||it.category===v.cat)&&(!s||[it.name,it.desc,it.category,...(it.tags||[]),...(it.tools||[]),...(it.userIds||[]).flatMap(i=>[accMap[i]?.name,accMap[i]?.email])].join(' ').toLowerCase().includes(s))
   :(v.filter==='all'||(v.filter==='free')===(cnt(it.id)===0))&&(!s||[it.name,it.email,it.note].join(' ').toLowerCase().includes(s))).sort(by[v.sort]||(()=>0))
 const manage=tab==='projects'||tab==='accounts'
 // ---- nhập / xuất
 const today=new Date().toISOString().slice(0,10)
 const emails=p=>(p.userIds||[]).map(i=>accMap[i]?.email).filter(Boolean)
 const flat=()=>shown.map(it=>tab==='projects'?{name:it.name,desc:it.desc||'',status:STATUS[it.status],category:it.category||'',tags:(it.tags||[]).map(t=>'#'+t).join(' '),tools:(it.tools||[]).join(', '),accounts:emails(it).join(', '),created:it.createdAt?.toDate?.().toLocaleDateString('vi-VN')||''}
  :{name:it.name||'',email:it.email,note:it.note||'',count:cnt(it.id),projects:projects.filter(p=>p.userIds?.includes(it.id)).map(p=>p.name).join(', ')})
 const records=()=>shown.map(it=>tab==='projects'?{name:it.name,desc:it.desc||'',status:it.status,category:it.category||'',tags:it.tags||[],tools:it.tools||[],accounts:emails(it)}:{name:it.name||'',email:it.email,note:it.note||''})
 const run=async(fn,ok)=>{setIo(true);try{await fn();toast(ok)}catch(e){toast(e.message||'Có lỗi xảy ra','error')}setIo(false)}
 const exportData=fmt=>run(async()=>{const rows=flat();if(!rows.length)throw new Error('Không có dữ liệu để xuất')
  const cols=COLS[tab],title=tab==='projects'?'Danh sách dự án':'Danh sách tài khoản',name=`vibeledger-${tab}-${today}`
  if(fmt==='csv')dl(new Blob([toCSV(cols,rows)],{type:'text/csv;charset=utf-8'}),name+'.csv')
  else if(fmt==='json')dl(new Blob([JSON.stringify({app:'VibeLedger',type:tab,exportedAt:new Date().toISOString(),data:records()},null,2)],{type:'application/json'}),name+'.json')
  else if(fmt==='xlsx')dl(await toXLSX(cols,rows,title),name+'.xlsx')
  else await exportReport(fmt,title,cols,rows,name)},'Đã xuất file')
 const exportStats=fmt=>run(()=>exportNode(statsRef.current,fmt,`vibeledger-thong-ke-${today}`),'Đã xuất báo cáo')
 const doImport=file=>run(async()=>{
  const ext=file.name.split('.').pop().toLowerCase();let rows
  if(ext==='json'){const j=JSON.parse(await file.text());rows=Array.isArray(j)?j:j.data}
  else if(ext==='csv')rows=parseCSV(await file.text());else if(ext==='xlsx')rows=await fromXLSX(await file.arrayBuffer());else throw new Error('Chỉ hỗ trợ file CSV, JSON, XLSX')
  if(!rows?.length)throw new Error('File không có dữ liệu');if(rows.length>400)throw new Error('Tối đa 400 dòng mỗi lần nhập')
  const get=(o,k)=>o[k]??o[COLS[tab].find(c=>c[0]===k)[1]]
  const list=x=>(Array.isArray(x)?x:String(x??'').split(/[,;\n]+/)).map(i=>String(i).trim()).filter(Boolean)
  const tagList=x=>(Array.isArray(x)?x:String(x??'').split(/[\s,;]+/)).map(i=>String(i).replace(/^#+/,'').trim().toLowerCase()).filter(Boolean)
  const e2id=Object.fromEntries((accounts||[]).map(a=>[a.email.toLowerCase(),a.id])),b=writeBatch(db);let n=0
  rows.forEach(o=>{
   if(tab==='projects'){const name=String(get(o,'name')||'').trim();if(!name)return
    const ids=list(get(o,'accounts')).map(e=>{const k=e.toLowerCase();if(!e2id[k]){const r=doc(col('accounts'));b.set(r,{name:'',email:e,note:'',createdAt:serverTimestamp()});e2id[k]=r.id}return e2id[k]})
    const st=String(get(o,'status')||'').trim().toLowerCase(),status=Object.keys(STATUS).find(k=>k===st||STATUS[k].toLowerCase()===st)||'active'
    b.set(doc(col('projects')),{name,desc:String(get(o,'desc')||''),status,category:String(get(o,'category')||'Khác'),tags:[...new Set(tagList(get(o,'tags')))],tools:list(get(o,'tools')),userIds:[...new Set(ids)],createdAt:serverTimestamp()});n++}
   else{const email=String(get(o,'email')||'').trim();if(!email||e2id[email.toLowerCase()])return
    e2id[email.toLowerCase()]=1;b.set(doc(col('accounts')),{name:String(get(o,'name')||'').trim(),email,note:String(get(o,'note')||''),createdAt:serverTimestamp()});n++}})
  if(!n)throw new Error('Không có dòng hợp lệ để nhập (thiếu tên/email hoặc bị trùng)')
  await b.commit();toast(`Đã nhập ${n} mục`)},'Nhập dữ liệu xong')
 const palItems=[...NAV.map(([k,l,d])=>({label:l,hint:'Trang',d,run:()=>go(k)})),
  {label:'Thêm dự án',hint:'Hành động',icon:'add',run:()=>{go('projects');setDlg({type:'projects'})}},
  {label:'Thêm tài khoản',hint:'Hành động',icon:'add',run:()=>{go('accounts');setDlg({type:'accounts'})}},
  {label:`Đổi giao diện (đang: ${cur[1]})`,hint:'Hành động',icon:cur[2],run:nextMode},
  ...(projects||[]).map(p=>({label:p.name,hint:'Dự án',d:NAV[0][2],run:()=>{go('projects');set({q:p.name})}})),
  ...(accounts||[]).map(a=>({label:a.name||a.email,hint:'Tài khoản',d:NAV[1][2],run:()=>{go('accounts');set({q:a.email})}}))]
 const NavItems=({rail})=>NAV.map(([k,l,d])=>rail
  ?<button key={k} onClick={()=>go(k)} className="flex flex-col items-center gap-1 text-xs w-20"><span className={`h-8 w-14 rounded-full grid place-items-center transition-all duration-300 ${tab===k?'bg-primary-container text-on-primary-container':'hover:bg-primary/10'}`}><Icon d={d} className="size-6!"/></span>{l}</button>
  :<button key={k} onClick={()=>go(k)} className={`w-full h-14 px-4 rounded-full flex items-center gap-3 text-sm transition ${tab===k?'bg-primary-container text-on-primary-container':'hover:bg-primary/10'}`}><Icon d={d}/>{l}</button>)
 const hb="size-10 grid place-items-center rounded-full hover:bg-primary/10 transition active:scale-90"
 return <div className="md:pl-24">
  <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur"><div className="max-w-7xl mx-auto px-3 md:px-10 h-14 flex items-center gap-1">
   <button aria-label="Mở menu" onClick={()=>setDrawer(true)} className={`${hb} md:hidden`}><Icon n="menu"/></button>
   <span className="text-lg font-medium flex-1 ml-1 md:ml-0">VibeLedger</span>
   <button aria-label="Tìm kiếm (Ctrl+K)" title="Tìm kiếm (Ctrl+K)" onClick={()=>setPal(true)} className={hb}><Icon n="search"/></button>
   <button aria-label={`Giao diện: ${cur[1]}`} title={`Giao diện: ${cur[1]}`} onClick={nextMode} className={hb}><Icon n={cur[2]}/></button></div></header>
  <div className="max-w-7xl mx-auto px-4 md:px-10 pt-4 pb-28">
   <div className="relative z-10 flex items-center justify-between gap-3 mb-5"><h1 className="text-3xl">{NAV.find(n=>n[0]===tab)[1]}</h1>
    {tab==='stats'&&<DataMenu label="Xuất báo cáo" exports={[['png','Ảnh PNG (.png)'],['pdf','PDF (.pdf)']]} onExport={exportStats} busy={io}/>}</div>
   {manage&&<Toolbar v={v} set={set} filters={F[tab]} sorts={S[tab]} cats={tab==='projects'?CATS:null} count={shown?.length} ph={tab==='projects'?'Tìm theo tên, hashtag, công cụ, tài khoản...':'Tìm theo tên, email, ghi chú...'}
    extra={<DataMenu exports={EXP} onExport={exportData} onImport={doImport} busy={io}/>}/>}
   {manage&&(shown===null?<Skeleton/>:!list.length?<p className="text-on-surface-variant anim-fade">{tab==='projects'?'Chưa có dự án nào. Nhấn "Thêm dự án" để tạo dự án đầu tiên.':'Chưa có tài khoản nào. Nhấn "Thêm tài khoản" để thêm email Google.'}</p>
    :!shown.length?<p className="text-on-surface-variant anim-fade">Không có kết quả phù hợp bộ lọc.</p>
    :<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{shown.map(it=>tab==='projects'
      ?<ProjectCard key={it.id} p={it} accs={(it.userIds||[]).map(i=>accMap[i]).filter(Boolean)} onEdit={()=>setDlg({type:tab,item:it})} onDelete={()=>setAsk({type:tab,item:it})}/>
      :<AccountCard key={it.id} a={it} projs={(projects||[]).filter(p=>p.userIds?.includes(it.id))} onEdit={()=>setDlg({type:tab,item:it})} onDelete={()=>setAsk({type:tab,item:it})}/>)}</div>)}
   {tab==='stats'&&<Stats projects={projects} accounts={accounts} nodeRef={statsRef}/>}
   {tab==='settings'&&<div className="anim-up space-y-6 max-w-xl">
    <section><p className="mb-2">Giao diện</p><div className="flex gap-2">{[['light','Sáng'],['dark','Tối'],['system','Hệ thống']].map(([k,l])=>
     <button key={k} onClick={()=>setTheme({mode:k})} className={`flex-1 h-10 rounded-full text-sm transition ${theme.mode===k?'bg-primary-container text-on-primary-container':'border border-outline'}`}>{l}</button>)}</div></section>
    <section><p className="mb-2">Màu chủ đề</p><div className="flex gap-3">{HUES.map(h=><button key={h} aria-label={`Màu ${h}`} onClick={()=>setTheme({hue:h})} style={{background:`hsl(${h} 45% 45%)`}} className={`size-10 rounded-full transition active:scale-90 ${theme.hue===h?'ring-2 ring-offset-2 ring-primary ring-offset-surface':''}`}/>)}</div></section>
    <section><p className="mb-2">Cỡ chữ: {theme.fs}px</p><input type="range" min="14" max="20" value={theme.fs} onChange={e=>setTheme({fs:+e.target.value})} className="w-full accent-primary"/></section>
    <section className="text-sm text-on-surface-variant">Đăng nhập: {user.email}</section>
    <Btn variant="tonal" icon="logout" loading={out} onClick={async()=>{setOut(true);await signOut(auth);setOut(false)}}>Đăng xuất</Btn>
    <p className="text-xs text-on-surface-variant pt-4">Tác giả <b>minhtrong67</b> · Có sự hỗ trợ của Claude</p></div>}
  </div>
  {manage&&<button onClick={()=>setDlg({type:tab})} className="fixed right-5 bottom-24 md:bottom-8 md:right-10 z-10 h-14 px-5 rounded-2xl bg-primary-container text-on-primary-container shadow-lg inline-flex items-center gap-2 font-medium transition active:scale-95 hover:shadow-xl"><Icon n="add"/>{tab==='projects'?'Thêm dự án':'Thêm tài khoản'}</button>}
  <nav className="hidden md:flex fixed inset-y-0 left-0 w-24 flex-col items-center gap-5 pt-20 z-10" style={{background:'var(--sc)'}}><NavItems rail/></nav>
  <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 h-20 flex justify-around items-center pb-[env(safe-area-inset-bottom)]" style={{background:'var(--sc)'}}><NavItems rail/></nav>
  <div className={`md:hidden fixed inset-0 z-40 ${drawer?'':'pointer-events-none'}`}>
   <div onClick={()=>setDrawer(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawer?'opacity-100':'opacity-0'}`}/>
   <aside className={`absolute inset-y-0 left-0 w-72 bg-surface rounded-r-[28px] p-4 transition-transform duration-300 ${drawer?'translate-x-0':'-translate-x-full'}`}>
    <div className="flex items-center justify-between pl-3 h-14 mb-2"><span className="text-lg font-medium">VibeLedger</span><button aria-label="Đóng menu" onClick={()=>setDrawer(false)} className={hb}><Icon n="close"/></button></div><NavItems/></aside></div>
  {dlg&&<Dialog title={`${dlg.item?'Sửa':'Thêm'} ${dlg.type==='projects'?'dự án':'tài khoản'}`} onClose={()=>setDlg(null)}>
   {dlg.type==='projects'?<ProjectForm init={dlg.item} accounts={accounts||[]} busy={busy} onCancel={()=>setDlg(null)} onSave={(d,id)=>save('projects',d,id)}/>:<AccountForm init={dlg.item} busy={busy} onSave={(d,id)=>save('accounts',d,id)}/>}</Dialog>}
  {ask&&<Dialog title="Xác nhận xoá" onClose={()=>!busy&&setAsk(null)}>
   <p className="text-on-surface-variant mb-6">Xoá {ask.type==='projects'?'dự án':'tài khoản'} <b className="text-on-surface break-all">{ask.item.name||ask.item.email}</b>?{ask.type==='accounts'&&' Tài khoản cũng sẽ được gỡ khỏi các dự án đang tham gia.'} Hành động này không thể hoàn tác.</p>
   <div className="flex justify-end gap-2"><Btn variant="text" icon="close" disabled={busy} onClick={()=>setAsk(null)}>Huỷ</Btn><Btn variant="error" icon="delete" loading={busy} onClick={doDelete}>Xoá</Btn></div></Dialog>}
  {pal&&<Palette items={palItems} onClose={()=>setPal(false)}/>}
 </div>}

function Gate({theme,setTheme}){
 const toast=useToast(),[user,setUser]=useState(undefined),[busy,setBusy]=useState(false)
 useEffect(()=>configured?onAuthStateChanged(auth,setUser):setUser(null),[])
 if(user===undefined)return <div className="max-w-2xl mx-auto p-4 pt-10"><Skeleton/></div>
 if(user)return <Main user={user} theme={theme} setTheme={setTheme}/>
 return <div className="min-h-screen grid place-items-center p-6"><div className="anim-up text-center max-w-sm">
  <img src="/pwa-192.png" alt="" className="size-24 mx-auto mb-6 rounded-3xl"/>
  <h1 className="text-3xl mb-2">VibeLedger</h1>
  <p className="text-on-surface-variant mb-6">Theo dõi tài khoản Google nào đang xử lý dự án nào.</p>
  {configured?<Btn className="w-full" icon="save" loading={busy} onClick={async()=>{setBusy(true);try{await signInWithPopup(auth,provider)}catch(e){toast(e.message,'error')}setBusy(false)}}>Đăng nhập với Google</Btn>
   :<p className="text-error text-sm">Chưa cấu hình Firebase. Điền các giá trị trong file .env rồi chạy lại npm run dev.</p>}
  <p className="text-xs text-on-surface-variant mt-8">Tác giả minhtrong67 · Có sự hỗ trợ của Claude</p></div></div>}

export default function App(){const [theme,setTheme]=useTheme();return <ToastProvider><Gate theme={theme} setTheme={setTheme}/></ToastProvider>}
