// Wayfarer modular script segment. Keep load order in index.html.
// Register navigation immediately so a later optional feature cannot disable the tabs.
document.querySelectorAll(".tab").forEach(function(button){
  button.addEventListener("click", function(){
    document.querySelectorAll(".tab").forEach(function(tab){tab.classList.toggle("active", tab===button);});
    document.querySelectorAll(".section").forEach(function(section){section.classList.toggle("active", section.id === "section-" + button.dataset.tab);});
    if(button.dataset.tab === "skills" && typeof renderSkillCatalog === "function") renderSkillCatalog();
    if(button.dataset.tab === "debug" && typeof renderDebugPanel === "function") renderDebugPanel();
  });
});

const KEY="wayfarer-rpg-v1";
const STATE_UPDATED_KEY=KEY+"-updatedAt";
const today=()=>new Date().toLocaleDateString("en-CA");
const defaultSettings={shift:"normal",social:"gradual",gaming:"moderate",workPattern:"Rotating 8-hour shifts",readTarget:10,musicEnabled:true,musicVolume:35};
const starters=[
 {title:"Read 10 pages",description:"Read 10 pages of any book you enjoy.",category:"Knowledge",skill:"Reading",xp:15},
 {title:"Practise piano for 10 minutes",description:"Spend 10 focused minutes practising piano.",category:"Skill",skill:"Piano",xp:15},
 {title:"Get outside",description:"Take a walk somewhere different or spend a little time outdoors.",category:"Adventure",skill:"Adventure",xp:15},
 {title:"Make a connection",description:"Send a thoughtful message, greet someone first, or initiate a conversation.",category:"Social",skill:"Social Interactions",xp:15},
 {title:"Choose life before the screen",description:"Complete one meaningful real-life activity before gaming or television.",category:"Daily",skill:"Discipline",xp:15}
];

const skillCatalog = [
 {category:"Lifestyle & personal growth", icon:"🧭", skills:[
  ["Adventure","Explore new places, take solo outings, try new experiences."],
  ["Reading","Read fiction, non-fiction or educational books."],
  ["Social Interactions","Start conversations, connect with people, and practise being more socially active."],
  ["Relationships","Invest in friendships, family and acquaintances."]
 ]},
 {category:"Instruments & music", icon:"🎼", skills:[
  ["Piano","Practise piano technique and songs."]
 ]},
 {category:"Fitness & movement", icon:"🏅", skills:[
  ["Fitness","Build strength through resistance training, bodyweight exercises, and consistent technique practice."],
  ["Cardio","Improve cardiovascular endurance through activities such as walking, running, cycling, or swimming."]
 ]},
 {category:"Faith", icon:"✝️", skills:[
  ["Orthodox Christianity","Grow in Orthodox Christian practice through prayer, Scripture, and the prayer rope at a thoughtful, sustainable pace."]
 ]},
 {category:"Finance", icon:"💼", skills:[
  ["Business","Build and develop a business through focused work, research, planning, marketing, and improving its operations."]
 ]},
 {category:"Sandbox testing", icon:"🧪", skills:[["Test","Complete the Test quest to validate unlocks, equipment, and item effects. (Sandbox only)"]]}
];
const defaultSelected = [ {category:"Sandbox testing", icon:"🧪", skills:[["Test","Complete test quests to validate unlocks, equipment, and item effects. (Sandbox only)"]] }
];
function allSkillNames(){return skillCatalog.flatMap(c=>c.skills.map(s=>s[0]))}
function ensureSelectedSkills(){
 if(!Array.isArray(state.selectedSkills)) state.selectedSkills=[...defaultSelected];
 state.selectedSkills=state.selectedSkills.filter(s=>allSkillNames().includes(s));
 if(!state.skillXp)state.skillXp={};
 if(!state.skillPriorities||typeof state.skillPriorities!=="object")state.skillPriorities={};
 state.selectedSkills.forEach(skill=>{if(!["priority","secondary"].includes(state.skillPriorities[skill]))state.skillPriorities[skill]="secondary";});
 Object.keys(state.skillPriorities).forEach(skill=>{if(!state.selectedSkills.includes(skill))delete state.skillPriorities[skill];});
}
function getSkillPriority(skill){ensureSelectedSkills();return state.skillPriorities[skill]||"secondary";}

