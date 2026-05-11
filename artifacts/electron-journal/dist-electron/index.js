"use strict";const i=require("electron"),c=require("path"),l=require("fs"),N=require("better-sqlite3"),y=`
CREATE TABLE IF NOT EXISTS children (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  dob         TEXT,
  start_date  TEXT,
  created_at  TEXT,
  updated_at  TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  archived_at   TEXT,
  baseline_step INTEGER
);

CREATE TABLE IF NOT EXISTS ratings (
  child_id    TEXT    NOT NULL,
  area_idx    INTEGER NOT NULL,
  strand_idx  INTEGER NOT NULL,
  step_idx    INTEGER NOT NULL,
  item_key    TEXT    NOT NULL,
  status      TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL,
  history     TEXT,
  PRIMARY KEY (child_id, area_idx, strand_idx, step_idx, item_key)
);

CREATE TABLE IF NOT EXISTS stagnant_notes (
  child_id    TEXT NOT NULL,
  area_name   TEXT NOT NULL,
  strand_name TEXT NOT NULL,
  note_text   TEXT NOT NULL DEFAULT '',
  note_date   TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (child_id, area_name, strand_name)
);

CREATE TABLE IF NOT EXISTS acknowledged_stagnations (
  child_id    TEXT    NOT NULL,
  area_name   TEXT    NOT NULL,
  strand_name TEXT    NOT NULL,
  step_number INTEGER NOT NULL,
  item_key    TEXT    NOT NULL,
  acked_at    TEXT    NOT NULL,
  note_text   TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (child_id, area_name, strand_name, step_number, item_key)
);
`;function f(e){l.mkdirSync(c.dirname(e),{recursive:!0});const t=new N(e);return t.pragma("journal_mode = WAL"),t.exec(y),t}function A(e){return new N(e,{readonly:!0})}function m(e){const t=e.prepare("SELECT * FROM children ORDER BY created_at").all().map(r=>({id:r.id,name:r.name,dob:r.dob??"",startDate:r.start_date??"",createdAt:r.created_at??new Date().toISOString(),updatedAt:r.updated_at??new Date().toISOString(),status:r.status??"active",...r.archived_at?{archivedAt:r.archived_at}:{},...r.baseline_step!=null?{baselineStep:r.baseline_step}:{}})),a={},n=e.prepare("SELECT child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history FROM ratings").all();for(const r of n){const p=`${r.child_id}::${r.area_idx}::${r.strand_idx}::${r.step_idx}::${r.item_key}`;a[p]={status:r.status,updatedAt:r.updated_at,...r.history?{history:JSON.parse(r.history)}:{}}}const s={},o=e.prepare("SELECT child_id, area_name, strand_name, note_text, note_date FROM stagnant_notes").all();for(const r of o){const p=`${r.child_id}::${r.area_name}::${r.strand_name}`;s[p]={text:r.note_text??"",date:r.note_date??""}}const d={},u=e.prepare("SELECT child_id, area_name, strand_name, step_number, item_key, acked_at, note_text FROM acknowledged_stagnations").all();for(const r of u){const p=`${r.child_id}::${r.area_name}::${r.strand_name}::${r.step_number}::${r.item_key}`;d[p]={ackedAt:r.acked_at,note:r.note_text??""}}return{children:t,ratings:a,stagnantNotes:s,acknowledgedStagnations:d}}const I=`
  INSERT OR REPLACE INTO children
    (id, name, dob, start_date, created_at, updated_at, status, archived_at, baseline_step)
  VALUES (@id, @name, @dob, @startDate, @createdAt, @updatedAt, @status, @archivedAt, @baselineStep)
`;function L(e,t){e.prepare(I).run({id:t.id,name:t.name,dob:t.dob??null,startDate:t.startDate??null,createdAt:t.createdAt??null,updatedAt:t.updatedAt??null,status:t.status??"active",archivedAt:t.archivedAt??null,baselineStep:t.baselineStep??null})}function w(e,t){e.prepare("DELETE FROM children WHERE id = ?").run(t),e.prepare("DELETE FROM ratings WHERE child_id = ?").run(t),e.prepare("DELETE FROM stagnant_notes WHERE child_id = ?").run(t),e.prepare("DELETE FROM acknowledged_stagnations WHERE child_id = ?").run(t)}function S(e,t,a){const n=t.split("::");if(n.length!==5)return;const[s,o,d,u,r]=n;e.prepare(`INSERT OR REPLACE INTO ratings
       (child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(s,parseInt(o,10),parseInt(d,10),parseInt(u,10),r,a.status,a.updatedAt,a.history?.length?JSON.stringify(a.history):null)}function P(e,t){const a=t.split("::");if(a.length!==5)return;const[n,s,o,d,u]=a;e.prepare("DELETE FROM ratings WHERE child_id=? AND area_idx=? AND strand_idx=? AND step_idx=? AND item_key=?").run(n,parseInt(s,10),parseInt(o,10),parseInt(d,10),u)}function D(e,t,a){const n=t.indexOf("::");if(n===-1)return;const s=t.slice(0,n),o=t.slice(n+2),d=o.indexOf("::");if(d===-1)return;const u=o.slice(0,d),r=o.slice(d+2);e.prepare(`INSERT OR REPLACE INTO stagnant_notes (child_id, area_name, strand_name, note_text, note_date)
     VALUES (?, ?, ?, ?, ?)`).run(s,u,r,a.text,a.date)}function M(e,t){const a=t.indexOf("::");if(a===-1)return;const n=t.slice(0,a),s=t.slice(a+2),o=s.indexOf("::");if(o===-1)return;const d=s.slice(0,o),u=s.slice(o+2);e.prepare("DELETE FROM stagnant_notes WHERE child_id=? AND area_name=? AND strand_name=?").run(n,d,u)}function b(e,t,a){const n=t.split("::");if(n.length<5)return;const[s,o,d,u,...r]=n,p=r.join("::"),h=parseInt(u,10);isNaN(h)||e.prepare(`INSERT OR REPLACE INTO acknowledged_stagnations
       (child_id, area_name, strand_name, step_number, item_key, acked_at, note_text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`).run(s,o,d,h,p,a.ackedAt,a.note)}function U(e,t){const a=t.split("::");if(a.length<5)return;const[n,s,o,d,...u]=a,r=u.join("::"),p=parseInt(d,10);isNaN(p)||e.prepare("DELETE FROM acknowledged_stagnations WHERE child_id=? AND area_name=? AND strand_name=? AND step_number=? AND item_key=?").run(n,s,o,p,r)}function v(e,t){e.transaction(()=>{e.prepare("DELETE FROM acknowledged_stagnations").run(),e.prepare("DELETE FROM stagnant_notes").run(),e.prepare("DELETE FROM ratings").run(),e.prepare("DELETE FROM children").run();for(const n of t.children)L(e,n);for(const[n,s]of Object.entries(t.ratings))S(e,n,s);for(const[n,s]of Object.entries(t.stagnantNotes??{}))D(e,n,s);for(const[n,s]of Object.entries(t.acknowledgedStagnations??{}))b(e,n,s)})()}const x=10;function R(e){return c.join(c.dirname(e),"backups")}function F(){return new Date().toISOString().replace(/[:.]/g,"-").slice(0,19)}async function X(e,t){try{if(!l.existsSync(t))return;const a=R(t);l.mkdirSync(a,{recursive:!0});const n=`journal-${F()}.db`;await e.backup(c.join(a,n)),C(t)}catch(a){console.error("[EYIT] Failed to create startup backup:",a)}}function O(e){const t=R(e);try{return l.existsSync(t)?l.readdirSync(t).filter(a=>a.endsWith(".db")).map(a=>{const n=c.join(t,a),s=l.statSync(n);return{filename:a,path:n,mtime:s.mtimeMs}}).sort((a,n)=>n.mtime-a.mtime):[]}catch{return[]}}function j(e,t){l.copyFileSync(e,t);for(const a of["-wal","-shm"]){const n=t+a;if(l.existsSync(n))try{l.unlinkSync(n)}catch{}}}function C(e){const a=O(e).slice(x);for(const n of a)try{l.unlinkSync(n.path)}catch{}}function W(e){i.ipcMain.handle("store:load-all",()=>m(e.getDb())),i.ipcMain.handle("store:upsert-child",(t,a)=>{L(e.getDb(),a)}),i.ipcMain.handle("store:delete-child",(t,a)=>{w(e.getDb(),a)}),i.ipcMain.handle("store:set-rating",(t,a,n)=>{n===null?P(e.getDb(),a):S(e.getDb(),a,n)}),i.ipcMain.handle("store:set-stagnant-note",(t,a,n)=>{n===null?M(e.getDb(),a):D(e.getDb(),a,n)}),i.ipcMain.handle("store:set-stagnation-acknowledged",(t,a,n)=>{n===null?U(e.getDb(),a):b(e.getDb(),a,n)}),i.ipcMain.handle("store:set-full",(t,a)=>{v(e.getDb(),a)}),i.ipcMain.handle("file:export-backup",async()=>{const t=new Date().toISOString().slice(0,10),a=await i.dialog.showSaveDialog({title:"Export journal backup",defaultPath:`eyit-backup-${t}.db`,filters:[{name:"SQLite database",extensions:["db"]}]});return a.canceled||!a.filePath?!1:(await e.getDb().backup(a.filePath),!0)}),i.ipcMain.handle("file:select-and-parse-backup",async()=>{const t=await i.dialog.showOpenDialog({title:"Select backup to import",filters:[{name:"SQLite database",extensions:["db"]}],properties:["openFile"]});if(t.canceled||!t.filePaths[0])return null;const a=A(t.filePaths[0]);try{return m(a)}finally{a.close()}}),i.ipcMain.handle("file:move-journal",async()=>{const t=e.getJournalPath(),a=await i.dialog.showSaveDialog({title:"Move journal file to…",defaultPath:t,filters:[{name:"SQLite database",extensions:["db"]}]});if(a.canceled||!a.filePath)return null;const n=a.filePath;if(c.resolve(n)===c.resolve(t))return t;l.mkdirSync(c.dirname(n),{recursive:!0}),await e.getDb().backup(n),e.reopenDb(n),e.setJournalPath(n);for(const s of[t,t+"-wal",t+"-shm"])try{l.unlinkSync(s)}catch{}return n}),i.ipcMain.handle("file:get-journal-path",()=>e.getJournalPath()),i.ipcMain.handle("backup:list",()=>O(e.getJournalPath())),i.ipcMain.handle("backup:restore",(t,a)=>{const n=c.join(c.dirname(e.getJournalPath()),"backups"),s=c.join(n,a),o=e.getJournalPath();e.getDb().close(),j(s,o),e.reopenDb(o)})}function $(){return c.join(i.app.getPath("documents"),"EYIT Journal","journal.db")}function k(){return c.join(i.app.getPath("userData"),"journal-path.txt")}function B(){try{const e=l.readFileSync(k(),"utf8").trim();if(e&&l.existsSync(e))return e}catch{}return $()}function J(e){l.writeFileSync(k(),e,"utf8")}let T=null,_=null,E="";function Y(){i.app.isPackaged}async function g(){T=new i.BrowserWindow({width:1280,height:800,minWidth:820,minHeight:600,titleBarStyle:process.platform==="darwin"?"hiddenInset":"default",webPreferences:{preload:c.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1,sandbox:!0}}),process.env.VITE_DEV_SERVER_URL?(await T.loadURL(process.env.VITE_DEV_SERVER_URL),T.webContents.openDevTools()):await T.loadFile(c.join(__dirname,"../dist/index.html"))}i.app.whenReady().then(async()=>{E=B(),l.mkdirSync(c.dirname(E),{recursive:!0}),_=f(E),await X(_,E),W({getJournalPath:()=>E,setJournalPath:e=>{E=e,J(e)},getDb:()=>_,reopenDb:e=>{_?.open&&_.close(),_=f(e)}}),await g(),Y(),i.app.on("activate",()=>{i.BrowserWindow.getAllWindows().length===0&&g()})});i.app.on("window-all-closed",()=>{_?.close(),process.platform!=="darwin"&&i.app.quit()});i.app.on("before-quit",()=>{_?.close()});
