import {createContext,useContext,useState,useCallback,useEffect} from 'react'
const ToastCtx=createContext()
export const useToast=()=>useContext(ToastCtx)
export function ToastProvider({children}){
 const [t,setT]=useState([])
 const push=useCallback((msg,type='info')=>{const id=Math.random();setT(x=>[...x,{id,msg,type}]);setTimeout(()=>setT(x=>x.filter(i=>i.id!==id)),3200)},[])
 return <ToastCtx.Provider value={push}>{children}
  <div className="fixed bottom-24 md:bottom-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none">
   {t.map(i=><div key={i.id} className={`anim-up pointer-events-auto rounded-xl px-4 py-3 text-sm shadow-lg ${i.type==='error'?'bg-error text-surface':'bg-inverse text-inverse-on'}`}>{i.msg}</div>)}
  </div></ToastCtx.Provider>}
const P={edit:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
delete:'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',add:'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
search:'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
save:'M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM15 9H5V5h10v4z',
logout:'M17 7l-1.4 1.4 2.6 2.6H9v2h9.2l-2.6 2.6L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z',
filter:'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',expand:'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z',menu:'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2v-2H2v2zm18 0h2v-2h-2v2zM11 2v2h2V2h-2zm0 18v2h2v-2h-2zM5.99 4.58 4.58 5.99l1.41 1.42 1.42-1.41-1.42-1.42zm12.02 12.02-1.42 1.41 1.42 1.42 1.41-1.42-1.41-1.41zM4.58 18.01l1.41 1.41 1.42-1.41-1.42-1.42-1.41 1.42zM18.01 5.99l1.41-1.41-1.41-1.42-1.42 1.42 1.42 1.41z',moon:'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-5.4-5.4c0-1.81.89-3.42 2.26-4.4A9.4 9.4 0 0 0 12 3z',desktop:'M21 2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 14H3V4h18v12z',download:'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z',upload:'M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z',close:'M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z'}
export const Icon=({n,d,className=''})=><svg viewBox="0 0 24 24" className={`size-5 fill-current shrink-0 ${className}`}><path d={d||P[n]}/></svg>
export function Btn({variant='filled',size,icon,loading,disabled,children,className='',...p}){
 const v={filled:'bg-primary text-on-primary',tonal:'bg-primary-container text-on-primary-container',text:'text-primary hover:bg-primary/10',danger:'text-error hover:bg-error/10',error:'bg-error text-surface'}[variant]
 return <button disabled={loading||disabled} className={`${size==='sm'?'h-8 px-3':'h-10 px-5'} rounded-full text-sm font-medium inline-flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${v} ${className}`} {...p}>
  {loading?<span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>:icon&&<Icon n={icon}/>}{children}</button>}
export const Field=({label,...p})=><label className="block mb-3 text-xs text-on-surface-variant">{label}
 <input {...p} className="mt-1 w-full h-12 px-4 rounded-xl bg-surface-container text-on-surface text-base outline-none focus:ring-2 ring-primary"/></label>
export const Skeleton=({n=3})=>Array.from({length:n},(_,i)=><div key={i} className="animate-pulse rounded-3xl bg-surface-container h-28 mb-3"/>)
export function Dialog({title,onClose,children}){
 useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose])
 return <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 anim-fade" onClick={onClose}>
  <div onClick={e=>e.stopPropagation()} role="dialog" aria-label={title} className="anim-up w-full sm:max-w-xl bg-surface rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] flex flex-col">
   <div className="flex items-center justify-between gap-2 px-6 pt-5 pb-3"><h2 className="text-2xl">{title}</h2>
    <button aria-label="Đóng" title="Đóng (Esc)" onClick={onClose} className="size-10 grid place-items-center rounded-full hover:bg-primary/10 transition active:scale-90"><Icon n="close"/></button></div>
   <div className="overflow-auto px-6 pb-6">{children}</div></div></div>}
export function useTheme(){
 const [s,set]=useState(()=>JSON.parse(localStorage.getItem('theme')||'{"mode":"system","hue":262,"fs":16}'))
 useEffect(()=>{localStorage.setItem('theme',JSON.stringify(s))
  const mq=matchMedia('(prefers-color-scheme: dark)')
  const apply=()=>{const d=s.mode==='dark'||(s.mode==='system'&&mq.matches),r=document.documentElement
   r.classList.toggle('dark',d);r.style.setProperty('--h',s.hue);r.style.fontSize=s.fs+'px'}
  apply();mq.addEventListener('change',apply);return()=>mq.removeEventListener('change',apply)},[s])
 return [s,p=>set(x=>({...x,...p}))]}
