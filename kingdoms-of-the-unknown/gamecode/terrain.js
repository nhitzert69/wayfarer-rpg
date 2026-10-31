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
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  
  // Stage 1: soft sky bounce and warm directional key light, without a second competing sun.
  scene.add(new THREE.HemisphereLight(0xe3efff,0x82775f,1.12));
  const sun=new THREE.DirectionalLight(0xffe3bd,2.0);sun.position.set(200,450,260);scene.add(sun);
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
  // A local shadow frustum follows the Town Hall instead of wasting resolution on the whole map.
  // The light is on layer 1, shared only by Playable_Area and the Town Hall.
  // One directional sun provides both illumination and shadows (no doubled key light).
  const gameSun=sun;
  gameSun.layers.enable(1);
  gameSun.castShadow=true;
  gameSun.shadow.mapSize.set(2048,2048);
  gameSun.shadow.camera.near=.01;
  gameSun.shadow.bias=-.00008;
  gameSun.shadow.normalBias=.002;
  gameSun.shadow.radius=3;
  scene.add(gameSun.target);
  camera.layers.enable(1);

  // Keep the authored camera rotation, including its intentional framing.
  const origin=camera.position.clone(),rotation=camera.quaternion.clone(),baseZoom=camera.zoom||1;
  // Blender authored frame is 16:9. Wider viewports must crop, not reveal terrain outside it.
  const authoredAspect=16/9;
  let viewportCrop=1;
  const orthoHeight=camera.isOrthographicCamera?camera.top-camera.bottom:0;
  const orthoCenterX=camera.isOrthographicCamera?(camera.left+camera.right)/2:0;
  const orthoCenterY=camera.isOrthographicCamera?(camera.top+camera.bottom)/2:0;
  camera.near=0.1;camera.far=100000;scene.add(camera);
  const groundY=targetBounds.min.y;
  const state={zoom:5,offset:new THREE.Vector3()},zoomMin=1,zoomMax=20;
  const resizeCamera=()=>{
    const aspect=Math.max(.2,host.clientWidth/Math.max(1,host.clientHeight));
    viewportCrop=Math.max(1,aspect/authoredAspect);
    if(camera.isPerspectiveCamera)camera.aspect=aspect;
    if(camera.isOrthographicCamera){
      camera.left=orthoCenterX-orthoHeight*aspect/2;camera.right=orthoCenterX+orthoHeight*aspect/2;
      camera.top=orthoCenterY+orthoHeight/2;camera.bottom=orthoCenterY-orthoHeight/2;
    }
    camera.updateProjectionMatrix();
  };
  const footprint=(position,zoom)=>{
    const probe=camera.clone();probe.position.copy(position);probe.quaternion.copy(rotation);
    probe.zoom=baseZoom*viewportCrop*zoom;probe.updateProjectionMatrix();probe.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(),hits=[];
    for(const x of [-1,1])for(const y of [-1,1]){
      ray.setFromCamera(new THREE.Vector2(x,y),probe);
      const d=ray.ray.direction.y;
      if(Math.abs(d)<1e-6)return null;
      const distance=(groundY-ray.ray.origin.y)/d;
      if(distance<=0)return null;
      hits.push(ray.ray.at(distance,new THREE.Vector3()));
    }
    return {minX:Math.min(...hits.map(p=>p.x)),maxX:Math.max(...hits.map(p=>p.x)),
      minZ:Math.min(...hits.map(p=>p.z)),maxZ:Math.max(...hits.map(p=>p.z))};
  };
  const updateCamera=()=>{
    camera.position.copy(origin).add(state.offset);camera.quaternion.copy(rotation);
    camera.zoom=baseZoom*viewportCrop*state.zoom;camera.updateProjectionMatrix();
    const outer=footprint(origin,1),inner=footprint(camera.position,state.zoom);
    if(outer&&inner){
      const dx=Math.max(outer.minX-inner.minX,Math.min(outer.maxX-inner.maxX,0));
      const dz=Math.max(outer.minZ-inner.minZ,Math.min(outer.maxZ-inner.maxZ,0));
      state.offset.x+=dx;state.offset.z+=dz;camera.position.copy(origin).add(state.offset);
    }else{state.offset.set(0,0,0);camera.position.copy(origin);}
    camera.updateMatrixWorld(true);
  };
  resizeCamera();updateCamera();


  let down=null;
  const touches=new Map();
  let pinchDistance=null;
  const onDown=e=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(e.pointerType!=="mouse"){
      touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(touches.size>=2){down=null;pinchDistance=null;}
    }
    if(touches.size<2)down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const onMove=e=>{
    if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(touches.size>=2){
      const [a,b]=Array.from(touches.values());
      const distance=Math.hypot(a.x-b.x,a.y-b.y);
      if(pinchDistance&&distance>0){
        state.zoom=THREE.MathUtils.clamp(state.zoom*distance/pinchDistance,zoomMin,zoomMax);
        updateCamera();
      }
      pinchDistance=distance;
      return;
    }
    if(!down)return;
    const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;
    if(down.moved){
      const area=footprint(camera.position,state.zoom);
      const factor=area?(area.maxX-area.minX)*Math.pow(state.zoom,.55)/Math.max(150,host.clientWidth):0;
      const right=new THREE.Vector3(1,0,0).applyQuaternion(rotation);
      const up=new THREE.Vector3(0,1,0).applyQuaternion(rotation);
      state.offset.addScaledVector(right,-dx*factor).addScaledVector(up,dy*factor);
      state.offset.y=0;
      updateCamera();
    }
    down.lastX=e.clientX;down.lastY=e.clientY;
  };
  const onUp=e=>{
    touches.delete(e.pointerId);
    pinchDistance=null;
    // Keep Blender camera framing; tapping terrain does not recenter.
    down=null;
  };
  const onWheel=e=>{e.preventDefault();state.zoom=THREE.MathUtils.clamp(state.zoom*Math.exp(-e.deltaY*0.001),zoomMin,zoomMax);updateCamera();};
  const canvas=renderer.domElement;
  canvas.style.touchAction="none";
  canvas.addEventListener("pointerdown",onDown);
  canvas.addEventListener("pointermove",onMove);
  canvas.addEventListener("pointerup",onUp);
  canvas.addEventListener("pointercancel",onUp);
  canvas.addEventListener("wheel",onWheel,{passive:false});
  const observer=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);resizeCamera();updateCamera();});
  observer.observe(host);
  renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight),false);
  let frame=0,disposed=false;
  function draw(){if(disposed)return;frame=requestAnimationFrame(draw);renderer.render(scene,camera);}
  draw();
  // Visual QA only adjusts this browser's camera, never persistent game data.
  const qaViews=[{id:"overview",label:"World overview",zoom:2},{id:"center",label:"Terrain center",zoom:8},{id:"close",label:"Terrain close-up",zoom:16}];
  const qaView=id=>{
    const view=qaViews.find(v=>v.id===id);if(!view)return false;
    state.zoom=view.zoom;state.offset.set(0,0,0);updateCamera();return true;
  };
  const qaCapture=()=>{
    renderer.render(scene,camera);
    const a=document.createElement("a");
    a.download="Kingdoms_QA_"+new Date().toISOString().replace(/[:.]/g,"-")+".png";
    a.href=renderer.domElement.toDataURL("image/png");a.click();
  };
  placement.setQAHandler?.({views:qaViews,view:qaView,capture:qaCapture});
  return ()=>{placement.setQAHandler?.(null);disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onUp);canvas.removeEventListener("wheel",onWheel);gameSun.shadow.map?.dispose();groundMaterials.forEach(material=>material.dispose());renderer.dispose();starTexture.dispose();};
}
