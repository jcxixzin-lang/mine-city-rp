// MINE CITY RP 3D - servidor multiplayer (Node.js + WebSocket)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const MAX_PLAYERS = 32;
const players = new Map();
let nextId = 1;

const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.fbx':'application/octet-stream', '.glb':'model/gltf-binary', '.txt':'text/plain; charset=utf-8'
};

const server = http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Requisição inválida'); }
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(ROOT, '.' + pathname);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT,'index.html')) {
    res.writeHead(403); return res.end('Acesso negado');
  }
  fs.stat(file,(err,stat) => {
    if(err || !stat.isFile()) { res.writeHead(404); return res.end('Arquivo não encontrado'); }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control':'no-cache',
      'X-Content-Type-Options':'nosniff'
    });
    fs.createReadStream(file).pipe(res);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 4096 });
function broadcastSnapshot() {
  const snapshot = JSON.stringify({type:'snapshot',players:[...players.values()].map(p=>p.state)});
  for (const client of wss.clients) if(client.readyState===WebSocket.OPEN && client.playerId) client.send(snapshot);
}
wss.on('connection',(ws) => {
  if(players.size >= MAX_PLAYERS) { ws.close(1013,'Servidor cheio'); return; }
  const id = String(nextId++);
  ws.playerId = id;
  ws.lastStateAt = 0;
  ws.isAlive = true;
  ws.on('pong',()=>ws.isAlive=true);
  ws.on('message',(raw) => {
    let msg;
    try { msg=JSON.parse(raw.toString()); } catch { return; }
    if(msg.type==='hello') {
      const name=String(msg.name||'Jogador').replace(/[<>]/g,'').trim().slice(0,18)||'Jogador';
      players.set(id,{state:{id,name,x:12,y:0.2225,z:12,rot:Math.PI,anim:'idle'}});
      ws.send(JSON.stringify({type:'welcome',id}));
      broadcastSnapshot();
      return;
    }
    if(msg.type==='state' && players.has(id)) {
      const now=Date.now();
      if(now-ws.lastStateAt<35) return;
      ws.lastStateAt=now;
      const n=v=>Number.isFinite(Number(v))?Math.max(-260,Math.min(260,Number(v))):0;
      const anim=['idle','walk','run','jump'].includes(msg.anim)?msg.anim:'idle';
      const old=players.get(id).state;
      old.x=n(msg.x); old.y=Math.max(-2,Math.min(30,n(msg.y))); old.z=n(msg.z);
      old.rot=n(msg.rot); old.anim=anim;
    }
  });
  ws.on('close',()=>{players.delete(id);broadcastSnapshot();});
  ws.on('error',()=>{players.delete(id);});
});
const snapshotTimer=setInterval(broadcastSnapshot,66);
const heartbeat=setInterval(()=>{
  for(const ws of wss.clients) {
    if(!ws.isAlive){ws.terminate();continue;}
    ws.isAlive=false;ws.ping();
  }
},30000);
server.listen(PORT,'0.0.0.0',()=>{
  console.log('');
  console.log('======================================');
  console.log('  MINE CITY RP 3D - MULTIPLAYER');
  console.log('======================================');
  console.log(`Jogo: http://localhost:${PORT}`);
  console.log('Na mesma rede Wi-Fi, use o IP deste computador.');
  console.log('Para jogar pela internet, hospede este servidor em um host público.');
  console.log('Mantenha esta janela aberta enquanto joga.');
  console.log('');
});
process.on('SIGINT',()=>{clearInterval(snapshotTimer);clearInterval(heartbeat);server.close(()=>process.exit(0));});
