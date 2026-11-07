/* Wayfarer v3.1.11 — Admin reflux guide and daily tracking. */
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

const HABITS=[["coffee","Coffee or caffeine"],["fizzy","Fizzy drinks"],["mint","Mint"],["spicy","Spicy or acidic food"],["fatty","Fatty or fried food"],["tobacco","Smoking or heated tobacco"],["late","Food within 3 hours of bed"],["large","Large meals"],["water","Enough water"],["small","Smaller meals"],["upright","Stayed upright after meals"],["noSnacks","No late-night snacks"]];
const authorized=()=>typeof cloudUser!=="undefined"&&!!cloudUser&&typeof debugIsAdmin==="function"&&debugIsAdmin();
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const tomorrow=s=>{const d=new Date(s+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);};
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
function data(){if(!state.refluxTracker)state.refluxTracker={draft:null,history:[]};const t=state.refluxTracker;if(!Array.isArray(t.history))t.history=[];if(!t.draft)t.draft={day:today(),habits:{},score:null,notes:""};return t;}
function saveLog(){if(authorized())save(true);}
function weekly(host,history){
 const old=host.querySelector("#refluxWeekly");if(old)old.remove();
 const out=node("div");out.id="refluxWeekly";const from=new Date(today()+"T12:00:00Z");from.setUTCDate(from.getUTCDate()-6);const first=from.toISOString().slice(0,10);
 const days=history.filter(x=>x.day>=first&&x.day<=today()&&Number.isInteger(x.score));
 out.append(node("h4",first+" to "+today()),node("p",days.length+" completed days. "+(days.length?"Average throat irritation: "+(days.reduce((s,x)=>s+x.score,0)/days.length).toFixed(1)+"/10":"No scores yet.")));
 if(days.length<4)out.append(node("p","Very limited data: four or more days are needed for an initial comparison."));
 const table=node("table");table.style.cssText="width:100%;font-size:0.85em";const head=node("tr");for(const s of ["Habit","Did","Didn't","Pattern"])head.append(node("th",s));table.append(head);
 for(const [id,label] of HABITS){const a=days.filter(x=>x.habits?.[id]==="yes"),b=days.filter(x=>x.habits?.[id]==="no");const avg=xs=>xs.length?xs.reduce((s,x)=>s+x.score,0)/xs.length:null;const av=avg(a),bv=avg(b);const tr=node("tr");
  for(const s of [label,av===null?"—":av.toFixed(1)+" ("+a.length+")",bv===null?"—":bv.toFixed(1)+" ("+b.length+")",a.length<2||b.length<2?"Too little data":av-bv>=1?"Higher after habit":bv-av>=1?"Lower after habit":"Similar"]){const td=node("td",s);td.style.padding="6px";tr.append(td);}table.append(tr);
 }out.append(table,node("p","Unlogged habits are excluded. Patterns do not establish causes; sleep, stress and other habits may influence symptoms."));host.append(out);
}
function showTracker(root){
 if(!authorized())return;const t=data(),draft=t.draft;
 const area=node("section");area.style.cssText="margin:20px 0;padding:16px 0;border-top:1px solid var(--line)";
 area.append(node("h3","Daily reflux tracker"),node("p","Choose Did, Didn't or Not logged for each habit. Drafts save automatically."),node("h4","Habits for "+draft.day));
 for(const [id,label] of HABITS){const row=node("div");row.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--line)";const caption=node("label",label);caption.htmlFor="reflux-"+id;row.append(caption);
 const select=node("select");select.id="reflux-"+id;for(const [value,text] of [["","Not logged"],["yes","Did"],["no","Didn't"]]){const option=node("option",text);option.value=value;select.append(option);}
 select.value=draft.habits?.[id]||"";select.addEventListener("change",()=>{draft.habits=draft.habits||{};if(select.value)draft.habits[id]=select.value;else delete draft.habits[id];saveLog();});row.append(select);area.append(row);}
 const label=node("label","Notes (optional)");label.htmlFor="reflux-notes";label.style.display="block";label.style.marginTop="12px";area.append(label);
 const notes=node("textarea");notes.id="reflux-notes";notes.rows=2;notes.maxLength=1000;notes.style.width="100%";notes.value=draft.notes||"";notes.addEventListener("input",()=>{draft.notes=notes.value;saveLog();});area.append(notes);
 area.append(node("h4","Morning after: "+tomorrow(draft.day)));
 const ready=today()>draft.day;area.append(node("p",ready?"Rate your throat upon waking.":"You can enter a morning score now for catch-up entries. Only do this if the score is from the morning after the habits listed; otherwise wait until tomorrow."));
 const scoreLabel=node("label","Throat irritation: 0 (none) to 10 (severe)");scoreLabel.htmlFor="reflux-score";area.append(scoreLabel);
 const score=node("select");score.id="reflux-score";for(const v of ["",...Array.from({length:11},(_,i)=>String(i))]){const opt=node("option",v===""?"Select score":v+"/10");opt.value=v;score.append(opt);}score.value=Number.isInteger(draft.score)?String(draft.score):"";score.addEventListener("change",()=>{draft.score=score.value===""?null:Number(score.value);saveLog();});area.append(score);
 const end=node("button","✓ End Day");end.className="btn primary";end.type="button";end.style.margin="12px 0";end.addEventListener("click",()=>{
 if(!authorized())return;
 if(!Number.isInteger(draft.score)||draft.score<0||draft.score>10){alert("Choose a morning score.");return;}
 if(!Object.keys(draft.habits||{}).length){alert("Log at least one habit.");return;}
 if(!ready&&!confirm("The following morning for "+draft.day+" is "+tomorrow(draft.day)+", which has not arrived yet. Only continue if you are correcting a backdated record and this score really belongs to the morning after those habits. Save anyway?"))return;
 if(ready&&!confirm("Save completed day "+draft.day+"?"))return;
 t.history=t.history.filter(x=>x.day!==draft.day);t.history.push(JSON.parse(JSON.stringify(draft)));t.history.sort((a,b)=>a.day.localeCompare(b.day));t.draft={day:today(),habits:{},score:null,notes:""};saveLog();render();
 });area.append(end);
 const report=node("div");report.append(node("h3","Weekly summary"));const sum=node("button","Summarize Week");sum.className="btn secondary";sum.type="button";sum.addEventListener("click",()=>{if(authorized())weekly(report,t.history);});report.append(sum);area.append(report);
 const history=node("div");history.append(node("h3","Completed days"));
 for(const entry of [...t.history].sort((a,b)=>b.day.localeCompare(a.day)).slice(0,30)){const row=node("div");row.style.cssText="display:flex;justify-content:space-between;gap:8px;margin:8px 0";row.append(node("span",entry.day+" · "+entry.score+"/10"));const edit=node("button","Edit");edit.type="button";edit.className="btn secondary small";edit.addEventListener("click",()=>{
 if(!authorized())return;if(Object.keys(t.draft?.habits||{}).length||t.draft?.notes){alert("Finish your current draft before editing.");return;}
 if(!confirm("Reopen "+entry.day+" for correction?"))return;t.history=t.history.filter(x=>x.day!==entry.day);t.draft=JSON.parse(JSON.stringify(entry));saveLog();render();
 });row.append(edit);history.append(row);}if(!t.history.length)history.append(node("p","No completed days yet."));area.append(history);root.prepend(area);
}

