import path from 'path'
import react from '@vitejs/plugin-react'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import legacy from '@vitejs/plugin-legacy';

const SRC_DIR = path.resolve(__dirname, './src');
const BUILD_DIR = path.resolve(__dirname, './www');
// publicディレクトリを 'public' フォルダ（もしあれば）に変更するか、
// なければ false にして重複を避けます
const PUBLIC_DIR = path.resolve(__dirname, './public'); 

const argvs = yargs(hideBin(process.argv)).argv
const HOST = process.env.MONACA_SERVER_HOST || argvs.host || '0.0.0.0';

export default {
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    })
  ],
  root: SRC_DIR,
  base: '',
  // 修正箇所：BUILD_DIR(www)を指定するのをやめる
  publicDir: PUBLIC_DIR, 
  build: {
    outDir: BUILD_DIR,
    assetsInlineLimit: 0,
    // 修正箇所：ビルド時、出力先を一度クリアするように true にすることを推奨
    // (競合を防ぐため)
    emptyOutDir: true, 
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  resolve: {
    alias: {
      '@': SRC_DIR,
    },
  },
  server: {
    host: HOST,
    port: 8080,
  }
};