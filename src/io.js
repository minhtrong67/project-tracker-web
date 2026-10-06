export const dl=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
// CSV có BOM UTF-8 để Excel hiển thị đúng tiếng Việt
export const toCSV=(cols,rows)=>'\uFEFF'+[cols.map(c=>c[1]),...rows.map(r=>cols.map(c=>r[c[0]]))].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n')
export function parseCSV(t){
 t=t.replace(/^\uFEFF/,'');const l=t.split(/\r?\n/)[0],d=l.split(';').length>l.split(',').length?';':','
 const rows=[];let row=[],f='',q=false
 for(let i=0;i<t.length;i++){const c=t[i]
  if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
  else if(c==='"')q=true
  else if(c===d){row.push(f);f=''}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}
  else f+=c}
 if(f||row.length){row.push(f);rows.push(row)}
 const [h,...b]=rows.filter(r=>r.some(x=>x.trim()))
 return b.map(r=>Object.fromEntries(h.map((k,i)=>[k.trim(),r[i]??''])))}
const loadX=async()=>{const m=await import('exceljs/dist/exceljs.min.js');return m.default||m}
export async function toXLSX(cols,rows,sheet){
 const X=await loadX(),wb=new X.Workbook();wb.creator='VibeLedger'
 const ws=wb.addWorksheet(sheet.slice(0,31),{views:[{state:'frozen',ySplit:1}]})
 ws.columns=cols.map(c=>({header:c[1],key:c[0],width:c[2]||20}));rows.forEach(r=>ws.addRow(r))
 const fill=a=>({type:'pattern',pattern:'solid',fgColor:{argb:a}})
 ws.getRow(1).height=26
 ws.eachRow((r,i)=>r.eachCell(c=>{
  if(i===1){c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill=fill('FF6750A4');c.alignment={vertical:'middle'}}
  else{c.alignment={vertical:'top',wrapText:true};c.border={bottom:{style:'thin',color:{argb:'FFE7E0EC'}}};if(i%2===0)c.fill=fill('FFF7F2FA')}}))
 ws.autoFilter={from:{row:1,column:1},to:{row:1,column:cols.length}}
 return new Blob([await wb.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
export async function fromXLSX(buf){
 const X=await loadX(),wb=new X.Workbook();await wb.xlsx.load(buf);const ws=wb.worksheets[0],h=[],out=[]
 ws.getRow(1).eachCell((c,i)=>{h[i]=String(c.text).trim()})
 ws.eachRow((r,n)=>{if(n>1){const o={};h.forEach((k,i)=>{if(k)o[k]=String(r.getCell(i).text??'')});if(Object.values(o).some(Boolean))out.push(o)}})
 return out}
// PNG/PDF: render bằng trình duyệt nên không lỗi font tiếng Việt
const toImg=async(node,bg)=>(await import('html-to-image')).toPng(node,{pixelRatio:2,backgroundColor:bg,cacheBust:true})
async function toPDF(img,name){
 const {jsPDF}=await import('jspdf'),im=new Image();im.src=img;await im.decode()
 const pdf=new jsPDF({unit:'mm',format:'a4'}),W=210,H=297,h=im.height*W/im.width
 for(let y=0,p=0;y<h-0.5;y+=H,p++){if(p)pdf.addPage();pdf.addImage(img,'PNG',0,-y,W,h)}
 pdf.save(name)}
const save=async(img,kind,name)=>kind==='png'?dl(await (await fetch(img)).blob(),name+'.png'):toPDF(img,name+'.pdf')
export async function exportNode(node,kind,name){await save(await toImg(node,getComputedStyle(document.body).backgroundColor),kind,name)}
export async function exportReport(kind,title,cols,rows,name){
 const el=document.createElement('div')
 el.style.cssText='position:fixed;left:-99999px;top:0;width:1000px;padding:40px;background:#fff;color:#1d1b20;font-family:system-ui,sans-serif'
 const th='background:#6750A4;color:#fff;text-align:left;padding:10px;font-weight:600'
 el.innerHTML=`<h1 style="margin:0 0 4px;font-size:28px;color:#6750A4">${esc(title)}</h1><p style="margin:0 0 20px;color:#625b71;font-size:13px">VibeLedger · ${new Date().toLocaleString('vi-VN')} · ${rows.length} mục</p>
<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${cols.map(c=>`<th style="${th}">${esc(c[1])}</th>`).join('')}</tr></thead>
<tbody>${rows.map((r,i)=>`<tr style="background:${i%2?'#f7f2fa':'#fff'}">${cols.map(c=>`<td style="padding:9px 10px;border-bottom:1px solid #e7e0ec;vertical-align:top">${esc(r[c[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table>
<p style="margin-top:24px;font-size:11px;color:#79747e">Tác giả minhtrong67 · Có sự hỗ trợ của Claude</p>`
 document.body.appendChild(el)
 try{await save(await toImg(el,'#fff'),kind,name)}finally{el.remove()}}
