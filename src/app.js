import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';
import GLTFLoader from 'three-gltf-loader';
import FaceTracker from './FaceTracker'
import AudioManager from './AudioManager/AudioManager'
import {
    EffectComposer,
    EffectPass,
    NoiseEffect,
    RenderPass,
    SMAAEffect,
    VignetteEffect
} from "postprocessing";

import {
    TweenLite
} from 'gsap'


window.mobileCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


export function main(assets) {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        canvas
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    // renderer.shadowMap.needsUpdate = true;
    // renderer.shadowMap.enabled = true;

    // POST PROCESSING
    const composer = new EffectComposer(renderer, {
        frameBufferType: THREE.HalfFloatType
    });
    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);
    let video;
    // const controls = new OrbitControls(camera, canvas);
    // controls.target.set(0, 5, 0);
    // controls.update();

    window.addEventListener('mouth', shoot, false);



    const scene = new THREE.Scene();
      scene.background = new THREE.Color('black');
    // scene.background = assets.get("sky");
    let lightGroup = new THREE.Group()
    scene.add(lightGroup)
    let objectGroup = new THREE.Group()
    scene.add(objectGroup)
    let webcamTexture;
    let tuple = getVideo()
    let parentDebrisGroup = new THREE.Group()
    scene.add(parentDebrisGroup);
    let debrisGroupA = new THREE.Group()
    debrisGroupA.position.set(0, 0, 0)
    parentDebrisGroup.add(debrisGroupA)
    let debrisGroupB = new THREE.Group()
    parentDebrisGroup.add(debrisGroupB)
    let debrisGroupC = new THREE.Group()
    parentDebrisGroup.add(debrisGroupC)
    video = tuple[0]
    webcamTexture = tuple[1]
    let facetracking = new FaceTracker(render)
    let rotationVector = new THREE.Vector3(0, 0, -10)
    // let heart;
    let animationMixer;

    let clock = new THREE.Clock();

    let audioManager = new AudioManager()
    audioManager.initAudioListener()


    let debrisMixers = []
    let debrisAnimations = [];

    var sphere = new THREE.SphereBufferGeometry(0.05, 16, 8);

    let light1 = new THREE.PointLight(0xff0000, 1, 30);
    light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        color: 0xff0040
    })));
    scene.add(light1);

    let light2 = new THREE.PointLight(0x0000ff, 1, 30);
    light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
        color: 0x0040ff
    })));
    scene.add(light2);

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.2)
    scene.add(hemiLight)



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

    const heart = assets.get("heart")
    const root = heart.scene;
    //console.log(heart.animations)
    animationMixer = new THREE.AnimationMixer(root)
    let heartbeat = animationMixer.clipAction(heart.animations[0])
    heartbeat.play();
    // animationMixer.timeScale = 0.5

    root.traverse((node) => {
        if (node.isMesh) {

            if (webcamTexture) {
                node.material.map = webcamTexture;
                //   node.material.map.scale.x = 0.5
                // node.material.map.center.x = 2
                // node.material.map.offset.x = 0.05
                node.material.map.repeat.x = 2
                node.material.map.rotation = 0.05
                node.scale.setScalar(2)
                // node
                console.log(node.material)

            } else {
                node.material = new THREE.MeshPhongMaterial({
                    color: 0xdddddd,
                    specular: 0x009900,
                    shininess: 30,
                    flatShading: true
                })
                node.material.offset.x = 10
            }
            // node.material.color = new THREE.Color("#000000");
            // // node.material.normalMap = this.normalMap;
            node.material.morphTargets = true;
            // node.s
        }
    })

    // root
    scene.add(root);

    // compute the box that contains all the stuff
    // from root and below
    const box = new THREE.Box3().setFromObject(root);

    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    // set the camera to frame the box
    frameArea(boxSize * 0.35, boxSize, boxCenter, camera);

    objectGroup.add(root)


    // update the Trackball controls to handle the new size
    // controls.maxDistance = boxSize * 10;
    // controls.target.copy(boxCenter);
    // controls.update();





    const stick = assets.get("stick")
    const rock = assets.get("rock")

    const debris = rock.scene;
    // debrisAnimations.push(gltf.animations[0])


    for (let i = 0; i < 25; i++) {
        let particle = debris.clone()
        particle.scale.setScalar(Math.random() * 1.25 + 2.0)
        let theta = Math.random() * 2 * Math.PI
        let psi = Math.random() * 2 * Math.PI
        particle.position.set(20 * Math.sin(theta) * Math.cos(psi), 20 * Math.sin(theta) * Math.sin(psi), 20 * Math.cos(theta))

        debrisGroupB.add(particle)
        // let mixer = new THREE.AnimationMixer(particle);
        // mixer.clipAction(gltf.animations[0]).play()
        // mixer.timeScale = 0.25
        // mixer.setTime(Math.random())
        // debrisMixers.push(mixer)
    }

    const debris2 = stick.scene;

    // debrisAnimations.push(gltf.animations[0])

    for (let i = 0; i < 9; i++) {
        let particle = debris2.clone()
        particle.scale.setScalar(Math.random() * 0.25 + 2.0)
        let theta = Math.random() * Math.PI
        let psi = Math.random() * Math.PI
        particle.position.set(20 * Math.sin(theta) * Math.cos(psi), 20 * Math.sin(theta) * Math.sin(psi), 20 * Math.cos(theta))
        debrisGroupC.add(particle)
        // let mixer = new THREE.AnimationMixer(particle);
        // // mixer.clipAction(gltf.animations[0]).play()
        // mixer.setTime(Math.random())
        // debrisMixers.push(mixer)
    }





    //   Mouth Effect

    function shoot() {
        console.log("shoot")
        // // let m
        // let debris = assets.get("rock").scene
        // let theta = Math.random() * Math.PI
        // let psi = Math.random() * Math.PI
        // debris.position.set( Math.sin(theta) * Math.cos(psi),  Math.sin(theta) * Math.sin(psi),  Math.cos(theta))
        // debris.scale.setScalar(20)
        // debrisGroupB.add(debris)
        // TweenLite.to(debris.position, 5, {
        //     x: camera.position.x, 
        //     y: camera.position.y, 
        //     z: camera.position.z+10
        // })
    }

    // Passes.
    const smaaEffect = new SMAAEffect(
        assets.get("smaa-search"),
        assets.get("smaa-area")
    );




    const noiseEffect = new NoiseEffect({
        premultiply: true
    });
    const vignetteEffect = new VignetteEffect();

    const renderPass = new RenderPass(scene, camera);
    const effectPass = new EffectPass(
        camera,
        // noiseEffect,
        // vignetteEffect,
        // smaaEffect,

    );

    // noiseEffect.blendMode.opacity.value = 0.5;

    composer.addPass(renderPass);
    composer.addPass(effectPass);



    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        // renderer.setPixelRatio(window.innerWidth < 768 ? Math.min(3, window.devicePixelRatio) : window.devicePixelRatio);
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
                objectGroup.position.lerp(new THREE.Vector3(-mv.x*5, mv.y*5, 0), 0.05)
                parentDebrisGroup.position.lerp(new THREE.Vector3(-mv.x*5, mv.y*5, 0), 0.05)

                rotationVector.lerp(new THREE.Vector3(mv.rx, mv.ry, 0), 0.05)
                objectGroup.rotation.x = rotationVector.x * 3
                objectGroup.rotation.y = -rotationVector.y * 3 + Math.PI
                objectGroup.rotation.z = Math.PI


            } else {
                objectGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.053)
                parentDebrisGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.03)
                objectGroup.rotation.z = Math.PI

            }

            animationMixer.timeScale = audioManager.getAudioLevel() + 0.2
        }
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        audioMult = easeOutCubic(audioManager.getAudioLevel()) * 0.425 + 0.005;
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

        debrisGroupA.rotation.x += (0.0002 + audioMult)
        debrisGroupA.rotation.y += (0.0002 + audioMult)
        debrisGroupB.rotation.x += (0.00015 + audioMult)
        debrisGroupB.rotation.y -= (0.00015 + audioMult)
        debrisGroupC.rotation.x -= (0.00011 + audioMult)
        debrisGroupC.rotation.y += (0.0001 + audioMult)

        parentDebrisGroup.scale.setScalar(1.1-audioManager.getAudioLevel())
        objectGroup.scale.setScalar(2-audioManager.getAudioLevel())


        updateLights(clock.getElapsedTime())
        renderer.render(scene, camera);
        // composer.render(clock.getDelta());


    }


    function updateLights(time) {
        light1.position.x = Math.sin(time * 0.7) * 10;
        light1.position.y = Math.cos(time * 0.5) * 15;
        light1.position.z = Math.cos(time * 0.3) * 10;

        light2.position.x = Math.cos(time * 0.3) * 10;
        light2.position.y = Math.sin(time * 0.5) * 15;
        light2.position.z = Math.sin(time * 0.7) * 10;




    }
}




// main();

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