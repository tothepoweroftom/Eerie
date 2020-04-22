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




    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    // scene.background = assets.get("sky");
    let lightGroup = new THREE.Group()
    scene.add(lightGroup)
    let objectGroup = new THREE.Group()
    scene.add(objectGroup)

    let parentDebrisGroup = new THREE.Group()
    scene.add(parentDebrisGroup);
    let debrisGroupA = new THREE.Group()
    debrisGroupA.position.set(0, 0, 0)
    parentDebrisGroup.add(debrisGroupA)
    let debrisGroupB = new THREE.Group()
    parentDebrisGroup.add(debrisGroupB)
    let debrisGroupC = new THREE.Group()
    parentDebrisGroup.add(debrisGroupC)
    video = document.getElementById('video');

    webcamTexture = new THREE.VideoTexture(video);

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
    } else {

        console.error('MediaDevices interface not available.');

    }


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
  
    // root.traverse((node) => {
    //     if (node.isMesh) {

    //         // if (webcamTexture) {
    //         //     node.material.map = webcamTexture;
    //         //     //   node.material.map.scale.x = 0.5
    //         //     // node.material.map.center.x = 2
    //         //     // node.material.map.offset.x = 0.05
    //         //     node.material.map.repeat.x = 2
    //         //     node.material.map.rotation = 0.05
                

    //         //     // node
                

    //         // } else {
    //         // //   node.material.map = null

    //         // }
      
    //     }
    // })

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
                objectGroup.position.lerp(new THREE.Vector3(-mv.x * 5, mv.y * 5, 0), 0.05)
                parentDebrisGroup.position.lerp(new THREE.Vector3(-mv.x * 5, mv.y * 5, 0), 0.05)

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

        parentDebrisGroup.scale.setScalar(1.1 - audioManager.getAudioLevel())
        objectGroup.scale.setScalar(2 - audioManager.getAudioLevel())


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

    return new Promise((resolve, reject) => {

                // return new Promis
                let video, texture;




            }