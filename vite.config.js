import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'MiniMe Kiddies Treasures',
                short_name: 'MiniMe',
                description: 'Quality children\'s clothing, toys, and essentials.',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'https://placehold.co/192x192/png?text=MiniMe',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'https://placehold.co/512x512/png?text=MiniMe',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    server: {
        port: 3000,
        open: true
    }
})
