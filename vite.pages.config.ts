import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {mkdirSync,copyFileSync} from 'node:fs';
export default defineConfig({
 base:'/eatmeat/',
 define:{'process.env.NEXT_PUBLIC_GITHUB_PAGES':JSON.stringify('true')},
 plugins:[{name:'pages-paths',enforce:'pre',transform(code,id){
 if(!/\.(tsx|ts)$/.test(id)||id.includes('node_modules'))return;
 return code.replace(/(['"])\/(food|drinks|courier|fonts)\//g,'$1/eatmeat/$2/').replace(/href="\//g,'href="/eatmeat/');
 },closeBundle(){mkdirSync('dist-pages/design-system',{recursive:true});copyFileSync('dist-pages/index.html','dist-pages/design-system/index.html');}},react()],
 build:{outDir:'dist-pages'},
});
