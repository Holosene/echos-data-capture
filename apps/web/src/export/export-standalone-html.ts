/**
 * ECOS — Standalone HTML Export
 *
 * Generates a self-contained .html file with:
 *   - Compressed volume data (Uint16 + deflate → base64)
 *   - Pure WebGL2 ray marching viewer (zero dependencies)
 *   - Canvas 2D orthogonal slice viewer
 *   - Interactive controls (modes, sliders, palettes, orbit camera)
 *
 * Decompression uses the browser's native DecompressionStream('raw').
 */

import { deflateSync } from 'fflate';

interface ExportVolume {
  data: Float32Array;
  dimensions: [number, number, number];
  extent: [number, number, number];
}

export interface ExportOptions {
  sessionName: string;
  instrument: ExportVolume;
  spatial: ExportVolume | null;
  classic: ExportVolume | null;
  gpxPoints?: Array<{ lat: number; lon: number }>;
  durationS?: number;
  frameCount?: number;
}

/** Quantize Float32Array to Uint16 and compress with deflate, return base64. */
function compressVolumeToBase64(vol: ExportVolume): string {
  const count = vol.data.length;
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < count; i++) {
    const v = vol.data[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!isFinite(min)) min = 0;
  if (!isFinite(max)) max = 1;
  if (max === min) max = min + 1;

  const range = max - min;
  const uint16 = new Uint16Array(count);
  for (let i = 0; i < count; i++) {
    uint16[i] = Math.round(Math.max(0, Math.min(65535, ((vol.data[i] - min) / range) * 65535)));
  }

  const compressed = deflateSync(new Uint8Array(uint16.buffer), { level: 6 });
  let binary = '';
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }

  return JSON.stringify({ b64: btoa(binary), dims: vol.dimensions, extent: vol.extent, min, max });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateStandaloneHTML(opts: ExportOptions): string {
  const instrumentJson = compressVolumeToBase64(opts.instrument);
  const spatialJson = opts.spatial ? compressVolumeToBase64(opts.spatial) : 'null';
  const classicJson = opts.classic ? compressVolumeToBase64(opts.classic) : 'null';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ECOS - ${escapeHtml(opts.sessionName)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.hdr{padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #222}
.hdr h1{font-size:17px;font-weight:600;flex:1}
.badge{padding:3px 10px;border-radius:9999px;background:rgba(66,133,244,.15);color:#6ea8fe;font-size:11px;font-weight:600}
.tabs{display:flex;gap:6px;padding:14px 20px;justify-content:center}
.tab{padding:7px 18px;border-radius:7px;border:1px solid #333;background:transparent;color:#999;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s}
.tab:hover{border-color:#6ea8fe;color:#6ea8fe}.tab.active{background:#6ea8fe;border-color:#6ea8fe;color:#fff}
.ctrls{display:flex;flex-wrap:wrap;gap:14px;padding:10px 20px;justify-content:center;align-items:center}
.cg{display:flex;align-items:center;gap:6px}.cg label{font-size:11px;color:#777;white-space:nowrap}
.cg input[type=range]{width:100px;accent-color:#6ea8fe}.cg select{padding:3px 6px;border-radius:5px;border:1px solid #333;background:#111;color:#ddd;font-size:11px}
.gl-wrap{width:100%;max-width:750px;margin:10px auto;aspect-ratio:4/3;background:#0d0d0d;border:1px solid #222;border-radius:10px;overflow:hidden;position:relative}
.gl-wrap canvas{width:100%;height:100%}
.slices{display:flex;flex-wrap:wrap;gap:14px;padding:14px 20px;justify-content:center}
.panel{background:#111;border:1px solid #222;border-radius:10px;overflow:hidden;flex:1;min-width:250px;max-width:550px}
.panel-h{padding:8px 14px;font-size:12px;font-weight:600;color:#777;border-bottom:1px solid #222}
.panel canvas{width:100%;display:block;image-rendering:pixelated}
.info{padding:14px;text-align:center;color:#444;font-size:11px}
#loading{position:fixed;inset:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;z-index:100;flex-direction:column;gap:12px}
#loading .bar{width:200px;height:4px;background:#222;border-radius:2px;overflow:hidden}
#loading .fill{height:100%;background:#6ea8fe;width:0%;transition:width .3s}
</style>
</head>
<body>
<div id="loading"><p style="color:#888;font-size:13px">Decompression des volumes...</p><div class="bar"><div class="fill" id="load-fill"></div></div></div>

<div id="app" style="display:none">
<div class="hdr"><h1>ECOS - ${escapeHtml(opts.sessionName)}</h1><span class="badge">export autonome</span></div>
<div class="tabs">
  <button class="tab active" data-mode="instrument">Cone</button>
  <button class="tab" data-mode="spatial">Trace</button>
  <button class="tab" data-mode="classic">Bloc</button>
</div>
<div class="ctrls">
  <div class="cg"><label>Palette:</label><select id="pal"><option value="sonar-original">Sonar</option><option value="water-off">Water Off</option><option value="high-contrast">Contraste</option><option value="grayscale">Gris</option></select></div>
  <div class="cg"><label>Opacite:</label><input type="range" id="opa" min="0.1" max="3" step="0.1" value="1"></div>
  <div class="cg"><label>Densite:</label><input type="range" id="den" min="0.1" max="3" step="0.1" value="1"></div>
</div>
<div class="gl-wrap" id="glw"><canvas id="glc"></canvas></div>
<div class="slices">
  <div class="panel"><div class="panel-h">Coupe Y <input type="range" id="ys" min="0" max="100" value="50" style="width:80px;vertical-align:middle;margin-left:8px;accent-color:#6ea8fe"></div><canvas id="sy"></canvas></div>
  <div class="panel"><div class="panel-h">Coupe X <input type="range" id="xs" min="0" max="100" value="50" style="width:80px;vertical-align:middle;margin-left:8px;accent-color:#6ea8fe"></div><canvas id="sx"></canvas></div>
</div>
<div class="info">${opts.frameCount || ''} frames ${opts.durationS ? '- ' + (opts.durationS / 60).toFixed(1) + ' min' : ''} - ECOS Standalone</div>
</div>

<script>
const _I=${instrumentJson};
const _S=${spatialJson};
const _C=${classicJson};
</script>
<script>
// ── Async inflate using browser DecompressionStream ──
async function inflateRaw(bytes){
  try{
    const ds=new DecompressionStream('raw');
    const w=ds.writable.getWriter();const r=ds.readable.getReader();
    w.write(bytes);w.close();
    const chunks=[];
    while(true){const{done,value}=await r.read();if(done)break;chunks.push(value);}
    const len=chunks.reduce((s,c)=>s+c.length,0);
    const out=new Uint8Array(len);let off=0;
    for(const c of chunks){out.set(c,off);off+=c.length;}
    return out;
  }catch(e){
    // Fallback: try deflate (zlib wrapper)
    const zlib=new Uint8Array(bytes.length+6);
    zlib[0]=0x78;zlib[1]=0x9C;zlib.set(bytes,2);
    const ds=new DecompressionStream('deflate');
    const w=ds.writable.getWriter();const r=ds.readable.getReader();
    w.write(zlib);w.close();
    const chunks=[];
    while(true){const{done,value}=await r.read();if(done)break;chunks.push(value);}
    const len=chunks.reduce((s,c)=>s+c.length,0);
    const out=new Uint8Array(len);let off=0;
    for(const c of chunks){out.set(c,off);off+=c.length;}
    return out;
  }
}

async function decompressVol(p){
  if(!p)return null;
  const bin=atob(p.b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const dec=await inflateRaw(bytes);
  const u16=new Uint16Array(dec.buffer,dec.byteOffset,dec.length/2);
  const data=new Float32Array(u16.length);
  const rng=p.max-p.min;
  for(let i=0;i<u16.length;i++)data[i]=(u16[i]/65535)*rng+p.min;
  return{data,dimensions:p.dims,extent:p.extent};
}

// ── Palettes ──
const PAL={'sonar-original':[[0,0,0,40,0],[.1,0,20,80,20],[.25,0,60,160,80],[.4,0,120,200,140],[.5,40,180,200,180],[.65,120,220,120,200],[.8,220,220,40,230],[.9,255,140,0,245],[1,255,40,0,255]],'water-off':[[0,0,0,0,0],[.15,0,0,0,0],[.3,10,20,60,20],[.5,66,33,206,120],[.7,140,100,255,200],[1,225,224,235,255]],'high-contrast':[[0,0,0,0,0],[.05,0,0,0,0],[.1,30,0,60,60],[.3,100,30,206,150],[.5,200,100,255,220],[.7,255,200,100,245],[1,255,255,255,255]],'grayscale':[[0,0,0,0,0],[.1,30,30,30,30],[.5,128,128,128,160],[.8,210,210,210,220],[1,255,255,255,255]]};
function mkLUT(m){const s=PAL[m],l=new Uint8Array(1024);for(let i=0;i<256;i++){const p=i/255;let a=0,b=s.length-1;for(let j=0;j<s.length-1;j++){if(s[j][0]<=p&&s[j+1][0]>=p){a=j;b=j+1;break;}}const s0=s[a],s1=s[b],r=s1[0]-s0[0],t=r>0?(p-s0[0])/r:0;l[i*4]=Math.round(s0[1]+(s1[1]-s0[1])*t);l[i*4+1]=Math.round(s0[2]+(s1[2]-s0[2])*t);l[i*4+2]=Math.round(s0[3]+(s1[3]-s0[3])*t);l[i*4+3]=Math.round(s0[4]+(s1[4]-s0[4])*t);}return l;}

let vols={},mode='instrument',lut=mkLUT('sonar-original');
function vol(){return vols[mode]||vols.instrument;}

// ── Slice rendering (Canvas 2D) ──
function renderSlice(cv,v,ax,idx){
  if(!v||!cv)return;const[dx,dy,dz]=v.dimensions,d=v.data;
  let w,h,get;
  if(ax==='y'){w=dx;h=dz;const yi=Math.min(idx,dy-1);get=(x,z)=>d[z*dy*dx+yi*dx+x];}
  else{w=dy;h=dz;const xi=Math.min(idx,dx-1);get=(y,z)=>d[z*dy*dx+y*dx+xi];}
  cv.width=w;cv.height=h;const ctx=cv.getContext('2d'),img=ctx.createImageData(w,h);
  for(let r=0;r<h;r++)for(let c=0;c<w;c++){
    const val=get(c,r),li=Math.min(255,Math.max(0,Math.round(val*255))),px=(r*w+c)*4;
    img.data[px]=lut[li*4];img.data[px+1]=lut[li*4+1];img.data[px+2]=lut[li*4+2];img.data[px+3]=lut[li*4+3]>0?255:0;
  }
  ctx.putImageData(img,0,0);
}
function updateSlices(){
  const v=vol();if(!v)return;
  const[dx,dy]=v.dimensions;
  const ys=document.getElementById('ys'),xs=document.getElementById('xs');
  ys.max=dy-1;xs.max=dx-1;
  renderSlice(document.getElementById('sy'),v,'y',+ys.value);
  renderSlice(document.getElementById('sx'),v,'x',+xs.value);
}

// ── WebGL2 Ray Marcher ──
const glc=document.getElementById('glc');
let gl,prg,vTex,tTex,va;
let cax=0.3,cay=0.5,cd=3.5,drag=false,lmx=0,lmy=0;

const VS=\`#version 300 es
precision highp float;in vec3 a;out vec3 wp;uniform mat4 mvp;uniform vec3 sc;
void main(){wp=a*sc;gl_Position=mvp*vec4(wp,1);}\`;

const FS=\`#version 300 es
precision highp float;precision highp sampler3D;
in vec3 wp;out vec4 fc;
uniform sampler3D uV;uniform sampler2D uT;uniform vec3 cp,bn,bx,vs;uniform float op,dn;uniform int st;
vec2 iBox(vec3 o,vec3 d,vec3 mn,vec3 mx){vec3 iv=1./d,t0=(mn-o)*iv,t1=(mx-o)*iv,tn=min(t0,t1),tx=max(t0,t1);return vec2(max(max(tn.x,tn.y),tn.z),min(min(tx.x,tx.y),tx.z));}
void main(){
  vec3 rd=normalize(wp-cp);vec2 th=iBox(cp,rd,bn,bx);float tN=max(th.x,0.),tF=th.y;
  if(tN>=tF)discard;float s=(tF-tN)/float(st);vec4 ac=vec4(0);float t=tN;
  for(int i=0;i<512;i++){if(i>=st||ac.a>=.98)break;vec3 p=cp+rd*t,uv=(p-bn)/(bx-bn);
    if(all(greaterThanEqual(uv,vec3(0)))&&all(lessThanEqual(uv,vec3(1)))){
      float v=texture(uV,uv).r,d=v*dn+v*v*2.;if(d>.02){
        vec4 c=texture(uT,vec2(clamp(d,0.,1.),.5));c.a*=op*s*100.;c.a=clamp(c.a,0.,1.);c.rgb*=c.a;ac+=(1.-ac.a)*c;}}t+=s;}
  if(ac.a<.01)discard;fc=ac;}\`;

function initGL(){
  gl=glc.getContext('webgl2');if(!gl){document.getElementById('glw').innerHTML='<p style="padding:40px;text-align:center;color:#666">WebGL2 non disponible</p>';return false;}
  function cs(tp,src){const s=gl.createShader(tp);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));return null;}return s;}
  const vs=cs(gl.VERTEX_SHADER,VS),fs=cs(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return false;
  prg=gl.createProgram();gl.attachShader(prg,vs);gl.attachShader(prg,fs);gl.linkProgram(prg);
  if(!gl.getProgramParameter(prg,gl.LINK_STATUS))return false;
  const vt=new Float32Array([-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1]);
  const ix=new Uint16Array([0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,2,6,7,2,7,3,0,3,7,0,7,4,1,5,6,1,6,2]);
  va=gl.createVertexArray();gl.bindVertexArray(va);
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,vt,gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prg,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,ix,gl.STATIC_DRAW);
  tTex=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tTex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  vTex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_3D,vTex);
  gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_R,gl.CLAMP_TO_EDGE);
  return true;
}

function upVol(v){if(!gl||!v)return;const[dx,dy,dz]=v.dimensions;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_3D,vTex);gl.texImage3D(gl.TEXTURE_3D,0,gl.R32F,dx,dy,dz,0,gl.RED,gl.FLOAT,v.data);}
function upTF(){if(!gl)return;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,lut);}

function persp(f,a,n,r){const t=1/Math.tan(f/2),nf=1/(n-r);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(r+n)*nf,-1,0,0,2*r*n*nf,0]);}
function lookAt(e,c,u){const z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.sqrt(z[0]*z[0]+z[1]*z[1]+z[2]*z[2]);z[0]/=l;z[1]/=l;z[2]/=l;
  const x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);x[0]/=l;x[1]/=l;x[2]/=l;
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1]);}
function m4mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++)o[j*4+i]=a[i]*b[j*4]+a[4+i]*b[j*4+1]+a[8+i]*b[j*4+2]+a[12+i]*b[j*4+3];return o;}

function render3D(){
  if(!gl||!prg)return;const v=vol();if(!v)return;
  const r=glc.getBoundingClientRect();glc.width=r.width*devicePixelRatio;glc.height=r.height*devicePixelRatio;
  gl.viewport(0,0,glc.width,glc.height);gl.clearColor(.04,.04,.04,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.CULL_FACE);gl.cullFace(gl.FRONT);
  gl.useProgram(prg);
  const[ex,ey,ez]=v.extent,[dx,dy,dz]=v.dimensions;
  const cx=Math.sin(cax)*Math.cos(cay)*cd,cy=Math.sin(cay)*cd,cz=Math.cos(cax)*Math.cos(cay)*cd;
  const eye=[cx,cy,cz],asp=glc.width/glc.height;
  const mvp=m4mul(lookAt(eye,[0,0,0],[0,1,0]),persp(Math.PI/4,asp,.1,100));
  const u=n=>gl.getUniformLocation(prg,n);
  gl.uniformMatrix4fv(u('mvp'),false,mvp);gl.uniform3fv(u('sc'),[ex,ey,ez]);gl.uniform3fv(u('cp'),eye);
  gl.uniform3fv(u('bn'),[-ex,-ey,-ez]);gl.uniform3fv(u('bx'),[ex,ey,ez]);gl.uniform3fv(u('vs'),[dx,dy,dz]);
  gl.uniform1f(u('op'),+document.getElementById('opa').value);
  gl.uniform1f(u('dn'),+document.getElementById('den').value);
  gl.uniform1i(u('st'),192);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_3D,vTex);gl.uniform1i(u('uV'),0);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tTex);gl.uniform1i(u('uT'),1);
  gl.bindVertexArray(va);gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0);
}

// ── Interaction ──
glc.addEventListener('mousedown',e=>{drag=true;lmx=e.clientX;lmy=e.clientY;});
window.addEventListener('mousemove',e=>{if(!drag)return;cax+=(e.clientX-lmx)*.01;cay=Math.max(-1.5,Math.min(1.5,cay+(e.clientY-lmy)*.01));lmx=e.clientX;lmy=e.clientY;render3D();});
window.addEventListener('mouseup',()=>{drag=false;});
glc.addEventListener('wheel',e=>{e.preventDefault();cd=Math.max(1,Math.min(10,cd+e.deltaY*.005));render3D();},{passive:false});
let lt=null;
glc.addEventListener('touchstart',e=>{if(e.touches.length===1)lt=e.touches[0];});
glc.addEventListener('touchmove',e=>{if(!lt||e.touches.length!==1)return;const t=e.touches[0];cax+=(t.clientX-lt.clientX)*.01;cay=Math.max(-1.5,Math.min(1.5,cay+(t.clientY-lt.clientY)*.01));lt=t;render3D();e.preventDefault();},{passive:false});

// ── Controls ──
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');mode=tab.dataset.mode;
    const v=vol();if(v){upVol(v);render3D();updateSlices();}
  });
});
document.getElementById('pal').addEventListener('change',e=>{lut=mkLUT(e.target.value);upTF();render3D();updateSlices();});
document.getElementById('opa').addEventListener('input',render3D);
document.getElementById('den').addEventListener('input',render3D);
document.getElementById('ys').addEventListener('input',()=>renderSlice(document.getElementById('sy'),vol(),'y',+document.getElementById('ys').value));
document.getElementById('xs').addEventListener('input',()=>renderSlice(document.getElementById('sx'),vol(),'x',+document.getElementById('xs').value));
window.addEventListener('resize',render3D);

// ── Async init ──
(async function(){
  const fill=document.getElementById('load-fill');
  fill.style.width='20%';
  vols.instrument=await decompressVol(_I);fill.style.width='50%';
  vols.spatial=await decompressVol(_S);fill.style.width='75%';
  vols.classic=await decompressVol(_C);fill.style.width='100%';
  document.getElementById('loading').style.display='none';
  document.getElementById('app').style.display='block';
  const ok=initGL();
  if(ok&&vols.instrument){upVol(vols.instrument);upTF();render3D();}
  updateSlices();
})();
</script>
</body>
</html>`;
}

/** Trigger download of the standalone HTML file. */
export function downloadStandaloneHTML(opts: ExportOptions): void {
  const html = generateStandaloneHTML(opts);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecos-${opts.sessionName.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
