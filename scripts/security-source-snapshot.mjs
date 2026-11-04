#!/usr/bin/env node
// Explicit source-only snapshot. Never copies .git, env files, records, or protected HTML.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const DEFAULT_ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function collectSecuritySources(root=DEFAULT_ROOT){
 const policy=JSON.parse(await fs.readFile(path.join(root,'security/source-policy.json'),'utf8'));
 const selected=new Set();
 function safe(rel){
  const parts=rel.split('/');
  if(path.posix.isAbsolute(rel)||rel.includes('\\')||parts.some(x=>!x||x==='.'||x==='..'))return false;
  return !parts.some(x=>policy.excludedSegments.includes(x))&&!/^(?:\.env(?:\.|$)|.*(?:credentials|secrets)(?:\.|$))/i.test(parts.at(-1))&&!/\.(?:zip|bak|log|map)$/i.test(rel)&&rel!=='security/source-index.json';
 }
 async function assertNoSymlinkAncestors(rel){
  let current=root;
  for(const part of rel.split('/')){current=path.join(current,part);let stat;try{stat=await fs.lstat(current);}catch(e){if(e.code==='ENOENT')return;throw e;}if(stat.isSymbolicLink())throw new Error('SNAPSHOT_SYMLINK_REJECTED');}
 }
 async function add(rel){
  if(!safe(rel))throw new Error('SNAPSHOT_FORBIDDEN_PATH');
  await assertNoSymlinkAncestors(rel);
  let stat;try{stat=await fs.lstat(path.join(root,rel));}catch(e){if(e.code==='ENOENT')return;throw e;}
  if(stat.isSymbolicLink())throw new Error('SNAPSHOT_SYMLINK_REJECTED');
  if(stat.isFile())selected.add(rel);
 }
 async function walk(tree,rel=tree.path){
  if(!safe(rel))throw new Error('SNAPSHOT_FORBIDDEN_PATH');
  await assertNoSymlinkAncestors(rel);
  let rootStat;try{rootStat=await fs.lstat(path.join(root,rel));}catch(e){if(e.code==='ENOENT')return;throw e;}
  if(rootStat.isSymbolicLink())throw new Error('SNAPSHOT_SYMLINK_REJECTED');
  let entries;try{entries=await fs.readdir(path.join(root,rel),{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}
  for(const e of entries){const next=rel+'/'+e.name;if(!safe(next))continue;if(e.isSymbolicLink())throw new Error('SNAPSHOT_SYMLINK_REJECTED');if(e.isDirectory()&&!tree.topLevelOnly)await walk(tree,next);else if(e.isFile()&&tree.extensions.includes(path.extname(e.name)))await add(next);}
 }
 for(const rel of policy.rootFiles)await add(rel);
 for(const tree of policy.trees)await walk(tree);
 for(const e of await fs.readdir(path.join(root,'scripts'),{withFileTypes:true}))if(e.isFile()&&policy.scriptPrefixes.some(p=>('scripts/'+e.name).startsWith(p)))await add('scripts/'+e.name);
 const files=[];for(const rel of [...selected].sort()){const bytes=await fs.readFile(path.join(root,rel));files.push({path:rel,sha256:sha(bytes),bytes:bytes.length});}
 const missing=policy.requiredSources.filter(p=>!selected.has(p));if(missing.length)throw new Error('SNAPSHOT_REQUIRED_SOURCES_MISSING: '+missing.join(','));
 return {version:policy.version,generatedAt:new Date().toISOString(),scope:'Current source for security review. Credentials, raw records, private learning HTML, media and Git history excluded.',files};
}
export async function exportSecuritySnapshot(root=DEFAULT_ROOT,destination){
 const index=await collectSecuritySources(root);
 const target=destination?path.resolve(destination):await fs.mkdtemp(path.join(os.tmpdir(),'hahalab-security-source-'));
 if(destination){try{await fs.mkdir(target,{recursive:false,mode:0o700});}catch(e){if(e.code==='EEXIST')throw new Error('SNAPSHOT_DESTINATION_MUST_BE_NEW');throw e;}}
 if(target===root||root.startsWith(target+path.sep))throw new Error('SNAPSHOT_DESTINATION_UNSAFE');
 for(const file of index.files){const to=path.join(target,file.path);await fs.mkdir(path.dirname(to),{recursive:true});await fs.copyFile(path.join(root,file.path),to);}
 await fs.mkdir(path.join(target,'security'),{recursive:true});await fs.writeFile(path.join(target,'security/source-index.json'),JSON.stringify(index,null,2)+'\n');
 return {directory:target,index};
}
export async function verifySecuritySourceIndex(root=DEFAULT_ROOT){
 const expected=JSON.parse(await fs.readFile(path.join(root,'security/source-index.json'),'utf8'));
 const actual=await collectSecuritySources(root);
 if(JSON.stringify(expected.files)!==JSON.stringify(actual.files))throw new Error('SECURITY_SOURCE_INDEX_STALE: regenerate curated source snapshot before publication');
 return {files:actual.files.length,bytes:actual.files.reduce((n,f)=>n+f.bytes,0),version:actual.version};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv[2]==='verify')console.log(JSON.stringify(await verifySecuritySourceIndex()));else if(process.argv[2]==='list')console.log(JSON.stringify(await collectSecuritySources()));else console.log(JSON.stringify(await exportSecuritySnapshot(DEFAULT_ROOT,process.argv[2])));}catch(e){console.error(e.message);process.exitCode=1;}
}
