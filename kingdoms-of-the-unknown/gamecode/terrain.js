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
  const THREE=await import("three");
  const terrainFile="./models/terrain/Playmap/terrain_kingdoms.glb";
  const scene=new THREE.Scene();
  // Procedural starfield behind the terrain, with no external asset dependency.
  const skyCanvas=document.createElement("canvas");
  skyCanvas.width=2048;skyCanvas.height=1024;
  const sky=skyCanvas.getContext("2d");
  const gradient=sky.createLinearGradient(0,0,0,1024);
  gradient.addColorStop(0,"#030713");gradient.addColorStop(0.5,"#10152b");gradient.addColorStop(1,"#080b19");
  sky.fillStyle=gradient;sky.fillRect(0,0,2048,1024);
  let seed=93217;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<2200;i++){
    const x=random()*2048,y=random()*1024,r=0.25+random()*1.15;
    sky.beginPath();sky.arc(x,y,r,0,Math.PI*2);
    sky.fillStyle="rgba(225,235,255,"+(0.2+random()*0.75)+")";sky.fill();
  }
  const starTexture=new THREE.CanvasTexture(skyCanvas);
  starTexture.colorSpace=THREE.SRGBColorSpace;
  starTexture.mapping=THREE.EquirectangularReflectionMapping;
  scene.background=starTexture;
  const renderer=new THREE.WebGLRenderer({canvas:host.querySelector("#viewport"),antialias:true,powerPreference:"high-performance",logarithmicDepthBuffer:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  // Neutral rendering: do not impose the old strategy-view exposure on Blender-authored materials.
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  
  // No generated lights. GLTFLoader preserves KHR_lights_punctual exported from Blender.
  const model=await loadGameModel(terrainFile);
  // GLB preserves supported Blender PBR materials and packed textures.
  // The single arena includes its own rectangular ground surface.
  // Keep the exported orientation and avoid loading obsolete separate floors.
  scene.add(model);
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
  // Ignore all lighting imported from Blender; the source GLB remains unchanged.
  const importedLights=[];
  model.traverse(node=>{if(node.isLight)importedLights.push(node);});
  for(const light of importedLights)light.parent?.remove(light);
  // Consistent game lighting independent of Blender export units and sun intensity.
  const ambient=new THREE.HemisphereLight(0xdce9ff,0x655b48,0.85);
  scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xfff2da,1.55);
  const lightCenter=targetBounds.getCenter(new THREE.Vector3());
  const lightSize=targetBounds.getSize(new THREE.Vector3());
  const lightExtent=Math.max(lightSize.x,lightSize.z,1);
  sun.position.copy(lightCenter).add(new THREE.Vector3(lightExtent*.6,lightExtent*1.4,lightExtent*.85));
  sun.target.position.copy(lightCenter);
  scene.add(sun,sun.target);
  sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-lightExtent*.8;
  sun.shadow.camera.right=lightExtent*.8;
  sun.shadow.camera.top=lightExtent*.8;
  sun.shadow.camera.bottom=-lightExtent*.8;
  sun.shadow.camera.near=Math.max(.01,lightExtent*.01);
  sun.shadow.camera.far=lightExtent*4;
  sun.shadow.bias=-0.00015;
  sun.shadow.normalBias=0.02;
  sun.shadow.camera.updateProjectionMatrix();
  model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
  console.info("Kingdoms hub: imported lights disabled; using game hemisphere and directional sunlight.",{removed:importedLights.length});
  camera.layers.enable(1);

  // Hub mode: the terrain is the whole scene. Player.fbx is loaded only in battle mode.
  // Keep the Blender camera's authored POSITION and projection. Aim at the
  // actual playable terrain, never at an imported character.
  const center=targetBounds.getCenter(new THREE.Vector3());
  const worldSize=targetBounds.getSize(new THREE.Vector3());
  const extent=Math.max(worldSize.x,worldSize.z,1);
  const worldUp=new THREE.Vector3(0,1,0);
  const basePosition=camera.position.clone();
  const cameraOffset=basePosition.clone().sub(center);
  if(cameraOffset.lengthSq()<1e-8)cameraOffset.set(0,extent*.7,extent*.7);
  const cameraRight=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion).setY(0).normalize();
  const right=cameraRight.lengthSq()>1e-8?cameraRight:new THREE.Vector3(1,0,0);
  const forward=new THREE.Vector3().crossVectors(worldUp,right).normalize();
  const target=center.clone();
  const initialDistance=cameraOffset.length();
  const zoomRange=[.85,1.15];
  let zoom=1,disposed=false,frame=0;
  const keys=new Set();
  const joystick={x:0,y:0,pointer:null};
  const stick=host.querySelector("#movementJoystick"),knob=host.querySelector("#movementJoystickKnob");
  const canvas=renderer.domElement;
  const updateCamera=()=>{
    camera.position.copy(target).addScaledVector(cameraOffset,zoom);
    camera.up.copy(worldUp);
    camera.lookAt(target);
    camera.near=Math.max(.001,initialDistance*.00001);
    camera.far=Math.max(1000,initialDistance*100,extent*100);
    if(camera.isOrthographicCamera){
      const h=Math.max(1,extent*.8)*zoom,aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
      camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;
    }else if(camera.isPerspectiveCamera)camera.aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  };
  const setZoom=value=>{zoom=THREE.MathUtils.clamp(value,...zoomRange);updateCamera();};
  const onWheel=e=>{e.preventDefault();setZoom(zoom*(e.deltaY>0?1.045:.955));};
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
  // Drag on desktop / touch to pan. Two-finger pinch zoom is limited to ±15%.
  const pointers=new Map();
  let dragDistance=0,lastPinch=null;
  const pointerDown=e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(pointers.size===2)lastPinch=null;};
  const pointerMove=e=>{
    const old=pointers.get(e.pointerId);if(!old)return;
    const dx=e.clientX-old.x,dy=e.clientY-old.y;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const pts=[...pointers.values()],d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
      if(lastPinch)setZoom(zoom*lastPinch/Math.max(1,d));
      lastPinch=d;return;
    }
    dragDistance+=Math.hypot(dx,dy);
    const speed=extent*.0006*zoom;
    target.addScaledVector(right,-dx*speed).addScaledVector(forward,dy*speed);
  };
  const raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const status=host.querySelector("#worldStatus");
  const pointerUp=e=>{
    if(!pointers.has(e.pointerId))return;
    pointers.delete(e.pointerId);lastPinch=null;
    if(dragDistance<8&&pointers.size===0){
      const box=canvas.getBoundingClientRect();
      ndc.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);
      raycaster.setFromCamera(ndc,camera);
      const hit=raycaster.intersectObject(model,true).find(h=>!h.object.name.toLowerCase().includes("playable_area"));
      if(hit&&status){
        const label=hit.object.name||hit.object.parent?.name||"Building";
        status.textContent=label+" — building interaction coming soon";
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
  const clampTarget=()=>{
    target.x=THREE.MathUtils.clamp(target.x,targetBounds.min.x,targetBounds.max.x);
    target.z=THREE.MathUtils.clamp(target.z,targetBounds.min.z,targetBounds.max.z);
  };
  const observer=new ResizeObserver(()=>{renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);updateCamera();});
  observer.observe(host);
  renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
  updateCamera();
  const clock=new THREE.Clock();
  function draw(){
    if(disposed)return;
    frame=requestAnimationFrame(draw);
    const dt=Math.min(clock.getDelta(),.05);
    const f=Number(keys.has("w")||keys.has("arrowup"))-Number(keys.has("s")||keys.has("arrowdown"))+joystick.y;
    const side=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"))+joystick.x;
    if(Math.abs(f)+Math.abs(side)>.001)target.addScaledVector(forward,f*extent*.18*dt).addScaledVector(right,side*extent*.18*dt);
    clampTarget();updateCamera();renderer.render(scene,camera);
  }
  draw();
  const qaViews=[{id:"hub",label:"Kingdom hub"}];
  const qaView=id=>id==="hub";
  const qaCapture=()=>{renderer.render(scene,camera);const a=document.createElement("a");a.download="Kingdoms_Hub_"+new Date().toISOString().replace(/[:.]/g,"-")+".png";a.href=canvas.toDataURL("image/png");a.click();};
  placement.setQAHandler?.({views:qaViews,view:qaView,capture:qaCapture});
  return ()=>{
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();placement.setQAHandler?.(null);
    window.removeEventListener("keydown",keyDown);window.removeEventListener("keyup",keyUp);window.removeEventListener("blur",reset);
    canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("pointerdown",pointerDown);
    canvas.removeEventListener("pointermove",pointerMove);canvas.removeEventListener("pointerup",pointerUp);canvas.removeEventListener("pointercancel",pointerUp);
    stick.removeEventListener("pointerdown",stickDown);stick.removeEventListener("pointermove",stickMove);
    stick.removeEventListener("pointerup",stickUp);stick.removeEventListener("pointercancel",stickUp);
    groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();
  };
}
