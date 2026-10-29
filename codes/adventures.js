// Wayfarer modular script segment. Keep load order in index.html.
// Adventure chooser: generate a location-independent mission and add it to the quest board.
const adventureToggle=document.getElementById("generateAdventureBtn");
const adventureChooser=document.getElementById("adventureChooser");
const adventureClose=document.getElementById("closeAdventureChooser");
function setAdventureChooserOpen(open){
  if(!adventureChooser||!adventureToggle)return;
  adventureChooser.style.display=open?"block":"none";
  adventureChooser.setAttribute("aria-hidden",open?"false":"true");
  adventureToggle.setAttribute("aria-expanded",open?"true":"false");
  if(open){adventureChooser.scrollIntoView({behavior:"smooth",block:"nearest"});}
}
if(adventureToggle)adventureToggle.addEventListener("click",function(){
  const isOpen=adventureChooser&&adventureChooser.style.display!=="none";
  setAdventureChooserOpen(!isOpen);
});
if(adventureClose)adventureClose.addEventListener("click",function(){setAdventureChooserOpen(false);});

const adventurePools={
  short:[
    ["The Road Less Travelled","Drive about 15 minutes in a direction you rarely choose. Park somewhere safe, explore on foot for 15 minutes, and notice three things you would normally pass by."],
    ["Five-Minute Curiosity","Head to an unfamiliar public area nearby. Find one detail that makes you curious and spend five minutes finding out more, if practical."],
    ["The Unplanned Turn","Take a safe, sensible route toward an unfamiliar area. Make one spontaneous but practical stop and explore it for at least 10 minutes."],
    ["Find the Quiet","Travel to a nearby public outdoor space. Put your phone away and spend 10 quiet minutes noticing sounds, movement, and details around you."],
    ["Three Things Hunt","Explore an unfamiliar street or public area and find something old, something colourful, and something unusual."],
    ["The Local Detail","Visit an area you usually pass through. Find a small detail—a sign, sculpture, building feature, or view—you have never noticed before."],
    ["A Different View","Drive around 15 minutes to a safe place where you can walk. Find a new viewpoint and stay long enough to take in the surroundings."],
    ["The Photo Scout","Explore somewhere unfamiliar and take three photos: a texture, an interesting shape, and something that tells a story."],
    ["Follow the Green","Find a public green space or tree-lined route nearby. Walk a new section and identify three natural details."],
    ["The Long Way Around","Choose a safe route home with one extra loop or stop. Explore for 10 minutes before heading back."],
    ["Unexpected Architecture","Explore an unfamiliar public area and find a building or structure with a feature you like. Notice what makes it stand out."],
    ["The Small Discovery","Travel a short distance to somewhere you have not explored properly. Find one thing that could make the outing worth repeating."],
    ["Wander Without a Shopping List","Visit a public shopping street or market area without needing to buy anything. Browse and find one thing you didn't know existed."],
    ["A Bench With a View","Find a safe public place to sit outdoors. Spend 10 minutes there, then walk a different way back to your starting point."],
    ["The Unfamiliar Loop","Drive about 15 minutes away and take a 20-minute walk on a route you have not used before."],
    ["Find Something Handmade","Look around an unfamiliar public area for handmade art, craft, decoration, or creative work. Find one example and appreciate its details."],
    ["The Soundtrack Walk","Choose a short playlist and explore an unfamiliar area on foot. Finish the walk without looking at your phone while moving."],
    ["A Tiny Travel Story","Take a short outing and collect three details that would help you describe the place to a friend later."],
    ["Find the Water","If accessible, visit a public river, canal, lake, coast, or fountain area. Walk for 15 minutes and notice how the place changes around the water."],
    ["The Different Direction","Choose a direction you rarely go, drive around 15 minutes, and explore a safe public place there."],
    ["One New Street","Find an unfamiliar street or path in a public area. Walk along it and choose your favourite detail."],
    ["The Mini Landmark Hunt","Find a public monument, plaque, sculpture, or locally meaningful feature without choosing a named destination in advance."],
    ["Browse and Discover","Explore an unfamiliar public area and browse a shop, display, or community noticeboard. Discover one event or activity that interests you."],
    ["The Five Senses","Take a short outing to an unfamiliar outdoor area. Notice one thing you can see, hear, smell, feel, and—where appropriate—taste."],
    ["The Curious Corner","Pick a safe public area you have never stopped at. Explore for 15 minutes and find one reason someone might enjoy visiting."],
    ["A Small Scenic Detour","Choose a pleasant, safe detour on a short drive. Stop only where parking is permitted and enjoy the surroundings for a few minutes."],
    ["The Colour Quest","Explore a nearby public area and find five different colours in buildings, nature, signs, or objects."],
    ["Find a New Walking Route","Drive about 15 minutes to an area with safe walking access. Create a short loop instead of retracing every step."],
    ["The Curious Sign","Look for an interesting public sign, notice, or piece of local information. Read it and learn one small thing about the area."],
    ["A Place for Future You","Explore somewhere new and identify one place you might return to for reading, thinking, walking, or bringing a friend."],
    ["The Window-Shopper","Walk along an unfamiliar shopping street and find the most intriguing window display without needing to buy anything."],
    ["The Nature Detail","Find a public outdoor space and spend 10 minutes looking closely at leaves, clouds, birds, stones, or other natural details."],
    ["The Spontaneous Stop","On a safe, planned short outing, make one unplanned stop at a public place that catches your attention."],
    ["The Local Flavour","If affordable and available, try a small local snack or drink you have not tried before. Otherwise, discover a food or drink you might try another time."],
    ["The Forgotten Nearby","Visit a place close to home that you have not explored in a long time. Find something new about it."],
    ["The Public Art Search","Look for public art, murals, sculptures, or creative details in an unfamiliar area. Choose your favourite."],
    ["The No-Rush Mission","Take a short drive to a walkable area and explore slowly for 20 minutes, with no errands to complete."],
    ["A New Place to Pause","Find a safe, comfortable public spot you have never paused at before. Spend 10 minutes there and decide what makes it pleasant."],
    ["The Route Reversal","Explore a familiar area from the opposite direction or enter it using a different safe route. Notice what changes."],
    ["The Tiny Expedition Report","Complete a short outing, then write down where you explored in general terms, what you discovered, and whether you would return."],
    ["Find the Odd One Out","Explore a public area and find one detail that seems different from everything around it. Think about why it caught your eye."],
    ["The Open-Air Break","Take a short drive to an outdoor public place and spend at least 15 minutes outside without scrolling."],
    ["A New Everyday View","Find a place where everyday life is happening—a square, walkway, or public seating area—and observe respectfully for 10 minutes."],
    ["The Curious Building","Explore an unfamiliar public area and choose a building or structure to observe. Notice three details about its shape, materials, or design."],
    ["The Mini Area Contrast","Travel toward a nearby area with a different local feel, even if it is only a few streets away. Explore for 15 minutes and identify what feels different."],
    ["The Unexpected Path","Find a public path or walkway you have never used. Walk a short section, staying on permitted routes."],
    ["The One-Question Adventure","Ask a staff member or local person a simple, appropriate question about the area, if a natural opportunity arises. If not, discover the answer through public information."],
    ["The Discovery Without Spending","Go somewhere new without buying anything. Explore for 20 minutes and return with one discovery instead of a purchase."],
    ["The Favourite Detail","Explore an unfamiliar area and choose one detail you would photograph, sketch, or describe to someone else."],
    ["Make a Future Pin","Find a public place you would like to revisit. Save a note or map pin for yourself and explain what drew you to it."]
  ],
  day:[
    ["The Five Discoveries","Choose an unfamiliar area within a practical travel distance—up to about two hours each way. Find something old, something beautiful, something unusual, something local, and somewhere you would revisit."],
    ["The Three-Stop Expedition","Plan a day outing with three different public stops: one for exploring on foot, one for scenery or nature, and one for a local discovery."],
    ["The Unfamiliar District","Travel to an unfamiliar town or district without selecting a specific named attraction first. Explore its centre, then walk through an area beyond the busiest streets."],
    ["The Scenic Route Mission","Choose a destination area up to two hours away and take a safe, scenic route where practical. Make two permitted stops and notice how the landscape changes."],
    ["The Local Culture Quest","Explore an unfamiliar area and find three clues to its local character, such as architecture, public art, food, language, or community life."],
    ["The Nature and Neighbourhood Day","Combine a walk in a public natural area with exploring a nearby built-up area. Find one thing you liked in each."],
    ["The Unplanned Afternoon","Travel to an unfamiliar area with only a loose plan. Choose your next stop after each discovery, while keeping travel and return plans sensible."],
    ["The Five Senses Expedition","Spend a day exploring an unfamiliar area. Record one memorable sight, sound, smell, texture, and taste if safely and comfortably available."],
    ["The History Hunt","Find three visible traces of the past in an unfamiliar area—older buildings, plaques, preserved structures, or public displays—and learn something about one."],
    ["The Everyday Explorer","Spend time in an unfamiliar town or district and explore places where everyday life happens, not just its main attraction. Find a public space, a local shopfront, and a quiet street."],
    ["The Two Landscapes","Visit two areas with different surroundings, such as built-up streets and open countryside, or a park and a waterfront. Compare what you noticed."],
    ["The Local Speciality","Explore an unfamiliar area and discover a local food, craft, product, or tradition. Try it if available and within budget; otherwise learn about it."],
    ["The Long Walk Discovery","Travel to an unfamiliar area and complete a walk suited to your ability. Along the way, find three points of interest and take a proper rest break."],
    ["The Photo Journal Day","Visit an unfamiliar area and take a series of photos that tell the story of the outing: arrival, a detail, a view, an unexpected discovery, and a favourite moment."],
    ["The Public Transport Expedition","Use public transport to reach an unfamiliar area, if practical. Explore on foot, discover something interesting, and plan a reliable return journey."],
    ["The Market and Streets Quest","If a market or public gathering is available, explore it, then walk around the surrounding area. If not, substitute another public community space."],
    ["The Three Generations of Buildings","In an unfamiliar area, look for buildings or structures that appear to belong to different periods. Compare their visible features without needing exact dates."],
    ["The Friend-Recommendation Test","Explore an unfamiliar area and find three things you might recommend to a friend: a place to walk, something interesting to see, and a possible food or drink stop."],
    ["The Quiet Corners Expedition","Spend the day finding calm public places in an unfamiliar area. Visit two or three, and choose which would be best for reading or thinking."],
    ["The Regional Difference","Travel to an area that feels different from your everyday surroundings. Find three small differences in architecture, landscape, shops, or local atmosphere."],
    ["The Spontaneous Detour Day","Plan a main area to explore, but leave room for one safe spontaneous detour. Complete the detour and note whether it became the highlight."],
    ["The Open Map Challenge","Look at a map of an area you do not know and choose a public area to explore, rather than a famous attraction. Find your way around and discover three points of interest."],
    ["The Coast, River, or Countryside Quest","If accessible within your travel range, explore a public natural feature such as a coast, river, lake, or countryside path. If none is nearby, choose another landscape that differs from home."],
    ["The Community Discovery","Look for public information about community activities, clubs, events, or local traditions in an unfamiliar area. Find one you might realistically attend in the future."],
    ["The Whole-Day Wander","Set aside several hours for an unhurried exploration of an unfamiliar area. Walk, pause, discover, and let curiosity choose at least one of your stops."],
    ["The Unexpected Collection","Across an unfamiliar area, find and photograph or note five things: a pattern, a sign, a natural detail, a piece of design, and something that made you smile."],
    ["The Local Story","Find a public plaque, display, historic feature, or local information source. Learn one story about the area and find another nearby place that adds context."],
    ["The Three Neighbourhoods","Explore three distinct public areas within one region. Spend enough time in each to notice its atmosphere, layout, and one point of interest."],
    ["The New Favourite Place","Spend the day looking for a place you would genuinely want to revisit. Explore multiple options and choose a favourite based on how it felt to be there."],
    ["The Return Route Adventure","Travel to an unfamiliar area and explore it. On the way back, choose a different safe route if practical and make one extra stop where permitted."],
    ["The Day of Small Firsts","During one outing, do three things for the first time: visit an unfamiliar public area, try or learn something new, and take a route you have not used before."],
    ["The Budget Explorer","Set a modest budget—or zero spending—and plan a day of discovery. Prioritise free public spaces, walking, and things to observe rather than purchases."],
    ["The Museum Alternative","If a museum or gallery is available and suits you, visit one and explore the surrounding area. Otherwise, find a public cultural display, historic feature, or creative space."],
    ["The Unfamiliar Food Trail","Explore an unfamiliar area and look for a local food or drink option. Try something within your budget, then walk around and discover two more interesting details."],
    ["The Sunrise or Sunset Expedition","Plan an outing around daylight and visit a safe public place for a sunrise or sunset if timing and weather allow. Add a short exploration before heading home."],
    ["The Crossroads Challenge","Choose an unfamiliar area and make three sensible choices during the day based on curiosity rather than habit: a street to explore, a place to pause, and a final stop."],
    ["The Landscape Notebook","Travel to an area with different scenery and record five observations about the landscape, weather, buildings, plants, or sounds."],
    ["The Future Adventure Scout","Explore an unfamiliar area and identify three possible future activities, such as a walk, event, local class, or place to bring a friend."],
    ["The Local Connections Day","Explore an unfamiliar public area and, where natural, have one brief friendly interaction—ask a simple question or exchange a few words. No interaction is required if it feels inappropriate."],
    ["The Hidden-in-Plain-Sight Day","Spend several hours exploring an area without relying on famous attractions. Find three ordinary things that turned out to be more interesting than expected."],
    ["The Complete Expedition","Choose an unfamiliar area within a sensible travel range. Discover one historic or cultural detail, one natural or scenic spot, one local speciality or story, and one place you would return to. Finish by recording your favourite discovery."]
  ]
};
function generateAdventure(type){
  const pool=adventurePools[type];
  if(!pool||!pool.length)return;
  const historyKey=type==="short"?"__adventureShortHistory":"__adventureDayHistory";
  if(!state.questHistory||typeof state.questHistory!=="object")state.questHistory={};
  const recent=Array.isArray(state.questHistory[historyKey])?state.questHistory[historyKey]:[];
  const fresh=pool.filter(item=>!recent.includes(item[0]));
  const choices=fresh.length?fresh:pool;
  const [title,description]=choices[Math.floor(Math.random()*choices.length)];
  state.questHistory[historyKey]=[title,...recent.filter(t=>t!==title)].slice(0,12);
  const quest={id:(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+"-"+Math.random().toString(36).slice(2),title,description,category:"Adventure",skill:"Adventure",xp:15,done:false,source:"adventure",adventureType:type};
  if(!Array.isArray(state.quests))state.quests=[];
  state.quests.push(quest);
  state.activeDate=today();
  save();
  setAdventureChooserOpen(false);
  toast(`${type==="short"?"Short":"Day"} adventure generated! +15 XP when completed.`);
  // Keep the current scroll position after generating an adventure.
}
document.querySelectorAll(".adventure-choice").forEach(button=>button.addEventListener("click",function(){generateAdventure(button.dataset.adventureType);}));

