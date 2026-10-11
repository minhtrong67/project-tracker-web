import {lazy,Suspense,useEffect,useMemo,useState} from 'react'
import {onAuthStateChanged,signInWithPopup} from 'firebase/auth'
import {Loader2,LogIn} from 'lucide-react'
import {auth,provider,configured} from './firebase'
import {I18n,makeT,useT} from './i18n'
import {DEF,SettingsCtx,useLocal,useThemeEffect} from './hooks'
import {Btn,Credit,Logo,ToastProvider,useToast} from './ui'
const Authed=lazy(()=>import('./Shell'))
const Splash=()=><div className="grid min-h-dvh place-items-center"><div className="flex flex-col items-center gap-4"><Logo className="size-14 animate-pulse"/><Loader2 className="size-5 animate-spin text-zinc-400"/></div></div>

function Gate(){
 const {t}=useT(),toast=useToast(),[user,setUser]=useState(undefined),[busy,setBusy]=useState(false)
 useEffect(()=>configured?onAuthStateChanged(auth,setUser):setUser(null),[])
 if(user===undefined)return <Splash/>
 if(user)return <Suspense fallback={<Splash/>}><Authed user={user}/></Suspense>
 return <div className="grid min-h-dvh place-items-center p-6" style={{backgroundImage:'radial-gradient(50rem 26rem at 50% -6%, color-mix(in oklab, var(--a500) 16%, transparent), transparent)'}}>
  <div className="anim-up w-full max-w-sm text-center">
   <Logo className="mx-auto mb-6 size-16"/><h1 className="text-3xl font-semibold tracking-tight">VibeLedger</h1><p className="mb-8 mt-2 text-zinc-500 dark:text-zinc-400">{t('app.tagline')}</p>
   {configured?<Btn className="w-full" icon={LogIn} loading={busy} onClick={async()=>{setBusy(true);try{await signInWithPopup(auth,provider)}catch(e){if(e.code!=='auth/popup-closed-by-user')toast(e.message,'error')}setBusy(false)}}>{t('login.btn')}</Btn>
    :<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{t('login.noconfig')}</p>}
   <Credit className="mt-10"/></div></div>}

export default function App(){
 const [stored,setStored]=useLocal('settings',DEF),s={...DEF,...stored}
 useThemeEffect(s)
 const ctx=useMemo(()=>({s,set:p=>setStored(x=>({...DEF,...x,...p})),reset:()=>setStored(DEF)}),[stored])
 const i18n=useMemo(()=>({t:makeT(s.lang),lang:s.lang}),[s.lang])
 return <SettingsCtx.Provider value={ctx}><I18n.Provider value={i18n}><ToastProvider><Gate/></ToastProvider></I18n.Provider></SettingsCtx.Provider>}
