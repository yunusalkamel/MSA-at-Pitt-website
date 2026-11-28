// Run with an existing sharp installation: SHARP_MODULE=/path/to/sharp node scripts/optimize-mobile-photos.mjs
import { readdir, stat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {default:sharp} = await import(process.env.SHARP_MODULE ? pathToFileURL(process.env.SHARP_MODULE).href : 'sharp');
const root = new URL('../public/photos/community/',import.meta.url);
const files = (await readdir(root)).filter(name=>name.endsWith('.webp') && !/-\d+\.webp$/.test(name) && !name.endsWith('-tile.webp'));
let input=0,output=0;
for (const file of files) {
  for (const width of [320,400,480]) {
    const target = new URL(file.replace('.webp',`-${width}.avif`),root);
    await sharp(new URL(file,root).pathname).resize({width,withoutEnlargement:true}).avif({quality:45,effort:4}).toFile(target.pathname);
    if (width !== 400) input += (await stat(new URL(file.replace('.webp',`-${width}.webp`),root))).size;
    output += (await stat(target)).size;
  }
}
console.log(JSON.stringify({photos:files.length,webpBytes:input,avifBytes:output}));
