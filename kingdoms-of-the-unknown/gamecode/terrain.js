// Kingdoms of the Unknown — standalone Three.js terrain viewer.
// Uses browser ES modules; does not depend on Wayfarer state.
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FBXLoader.js";
// CDN addons import "three" as a bare specifier, resolved by the game's import map.
export async function startTerrain(host, mapName="human") {
  const THREE=await import("three");
  const {FBXLoader}=await import(LOADER_URL);
  const files={
    human:"./models/human-terrain/human-terrain.fbx",
    greek:"./models/greek-terrain/greek-terrain.fbx",
    undead:"./models/undead-terrain/undead-terrain.fbx"
  };
  if(!files[mapName])throw new Error("Unknown map.");
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x9aa6a8);
  const renderer=new THREE.WebGLRenderer({canvas:host.querySelector("#viewport"),antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  
  const camera=new THREE.PerspectiveCamera(45,1,0.1,100000);
  scene.add(new THREE.HemisphereLight(0xe9f1ff,0x515049,2));
  const sun=new THREE.DirectionalLight(0xffe7c7,2.2);sun.position.set(200,450,260);scene.add(sun);
  const loader=new FBXLoader();
  const model=await loader.loadAsync(files[mapName]);
  const textures={human:"./models/human-terrain/Meshy_AI_grassy_mountain_basin_1030145654_texture.png",greek:"./models/greek-terrain/Meshy_AI_bare_stone_basin_40k_1030153252_texture.png",undead:"./models/undead-terrain/Meshy_AI_undead_mountain_basin_1030153644_texture.png"};
  try{const texture=await new THREE.TextureLoader().loadAsync(textures[mapName]);texture.colorSpace=THREE.SRGBColorSpace;model.traverse(node=>{if(node.isMesh){for(const mat of (Array.isArray(node.material)?node.material:[node.material])){if(mat){mat.map=texture;mat.needsUpdate=true;}}}});}catch(error){console.warn("Terrain texture missing, showing material fallback.",error);}
  scene.add(model);
  // FBX files may contain several meshes and nested material groups.
  const bounds=new THREE.Box3().setFromObject(model);
  if(bounds.isEmpty())throw new Error("The terrain model has no geometry.");
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const radius=Math.max(size.x,size.z,1);
  const minRange=Math.max(radius*0.2,5),maxRange=Math.max(radius*1.7,40);
  const state={target:new THREE.Vector3(center.x,center.y,center.z),range:Math.max(radius*0.9,15)};
  // Blender/FBX convention: world Z is vertical for exported terrain; THREE defaults to Y-up.
  // FBXLoader normally converts axis metadata. Use actual shortest extent as vertical axis.
  const vertical=size.y<=size.z && size.y<=size.x?"y":"z";
  if(vertical==="z")camera.up.set(0,0,1);
  const groundAxis=vertical==="z"?"z":"y";
  const horizontal=vertical==="z"?["x","y"]:["x","z"];
  const clampTarget=()=>{
    for(const axis of horizontal){
      const half=size[axis]*0.5;
      const margin=Math.min(half*0.12,state.range*0.08);
      state.target[axis]=THREE.MathUtils.clamp(state.target[axis],center[axis]-half+margin,center[axis]+half-margin);
    }
    state.target[groundAxis]=center[groundAxis];
  };
  const updateCamera=()=>{
    clampTarget();
    const a=state.range;
    if(vertical==="z")camera.position.set(state.target.x+a*0.65,state.target.y-a*0.65,state.target.z+a*0.85);
    else camera.position.set(state.target.x+a*0.65,state.target.y+a*0.85,state.target.z+a*0.65);
    camera.lookAt(state.target);
  };
  updateCamera();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const pick=(e)=>{
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    return raycaster.intersectObject(model,true).find(hit=>hit.point)?.point||null;
  };
  let down=null;
  const onDown=e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture(e.pointerId);};
  const onMove=e=>{
    if(!down)return;
    const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;
    if(down.moved){
      const factor=state.range/Math.max(150,host.clientHeight);
      state.target[horizontal[0]]-= (dx+dy)*factor*0.7;
      state.target[horizontal[1]]+= (dx-dy)*factor*0.7;
      updateCamera();
    }
    down.lastX=e.clientX;down.lastY=e.clientY;
  };
  const onUp=e=>{if(down&&!down.moved){const p=pick(e);if(p){state.target[horizontal[0]]=p[horizontal[0]];state.target[horizontal[1]]=p[horizontal[1]];updateCamera();}}down=null;};
  const onWheel=e=>{e.preventDefault();state.range=THREE.MathUtils.clamp(state.range*Math.exp(e.deltaY*0.001),minRange,maxRange);updateCamera();};
  const canvas=renderer.domElement;
  canvas.style.touchAction="none";
  canvas.addEventListener("pointerdown",onDown);
  canvas.addEventListener("pointermove",onMove);
  canvas.addEventListener("pointerup",onUp);
  canvas.addEventListener("pointercancel",onUp);
  canvas.addEventListener("wheel",onWheel,{passive:false});
  const observer=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});
  observer.observe(host);
  let frame=0,disposed=false;
  function draw(){if(disposed)return;frame=requestAnimationFrame(draw);renderer.render(scene,camera);}
  draw();
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);renderer.dispose();};
}
