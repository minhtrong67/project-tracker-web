export const COLORS=['#6366f1','#10b981','#f59e0b','#f43f5e','#0ea5e9','#8b5cf6','#14b8a6','#f97316']
const cut=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s
// Biểu đồ cột dọc: có nhãn trục X, số liệu trên đầu cột, đường lưới
export function BarChart({data,colors=false}){
 const max=Math.max(1,...data.map(d=>d.value)),W=Math.max(data.length*64,300),H=230,T=26,B=46,h=H-T-B,step=W/data.length,bw=Math.min(40,step*.55)
 return <div className="max-w-full overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} style={{minWidth:data.length>6?W:undefined}} className="h-auto w-full" role="img">
  {[0,.5,1].map(g=><line key={g} x1="0" x2={W} y1={T+h*(1-g)} y2={T+h*(1-g)} className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray={g?'4 4':'0'}/>)}
  {data.map((d,i)=>{const cx=step*(i+.5),bh=d.value/max*h,y=T+h-bh
   return <g key={d.label+i}><title>{`${d.label}: ${d.value}`}</title>
    <rect x={cx-bw/2} y={y} width={bw} height={bh} rx="6" style={{fill:colors?COLORS[i%COLORS.length]:'var(--a500)',transformOrigin:`${cx}px ${T+h}px`,animation:'grow .6s cubic-bezier(.2,.8,.2,1) both',animationDelay:`${i*50}ms`}}/>
    <text x={cx} y={y-7} textAnchor="middle" fontSize="13" fontWeight="600" className="fill-zinc-800 dark:fill-zinc-100">{d.value}</text>
    <text x={cx} y={H-B+20} textAnchor="middle" fontSize="11.5" className="fill-zinc-500">{cut(d.label,11)}</text></g>})}</svg></div>}
// Biểu đồ tròn: kèm chú thích gồm màu, nhãn, số lượng và phần trăm
export function PieChart({data}){
 const total=data.reduce((s,d)=>s+d.value,0),R=40,C=2*Math.PI*R;let acc=0
 return <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row"><svg viewBox="0 0 160 160" className="size-44 shrink-0 -rotate-90" role="img">
  <circle cx="80" cy="80" r={R+40} className="fill-white dark:fill-zinc-900"/>
  {data.map((d,i)=>{const len=d.value/total*C,o=-acc;acc+=len
   return <circle key={d.label+i} cx="80" cy="80" r={R} fill="none" strokeWidth="80" stroke={COLORS[i%COLORS.length]} strokeDasharray={`${len} ${C-len}`} strokeDashoffset={o}><title>{`${d.label}: ${d.value}`}</title></circle>})}</svg>
  <ul className="w-full min-w-0 flex-1 space-y-2">{data.map((d,i)=><li key={d.label+i} className="flex items-center gap-2.5 text-sm"><i className="size-3 shrink-0 rounded-sm" style={{background:COLORS[i%COLORS.length]}}/>
   <span className="min-w-0 flex-1 truncate">{d.label}</span><b className="tabular-nums">{d.value}</b><span className="w-12 text-right tabular-nums text-zinc-500 dark:text-zinc-400">{Math.round(d.value/total*100)}%</span></li>)}</ul></div>}
