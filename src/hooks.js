import {createContext,useCallback,useContext,useEffect,useState} from 'react'
const read=(s,k,d)=>{try{const v=s.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}}
function useStored(store,key,def){
 const [v,setV]=useState(()=>read(store,key,def))
 const set=useCallback(p=>setV(x=>{const n=typeof p==='function'?p(x):p;try{store.setItem(key,JSON.stringify(n))}catch{/* storage full/blocked */}return n}),[store,key])
 return [v,set]}
export const useSession=(k,d)=>useStored(sessionStorage,k,d)
export const useLocal=(k,d)=>useStored(localStorage,k,d)
export const V0P={q:'',status:'all',cat:'',sort:'new'}
export const V0A={q:'',part:'all',sort:'new'}
export const DEF={mode:'system',lang:'vi',fs:16,accent:'indigo',home:'projects'}
export const ACCENTS=['indigo','violet','sky','teal','emerald','amber','orange','rose']
export const SettingsCtx=createContext()
export const useSettings=()=>useContext(SettingsCtx)
export function useThemeEffect(s){
 useEffect(()=>{const mq=matchMedia('(prefers-color-scheme: dark)')
  const apply=()=>{const d=s.mode==='dark'||(s.mode==='system'&&mq.matches),r=document.documentElement
   r.classList.toggle('dark',d);r.dataset.accent=s.accent;r.style.fontSize=s.fs+'px';r.lang=s.lang
   document.getElementById('tc')?.setAttribute('content',d?'#09090b':'#fafafa')}
  apply();mq.addEventListener('change',apply);return()=>mq.removeEventListener('change',apply)},[s.mode,s.accent,s.fs,s.lang])}
let deferred=null
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;dispatchEvent(new Event('vl-install'))})
export function useInstall(){
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true
 const [,tick]=useState(0),[done,setDone]=useState(standalone)
 useEffect(()=>{const f=()=>tick(n=>n+1),a=()=>setDone(true);addEventListener('vl-install',f);addEventListener('appinstalled',a)
  return()=>{removeEventListener('vl-install',f);removeEventListener('appinstalled',a)}},[])
 return {done,canPrompt:!!deferred,ios:/iphone|ipad|ipod/i.test(navigator.userAgent),
  install:async()=>{if(!deferred)return;deferred.prompt();const r=await deferred.userChoice;deferred=null;if(r.outcome==='accepted')setDone(true);tick(n=>n+1)}}}