function skillDescription(name){for(const c of skillCatalog){const found=c.skills.find(s=>s[0]===name);if(found)return found[1]}return ""}
function questForSkill(skill){
 const map={
  "Reading":["Read 10 pages","Read 10 pages of a book you enjoy."],
  "Piano":["Practise piano for 10 minutes","Practise one technique or work on a song for 10 minutes."],
  "Adventure":["Explore somewhere new","Visit a nearby place you don't usually go, even briefly."],
  "Social Interactions":["Initiate one interaction","Start a conversation, ask a question or greet someone first."],
  "Relationships":["Reconnect with someone","Send a thoughtful message or make plans with someone you care about."],
  "Discipline":["Do one thing before screens","Complete one meaningful real-life task before gaming or TV."],
  "Learning":["Learn something new","Spend 10 minutes learning a topic and note one thing you discovered."],
  "Digital Balance":["Choose an offline activity","Put your phone away and spend 15 minutes doing something offline."],
  "Fitness":["Complete a strength session","Do a manageable resistance or bodyweight workout using familiar exercises."],
  "Cooking":["Make something simple","Prepare a meal or learn one new cooking technique."],
  "Conversation":["Ask a good question","Ask someone an open-ended question and listen to their answer."],
  "Photography":["Take three thoughtful photos","Look for interesting light, shapes or details around you."],
  "Writing":["Write for 10 minutes","Write a paragraph, journal entry or short scene."],
  "Strength Training":["Complete a short strength session","Do a safe, manageable session suited to your current ability."],
  "Running":["Go for an easy run or walk-run","Keep it comfortable and adapt to your current fitness."],
  "Walking & Hiking":["Take a different route","Walk somewhere you don't usually go."],
  "Guitar":["Practise guitar","Spend 10 focused minutes on chords or a song."],
  "Singing":["Practise your voice","Spend 10 minutes on warm-ups or a song."]
 };
 const pair=skill==="Test"?["Test","Complete the Test quest to verify the Test skill can gain XP in Sandbox."]:map[skill]||[`Practise ${skill.toLowerCase()}`,`Spend 10 focused minutes practising ${skill.toLowerCase()} or learning one small thing about it.`];
 const xp=/Adventure|Social Interactions|Relationships|Conversation|Networking|Public Speaking|Community|Hosting/.test(skill)?25:10;
 return {title:pair[0],description:pair[1],category:/Adventure|Walking|Hiking|Explore/.test(skill)?"Adventure":/Social|Relationships|Conversation|Networking|Speaking|Hosting|Community|Teamwork/.test(skill)?"Social":/Reading|Learning|History|Science|Philosophy|Psychology|Geography|Language|Research|Knowledge/.test(skill)?"Knowledge":/Piano|Guitar|Music|Instrument|Singing|Drawing|Painting|Photography|Writing|Creative|Pottery|Woodworking|Sewing|Knitting|Coding|Design/.test(skill)?"Skill":"Daily",skill,xp};
}

