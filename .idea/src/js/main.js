import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/OBJLoader.js';

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
    raycaster,
    // raycaster "object intersected"
    INTERSECTED,
    // track mouse
    mouseX = 0, mouseY = 0,
    // hold particles
    particles = [];

// This pointer is used for the raycaster
const pointer = new THREE.Vector2();

// used for gtlf loading (can be removed if we do not end up using any gltf resources,
// more or less just here for example for now.
let gltfLoader = new GLTFLoader().setPath('./res/gltf/cube/');

init();

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

    // -- raycaster: intersect object models & register events based on mouse interactions
    raycaster = new THREE.Raycaster();

    // -- lighting

    scene.add(new THREE.AmbientLight(0x888888));

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
    renderer.setClearColor("#02020A");
    // sets size of app
    renderer.setSize(window.innerWidth, window.innerHeight);
    // appends renderer to html doc as canvas to draw in browser
    document.body.appendChild(renderer.domElement);

    // -- controls: allows mouse controls such as click+drag, zoom, etc.
    // Add mouse controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 400;


    // -- models: load object model resources
    loadSpacecraft();
    loadPsyche("A");

    // visible axes for x,y,z planes
    // TODO: remove later
    scene.add(new THREE.AxesHelper(500));

    scene.fog = new THREE.FogExp2(0x141414, 0.0030);

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // for raycaster
        // (TODO: this doesn't seem to be exact, this may need little bit of tweaking
        // based on screen size, etc? y coordinates didn't seem 100% accurate, although
        // changing the constant from 1 to 0.95 has helped a whole lot. Change back to 1
        // to see original raycaster behavior.
        pointer.x = ( (event.clientX -renderer.domElement.offsetLeft) / renderer.domElement.width ) * 2 - 1;
        pointer.y = -( (event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height ) * 2 + 0.95;
    });

    // Responsive Design //
    // allow for window resizing //
    window.addEventListener('resize', () => { // if window is resized
        renderer.setSize(window.innerWidth, window.innerHeight); // identify new win size
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); // apply new changes to new win size
    });
}

var rgbToHex = function (rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

var fullColorHex = function(r,g,b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red+green+blue;
};

function generateRandomColor()
{
    var randomColor = randomRange(0,6);

    switch(randomColor) {
        case 0: return '#'+fullColorHex(175,201,255);
        case 1: return '#'+fullColorHex(199,216,255);
        case 2: return '#'+fullColorHex(255,244,243);
        case 3: return '#'+fullColorHex(255,229,207);
        case 4: return '#'+fullColorHex(255,217,178);
        case 5: return '#'+fullColorHex(255,199,142);
        case 6: return '#'+fullColorHex(255,166,81);

        default: break;
    }

    //random color will be freshly served
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
    for (var zpos = -5000; zpos < 5000; zpos += 1) {
        // dynamic object initialisation method
        var geometry = new THREE.SphereGeometry(0.2, 5, 5);

        let material = new THREE.MeshBasicMaterial({
            color: generateRandomColor()
        });

        //make particle
        var particle = new THREE.Mesh(geometry, material);

        // give random (x,y) coords between -500 to 500
        particle.position.x = randomRange(-500,600);
        particle.position.y = randomRange(-500,500);
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
    return Math.floor(Math.random() * (max-min + 1) + min);
}

function animateStars() {
    for(var i = 0; i<particles.length; i++) {
        var particle = particles[i];
        // move particle forward based on mouse y position
        particle.position.z += mouseY * 0.0002;

        // if particle is too close move it backwards
        if(particle.position.z > 1000) particle.position.z -=2000;
    }

    particle.rotation.y += 0.00001;
}

function loadSpacecraft() {

    const material = new THREE.MeshPhysicalMaterial({
        color: 0x8c8c8c,
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
        '../src/res/stl/spacecraft/spacecraft_panels_antenna_attached.stl',
        function (geometry) {
            const mesh = new THREE.Mesh(geometry, material)
            // change these values to modify the x,y,z plane that this model sits on when it is loaded.
            mesh.rotation.set(-Math.PI / 2, 0.3,  Math.PI / 2);
            mesh.scale.set(0.025,0.025,0.025);
            mesh.position.set(0,0,0.5);
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

function loadPsyche(orbit=char) {
    var x, y, z;
    switch(orbit)
    {
        case "A":
            x = 100; y = 100; z = 120;
            break;
        case "B":
            x = 80; y = 80; z = 100;
            break;
        case "C":
            x = 60; y = 60; z = 80;
            break;
        case "D":
            x = 40; y = 40; z = 60;
            break;
        default:
            x = 100; y = 100; z = 120;
            break;
    }
    const objLoader = new OBJLoader();
    objLoader.load('../src/res/psyche.obj',
        function (object) {
            //original size and position
            //object.position.set(10, 10, 20);
            //object.scale.setScalar(3);
            object.position.set(x, y, z);
            object.scale.setScalar(20);
            scene.add(object);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log('An error occurred');
        }
    );
}

function renderRaycaster() {

    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children, true );

    if (intersects.length > 0) {

        // TODO: remove this when done, just printing intersections to log
        // for testing purpuses.
        for (var i = 0; i < intersects.length; i++) {
            console.log(intersects[i].face)
        }

        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED){
                material = INTERSECTED.material;
                if(material.emissive){
                    material.emissive.setHex(INTERSECTED.currentHex);
                }
                else{
                    material.color.setHex(INTERSECTED.currentHex);
                }
            }
            INTERSECTED = intersects[0].object;
            material = INTERSECTED.material;
            if(material.emissive){
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                material.emissive.setHex(0xff0000);
            }
            else{
                INTERSECTED.currentHex = material.color.getHex();
                material.color.setHex(0xff0000);
            }
            console.log(INTERSECTED.position);
        }
    } else {
        if (INTERSECTED){
            material = INTERSECTED.material;
            if(material.emissive){
                material.emissive.setHex(INTERSECTED.currentHex);
            }
            else
            {
                material.color.setHex(INTERSECTED.currentHex);
            }
        }
        INTERSECTED = null;
    }
}

// render scene
// animation loop
// redraw scene 60FPS
// keep function at bottom
// needs to reference the above definitions
function animate() {
    // Rotate scene constantly
    // would like to get orbiter to rotate around psyche
    // and make psyche the center of the scene
    scene.rotation.z -= 0.0001;
    scene.rotation.x -= 0.00001;
    renderRaycaster();
    renderer.render(scene, camera);
    requestAnimationFrame(animate); // recursive call to animate function
    animateStars();
}

addStars();
checkForXRSupport();
animate();