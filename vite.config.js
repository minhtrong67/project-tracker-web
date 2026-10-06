import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from 'vite-plugin-pwa'
export default defineConfig({plugins:[react(),tailwindcss(),VitePWA({registerType:'autoUpdate',workbox:{maximumFileSizeToCacheInBytes:6*1024*1024},
 includeAssets:['favicon.svg','favicon-32.png','apple-touch-icon.png'],
 manifest:{name:'VibeLedger',short_name:'VibeLedger',description:'Theo dõi account nào đang xử lý project nào',
  theme_color:'#6750A4',background_color:'#FEF7FF',display:'standalone',start_url:'/',
  icons:[{src:'pwa-192.png',sizes:'192x192',type:'image/png'},{src:'pwa-512.png',sizes:'512x512',type:'image/png'},{src:'maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]}})]})
