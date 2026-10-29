// Wayfarer modular script segment. Keep load order in index.html.
// v0.14.5: theme-aware music system. Settings are persisted in the existing account state.
const THEME_MUSIC={
 "dungeon-theme":"./assets/sound/dungeon-theme.mp3",
 "bloodthirst-theme":"./assets/sound/bloodthirst-theme.mp3",
 "adventure-theme":"./assets/sound/adventure-theme.mp3",
 "academy-theme":"./assets/sound/academy-theme.mp3",
 "social-interactions-theme":"./assets/sound/social-interactions-theme.mp3",
 "relationships-theme":"./assets/sound/relationships-theme.mp3",
 "orthodox-theme":"./assets/sound/orthodox-theme.mp3",
 // Reserved tracks for future themes; these themes are not registered or equipable yet.
 "fitness-theme":"./assets/sound/fitness-theme.mp3",
 "spartan-endurance-theme":"./assets/sound/cardio-theme.mp3",
 "mozart-salon-theme":"./assets/sound/piano-theme.mp3",
 "ceo-theme":"./assets/sound/ceo-theme.mp3",
 "v0-test-theme":"./assets/sound/dungeon-theme.mp3",
 "cardio-theme":"./assets/sound/cardio-theme.mp3",
 "piano-theme":"./assets/sound/piano-theme.mp3"
};
let themeMusicAudio=null, themeMusicSource="", themeMusicFadeTimers=new Map(), musicPlaybackUnlocked=false;
function getMusicSettings(){if(!state.settings||typeof state.settings!=="object")state.settings={...defaultSettings};if(typeof state.settings.musicEnabled!=="boolean")state.settings.musicEnabled=true;if(!state.settings.musicEnabledMigrationV1){state.settings.musicEnabled=true;state.settings.musicEnabledMigrationV1=true;}const volume=Number(state.settings.musicVolume);state.settings.musicVolume=Number.isFinite(volume)?Math.max(0,Math.min(100,volume)):35;return state.settings;}
function getEquippedMusicSource(){const id=(debugIsAdmin&&debugSandboxActive&&document.getElementById("debugDisableMusic")?.checked)?"dungeon-theme":(state?.equipment?.theme||"dungeon-theme");return THEME_MUSIC[id]||THEME_MUSIC["dungeon-theme"];}
function updateMusicControls(){const settings=getMusicSettings();const toggle=document.getElementById("musicEnabled"),volume=document.getElementById("musicVolume"),value=document.getElementById("musicVolumeValue"),button=document.getElementById("musicPlayButton"),status=document.getElementById("musicStatus");if(toggle)toggle.checked=settings.musicEnabled;if(volume)volume.value=String(settings.musicVolume);if(value)value.textContent=settings.musicVolume+"%";if(button)button.textContent=settings.musicEnabled?"Ⅱ Pause music":"▶ Play music";if(status)status.textContent=!settings.musicEnabled?"Music paused":(themeMusicAudio&&!themeMusicAudio.paused?"Playing current theme soundtrack":"Ready to play — tap Play music if your browser blocks autoplay");}
function stopMusicFade(audio){if(audio&&themeMusicFadeTimers.has(audio)){clearInterval(themeMusicFadeTimers.get(audio));themeMusicFadeTimers.delete(audio);}else if(!audio){for(const timer of themeMusicFadeTimers.values())clearInterval(timer);themeMusicFadeTimers.clear();}}
function fadeAudio(audio,target,duration=700,done){stopMusicFade(audio);if(!audio){if(done)done();return;}const start=Number(audio.volume)||0,steps=14;let step=0;const timer=setInterval(()=>{step++;audio.volume=Math.max(0,Math.min(1,start+(target-start)*(step/steps)));if(step>=steps){stopMusicFade(audio);audio.volume=target;if(done)done();}},Math.max(16,duration/steps));themeMusicFadeTimers.set(audio,timer);}
function createThemeAudio(src){const audio=new Audio(src);audio.loop=true;audio.preload="none";audio.volume=0;audio.addEventListener("error",()=>{const status=document.getElementById("musicStatus");if(status)status.textContent="Could not load this soundtrack. Check the deployed audio files.";});return audio;}
async function applyThemeMusic({userInitiated=false}={}){
 const settings=getMusicSettings(),src=getEquippedMusicSource(),target=settings.musicVolume/100;
 updateMusicControls();
 if(!settings.musicEnabled){if(themeMusicAudio&&!themeMusicAudio.paused)fadeAudio(themeMusicAudio,0,450,()=>themeMusicAudio.pause());else if(themeMusicAudio)themeMusicAudio.pause();return;}
 if(!musicPlaybackUnlocked&&!userInitiated){const status=document.getElementById("musicStatus");if(status)status.textContent="Ready — tap Play music to start";return;}
 musicPlaybackUnlocked=musicPlaybackUnlocked||userInitiated;
 if(themeMusicSource!==src||!themeMusicAudio){
  const old=themeMusicAudio;
  // Theme changes are an immediate handoff: stop the previous soundtrack before starting the new one.
  if(old){stopMusicFade(old);old.pause();old.currentTime=0;old.src="";}
  stopMusicFade();themeMusicSource=src;
  const next=createThemeAudio(src);themeMusicAudio=next;next.preload="auto";next.volume=target;
  try{await next.play();}
  catch(_){const status=document.getElementById("musicStatus");if(status)status.textContent="Tap Play music to allow playback";return;}
 }
 else {try{if(themeMusicAudio.paused)await themeMusicAudio.play();stopMusicFade(themeMusicAudio);themeMusicAudio.volume=target;}catch(_){const status=document.getElementById("musicStatus");if(status)status.textContent="Tap Play music to allow playback";return;}}
 updateMusicControls();
}
function syncDungeonMusic(){applyThemeMusic();}
function tryStartDungeonMusic(){if(getMusicSettings().musicEnabled)applyThemeMusic({userInitiated:true});}
document.getElementById("musicEnabled")?.addEventListener("change",event=>{getMusicSettings().musicEnabled=!!event.target.checked;save(true);updateMusicControls();if(event.target.checked)applyThemeMusic({userInitiated:true});else applyThemeMusic();});
document.getElementById("musicVolume")?.addEventListener("input",event=>{const settings=getMusicSettings();settings.musicVolume=Math.max(0,Math.min(100,Number(event.target.value)||0));const label=document.getElementById("musicVolumeValue");if(label)label.textContent=settings.musicVolume+"%";if(themeMusicAudio&&!themeMusicAudio.paused){stopMusicFade();themeMusicAudio.volume=settings.musicVolume/100;}save(true);});
document.getElementById("musicPlayButton")?.addEventListener("click",()=>{const settings=getMusicSettings();settings.musicEnabled=!settings.musicEnabled;save(true);updateMusicControls();if(settings.musicEnabled)applyThemeMusic({userInitiated:true});else applyThemeMusic();});
window.addEventListener("pointerdown",()=>{if(getMusicSettings().musicEnabled)tryStartDungeonMusic();},{passive:true});
window.addEventListener("keydown",()=>{if(getMusicSettings().musicEnabled)tryStartDungeonMusic();});
window.addEventListener("pagehide",()=>{stopMusicFade();if(themeMusicAudio)themeMusicAudio.pause();});

