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
  const authoredLights=[];
  model.traverse(node=>{if(node.isLight){authoredLights.push(node);node.castShadow=true;}});
  if(!authoredLights.length)console.warn("Kingdoms: terrain GLB contains no exported punctual lights. Export Blender lights using glTF with punctual lights enabled.");
  camera.layers.enable(1);

  // v3.0.78: fixed-distance player-follow camera; movement is controlled by the commander.
  const playerFile="./models/Characters/Player/Player.fbx";
  const commander=await loadGameModel(playerFile);
  const playerRoot=new THREE.Group();playerRoot.name="CommanderRoot";scene.add(playerRoot);
  playerRoot.add(commander);
  // Explicit player-only gameplay scale; world assets are unchanged.
  commander.scale.setScalar(0.003);
  // Keep the FBX authoring scale. Do not normalize the character to terrain bounds.
  const worldWidth=Math.max(targetBounds.max.x-targetBounds.min.x,targetBounds.max.z-targetBounds.min.z);
  const unit=worldWidth/1000;
  commander.updateMatrixWorld(true);
  const characterBox=new THREE.Box3().setFromObject(commander);
  const characterHeight=characterBox.max.y-characterBox.min.y;
  if(!Number.isFinite(characterHeight)||characterHeight<=1e-7)throw new Error("Player.fbx has no usable character bounds.");
  // Keep original character size and orientation. Only align its lowest point to the walkable surface.
  commander.position.y-=characterBox.min.y;
  const spawn=targetBounds.getCenter(new THREE.Vector3());
  const terrainRay=new THREE.Raycaster();
  const groundAt=(x,z)=>{
    terrainRay.set(new THREE.Vector3(x,targetBounds.max.y+Math.max(worldWidth,1),z),new THREE.Vector3(0,-1,0));
    const hits=terrainRay.intersectObject(playable||model,true);
    return hits.length?hits[0].point.y:null;
  };
  const initialGround=groundAt(spawn.x,spawn.z);
  if(initialGround===null)throw new Error("Cannot find a walkable surface on Playable_Area.");
  playerRoot.position.set(spawn.x,initialGround,spawn.z);
  // Animation names vary by exporter; use available idle/walk actions when present.
  const clips=commander.animations||[];
  const mixer=clips.length?new THREE.AnimationMixer(commander):null;
  const walkClip=clips.find(c=>/walk|run|locomot|move/i.test(c.name))||clips[0]||null;
  const idleClip=clips.find(c=>/idle|stand|breath/i.test(c.name))||null;
  const walkAction=walkClip?mixer.clipAction(walkClip):null;
  const idleAction=idleClip?mixer.clipAction(idleClip):null;
  let activeAction=null;
  const animateMovement=walking=>{
    const next=walking?walkAction:(idleAction||walkAction);
    if(next!==activeAction){activeAction?.fadeOut(.18);next?.reset().fadeIn(.18).play();activeAction=next;}
    if(next===walkAction&&!walking)next.paused=true;
    else if(next)next.paused=false;
  };
  animateMovement(false);
  // Dedicated follow target, independent of animated FBX geometry.
  const worldUp=new THREE.Vector3(0,1,0);
  const cameraBack=new THREE.Vector3(0,0,1);
  const cameraForward=cameraBack.clone().negate();
  const cameraRight=new THREE.Vector3().crossVectors(cameraForward,worldUp).normalize();
  const followDistance=Math.max(characterHeight*5,unit*5);
  const followHeight=Math.max(characterHeight*2,unit*2);
  const cameraTarget=new THREE.Object3D();
  cameraTarget.position.set(0,characterHeight*.55,0);
  playerRoot.add(cameraTarget);
  const focus=new THREE.Vector3();
  const updateCamera=()=>{
    cameraTarget.getWorldPosition(focus);
    camera.position.copy(focus).addScaledVector(cameraBack,followDistance);
    camera.position.y+=followHeight;
    camera.up.copy(worldUp);
    camera.lookAt(focus);
    camera.zoom=1;
    camera.near=Math.max(.001,followDistance*.001);
    camera.far=Math.max(1000,followDistance*200);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  };
  const resizeCamera=()=>{
    const aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
    if(camera.isPerspectiveCamera)camera.aspect=aspect;
    if(camera.isOrthographicCamera){
      const height=followDistance*.75;
      camera.left=-height*aspect/2;camera.right=height*aspect/2;
      camera.top=height/2;camera.bottom=-height/2;
    }
    camera.updateProjectionMatrix();updateCamera();
  };
  const keys=new Set();
  const keyDown=e=>{
    if(!host.isConnected||host.hidden||e.target.closest("input,textarea,select"))return;
    const key=e.key.toLowerCase();
    if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(key)){keys.add(key);e.preventDefault();}
  };
  const keyUp=e=>keys.delete(e.key.toLowerCase());
  const resetKeys=()=>{keys.clear();joystick.x=0;joystick.y=0;};
  window.addEventListener("keydown",keyDown);
  window.addEventListener("keyup",keyUp);
  window.addEventListener("blur",resetKeys);
  const joystick={x:0,y:0,pointer:null};
  const stick=host.querySelector("#movementJoystick"),knob=host.querySelector("#movementJoystickKnob");
  const updateStick=e=>{
    const box=stick.getBoundingClientRect(),radius=Math.max(1,Math.min(box.width,box.height)*.35);
    let x=(e.clientX-(box.left+box.width/2))/radius;
    let y=(e.clientY-(box.top+box.height/2))/radius;
    const length=Math.hypot(x,y);
    if(length>1){x/=length;y/=length;}
    joystick.x=x;joystick.y=-y;
    knob.style.transform="translate("+x*radius+"px,"+y*radius+"px)";
  };
  const stickDown=e=>{e.preventDefault();joystick.pointer=e.pointerId;stick.setPointerCapture(e.pointerId);updateStick(e);};
  const stickMove=e=>{if(joystick.pointer===e.pointerId)updateStick(e);};
  const stickUp=e=>{if(joystick.pointer!==e.pointerId)return;joystick.pointer=null;joystick.x=0;joystick.y=0;knob.style.transform="translate(0,0)";};
  stick.addEventListener("pointerdown",stickDown);
  stick.addEventListener("pointermove",stickMove);
  stick.addEventListener("pointerup",stickUp);
  stick.addEventListener("pointercancel",stickUp);
  const canvas=renderer.domElement;
  const observer=new ResizeObserver(()=>{
    renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
    resizeCamera();
  });
  observer.observe(host);
  renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
  resizeCamera();
  const clock=new THREE.Clock();
  let frame=0,disposed=false;
  function draw(){
    if(disposed)return;
    frame=requestAnimationFrame(draw);
    const dt=Math.min(clock.getDelta(),.05);
    const forward=Number(keys.has("w")||keys.has("arrowup"))-Number(keys.has("s")||keys.has("arrowdown"))+joystick.y;
    const sideways=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"))+joystick.x;
    const movement=new THREE.Vector3().addScaledVector(cameraForward,forward).addScaledVector(cameraRight,sideways);
    const walking=movement.lengthSq()>.001;
    if(walking){
      movement.normalize();
      const speed=unit*4.2;
      const nextX=THREE.MathUtils.clamp(playerRoot.position.x+movement.x*speed*dt,targetBounds.min.x+unit*2,targetBounds.max.x-unit*2);
      const nextZ=THREE.MathUtils.clamp(playerRoot.position.z+movement.z*speed*dt,targetBounds.min.z+unit*2,targetBounds.max.z-unit*2);
      const y=groundAt(nextX,nextZ);
      if(y!==null){
        playerRoot.position.set(nextX,y,nextZ);
        // Character's model forward direction is assumed to be -Z; adjust if authored differently.
        playerRoot.rotation.y=Math.atan2(-movement.x,-movement.z);
      }
    }
    animateMovement(walking);
    mixer?.update(dt);
    updateCamera();
    renderer.render(scene,camera);
  }
  draw();
  const qaViews=[{id:"player",label:"Follow commander"}];
  const qaView=id=>id==="player";
  const qaCapture=()=>{
    renderer.render(scene,camera);
    const a=document.createElement("a");a.download="Kingdoms_QA_"+new Date().toISOString().replace(/[:.]/g,"-")+".png";
    a.href=canvas.toDataURL("image/png");a.click();
  };
  placement.setQAHandler?.({views:qaViews,view:qaView,capture:qaCapture});
  return ()=>{
    placement.setQAHandler?.(null);
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();
    window.removeEventListener("keydown",keyDown);window.removeEventListener("keyup",keyUp);window.removeEventListener("blur",resetKeys);
    stick.removeEventListener("pointerdown",stickDown);stick.removeEventListener("pointermove",stickMove);
    stick.removeEventListener("pointerup",stickUp);stick.removeEventListener("pointercancel",stickUp);
    mixer?.stopAllAction();scene.remove(playerRoot);
    groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();
  };
}