function render(){
 const root=document.getElementById("refluxGuideContent");
 const allowed=typeof cloudUser!=="undefined" && !!cloudUser && typeof debugIsAdmin==="function" && debugIsAdmin();
 const button=document.getElementById("refluxTabButton");
 if(button){button.style.display=allowed?"inline-flex":"none";button.disabled=!allowed;}
 if(!root)return;
 root.replaceChildren();
 if(!allowed){root.textContent="Admin access required.";return;}
 const intro=document.createElement("p");intro.className="sub";intro.textContent="Personal triggers vary. These foods are options, not a cure; do not eliminate foods that cause no symptoms.";root.append(intro);
 for(const group of groups){
  const section=document.createElement("section");section.style.marginTop="18px";
  const h=document.createElement("h3");h.textContent=group.heading;section.append(h);
  const list=document.createElement("ul");list.style.lineHeight="1.7";
  for(const [name,detail] of group.items){const li=document.createElement("li");const strong=document.createElement("strong");strong.textContent=name+": ";li.append(strong,document.createTextNode(detail));list.append(li);}
  section.append(list);root.append(section);
 }
 const note=document.createElement("p");note.className="notice";note.textContent="For recurring regurgitation, throat burning or difficulty eating, consult a GP. Seek prompt medical care for trouble swallowing, food sticking, bleeding or unexplained weight loss.";root.append(note);
 showTracker(root);
}
window.WayfarerTabRenderers.reflux=render;
window.WayfarerTabModules.reflux=render;
})();