function load(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}}
function freshState(){return {xp:0,completedTotal:0,quests:[],questGenerationCooldownUntil:0,lastGeneratedSkills:[],journal:[],todo:[],groceries:[],selectedSkills:[],skillPriorities:{},skillXp:{},questHistory:{},questDays:[],profile:{gender:null},inventory:[],equipment:{},gold:0,settings:{...defaultSettings},activeDate:today(),lastDay:today()};}
let state=load()||freshState();
if(!state.profile||typeof state.profile!=="object")state.profile={gender:null};
if(!Array.isArray(state.inventory))state.inventory=[];
if(!state.equipment||typeof state.equipment!=="object")state.equipment={};
if(!Number.isFinite(Number(state.gold)))state.gold=0;
if(!state.settings)state.settings={...defaultSettings};
delete state.settings.difficulty;
if(Array.isArray(state.quests)) state.quests.forEach(q=>{if(!Number.isFinite(Number(q.xp)))q.xp=15;if(!Number.isFinite(Number(q.baseXp)))q.baseXp=Number(q.xp)||15;});
if(!Array.isArray(state.selectedSkills))state.selectedSkills=[];
if(!Number.isFinite(Number(state.questGenerationCooldownUntil)))state.questGenerationCooldownUntil=0;
if(!Array.isArray(state.lastGeneratedSkills))state.lastGeneratedSkills=[];
if(!Array.isArray(state.todo))state.todo=[];
if(!Array.isArray(state.groceries))state.groceries=[];
if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};
// Migrate the retired skill label to Social Interactions without losing saved XP or quests.
if(Array.isArray(state.quests))state.quests.forEach(q=>{if(q&&q.skill==="Social Confidence")q.skill="Social Interactions";});
if(Object.prototype.hasOwnProperty.call(state.skillXp,"Social Confidence")){
  state.skillXp["Social Interactions"]=(Number(state.skillXp["Social Interactions"])||0)+(Number(state.skillXp["Social Confidence"])||0);
  delete state.skillXp["Social Confidence"];
}
if(state.activeDate!==today()){state.activeDate=today();}

