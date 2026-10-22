import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from 'vite-plugin-pwa'
export default defineConfig({
 build:{rollupOptions:{output:{manualChunks:id=>{if(id.includes('vite/preload-helper'))return 'react'
  if(!id.includes('node_modules'))return
  if(/node_modules\/(@firebase\/firestore|firebase\/firestore)/.test(id))return 'firestore'
  if(/node_modules\/@?firebase/.test(id))return 'firebase'
  if(id.includes('exceljs'))return 'excel'
  if(/node_modules\/(jspdf|html-to-image|fflate)\//.test(id))return 'report'
  if(/node_modules\/react(-dom)?\//.test(id))return 'react'}}}},
 plugins:[react(),tailwindcss(),VitePWA({registerType:'autoUpdate',workbox:{globIgnores:['**/excel-*.js','**/report-*.js','**/html2canvas*.js','**/index.es-*.js','**/purify*.js'],runtimeCaching:[{urlPattern:({url})=>/\/assets\/(excel|report|html2canvas|index\.es|purify)/.test(url.pathname),handler:'StaleWhileRevalidate',options:{cacheName:'export-libs'}}]},
 includeAssets:['favicon.svg','favicon-32.png','favicon-48.png','apple-touch-icon.png'],
 manifest:{name:'Project Tracker',short_name:'Project Tracker',description:'Theo dõi tài khoản Google nào đang xử lý dự án vibe code nào',
  theme_color:'#6366f1',background_color:'#ffffff',display:'standalone',orientation:'portrait',start_url:'/',
  icons:[{src:'pwa-192.png',sizes:'192x192',type:'image/png'},{src:'pwa-512.png',sizes:'512x512',type:'image/png'},{src:'maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]}})]})
