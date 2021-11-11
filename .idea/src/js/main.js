import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/STLLoader.js';

var mesh,
    renderer,
    scene,
    camera,
    controls,
    geometry,
    cubes,
    points,
    lineGeometry,
    material,
    line,
    gtlfLoader,
    // track mouse
    mouseX = 0, mouseY = 0,
    // hold particles
    particles = [];

let gltfLoader = new GLTFLoader().setPath('./res/gltf/cube/');

function init() {
    //=================//
    // Create a scene ||
    //=================//

    // -- scene: parent obj where all rendered obj, lights, and cameras live
    scene = new THREE.Scene();

    // -- camera: obj allows us to see other obj
    // Parameters:
    // FOV - Field of View - number in degrees representing vertical field of view - up down
    // Aspect Ratio: ratio between width and height (width divided by height) - innerWidth/Height grabs window size
    // Near Clipping Plane: plane closest to the camera - current val is max - anything closer and nothing is rendered
    // Far Clipping Plane: plane furtherst from camera - current val is max - anything bigger and nothing will be rendered
    // setting far clipping to be =< near clipping then nothing will be rendered
    camera = new THREE.PerspectiveCamera(
        45, window.innerWidth / window.innerHeight, 1, 1000);

    // move came towards the back so we can see
    // default 0,0,0
    // z increases as it comes out of the screen 'towards' you
    camera.position.z = -800;

    // -- renderer: obj renders scene using WebGL
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;

    var light = new THREE.AmbientLight(0x888888);
    scene.add(light);

    var light = new THREE.DirectionalLight(0xcccccc, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    light.caseShadow = true;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 15;
    light.shadow.camera.fov = 45;

    light.shadow.camera.left = -1;
    light.shadow.camera.right = 1;
    light.shadow.camera.top = 1;
    light.shadow.camera.bottom = -1;

    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 1024 * 2;

    // set color of bg in hex - 0-1 can be set for alpha - opacity
    renderer.setClearColor("#1c1624");
    // sets size of app
    renderer.setSize(window.innerWidth, window.innerHeight);
    // appends renderer to html doc as canvas to draw in browser
    document.body.appendChild(renderer.domElement);

    // -- controls: allows mouse controls such as click+drag, zoom, etc.
    // Add mouse controls
    controls = new OrbitControls(camera, renderer.domElement);

    // -- gtlf: load gtlf object resource
    //loadGltf();

    // -- stl: load spacecraft stl object resource
    loadSpacecraft();

    // visible axes for x,y,z planes
    // TODO: remove later
    scene.add(new THREE.AxesHelper(150));

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Responsive Design //
    // allow for window resizing //
    window.addEventListener('resize', () => { // if window is resized
        renderer.setSize(window.innerWidth, window.innerHeight); // identify new win size
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); // apply new changes to new win size
    });
}

function addStars() {

    // set interval val is in milliseconds - so convert frames per sec
    // to mils per frame
    // take 1000 which is the num of mils in one second
    // divide it by your frame rate

    // particles - called point sprinte or bill-board
    // create random filed of particle objects

    // move from -1000 super far to closer which is 1000 where the cam is
    // and this will add random particles
    // at every z position
    for (var zpos = -1000; zpos < 1000; zpos += 6) {
        // dynamic object initialisation method
        var geometry = new THREE.SphereGeometry(0.2, 10, 10);

        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        //make particle
        var particle = new THREE.Mesh(geometry, material);

        // give random (x,y) coords between -500 to 500
        particle.position.x = Math.random() * 1000 - 300;
        particle.position.y = Math.random() * 1000 - 500;
        // math.random returns 0 - 1 but not 1 inclusive
        // we multiply that by 1000 giving us 1000 or 0
        // and subtracting 500 from this value
        // resulting in 0 - 500 or 1000 - 500
        // which equals -500 or 500

        // z position
        particle.position.z = zpos;

        // make it bigger
        particle.scale.x = particle.scale.y = 2;
        // add to scene
        scene.add(particle);
        /// add particle to particle array
        particles.push(particle);

    }
}

/// create a random between any two values
function randomRange(min, max) {
    return Math.random() * (max-min) + min;
}

function animateStars() {
    for(var i = 0; i<particles.length; i++) {
        var particle = particles[i];
        // move particle forward based on mouse y position
        particle.position.z += mouseY * 0.1;

        // if particle is too close move it backwards
        if(particle.position.z > 1000) particle.position.z -=2000;
    }

    particle.rotation.y += 0.002;
}

function loadGltf() {
    // -- gltf: Load a gltf resource file
    // Instantiate a loader
    //gltfLoader = new GLTFLoader();
    // Load a glTF resource
    this.gltfLoader.load(
        // resource URL
        'cube.gltf',
        // called when the resource is loaded
        ( gltf ) => {
            const model = gltf.scene;
            this.scene.add( model );

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        // called while loading is progressing
        ( xhr ) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        // called when loading has errors
        ( error ) => {
            console.log( 'An error happened' );
        }
    );
}

function loadSpacecraft() {

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xb2ffc8,
        //envMap: envTexture,
        metalness: 0.25,
        roughness: 0.1,
        //opacity: 2,
        transparent: false,
        transmission: 0.99,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
    })

    const stlLoader = new STLLoader();
    stlLoader.load(
        '../res/stl/spacecraft/spacecraft_panels_antenna_attached.stl',
        function (geometry) {
            const mesh = new THREE.Mesh(geometry, material)

            // change these values to modify the x,y,z plane that this model sits on when it is loaded.
            mesh.rotation.set(-Math.PI / 2, 0,  Math.PI / 2);
            scene.add(mesh)
        },
        (xhr) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        (error) => {
            console.log(error)
        }
    )
}

// check for XR support
// not working..... need to debug..
async function checkForXRSupport() {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if (supported) {
            var enterXrBtn = document.createElement("button");
            enterXrBtn.innerHTML = "Enter Ar";
            enterXrBtn.addEventListener("click", beginXRSession);
            document.body.appendChild(enterXrBtn);
        } else {
            console.log("Session not supported: ");
        }
    });
}

function beginXRSession() {
    // requestSession must be called within a user gesture event
    // like click or touch when requesting an immersive session.
    navigator.xr.requestSession('immersive-vr')
        .then(onSessionStarted)
        .catch(err => {
            // May fail for a variety of reasons. Probably just want to
            // render the scene normally without any tracking at this point.
            window.requestAnimationFrame(onDrawFrame);
        });
}

// render scene
// animation loop
// redraw scene 60FPS
// keep function at bottom
// needs to reference the above definitions
function animate() {

    // Rotate scene constantly
    // uncomment these lines to see rotation in action.
    //scene.rotation.z -= 0.005;
    //scene.rotation.x -= 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate); // recursive call to animate function
    animateStars();
}

init();
addStars();

checkForXRSupport();
animate();