// WAYFARER CLOUD CONFIG: replace these two placeholders with your Supabase project URL and publishable/anon key.
// Never put a Supabase service_role key in this public website.
const WAYFARER_SUPABASE_URL = "https://zpyspmmbcopmsjmsqyhx.supabase.co";
const WAYFARER_SUPABASE_ANON_KEY = "sb_publishable_k0wIbWAz6lWzXiRvbFZPwg_lXK0m-u5";
let cloudClient = null;
let cloudUser = null;
let cloudHydrating = false;
let cloudConfigured = false;
// Hold the visible app behind a startup gate until Supabase has definitively restored auth and account state.
let authInitializationPending = true;
if (window.supabase && WAYFARER_SUPABASE_URL.startsWith("https://") && WAYFARER_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
  // Prefer the client created by index.html before any modular app code ran.
  // This prevents different modules from racing separate auth clients/session restores.
  cloudClient = window.wayfarerSupabaseClient || window.supabase.createClient(WAYFARER_SUPABASE_URL, WAYFARER_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storage: window.localStorage }
  });
  cloudConfigured = true;
}
function setCloudStatus(message){const el=document.getElementById("cloudStatus");if(el)el.textContent=message;}
function usernameEmail(username){return username.trim().toLowerCase()+"@wayfarer.example";}
// Resolve gender from the authenticated account first. The auth metadata records
// the original account-creation choice and repairs older cloud saves that lack it
// or were accidentally defaulted to male during a previous app update.
function resolveSavedGender(user,savedGender){
 const accountGender=user&&user.user_metadata?String(user.user_metadata.wayfarer_gender||"").toLowerCase():"";
 if(accountGender==="male"||accountGender==="female")return accountGender;
 if(savedGender==="male"||savedGender==="female")return savedGender;
 return null;
}
function repairProfileGender(user){
 if(!state.profile||typeof state.profile!=="object")state.profile={gender:null};
 const resolved=resolveSavedGender(user,state.profile.gender);
 if(resolved)state.profile.gender=resolved;
 return resolved;
}
function validAccountForm(){
 const username=document.getElementById("accountUsername").value.trim();
 const pin=document.getElementById("accountPin").value.trim();
 if(!/^[A-Za-z0-9_-]{3,20}$/.test(username)){toast("Username must be 3–20 letters, numbers, underscores or hyphens.");return null;}
 if(!/^[0-9]{8,32}$/.test(pin)){toast("Use a numeric PIN of at least 8 digits.");return null;}
 return {username,pin};
}
let cloudSyncQueue=Promise.resolve();
let cloudSyncFailure=null;
async function syncCurrentState(updatedAtMs=Date.now()){
 if(!cloudClient||!cloudUser||cloudHydrating)return;
 const syncUserId=cloudUser.id;
 const payload=JSON.parse(JSON.stringify(state));
 // Use the same revision timestamp for the local marker and cloud row. Otherwise
 // updated_at can be a few milliseconds newer than the local save marker even
 // when the cloud write failed, causing startup to prefer stale cloud progress.
 const updatedAt=new Date(updatedAtMs).toISOString();
 const write=async()=>{
   if(!cloudClient||!cloudUser||cloudUser.id!==syncUserId||cloudHydrating)return;
   const {error}=await cloudClient.from("wayfarer_saves").upsert({user_id:syncUserId,app_state:payload,updated_at:updatedAt},{onConflict:"user_id"});
   if(error){cloudSyncFailure=error;console.error("Wayfarer cloud save failed",error);setCloudStatus("Signed in, but cloud save failed. Your device copy is retained; check your connection and Supabase setup.");}
   else {cloudSyncFailure=null;setCloudStatus("Cloud sync active for @"+(document.getElementById("accountUsername").value.trim()||"your account")+". Your progress is saved online.");}
 };
 cloudSyncQueue=cloudSyncQueue.then(write,write);
 return cloudSyncQueue;
}
let wayfarerSignedInUsername="";
hideGenderChoice();
async function finishSignIn(username,pin,create,gender=null){
 if(!cloudConfigured){setCloudStatus("Cloud accounts need setup first. Follow the Supabase instructions in README.md and add your project URL and anon key to index.html.");toast("Cloud accounts are not configured yet.");return;}
 const email=usernameEmail(username);
 setCloudStatus(create?"Creating your account…":"Signing in…");
 const authResult=create
   ? await cloudClient.auth.signUp({email,password:pin,options:{data:{wayfarer_username:username,wayfarer_gender:gender}}})
   : await cloudClient.auth.signInWithPassword({email,password:pin});
 if(authResult.error){setCloudStatus(authResult.error.message+" If creating an account, check that email confirmations are disabled in Supabase.");return;}
 if(create && !authResult.data.session){setCloudStatus("Account request received, but Supabase returned no session. Turn off email confirmations in Supabase Auth, then try again.");return;}
 cloudUser=authResult.data.user;
 wayfarerSignedInUsername=username;
 try{localStorage.setItem("wayfarer-last-username",username);}catch(e){}
 if(!cloudUser){setCloudStatus("Could not establish a session. Please try again.");return;}
 const {data:saveRow,error:readError}=await cloudClient.from("wayfarer_saves").select("app_state,updated_at").eq("user_id",cloudUser.id).maybeSingle();
 if(readError){setCloudStatus("Signed in, but could not load cloud data. Check that supabase-schema.sql was run.");return;}
 cloudHydrating=true;
 if(saveRow && saveRow.app_state && typeof saveRow.app_state==="object"){
   state=saveRow.app_state;
   if(!state.settings)state.settings={...defaultSettings};
   if(!state.profile||typeof state.profile!=="object")state.profile={gender:null};if(!Array.isArray(state.inventory))state.inventory=[];if(!state.equipment||typeof state.equipment!=="object")state.equipment={};if(!Object.prototype.hasOwnProperty.call(state.equipment,"pet"))state.equipment.pet=null;if(!Number.isFinite(Number(state.gold)))state.gold=0;
   if(!Array.isArray(state.quests))state.quests=[];
   if(!Array.isArray(state.journal))state.journal=[];
   if(!Array.isArray(state.todo))state.todo=[];
   if(!Array.isArray(state.groceries))state.groceries=[];
   if(!Array.isArray(state.selectedSkills))state.selectedSkills=[];
   if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};
   repairProfileGender(cloudUser);
   localStorage.setItem(KEY,JSON.stringify(state));
   setCloudStatus("Signed in. Loaded your cloud save from "+new Date(saveRow.updated_at).toLocaleString()+".");
 } else {
   // Never transfer the previous signed-out device state into a different account.
   // An account without a cloud save starts with a clean, independent profile.
   state=freshState();
   state.profile.gender=(create && (gender==="male"||gender==="female"))?gender:resolveSavedGender(cloudUser,null);
   localStorage.setItem(KEY,JSON.stringify(state));
   cloudHydrating=false;
   await syncCurrentState();
   cloudHydrating=true;
   setCloudStatus("Signed in. This account had no saved progress, so a fresh profile was created.");
 }
 cloudHydrating=false;
 // Persist any repaired gender/profile migration to the existing account's save.
 await syncCurrentState();
 document.getElementById("accountUsername").value=username;
 document.getElementById("accountPin").value="";
 document.getElementById("accountPin").placeholder="PIN saved by secure sign-in";
 document.getElementById("signOutBtn").style.display="inline-flex";
 document.getElementById("accountModeChooser").style.display="none";
 document.getElementById("accountUsernameField").style.display="block";
 document.getElementById("accountPinField").style.display="none";
 document.getElementById("accountActionButtons").style.display="flex";
 document.getElementById("createAccountBtn").style.display="none";
 document.getElementById("signInBtn").style.display="none";
 document.getElementById("backAccountModeBtn").style.display="none";
 const genderField=document.getElementById("accountGenderField");if(genderField)genderField.style.display="none";
 render();
 enforceAccountGate();
 if(typeof renderDebugPanel === "function") renderDebugPanel();
}
function finishAuthInitialization(){authInitializationPending=false;const gate=document.getElementById("authStartupGate");if(gate)gate.style.display="none";enforceAccountGate();if(typeof renderDebugPanel==="function")setTimeout(()=>{enforceAccountGate();renderDebugPanel();},0);}
// Independent last-resort watchdog: if any startup callback hangs or throws
// outside the bounded network promises, recover the UI without deleting saves.
window.wayfarerStartupFailsafe=function(){
 if(!authInitializationPending)return;
 console.error("Wayfarer startup watchdog released the authentication gate.");
 try{
   cloudHydrating=false;
   if(cloudUser){
     const cached=load();if(cached)state=cached;
     try{render();}catch(error){console.error("Cached-state render failed during startup recovery",error);}
     const show=(id,display)=>{const el=document.getElementById(id);if(el)el.style.display=display;};
     show("signOutBtn","inline-flex");show("accountModeChooser","none");show("accountUsernameField","block");show("accountPinField","none");show("accountActionButtons","flex");show("createAccountBtn","none");show("signInBtn","none");show("backAccountModeBtn","none");
     setCloudStatus("Startup recovery: opened your device copy while cloud restoration was delayed. Your cloud save was not overwritten. Refresh or retry cloud loading when ready.");
   }else{
     setCloudStatus("Sign-in restoration took too long. Please sign in again; your saved data has been preserved.");
   }
 }catch(error){console.error("Wayfarer startup recovery encountered an error",error);}
 finally{finishAuthInitialization();}
};
function enforceAccountGate(){const gate=document.getElementById("authStartupGate");if(authInitializationPending){if(gate)gate.style.display="flex";return;}if(gate)gate.style.display="none";const signedIn=!!cloudUser;document.querySelectorAll('.tabs .tab').forEach(btn=>{const allowed=signedIn||btn.dataset.tab==='settings';btn.style.display=allowed?'':'none';btn.disabled=!allowed;});const debugTab=document.getElementById('debugTabButton');if(debugTab){const admin=signedIn&&String(wayfarerSignedInUsername||'').trim().toLowerCase()==='admin';debugTab.style.display=admin?'inline-flex':'none';debugTab.disabled=!admin;}document.querySelectorAll('main > .section').forEach(sec=>{sec.style.display=signedIn?'':(sec.id==='section-settings'?'':'none');if(!signedIn)sec.classList.toggle('active',sec.id==='section-settings');});const n=document.getElementById('accountRequiredNotice');if(n)n.style.display=signedIn?'none':'block';}
let accountFlowMode=null;
function showAccountMode(mode){accountFlowMode=mode;document.getElementById("accountModeChooser").style.display="none";document.getElementById("accountUsernameField").style.display="block";document.getElementById("accountPinField").style.display="block";document.getElementById("accountActionButtons").style.display="flex";document.getElementById("createAccountBtn").style.display=mode==="create"?"inline-flex":"none";document.getElementById("signInBtn").style.display=mode==="login"?"inline-flex":"none";hideGenderChoice();if(mode==="create"){const field=document.getElementById("accountGenderField");if(field)field.style.display="block";}}
function resetAccountMode(){accountFlowMode=null;hideGenderChoice();document.getElementById("accountModeChooser").style.display="flex";document.getElementById("accountUsernameField").style.display="none";document.getElementById("accountPinField").style.display="none";document.getElementById("accountActionButtons").style.display="none";}
function hideGenderChoice(){const field=document.getElementById("accountGenderField");if(field)field.style.display="none";document.querySelectorAll('input[name="characterGender"]').forEach(r=>r.checked=false);const btn=document.getElementById("createAccountBtn");if(btn)btn.textContent="Create account";}
document.getElementById("chooseCreateAccountBtn")?.addEventListener("click",()=>showAccountMode("create"));
document.getElementById("chooseSignInBtn")?.addEventListener("click",()=>showAccountMode("login"));
document.getElementById("backAccountModeBtn")?.addEventListener("click",resetAccountMode);
document.getElementById("accountForm")?.addEventListener("submit",async e=>{e.preventDefault();if(accountFlowMode!=="login")return;const credentials=validAccountForm();if(credentials)await finishSignIn(credentials.username,credentials.pin,false);});
document.getElementById("createAccountBtn")?.addEventListener("click",async()=>{if(accountFlowMode!=="create")return;const credentials=validAccountForm();if(!credentials)return;const field=document.getElementById("accountGenderField");if(field.style.display==="none"){field.style.display="block";document.getElementById("createAccountBtn").textContent="Choose male or female below";field.scrollIntoView({behavior:"smooth",block:"center"});return;}const selected=document.querySelector('input[name="characterGender"]:checked');if(!selected)toast("Choose male or female for your character.");});
document.querySelectorAll('input[name="characterGender"]').forEach(r=>r.addEventListener("change",async()=>{if(!r.checked)return;const credentials=validAccountForm();if(!credentials){hideGenderChoice();return;}const gender=r.value;if(gender!=="male"&&gender!=="female")return;document.getElementById("createAccountBtn").disabled=true;try{await finishSignIn(credentials.username,credentials.pin,true,gender);}finally{const btn=document.getElementById("createAccountBtn");if(btn)btn.disabled=false;}}));
document.getElementById("signOutBtn")?.addEventListener("click",async()=>{
 // Drain queued account saves before clearing the local account state or ending
 // the auth session. If the latest save failed, stay signed in so progress is
 // not silently discarded by the sign-out cleanup below.
 await cloudSyncQueue;
 if(cloudSyncFailure){toast("Your latest progress could not be saved online. Please check your connection and try signing out again.");return;}
 if(cloudClient){const {error}=await cloudClient.auth.signOut();if(error){setCloudStatus("Could not sign out: "+error.message);return;}}
 try{localStorage.removeItem("wayfarer-last-username");localStorage.removeItem(STATE_UPDATED_KEY);}catch(e){}
 // Clear account-bound data from the visible page and local cache on sign-out.
 // The account's saved data remains safely in its cloud row.
 cloudUser=null;
 cloudHydrating=true;
 state=freshState();
 localStorage.setItem(KEY,JSON.stringify(state));
 const usernameEl=document.getElementById("accountUsername");if(usernameEl)usernameEl.value="";
 const pinEl=document.getElementById("accountPin");if(pinEl){pinEl.value="";pinEl.placeholder="At least 8 digits";}
 document.getElementById("signOutBtn").style.display="none";
 document.getElementById("backAccountModeBtn").style.display="inline-flex";
 resetAccountMode();
 render();
 if(typeof renderDebugPanel === "function") renderDebugPanel();
 cloudHydrating=false;
 wayfarerSignedInUsername="";
 setCloudStatus("Signed out. This page has been cleared; each account keeps its own cloud save.");
});
function withStartupTimeout(promise, ms, operation){
 let timer;
 const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error("Wayfarer startup timed out while "+operation+". Please check your connection and retry.")),ms);});
 return Promise.race([Promise.resolve(promise),timeout]).finally(()=>clearTimeout(timer));
}
if(cloudClient){
 let authRestoreComplete=false;
 cloudClient.auth.onAuthStateChange((event,session)=>{
   if(session?.user){cloudUser=session.user;wayfarerSignedInUsername=restoreWayfarerUsername(session.user);}
   else if(event==="SIGNED_OUT"&&authRestoreComplete){cloudUser=null;wayfarerSignedInUsername="";try{localStorage.removeItem("wayfarer-last-username");}catch(e){}}
   // Null events before getSession completes are not proof that the user is signed out.
   enforceAccountGate();
   if(typeof renderDebugPanel==="function")renderDebugPanel();
 });
 withStartupTimeout(window.wayfarerAuthPreflight || cloudClient.auth.getSession(),13000,"restoring sign-in").then(async({data,error})=>{
   authRestoreComplete=true;
   if(error){
     console.error("Wayfarer session restore failed",error);
     setCloudStatus("Could not restore your sign-in session. Your device copy is retained; please retry sign-in.");
     finishAuthInitialization();
     return;
   }
   if(data.session){
     cloudUser=data.session.user;
     wayfarerSignedInUsername=restoreWayfarerUsername(data.session.user);
     // If this same tab has a valid Admin Sandbox snapshot, authenticate first but
     // skip the ordinary cloud-save wait. The snapshot contains the isolated sandbox
     // plus the live-state backup; debug.js restores it before the startup gate opens.
     let sandboxResume=null;
     let startupCloudReadFailed=false;
     try{
       const rawSandbox=sessionStorage.getItem("wayfarer-debug-sandbox-session-v1");
       if(rawSandbox){const candidate=JSON.parse(rawSandbox);if(candidate&&candidate.username&&candidate.username.trim().toLowerCase()===String(wayfarerSignedInUsername||"").trim().toLowerCase()&&String(wayfarerSignedInUsername||"").trim().toLowerCase()==="admin"&&candidate.live&&candidate.sandbox)sandboxResume=candidate;}
     }catch(sandboxError){console.warn("Wayfarer Sandbox resume snapshot could not be inspected; using normal cloud restore.",sandboxError);}
     if(sandboxResume){
       state=sandboxResume.live;
       render();
       setCloudStatus("Admin Sandbox session found. Restoring the temporary test state; live account data remains isolated.");
     }else{
     cloudHydrating=true;
     const {data:row,error:rowError}=await withStartupTimeout(cloudClient.from("wayfarer_saves").select("app_state,updated_at").eq("user_id",cloudUser.id).maybeSingle(),12000,"loading saved progress");
     startupCloudReadFailed=!!rowError;
     if(!rowError&&row&&row.app_state){
       const localUpdatedAt=Number(localStorage.getItem(STATE_UPDATED_KEY)||0);
       const cloudUpdatedAt=Date.parse(row.updated_at||"")||0;
       const localState=load();
       if(localState&&localUpdatedAt>cloudUpdatedAt){state=localState;setCloudStatus("Restored newer local progress and syncing it to your cloud save.");}
       else state=row.app_state;
       if(!state.settings)state.settings={...defaultSettings};
       if(!state.profile||typeof state.profile!=="object")state.profile={gender:null};
       if(!Array.isArray(state.inventory))state.inventory=[];
       if(!state.equipment||typeof state.equipment!=="object")state.equipment={};
       if(!Object.prototype.hasOwnProperty.call(state.equipment,"pet"))state.equipment.pet=null;
       if(!Number.isFinite(Number(state.gold)))state.gold=0;
       if(!Array.isArray(state.quests))state.quests=[];
       if(!Array.isArray(state.journal))state.journal=[];
       if(!Array.isArray(state.todo))state.todo=[];
       if(!Array.isArray(state.groceries))state.groceries=[];
       if(!Array.isArray(state.selectedSkills))state.selectedSkills=[];
       if(!state.skillXp||typeof state.skillXp!=="object")state.skillXp={};
       if(!state.skillPriorities||typeof state.skillPriorities!=="object")state.skillPriorities={};
       repairProfileGender(cloudUser);
       localStorage.setItem(KEY,JSON.stringify(state));
       try{localStorage.setItem(STATE_UPDATED_KEY,String(Math.max(Date.now(),localUpdatedAt,cloudUpdatedAt)));}catch(e){}
       render();
       if(!(localState&&localUpdatedAt>cloudUpdatedAt))setCloudStatus("Signed in. Cloud save loaded from "+new Date(row.updated_at).toLocaleString()+".");
     }else if(rowError){
       // Keep the cached account copy intact if the cloud read fails.
       const localState=load();
       if(localState)state=localState;
       setCloudStatus("Signed in, but cloud data could not be loaded. Your device copy is retained; check the connection and retry.");
       render();
     }else{
       state=freshState();
       localStorage.setItem(KEY,JSON.stringify(state));
       try{localStorage.setItem(STATE_UPDATED_KEY,String(Date.now()));}catch(e){}
       render();
       setCloudStatus("Signed in. No cloud save existed, so a fresh profile was created.");
     }
     }
     cloudHydrating=false;
     if(typeof restoreDebugSandboxSession==="function")restoreDebugSandboxSession();
     window.dispatchEvent(new Event("wayfarer-auth-restored"));
     document.getElementById("signOutBtn").style.display="inline-flex";
     document.getElementById("accountModeChooser").style.display="none";
     document.getElementById("accountUsernameField").style.display="block";
     document.getElementById("accountPinField").style.display="none";
     document.getElementById("accountActionButtons").style.display="flex";
     document.getElementById("createAccountBtn").style.display="none";
     document.getElementById("signInBtn").style.display="none";
     document.getElementById("backAccountModeBtn").style.display="none";
     if(typeof renderDebugPanel==="function")renderDebugPanel();
     finishAuthInitialization();
     // Open the app as soon as account state is restored; cloud writes run in the background.
     // This prevents a slow save request from holding the user on the startup screen.
     if(!startupCloudReadFailed&&!sandboxResume)syncCurrentState().catch(error=>console.error("Background startup sync failed",error));
   }else{
     // Only show the login flow after getSession explicitly confirms no session.
     finishAuthInitialization();
   }
 }).catch(error=>{
   authRestoreComplete=true;
   cloudHydrating=false;
   console.error("Wayfarer startup/auth restoration failed",error);
   if(cloudUser){
     const cached=load();if(cached)state=cached;
     render();
     document.getElementById("signOutBtn").style.display="inline-flex";
     document.getElementById("accountModeChooser").style.display="none";
     document.getElementById("accountUsernameField").style.display="block";
     document.getElementById("accountPinField").style.display="none";
     document.getElementById("accountActionButtons").style.display="flex";
     document.getElementById("createAccountBtn").style.display="none";
     document.getElementById("signInBtn").style.display="none";
     document.getElementById("backAccountModeBtn").style.display="none";
   }
   setCloudStatus(error?.message?.includes("timed out") ? error.message+" Your device copy is retained; retry sign-in when ready." : "Could not finish restoring your session. Your device copy is retained; retry sign-in when ready.");
   finishAuthInitialization();
 });
}else{
 authInitializationPending=false;
 const gate=document.getElementById("authStartupGate");if(gate)gate.style.display="none";
 enforceAccountGate();
}

function nextSaveRevision(){
 let previous=0;try{previous=Number(localStorage.getItem(STATE_UPDATED_KEY))||0;}catch(e){}
 return Math.max(Date.now(),previous+1);
}
function save(skipRender=false){
 const revision=nextSaveRevision();
 localStorage.setItem(KEY,JSON.stringify(state));
 try{localStorage.setItem(STATE_UPDATED_KEY,String(revision));}catch(e){}
 if(!skipRender)render();
 if(cloudUser&&!cloudHydrating)syncCurrentState(revision);
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(s){let t=document.getElementById("toast");t.textContent=s;t.style.display="block";clearTimeout(window._toastTimer);window._toastTimer=setTimeout(()=>t.style.display="none",2400)}
function ensureQuests(){if(state.quests.length)return;state.quests=starters.map((q,i)=>({...q,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+i),done:false,source:"starter"}));}
