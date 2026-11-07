/* Wayfarer v3.1.12 — Admin reflux guide and dated period diary. */
(()=>{
"use strict";
window.WayfarerTabRenderers=window.WayfarerTabRenderers||{};
window.WayfarerTabModules=window.WayfarerTabModules||{};
const groups=[
 {heading:"✓ Foods and drinks to favor",items:[
 ["Breakfast and grains","Oatmeal, wholegrain bread, rice, couscous, potatoes, plain crackers."],
 ["Fruits","Bananas, melon, pears, apples (cooked if preferred), papaya."],
 ["Vegetables","Carrots, green beans, zucchini, spinach, cucumber; broccoli if tolerated."],
 ["Proteins","Skinless chicken or turkey, white fish, eggs, tofu, lean meat."],
 ["Drinks","Still water, chamomile or rooibos tea, warm water with a little honey for throat comfort, low-fat milk if tolerated."]]},
 {heading:"⚠ Common triggers to limit if they worsen symptoms",items:[
 ["Drinks","Coffee, espresso, energy drinks, carbonated drinks, alcohol, strong caffeinated tea."],
 ["Mint and chocolate","Peppermint, spearmint, mint tea or sweets, chocolate, cocoa."],
 ["Fatty foods","Deep-fried foods, fatty burgers, bacon, sausages, creamy sauces, large amounts of butter or cheese."],
 ["Acidic and spicy foods","Tomato sauce, citrus fruit and juice, vinegar-heavy dressings, hot peppers and spicy sauces; onions and garlic if triggering."]]},
 {heading:"Daily meal example",items:[
 ["Breakfast","Oatmeal with banana and water."],
 ["Snack","Pear and plain crackers."],
 ["Lunch","Wholegrain chicken sandwich with cucumber."],
 ["Afternoon","Low-fat yogurt if tolerated."],
 ["Dinner","Grilled fish or chicken, rice and cooked vegetables."],
 ["Evening","Caffeine-free tea; finish food at least 3 hours before bed."]]},
 {heading:"Habits that can reduce reflux",items:[
 ["Meals","Choose smaller portions, eat slowly, and avoid lying down after eating."],
 ["Night","Finish eating at least 3 hours before bed; sleep on your left side and elevate the head of the bed if needed."],
 ["Posture","Stay comfortably upright after meals; avoid tight abdominal bracing and tight waistbands."],
 ["Smoking","Work toward stopping smoking; smoke and heated tobacco can irritate the throat."]]}
];


const habits=[["coffee","Coffee or caffeine"],["fizzy","Fizzy drinks"],["mint","Mint or peppermint"],["spicy","Spicy or acidic food"],["fatty","Fatty or fried food"],["tobacco","Cigarettes or heated tobacco"],["large","Large meals"],["water","Enough water"],["small","Smaller meals"],["upright","Stayed upright after meals"],["noSnacks","Avoided late-night snacks"]];
const periods=["morning","afternoon","evening"];
const authorized=()=>typeof cloudUser!=="undefined"&&!!cloudUser&&typeof debugIsAdmin==="function"&&debugIsAdmin();
const dateNow=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+"T12:00:00Z"));
const el=(tag,content)=>{const e=document.createElement(tag);if(content!==undefined)e.textContent=content;return e;};
function empty(day){return {day,late:null,morningThroat:null,periods:{morning:{habits:{},score:null},afternoon:{habits:{},score:null},evening:{habits:{},score:null}},notes:""};}
function normalize(raw,day){
 const x=empty(day);if(!raw||typeof raw!=="object")return x;
 x.day=day;x.notes=String(raw.notes||"").slice(0,1000);
 if(raw.late==="yes"||raw.late==="no")x.late=raw.late;
 if(Number.isInteger(raw.morningThroat)&&raw.morningThroat>=0&&raw.morningThroat<=10)x.morningThroat=raw.morningThroat;
 for(const p of periods){const from=raw.periods?.[p];if(!from)continue;for(const [id] of habits){if(["yes","no"].includes(from.habits?.[id]))x.periods[p].habits[id]=from.habits[id];}if(Number.isInteger(from.score)&&from.score>=0&&from.score<=10)x.periods[p].score=from.score;}
 return x;
}
function tracker(){
 if(!state.refluxTracker||typeof state.refluxTracker!=="object")state.refluxTracker={draft:null,history:[]};
 const t=state.refluxTracker;if(!Array.isArray(t.history))t.history=[];
 if(!t.drafts||typeof t.drafts!=="object")t.drafts={};
 // Preserve the previous diary as legacy records rather than silently misattribute scores.
 if(!t.periodDiaryMigrated){
  t.legacyHistory=Array.isArray(t.legacyHistory)?t.legacyHistory:[];
  for(const entry of t.history){if(entry&&entry.day&&!t.legacyHistory.some(x=>x.day===entry.day))t.legacyHistory.push(JSON.parse(JSON.stringify(entry)));}
  if(t.draft&&validDate(t.draft.day)){const day=t.draft.day;const x=empty(day);x.notes=String(t.draft.notes||"");for(const [id] of habits){if(["yes","no"].includes(t.draft.habits?.[id]))x.periods.evening.habits[id]=t.draft.habits[id];}if(["yes","no"].includes(t.draft.habits?.late))x.late=t.draft.habits.late;t.drafts[day]=x;}
  t.history=[];t.periodDiaryMigrated=true;save(true);
 }
 return t;
}
function saveDiary(){if(authorized())save(true);}
function select(values,current,onChange){
 const s=el("select");for(const [value,label] of values){const o=el("option",label);o.value=value;s.append(o);}s.value=current??"";s.addEventListener("change",()=>onChange(s.value));return s;
}
const yesNo=[["","Not logged"],["yes","Did"],["no","Didn't"]];
const scoreOptions=[["","Not logged"],...Array.from({length:11},(_,i)=>[String(i),i+"/10"])];
function row(host,label,control){
 const r=el("div");r.style.cssText="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:9px 0;border-bottom:1px solid rgba(170,150,130,.3)";
 r.append(el("span",label),control);host.append(r);
}
function scores(s){return Number.isInteger(s)?s+"/10":"Not logged";}
function summary(host,history){
 host.querySelector("#refluxReport")?.remove();
 const report=el("div");report.id="refluxReport";report.style.marginTop="14px";
 const end=dateNow(),start=new Date(end+"T12:00:00Z");start.setUTCDate(start.getUTCDate()-6);const first=start.toISOString().slice(0,10);
 const week=history.filter(x=>x.day>=first&&x.day<=end);report.append(el("h4","Last seven dates: "+first+" to "+end),el("p",week.length+" completed entries. Scores not logged are excluded."));
 const average=values=>values.length?(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1):"—";
 for(const p of periods){const values=week.map(x=>x.periods?.[p]?.score).filter(Number.isInteger);report.append(el("p",p[0].toUpperCase()+p.slice(1)+" reflux: "+average(values)+"/10 (n="+values.length+")"));}
 const lateYes=week.filter(x=>x.late==="yes"&&Number.isInteger(x.morningThroat)),lateNo=week.filter(x=>x.late==="no"&&Number.isInteger(x.morningThroat));
 report.append(el("h4","Food within 3 hours of bed → waking throat"));
 report.append(el("p","Did: "+average(lateYes.map(x=>x.morningThroat))+"/10 (n="+lateYes.length+") · Didn't: "+average(lateNo.map(x=>x.morningThroat))+"/10 (n="+lateNo.length+")"));
 for(const p of periods){
  report.append(el("h4",p[0].toUpperCase()+p.slice(1)+" habits and reflux"));
  const table=el("table");table.style.cssText="width:100%;font-size:.85em";
  const head=el("tr");for(const label of ["Habit","Did avg (n)","Didn't avg (n)"])head.append(el("th",label));table.append(head);
  for(const [id,label] of habits){const a=week.filter(x=>x.periods?.[p]?.habits?.[id]==="yes"&&Number.isInteger(x.periods[p].score)),b=week.filter(x=>x.periods?.[p]?.habits?.[id]==="no"&&Number.isInteger(x.periods[p].score));
   const tr=el("tr");for(const value of [label,average(a.map(x=>x.periods[p].score))+" ("+a.length+")",average(b.map(x=>x.periods[p].score))+" ("+b.length+")"]){const td=el("td",value);td.style.padding="6px";tr.append(td);}table.append(tr);
  }report.append(table);
 }
 report.append(el("p","These are associations, not diagnoses or proof of triggers. Small samples, simultaneous habits, and sleep or stress can affect the results."));host.append(report);
}
function showTracker(root){
 if(!authorized())return;
 const t=tracker(),wrapper=el("section");wrapper.style.cssText="margin:20px 0;padding:16px 0;border-top:1px solid rgba(170,150,130,.4)";
 wrapper.append(el("h3","Daily reflux tracker"),el("p","Choose the date the habits occurred. Fill in morning, afternoon and evening whenever convenient, including the following night."));
 const dateLabel=el("label","Diary date ");dateLabel.htmlFor="reflux-date";wrapper.append(dateLabel);
 const picker=el("input");picker.type="date";picker.id="reflux-date";picker.max=dateNow();picker.value=t.selectedDay&&validDate(t.selectedDay)?t.selectedDay:dateNow();if(picker.value>dateNow())picker.value=dateNow();
 t.selectedDay=picker.value;picker.addEventListener("change",()=>{if(!validDate(picker.value)||picker.value>dateNow()){picker.value=t.selectedDay;return;}t.selectedDay=picker.value;saveDiary();render();});wrapper.append(picker);
 const day=t.selectedDay;const existing=t.history.find(x=>x.day===day);
 const draft=t.drafts[day]?normalize(t.drafts[day],day):existing?normalize(existing,day):empty(day);
 if(!existing&&!t.drafts[day])t.drafts[day]=draft;
 const saveDraft=()=>{t.drafts[day]=draft;saveDiary();};
 const morning=el("section");morning.style.marginTop="16px";morning.append(el("h4","🌅 Morning"));
 row(morning,"Ate within 3 hours before last night's bedtime",select(yesNo,draft.late,v=>{draft.late=v||null;saveDraft();}));
 row(morning,"Throat irritation on waking (0–10)",select(scoreOptions,Number.isInteger(draft.morningThroat)?String(draft.morningThroat):"",v=>{draft.morningThroat=v===""?null:Number(v);saveDraft();}));
 wrapper.append(morning);
 for(const p of periods){
  const section=el("section");section.style.marginTop="18px";section.append(el("h4",p==="morning"?"Morning habits":p==="afternoon"?"☀️ Afternoon":"🌙 Evening"));
  for(const [id,label] of habits)row(section,label,select(yesNo,draft.periods[p].habits[id]||"",v=>{if(v)draft.periods[p].habits[id]=v;else delete draft.periods[p].habits[id];saveDraft();}));
  row(section,"Reflux severity during "+p+" (0–10)",select(scoreOptions,Number.isInteger(draft.periods[p].score)?String(draft.periods[p].score):"",v=>{draft.periods[p].score=v===""?null:Number(v);saveDraft();}));
  wrapper.append(section);
 }
 const notesLabel=el("label","Notes (optional)");notesLabel.style.display="block";notesLabel.style.marginTop="16px";notesLabel.htmlFor="reflux-notes";wrapper.append(notesLabel);
 const notes=el("textarea");notes.id="reflux-notes";notes.rows=3;notes.maxLength=1000;notes.style.width="100%";notes.value=draft.notes;notes.addEventListener("input",()=>{draft.notes=notes.value;saveDraft();});wrapper.append(notes);
 const finish=el("button",existing?"✓ Update Day":"✓ End Day");finish.type="button";finish.className="btn primary";finish.style.margin="12px 0";
 finish.addEventListener("click",()=>{if(!authorized())return;
  if(!Number.isInteger(draft.morningThroat)&&!periods.some(p=>Number.isInteger(draft.periods[p].score))){alert("Please enter at least one symptom score.");return;}
  if(!confirm("Save reflux diary for "+day+"? Missing answers remain Not logged."))return;
  t.history=t.history.filter(x=>x.day!==day);t.history.push(JSON.parse(JSON.stringify(draft)));t.history.sort((a,b)=>a.day.localeCompare(b.day));delete t.drafts[day];saveDiary();render();
 });wrapper.append(finish);
 const report=el("section");report.append(el("h3","Weekly summary"));const summarize=el("button","Summarize Week");summarize.type="button";summarize.className="btn secondary";summarize.addEventListener("click",()=>summary(report,t.history));report.append(summarize);wrapper.append(report);
 const history=el("section");history.style.marginTop="16px";history.append(el("h3","Completed days"));
 for(const entry of [...t.history].sort((a,b)=>b.day.localeCompare(a.day)).slice(0,40)){const line=el("div");line.style.cssText="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0";line.append(el("span",entry.day+" · waking "+scores(entry.morningThroat)+" · evening "+scores(entry.periods?.evening?.score)));
  const edit=el("button","Edit");edit.type="button";edit.className="btn secondary small";edit.addEventListener("click",()=>{t.selectedDay=entry.day;saveDiary();render();});line.append(edit);history.append(line);}
 if(!t.history.length)history.append(el("p","No completed entries yet."));
 if(t.legacyHistory?.length){const legacy=el("details");legacy.append(el("summary","Previous-format entries ("+t.legacyHistory.length+")"));for(const item of t.legacyHistory)legacy.append(el("p",item.day+" · previous morning score "+scores(item.score)));history.append(legacy);}
 wrapper.append(history);root.prepend(wrapper);
}
function render(){
 const root=document.getElementById("refluxGuideContent"),ok=authorized(),button=document.getElementById("refluxTabButton");
 if(button){button.style.display=ok?"inline-flex":"none";button.disabled=!ok;}
 if(!root)return;root.replaceChildren();if(!ok){root.textContent="Admin access required.";return;}
 const intro=el("p","Personal triggers vary. These foods are options, not a cure; do not eliminate foods that cause no symptoms.");root.append(intro);
 for(const group of groups){const section=el("section");section.style.marginTop="18px";section.append(el("h3",group.heading));const list=el("ul");list.style.lineHeight="1.7";for(const [name,detail] of group.items){const li=el("li");const strong=el("strong",name+": ");li.append(strong,document.createTextNode(detail));list.append(li);}section.append(list);root.append(section);}
 root.append(el("p","For recurring regurgitation or throat burning, consult a GP. Seek prompt medical care for difficulty swallowing, bleeding or unexplained weight loss."));
 showTracker(root);
}
window.WayfarerTabRenderers.reflux=render;
window.WayfarerTabModules.reflux=render;
})();
