// Kingdoms of the Unknown — standalone Three.js terrain viewer.
// Uses browser ES modules; does not depend on Wayfarer state.
const THREE_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const GLTF_LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
const FBX_LOADER_URL="https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FBXLoader.js";
// Reusable asset loader: GLB for the authored terrain, FBX for future game models.
export async function loadGameModel(path) {
  const extension=path.split(/[?#]/,1)[0].split(".").pop().toLowerCase();
  if(extension==="fbx"){
    const {FBXLoader}=await import(FBX_LOADER_URL);
    return new FBXLoader().loadAsync(path);
  }
  if(extension==="glb"||extension==="gltf"){
    const {GLTFLoader}=await import(GLTF_LOADER_URL);
    const asset=await new GLTFLoader().loadAsync(path);
    return asset.scene;
  }
  throw new Error("Unsupported 3D model format: "+extension);
}
// CDN addons import "three" as a bare specifier, resolved by the game's import map.
export async function startTerrain(host, placement={}) {
  placement.reportStage?.("importing_three");
  const THREE=await import("three");
  placement.reportStage?.("three_ready");
  const terrainFolder="./models/kingdom/kingdom_modular/";
  const response=await fetch(terrainFolder+"manifest.json?v=3.0.93",{cache:"no-cache"});
  if(!response.ok)throw new Error("Kingdom manifest unavailable: "+response.status);
  const terrainManifest=await response.json();
  if(!Array.isArray(terrainManifest.groups)||terrainManifest.groups[0]?.file!=="base_ground_camera.glb")throw new Error("Invalid kingdom manifest");
  placement.reportStage?.("initializing_scene");
  const scene=new THREE.Scene();
  // iOS WebKit can terminate the page under high WebGL memory pressure.
  // Limit only mobile rendering buffers; keep the original GLB untouched.
  const mobileGraphics=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||
    (navigator.maxTouchPoints>1&&/Macintosh/i.test(navigator.userAgent));
  const skyWidth=mobileGraphics?1024:2048;
  const skyHeight=mobileGraphics?512:1024;
  // Procedural starfield behind the terrain, with no external asset dependency.
  const skyCanvas=document.createElement("canvas");
  skyCanvas.width=skyWidth;skyCanvas.height=skyHeight;
  const sky=skyCanvas.getContext("2d");
  const gradient=sky.createLinearGradient(0,0,0,skyHeight);
  gradient.addColorStop(0,"#030713");gradient.addColorStop(0.5,"#10152b");gradient.addColorStop(1,"#080b19");
  sky.fillStyle=gradient;sky.fillRect(0,0,skyWidth,skyHeight);
  let seed=93217;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<(mobileGraphics?1100:2200);i++){
    const x=random()*skyWidth,y=random()*skyHeight,r=0.25+random()*1.15;
    sky.beginPath();sky.arc(x,y,r,0,Math.PI*2);
    sky.fillStyle="rgba(225,235,255,"+(0.2+random()*0.75)+")";sky.fill();
  }
  const starTexture=new THREE.CanvasTexture(skyCanvas);
  starTexture.colorSpace=THREE.SRGBColorSpace;
  starTexture.mapping=THREE.EquirectangularReflectionMapping;
  scene.background=starTexture;
  placement.reportStage?.("creating_webgl_renderer");
  const renderer=new THREE.WebGLRenderer({canvas:host.querySelector("#viewport"),antialias:!mobileGraphics,powerPreference:mobileGraphics?"default":"high-performance",logarithmicDepthBuffer:true,preserveDrawingBuffer:!mobileGraphics});
  renderer.setPixelRatio(mobileGraphics?1:Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  // Neutral rendering: do not impose the old strategy-view exposure on Blender-authored materials.
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=!mobileGraphics;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  
  placement.reportStage?.("webgl_renderer_ready");
  // No generated lights. GLTFLoader preserves KHR_lights_punctual exported from Blender.
  placement.reportStage?.("loading_base_ground_camera");
  const model=await loadGameModel(terrainFolder+terrainManifest.groups[0].file);
  placement.reportStage?.("base_ground_camera_decoded");
  // GLB preserves supported Blender PBR materials and packed textures.
  // The single arena includes its own rectangular ground surface.
  // Keep the exported orientation and avoid loading obsolete separate floors.
  scene.add(model);
  placement.reportStage?.("terrain_added_to_scene");
  model.updateMatrixWorld(true);
  const cameras=[];
  model.traverse(node=>{if(node.isCamera)cameras.push(node);});
  if(!cameras.length)throw new Error("No Blender camera in terrain GLB. In Blender export glTF Binary (.glb) with Cameras enabled, then upload terrain_kingdoms.glb.");
  const source=cameras.find(c=>c.name.toLowerCase()==="camera")||cameras[0];
  source.updateWorldMatrix(true,false);
  const camera=source.clone();
  source.matrixWorld.decompose(camera.position,camera.quaternion,camera.scale);
  camera.scale.set(1,1,1);
  // GLB camera axes are defined consistently with Three.js; retain Blender orientation.
  const playable=model.getObjectByName("Playable_Area")||model.getObjectByName("Playable Area");
  const targetBounds=new THREE.Box3().setFromObject(playable||model);
  // Grade only Playable_Area: keep imported texture images, UVs and perimeter materials untouched.
  // Apply the correction after sampling the texture, rather than tinting the Town Hall.
  const groundMaterials=[];
  if(playable)playable.traverse(node=>{
    if(!node.isMesh)return;
    const grade=material=>{
      const adjusted=material.clone();
      adjusted.onBeforeCompile=shader=>{
        shader.fragmentShader=shader.fragmentShader.replace(
          "#include <map_fragment>",
          "#include <map_fragment>\n" +
          "float groundLuma=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));\n" +
          "diffuseColor.rgb=mix(vec3(groundLuma),diffuseColor.rgb,0.79);\n" +
          "#ifdef USE_MAP\n" +
          "vec2 terrainMacro=floor(vMapUv*5.0);\n" +
          "vec2 terrainFrac=fract(vMapUv*5.0);\n" +
          "terrainFrac=terrainFrac*terrainFrac*(3.0-2.0*terrainFrac);\n" +
          "float macroA=fract(sin(dot(terrainMacro,vec2(127.1,311.7)))*43758.5453);\n" +
          "float macroB=fract(sin(dot(terrainMacro+vec2(1.0,0.0),vec2(127.1,311.7)))*43758.5453);\n" +
          "float macroC=fract(sin(dot(terrainMacro+vec2(0.0,1.0),vec2(127.1,311.7)))*43758.5453);\n" +
          "float macroD=fract(sin(dot(terrainMacro+vec2(1.0,1.0),vec2(127.1,311.7)))*43758.5453);\n" +
          "float macroNoise=mix(mix(macroA,macroB,terrainFrac.x),mix(macroC,macroD,terrainFrac.x),terrainFrac.y);\n" +
          "diffuseColor.rgb*=0.99+(macroNoise-0.5)*0.15;\n" +
          "#endif"
        );
      };
      adjusted.customProgramCacheKey=()=>"kotu-playable-grade-v2";
      groundMaterials.push(adjusted);
      return adjusted;
    };
    node.material=Array.isArray(node.material)?node.material.map(grade):grade(node.material);
    node.receiveShadow=true;
    node.layers.enable(1);
  });
  // Hub lighting is owned by the game; never use lights exported by Blender.
  const importedLights=[];
  const removeAuthoredLights=root=>{
    const lights=[];root.traverse(node=>{if(node.isLight)lights.push(node);});
    for(const light of lights){importedLights.push(light);light.parent?.remove(light);}
  };
  removeAuthoredLights(model);
  const ambient=new THREE.HemisphereLight(0xdce9ff,0x655b48,0.85);
  scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xfff2da,1.55);
  const lightCenter=targetBounds.getCenter(new THREE.Vector3());
  const lightSize=targetBounds.getSize(new THREE.Vector3());
  const lightExtent=Math.max(lightSize.x,lightSize.z,1);
  sun.position.copy(lightCenter).add(new THREE.Vector3(lightExtent*.6,lightExtent*1.4,lightExtent*.85));
  sun.target.position.copy(lightCenter);
  scene.add(sun,sun.target);
  sun.castShadow=!mobileGraphics;
  sun.shadow.mapSize.set(mobileGraphics?1024:2048,mobileGraphics?1024:2048);
  sun.shadow.camera.left=-lightExtent*.8;sun.shadow.camera.right=lightExtent*.8;
  sun.shadow.camera.top=lightExtent*.8;sun.shadow.camera.bottom=-lightExtent*.8;
  sun.shadow.camera.near=Math.max(.01,lightExtent*.01);sun.shadow.camera.far=lightExtent*4;
  sun.shadow.bias=-0.00015;sun.shadow.normalBias=0.02;
  sun.shadow.camera.updateProjectionMatrix();
  if(!mobileGraphics)model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
  console.info("Kingdoms hub: using game-owned lighting.",{disabledImportedLights:importedLights.length,mobileGraphics,devicePixelRatio:renderer.getPixelRatio(),shadowSize:sun.shadow.mapSize.x});
  camera.layers.enable(1);

  // Fixed-center orbit camera. The exported Blender camera defines the
  // closest orbit position; zoom-out elevates toward a true overhead view.
  const center=targetBounds.getCenter(new THREE.Vector3());
  const worldSize=targetBounds.getSize(new THREE.Vector3());
  const extent=Math.max(worldSize.x,worldSize.z,1);
  const worldUp=new THREE.Vector3(0,1,0);
  const initialOffset=camera.position.clone().sub(center);
  const initialRadius=Math.max(.001,Math.hypot(initialOffset.x,initialOffset.z));
  const initialHeight=Math.max(.001,initialOffset.y);
  const initialYaw=Math.atan2(initialOffset.x,initialOffset.z);
  const overheadHeight=Math.max(initialHeight*2.1,extent*1.3);
  let yaw=initialYaw,targetYaw=initialYaw;
  let elevation=0,targetElevation=0;
  let disposed=false,frame=0;
  const keys=new Set();
  const joystick={x:0,y:0,pointer:null};
  const stick=host.querySelector("#movementJoystick"),knob=host.querySelector("#movementJoystickKnob");
  const canvas=renderer.domElement;
  const clampElevation=v=>THREE.MathUtils.clamp(v,0,1);
  const updateCamera=()=>{
    // Horizontal orbit radius fades to zero as the camera reaches top-down.
    const horizontal=initialRadius*Math.cos(elevation*Math.PI/2);
    const height=THREE.MathUtils.lerp(initialHeight,overheadHeight,elevation);
    camera.position.set(center.x+Math.sin(yaw)*horizontal,center.y+height,center.z+Math.cos(yaw)*horizontal);
    camera.up.set(0,1,0);
    // Looking exactly vertically requires a stable up vector to prevent
    // flipping or a sudden roll at the overhead limit.
    if(elevation>.9999)camera.up.set(-Math.sin(yaw),0,-Math.cos(yaw));
    camera.lookAt(center);
    camera.near=Math.max(.001,initialRadius*.00001);
    camera.far=Math.max(1000,overheadHeight*100,extent*100);
    if(camera.isOrthographicCamera){
      const h=THREE.MathUtils.lerp(Math.max(1,extent*.8),Math.max(1,extent*1.45),elevation);
      const aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
      camera.left=-h*aspect/2;camera.right=h*aspect/2;
      camera.top=h/2;camera.bottom=-h/2;
    }else if(camera.isPerspectiveCamera){
      camera.aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  };
  const onWheel=e=>{e.preventDefault();targetElevation=clampElevation(targetElevation+Math.sign(e.deltaY)*.065);};
  canvas.addEventListener("wheel",onWheel,{passive:false});
  const keyDown=e=>{
    if(!host.isConnected||host.hidden||e.target.closest("input,textarea,select"))return;
    const k=e.key.toLowerCase();
    if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)){keys.add(k);e.preventDefault();}
  };
  const keyUp=e=>keys.delete(e.key.toLowerCase());
  const reset=()=>{keys.clear();joystick.x=0;joystick.y=0;};
  window.addEventListener("keydown",keyDown);window.addEventListener("keyup",keyUp);window.addEventListener("blur",reset);
  const updateStick=e=>{
    const box=stick.getBoundingClientRect(),radius=Math.max(1,Math.min(box.width,box.height)*.35);
    let x=(e.clientX-box.left-box.width/2)/radius,y=(e.clientY-box.top-box.height/2)/radius;
    const n=Math.hypot(x,y);if(n>1){x/=n;y/=n;}
    joystick.x=x;joystick.y=-y;
    knob.style.transform="translate("+x*radius+"px,"+y*radius+"px)";
  };
  const stickDown=e=>{e.preventDefault();joystick.pointer=e.pointerId;stick.setPointerCapture(e.pointerId);updateStick(e);};
  const stickMove=e=>{if(joystick.pointer===e.pointerId)updateStick(e);};
  const stickUp=e=>{if(joystick.pointer!==e.pointerId)return;joystick.pointer=null;joystick.x=0;joystick.y=0;knob.style.transform="translate(0,0)";};
  stick.addEventListener("pointerdown",stickDown);stick.addEventListener("pointermove",stickMove);
  stick.addEventListener("pointerup",stickUp);stick.addEventListener("pointercancel",stickUp);
  const pointers=new Map();
  let dragDistance=0,lastPinch=null;
  const pointerDown=e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(pointers.size===2)lastPinch=null;};
  const pointerMove=e=>{
    const old=pointers.get(e.pointerId);if(!old)return;
    const dx=e.clientX-old.x,dy=e.clientY-old.y;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const pts=[...pointers.values()],d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
      if(lastPinch!==null)targetElevation=clampElevation(targetElevation+(lastPinch-d)/Math.max(100,canvas.clientHeight));
      lastPinch=d;return;
    }
    dragDistance+=Math.hypot(dx,dy);
    targetYaw-=dx*.006;
    targetElevation=clampElevation(targetElevation+dy*.0016);
  };
  // Only known buildings may be selected. The surrounding mountains, trees,
  // palisade and ground must never behave as buildings.
  const buildingPatterns=[
    {id:"Town Hall",test:/town[ _.-]*hall|townhall/i},
    {id:"Citadel",test:/citadel|castle|keep/i},
    {id:"Barracks",test:/barracks/i},
    {id:"Trading Hub",test:/trading[ _.-]*hub|tradinghub|market|trader/i},
    {id:"Hunter's Hut",test:/hunter[ _.-]*s?[ _.-]*hut|huntershut|hunting[ _.-]*hut/i},
    {id:"Military Camp",test:/military[ _.-]*camp|militarycamp|army[ _.-]*camp|encampment|camp/i}
  ];
  const matchBuilding=node=>{
    for(let current=node;current&&current!==model.parent;current=current.parent){
      const name=current.name||"";
      const match=buildingPatterns.find(item=>item.test.test(name));
      if(match)return match.id;
      if(current===model)break;
    }
    return null;
  };
  // Build a horizontal click region from the camp's actual world-space bounds.
  // This includes the open courtyard between its tents and props, not just mesh.
  const campBounds=new THREE.Box3();
  let campFound=false;
  model.traverse(node=>{
    if(!node.isMesh)return;
    if(matchBuilding(node)!=="Military Camp")return;
    const box=new THREE.Box3().setFromObject(node);
    if(box.isEmpty())return;
    campBounds.union(box);campFound=true;
  });
  const campSize=new THREE.Vector3();
  if(campFound)campBounds.getSize(campSize);
  const campPlane=new THREE.Plane(new THREE.Vector3(0,1,0),campFound?-campBounds.min.y:0);
  const campPoint=new THREE.Vector3();
  const raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const status=host.querySelector("#worldStatus");
  const pointerUp=e=>{
    if(!pointers.has(e.pointerId))return;
    pointers.delete(e.pointerId);lastPinch=null;
    if(dragDistance<8&&pointers.size===0){
      const box=canvas.getBoundingClientRect();
      ndc.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);
      raycaster.setFromCamera(ndc,camera);
      const selected=raycaster.intersectObject(model,true)
        .map(hit=>({name:matchBuilding(hit.object),distance:hit.distance}))
        .find(hit=>hit.name);
      let building=selected?.name||null;
      // A ground-level footprint fills the camp's otherwise empty interior.
      // Do not override another building already hit by the ray.
      if(!building&&campFound&&campSize.x>0&&campSize.z>0&&raycaster.ray.intersectPlane(campPlane,campPoint)){
        const margin=Math.min(campSize.x,campSize.z)*.05;
        if(campPoint.x>=campBounds.min.x-margin&&campPoint.x<=campBounds.max.x+margin
          &&campPoint.z>=campBounds.min.z-margin&&campPoint.z<=campBounds.max.z+margin){
          building="Military Camp";
        }
      }
      if(building&&status){
        status.textContent=building+" — building interaction coming soon";
        status.hidden=false;
        clearTimeout(status._hubTimer);
        status._hubTimer=setTimeout(()=>status.hidden=true,3500);
      }
    }
    if(!pointers.size)dragDistance=0;
  };
  canvas.style.touchAction="none";
  canvas.addEventListener("pointerdown",pointerDown);canvas.addEventListener("pointermove",pointerMove);
  canvas.addEventListener("pointerup",pointerUp);canvas.addEventListener("pointercancel",pointerUp);
  placement.reportStage?.("preparing_first_frame");
  const observer=new ResizeObserver(()=>{renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);updateCamera();});
  observer.observe(host);
  renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
  updateCamera();
  const clock=new THREE.Clock();
  function draw(){
    if(disposed)return;
    frame=requestAnimationFrame(draw);
    const dt=Math.min(clock.getDelta(),.05);
    const horizontal=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"))+joystick.x;
    const vertical=Number(keys.has("s")||keys.has("arrowdown"))-Number(keys.has("w")||keys.has("arrowup"))-joystick.y;
    targetYaw+=horizontal*dt*1.2;
    targetElevation=clampElevation(targetElevation+vertical*dt*.35);
    const smoothing=1-Math.exp(-dt*8);
    yaw+=THREE.MathUtils.euclideanModulo(targetYaw-yaw+Math.PI,Math.PI*2)-Math.PI ? 0 : 0;
    yaw+=((targetYaw-yaw))*smoothing;
    elevation=THREE.MathUtils.lerp(elevation,targetElevation,smoothing);
    updateCamera();renderer.render(scene,camera);
  }
  draw();
  placement.reportStage?.("first_frame_submitted");
  let loadingCancelled=false;
  const loadRemainingGroups=async()=>{
    // Load all scenery concurrently, except the temporarily disabled archer towers.
    const groups=terrainManifest.groups.slice(1).filter(group=>group.file!=="archer_towers.glb");
    await Promise.allSettled(groups.map(async group=>{
      if(loadingCancelled||disposed)return;
      placement.reportStage?.("loading_group_"+group.file.replace(".glb",""));
      try{
        const part=await loadGameModel(terrainFolder+group.file);
        if(loadingCancelled||disposed)return;
        removeAuthoredLights(part);
        if(!mobileGraphics)part.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
        model.add(part);
        model.updateMatrixWorld(true);
        placement.reportStage?.("loaded_group_"+group.file.replace(".glb",""));
      }catch(error){
        console.error("Kingdom group failed:",group.file,error);
        placement.reportStage?.("failed_group_"+group.file.replace(".glb",""),"error",error?.message||String(error));
        const label=host.querySelector("#worldStatus");
        if(label){label.textContent="Some scenery could not load: "+group.file;label.hidden=false;}
      }
    }));
    if(!loadingCancelled&&!disposed)placement.reportStage?.("all_kingdom_groups_loaded","success");
  };
  setTimeout(()=>{if(!loadingCancelled&&!disposed)loadRemainingGroups();},350);
  const qaViews=[{id:"hub",label:"Kingdom hub"}];
  const qaView=id=>id==="hub";
  const qaCapture=()=>{renderer.render(scene,camera);const a=document.createElement("a");a.download="Kingdoms_Hub_"+new Date().toISOString().replace(/[:.]/g,"-")+".png";a.href=canvas.toDataURL("image/png");a.click();};
  placement.setQAHandler?.({views:qaViews,view:qaView,capture:qaCapture});
  return ()=>{
    loadingCancelled=true;disposed=true;cancelAnimationFrame(frame);observer.disconnect();placement.setQAHandler?.(null);
    window.removeEventListener("keydown",keyDown);window.removeEventListener("keyup",keyUp);window.removeEventListener("blur",reset);
    canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("pointerdown",pointerDown);
    canvas.removeEventListener("pointermove",pointerMove);canvas.removeEventListener("pointerup",pointerUp);canvas.removeEventListener("pointercancel",pointerUp);
    stick.removeEventListener("pointerdown",stickDown);stick.removeEventListener("pointermove",stickMove);
    stick.removeEventListener("pointerup",stickUp);stick.removeEventListener("pointercancel",stickUp);
    groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();
  };
}
