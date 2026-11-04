#!/usr/bin/env node
// Only pinned upstream releases. Network/setup failure is never a passing scan.
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import{createHash}from'node:crypto';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function ensureSecurityTool(name){
 const lock=JSON.parse(await fs.readFile(path.join(ROOT,'security/tools.lock.json'),'utf8'));
 const tool=lock[name],asset=tool?.assets?.[`${process.platform}-${process.arch}`];if(!asset)throw new Error('UNSUPPORTED_PINNED_TOOL_PLATFORM');
 const cache=path.resolve(process.env.HAHALAB_SECURITY_TOOL_CACHE||path.join(os.tmpdir(),'hahalab-security-tool-cache'),name,tool.version,`${process.platform}-${process.arch}`);
 const binary=path.join(cache,name),metadata=path.join(cache,'verified.json');
 const hash=b=>createHash('sha256').update(b).digest('hex');
 try{const m=JSON.parse(await fs.readFile(metadata));if(m.downloadSha256===asset.sha256&&hash(await fs.readFile(binary))===m.binarySha256)return binary;}catch{}
 await fs.mkdir(cache,{recursive:true,mode:0o700});
 const response=await fetch(`${tool.repository}/releases/download/v${tool.version}/${asset.name}`,{signal:AbortSignal.timeout(120000)});if(!response.ok)throw new Error('PINNED_TOOL_DOWNLOAD_FAILED');
 const bytes=Buffer.from(await response.arrayBuffer());if(hash(bytes)!==asset.sha256)throw new Error('PINNED_TOOL_CHECKSUM_MISMATCH');
 if(asset.name.endsWith('.tar.gz')){const archive=path.join(cache,'release.tar.gz');await fs.writeFile(archive,bytes,{mode:0o600});const r=spawnSync('tar',['-xzf',archive,'-C',cache,name],{encoding:'utf8'});await fs.rm(archive,{force:true});if(r.status!==0)throw new Error('PINNED_TOOL_EXTRACTION_FAILED');}else await fs.writeFile(binary,bytes,{mode:0o700});
 await fs.chmod(binary,0o700);await fs.writeFile(metadata,JSON.stringify({version:tool.version,downloadSha256:asset.sha256,binarySha256:hash(await fs.readFile(binary))}),{mode:0o600});return binary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{await ensureSecurityTool(process.argv[2]);console.log(JSON.stringify({tool:process.argv[2],verified:true}));}catch(e){console.error(e.message);process.exitCode=1;}}
