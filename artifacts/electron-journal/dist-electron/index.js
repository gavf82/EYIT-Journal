"use strict";const s=require("electron"),l=require("path"),c=require("fs"),k=require("better-sqlite3"),y=`
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
`;function h(e){c.mkdirSync(l.dirname(e),{recursive:!0});const t=new k(e);return t.pragma("journal_mode = WAL"),t.exec(y),t}function f(e){const t=e.prepare("SELECT * FROM children ORDER BY created_at").all().map(r=>({id:r.id,name:r.name,dob:r.dob??"",startDate:r.start_date??"",createdAt:r.created_at??new Date().toISOString(),updatedAt:r.updated_at??new Date().toISOString(),status:r.status??"active",...r.archived_at?{archivedAt:r.archived_at}:{},...r.baseline_step!=null?{baselineStep:r.baseline_step}:{}})),a={},n=e.prepare("SELECT child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history FROM ratings").all();for(const r of n){const p=`${r.child_id}::${r.area_idx}::${r.strand_idx}::${r.step_idx}::${r.item_key}`;a[p]={status:r.status,updatedAt:r.updated_at,...r.history?{history:JSON.parse(r.history)}:{}}}const i={},o=e.prepare("SELECT child_id, area_name, strand_name, note_text, note_date FROM stagnant_notes").all();for(const r of o){const p=`${r.child_id}::${r.area_name}::${r.strand_name}`;i[p]={text:r.note_text??"",date:r.note_date??""}}const d={},u=e.prepare("SELECT child_id, area_name, strand_name, step_number, item_key, acked_at, note_text FROM acknowledged_stagnations").all();for(const r of u){const p=`${r.child_id}::${r.area_name}::${r.strand_name}::${r.step_number}::${r.item_key}`;d[p]={ackedAt:r.acked_at,note:r.note_text??""}}return{children:t,ratings:a,stagnantNotes:i,acknowledgedStagnations:d}}const A=`
  INSERT OR REPLACE INTO children
    (id, name, dob, start_date, created_at, updated_at, status, archived_at, baseline_step)
  VALUES (@id, @name, @dob, @startDate, @createdAt, @updatedAt, @status, @archivedAt, @baselineStep)
`;function N(e,t){e.prepare(A).run({id:t.id,name:t.name,dob:t.dob??null,startDate:t.startDate??null,createdAt:t.createdAt??null,updatedAt:t.updatedAt??null,status:t.status??"active",archivedAt:t.archivedAt??null,baselineStep:t.baselineStep??null})}function I(e,t){e.prepare("DELETE FROM children WHERE id = ?").run(t),e.prepare("DELETE FROM ratings WHERE child_id = ?").run(t),e.prepare("DELETE FROM stagnant_notes WHERE child_id = ?").run(t),e.prepare("DELETE FROM acknowledged_stagnations WHERE child_id = ?").run(t)}function L(e,t,a){const n=t.split("::");if(n.length!==5)return;const[i,o,d,u,r]=n;e.prepare(`INSERT OR REPLACE INTO ratings
       (child_id, area_idx, strand_idx, step_idx, item_key, status, updated_at, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(i,parseInt(o,10),parseInt(d,10),parseInt(u,10),r,a.status,a.updatedAt,a.history?.length?JSON.stringify(a.history):null)}function w(e,t){const a=t.split("::");if(a.length!==5)return;const[n,i,o,d,u]=a;e.prepare("DELETE FROM ratings WHERE child_id=? AND area_idx=? AND strand_idx=? AND step_idx=? AND item_key=?").run(n,parseInt(i,10),parseInt(o,10),parseInt(d,10),u)}function S(e,t,a){const n=t.indexOf("::");if(n===-1)return;const i=t.slice(0,n),o=t.slice(n+2),d=o.indexOf("::");if(d===-1)return;const u=o.slice(0,d),r=o.slice(d+2);e.prepare(`INSERT OR REPLACE INTO stagnant_notes (child_id, area_name, strand_name, note_text, note_date)
     VALUES (?, ?, ?, ?, ?)`).run(i,u,r,a.text,a.date)}function M(e,t){const a=t.indexOf("::");if(a===-1)return;const n=t.slice(0,a),i=t.slice(a+2),o=i.indexOf("::");if(o===-1)return;const d=i.slice(0,o),u=i.slice(o+2);e.prepare("DELETE FROM stagnant_notes WHERE child_id=? AND area_name=? AND strand_name=?").run(n,d,u)}function D(e,t,a){const n=t.split("::");if(n.length<5)return;const[i,o,d,u,...r]=n,p=r.join("::"),m=parseInt(u,10);isNaN(m)||e.prepare(`INSERT OR REPLACE INTO acknowledged_stagnations
       (child_id, area_name, strand_name, step_number, item_key, acked_at, note_text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`).run(i,o,d,m,p,a.ackedAt,a.note)}function P(e,t){const a=t.split("::");if(a.length<5)return;const[n,i,o,d,...u]=a,r=u.join("::"),p=parseInt(d,10);isNaN(p)||e.prepare("DELETE FROM acknowledged_stagnations WHERE child_id=? AND area_name=? AND strand_name=? AND step_number=? AND item_key=?").run(n,i,o,p,r)}function U(e,t){e.transaction(()=>{e.prepare("DELETE FROM acknowledged_stagnations").run(),e.prepare("DELETE FROM stagnant_notes").run(),e.prepare("DELETE FROM ratings").run(),e.prepare("DELETE FROM children").run();for(const n of t.children)N(e,n);for(const[n,i]of Object.entries(t.ratings))L(e,n,i);for(const[n,i]of Object.entries(t.stagnantNotes??{}))S(e,n,i);for(const[n,i]of Object.entries(t.acknowledgedStagnations??{}))D(e,n,i)})()}const x=10;function b(e){return l.join(l.dirname(e),"backups")}function v(){return new Date().toISOString().replace(/[:.]/g,"-").slice(0,19)}async function F(e,t){try{if(!c.existsSync(t))return;const a=b(t);c.mkdirSync(a,{recursive:!0});const n=`journal-${v()}.db`;await e.backup(l.join(a,n)),j(t)}catch(a){console.error("[EYIT] Failed to create startup backup:",a)}}function R(e){const t=b(e);try{return c.existsSync(t)?c.readdirSync(t).filter(a=>a.endsWith(".db")).map(a=>{const n=l.join(t,a),i=c.statSync(n);return{filename:a,path:n,mtime:i.mtimeMs}}).sort((a,n)=>n.mtime-a.mtime):[]}catch{return[]}}function X(e,t){c.copyFileSync(e,t);for(const a of["-wal","-shm"]){const n=t+a;if(c.existsSync(n))try{c.unlinkSync(n)}catch{}}}function j(e){const a=R(e).slice(x);for(const n of a)try{c.unlinkSync(n.path)}catch{}}function C(e){s.ipcMain.handle("store:load-all",()=>f(e.getDb())),s.ipcMain.handle("store:upsert-child",(t,a)=>{N(e.getDb(),a)}),s.ipcMain.handle("store:delete-child",(t,a)=>{I(e.getDb(),a)}),s.ipcMain.handle("store:set-rating",(t,a,n)=>{n===null?w(e.getDb(),a):L(e.getDb(),a,n)}),s.ipcMain.handle("store:set-stagnant-note",(t,a,n)=>{n===null?M(e.getDb(),a):S(e.getDb(),a,n)}),s.ipcMain.handle("store:set-stagnation-acknowledged",(t,a,n)=>{n===null?P(e.getDb(),a):D(e.getDb(),a,n)}),s.ipcMain.handle("store:set-full",(t,a)=>{U(e.getDb(),a)}),s.ipcMain.handle("file:export-backup",async()=>{const t=new Date().toISOString().slice(0,10),a=await s.dialog.showSaveDialog({title:"Export journal backup",defaultPath:`eyit-backup-${t}.db`,filters:[{name:"SQLite database",extensions:["db"]}]});return a.canceled||!a.filePath?!1:(await e.getDb().backup(a.filePath),!0)}),s.ipcMain.handle("file:select-and-parse-backup",async()=>{const t=await s.dialog.showOpenDialog({title:"Select backup to import",filters:[{name:"SQLite database",extensions:["db"]}],properties:["openFile"]});if(t.canceled||!t.filePaths[0])return null;const a=h(t.filePaths[0]);try{return f(a)}finally{a.close()}}),s.ipcMain.handle("file:move-journal",async()=>{const t=e.getJournalPath(),a=await s.dialog.showSaveDialog({title:"Move journal file to…",defaultPath:t,filters:[{name:"SQLite database",extensions:["db"]}]});if(a.canceled||!a.filePath)return null;const n=a.filePath;c.mkdirSync(l.dirname(n),{recursive:!0}),await e.getDb().backup(n),e.reopenDb(n),e.setJournalPath(n);try{c.unlinkSync(t)}catch{}return n}),s.ipcMain.handle("file:get-journal-path",()=>e.getJournalPath()),s.ipcMain.handle("backup:list",()=>R(e.getJournalPath())),s.ipcMain.handle("backup:restore",(t,a)=>{const n=l.join(l.dirname(e.getJournalPath()),"backups"),i=l.join(n,a),o=e.getJournalPath();e.getDb().close(),X(i,o),e.reopenDb(o)})}function W(){return l.join(s.app.getPath("documents"),"EYIT Journal","journal.db")}function O(){return l.join(s.app.getPath("userData"),"journal-path.txt")}function $(){try{const e=c.readFileSync(O(),"utf8").trim();if(e&&c.existsSync(e))return e}catch{}return W()}function B(e){c.writeFileSync(O(),e,"utf8")}let T=null,_=null,E="";async function g(){T=new s.BrowserWindow({width:1280,height:800,minWidth:820,minHeight:600,titleBarStyle:process.platform==="darwin"?"hiddenInset":"default",webPreferences:{preload:l.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1,sandbox:!0}}),process.env.VITE_DEV_SERVER_URL?(await T.loadURL(process.env.VITE_DEV_SERVER_URL),T.webContents.openDevTools()):await T.loadFile(l.join(__dirname,"../dist/index.html"))}s.app.whenReady().then(async()=>{E=$(),c.mkdirSync(l.dirname(E),{recursive:!0}),_=h(E),await F(_,E),C({getJournalPath:()=>E,setJournalPath:e=>{E=e,B(e)},getDb:()=>_,reopenDb:e=>{_?.open&&_.close(),_=h(e)}}),await g(),s.app.on("activate",()=>{s.BrowserWindow.getAllWindows().length===0&&g()})});s.app.on("window-all-closed",()=>{_?.close(),process.platform!=="darwin"&&s.app.quit()});s.app.on("before-quit",()=>{_?.close()});
