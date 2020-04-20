import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';
import GLTFLoader from 'three-gltf-loader';
import FaceTracker from './FaceTracker'
import AudioManager from './AudioManager/AudioManager'

window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};


function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({
    canvas
  });

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  let video;
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');
  let lightGroup = new THREE.Group()
  scene.add(lightGroup)
  let objectGroup = new THREE.Group()
  scene.add(objectGroup)
  let webcamTexture;
  let tuple = getVideo()
  let parentDebrisGroup = new THREE.Group()
  scene.add(parentDebrisGroup);
  let debrisGroupA = new THREE.Group()
  parentDebrisGroup.add(debrisGroupA)
  let debrisGroupB = new THREE.Group()
  parentDebrisGroup.add(debrisGroupB)
  let debrisGroupC = new THREE.Group()
  parentDebrisGroup.add(debrisGroupC)
  video = tuple[0]
  webcamTexture = tuple[1]
  let facetracking = new FaceTracker(render)
  let rotationVector = new THREE.Vector3(0, 0, -10)
  let heart;
  let animationMixer;

  let clock = new THREE.Clock();

  let audioManager = new AudioManager()
  audioManager.initAudioListener()
  

  let debrisMixers = []
  let debrisAnimations = [];


  {
    const color = 0xff0000;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-15, 15, 5);
    lightGroup.add(light);
    lightGroup.add(light.target);
    
  }


  {
    const color = 0x0000ff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(15, 15, 5);
    lightGroup.add(light);
    lightGroup.add(light.target);
    
  }

  {
    const color = 0xffffcc;
    const intensity = 0.6;
    const light = new THREE.HemisphereLight(color, intensity);
    light.position.set(0,0,0);
    lightGroup.add(light);
    
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }


  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./models/gltf/Heart/heart.gltf', (gltf) => {
    const root = gltf.scene;
    //console.log(gltf.animations)
    animationMixer = new THREE.AnimationMixer(root)
    let heartbeat = animationMixer.clipAction(gltf.animations[0])
    heartbeat.play();
    animationMixer.timeScale = 0.5

    root.traverse((node) => {
      if (node.isMesh) {

        if (webcamTexture) {
          node.material.map = webcamTexture;

        } else {
          node.material = new THREE.MeshPhongMaterial({
            color: 0xdddddd,
            specular: 0x009900,
            shininess: 30,
            flatShading: true
          })
        }
        // node.material.color = new THREE.Color("#000000");
        // // node.material.normalMap = this.normalMap;
        node.material.morphTargets = true;
        // node.s
      }
    })
    scene.add(root);

    // compute the box that contains all the stuff
    // from root and below
    const box = new THREE.Box3().setFromObject(root);

    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    // set the camera to frame the box
    frameArea(boxSize*1.5, boxSize, boxCenter, camera);

    objectGroup.add(root)


    // update the Trackball controls to handle the new size
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  });

  gltfLoader.load('./models/gltf/Debris-01/Debris-01.gltf', (gltf) => {
    const debris = gltf.scene;

    debrisAnimations.push(gltf.animations[0])
    console.log(gltf)
    for (let i = 0; i < 5; i++) {
      let particle = debris.clone()
      
      particle.scale.setScalar(Math.random() * 2 + 0.5)
      let theta = Math.random() * Math.PI
      let psi = Math.random() * Math.PI
      particle.position.set(5 * Math.sin(theta) * Math.cos(psi), 5 * Math.sin(theta) * Math.sin(psi), 5 * Math.cos(theta))
      debrisGroupA.add(particle)
    

    }


  });

  gltfLoader.load('./models/gltf/New-Debris-02/Debris02.gltf', (gltf) => {
    const debris = gltf.scene;
    debrisAnimations.push(gltf.animations[0])


    for (let i = 0; i < 3; i++) {
      let particle = debris.clone()
      particle.scale.setScalar(Math.random() * 0.25 + 0.25)
      let theta = Math.random() * 2 * Math.PI
      let psi = Math.random() * 2 * Math.PI
      particle.position.set(5 * Math.sin(theta) * Math.cos(psi), 5 * Math.sin(theta) * Math.sin(psi), 5 * Math.cos(theta))

      debrisGroupB.add(particle)
      let mixer = new THREE.AnimationMixer(particle);
      mixer.clipAction(gltf.animations[0]).play()
      mixer.timeScale = 0.25
      mixer.setTime(Math.random())
      debrisMixers.push(mixer)
    }


  });

  gltfLoader.load('./models/gltf/Debris-03/Debris03.gltf', (gltf) => {
    const debris = gltf.scene;

    debrisAnimations.push(gltf.animations[0])

    for (let i = 0; i < 5; i++) {
      let particle = debris.clone()
      particle.scale.setScalar(Math.random() * 0.15 + 0.025)
      let theta = Math.random() * Math.PI
      let psi = Math.random() * Math.PI
      particle.position.set(5 * Math.sin(theta) * Math.cos(psi), 5 * Math.sin(theta) * Math.sin(psi), 5 * Math.cos(theta))
      debrisGroupC.add(particle)
      let mixer = new THREE.AnimationMixer(particle);
      mixer.clipAction(gltf.animations[0]).play()
      mixer.setTime(Math.random())
      debrisMixers.push(mixer)
    }


  });


  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    renderer.setPixelRatio(window.innerWidth < 768 ? Math.min(3, window.devicePixelRatio) : window.devicePixelRatio);
    return needResize;
  }


  function easeOutCubic(x) {
    return x * x * x * x * x;
  }

  function easeOutExpo(x) {
    return 1 - (1 - x) * (1 - x);
  }


  function render(mv, mouth) {
    let audioMult = 0;
    let delta = clock.getDelta()
    if (mv) {
      // //console.log(objectGroup)
      // console.log(mv.detected)
      if (mv.detected > 0.01) {
        objectGroup.position.lerp(new THREE.Vector3(-mv.x * 2.5, mv.y * 2.5, 0), 0.23)
        parentDebrisGroup.position.lerp(new THREE.Vector3(-mv.x * 3, mv.y * 3, 0), 0.053)

        rotationVector.lerp(new THREE.Vector3(mv.rx, mv.ry, 0), 0.1)
        objectGroup.rotation.x = rotationVector.x * 3 
        objectGroup.rotation.y = -rotationVector.y * 3 +Math.PI

      } else {
        objectGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.053)
        parentDebrisGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.03)
        
      }

      animationMixer.timeScale = audioManager.getAudioLevel()
    }
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    audioMult = easeOutCubic(audioManager.getAudioLevel()) * 0.25 + 0.005;
    if (animationMixer) {
      animationMixer.update(delta)
    }
    for (let i = 0; i < debrisMixers.length; i++) {
      if (debrisMixers[i]) {
          debrisMixers[i].update(delta);
    }

    // if(mouth){
    //   scene.background = new THREE.Color('red');

    // } else {
    //   scene.background = new THREE.Color('white');

    // }
  }

    debrisGroupA.rotation.x += (0.002 + audioMult)
    debrisGroupA.rotation.y += (0.002 + audioMult)
    debrisGroupB.rotation.x += (0.0015 + audioMult)
    debrisGroupB.rotation.y -= (0.0015 + audioMult)
    debrisGroupC.rotation.x -= (0.0011 + audioMult)
    debrisGroupC.rotation.y += (0.001 + audioMult)
    renderer.render(scene, camera);

  }

}




main();

function getVideo() {

  // return new Promis
  let video, texture;

  video = document.getElementById('video');

  texture = new THREE.VideoTexture(video);
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

    var constraints = {
      video: {
        width: 1280,
        height: 720,
        facingMode: 'user'
      }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

      // apply the stream to the video element used in the texture

      video.srcObject = stream;
      video.play();

    }).catch(function (error) {

      console.error('Unable to access the camera/webcam.', error);

    });
    return [video, texture];
  } else {

    console.error('MediaDevices interface not available.');
    return null;
  }
}