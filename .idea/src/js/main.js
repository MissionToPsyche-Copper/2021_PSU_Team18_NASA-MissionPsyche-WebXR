import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/loaders/MTLLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/renderers/CSS2DRenderer.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.120.1/examples/jsm/webxr/VRButton.js';

var mesh,
    renderer,
    cssrenderer,
    scene,
    camera,
    orbitControls,
    geometry,
    cubes,
    points,
    lineGeometry,
    material,
    line,
    gtlfLoader,
    spacecraftMesh,
    gammaRaySpectrometerMesh,
    neutronSpectrometerMesh,
    magnetometerMesh,
    envTexture,
    raycaster,
    // raycaster "object intersected"
    INTERSECTED,
    previousObjectSelected = "",
    objectSelected,
    // track mouse
    mouseX = 0, mouseY = 0,
    // hold particles
    particles = [];

var orbit="init";
var moveAway = true;
var loaded=false;

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
        45, window.innerWidth / window.innerHeight, 0.1, 4000);

    // -- renderer: obj renders scene using WebGL
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;

    // -- raycaster: intersect object models & register events based on mouse interactions
    raycaster = new THREE.Raycaster();

    document.body.appendChild( VRButton.createButton( renderer ) );
    renderer.xr.enabled = true;

    // -- lighting
    scene.add(new THREE.AmbientLight(0x888888));

    var light = new THREE.DirectionalLight(0xcccccc, 1);
    light.position.set(0.5, 5, 5);
    scene.add(light);
    light.caseShadow = true;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 45;
    light.shadow.camera.fov = 55;

    light.shadow.camera.left = -10;
    light.shadow.camera.right = 1;
    light.shadow.camera.top = 1;
    light.shadow.camera.bottom = -10;

    light.shadow.bias = 0.001;
    light.shadow.mapSize.width = 1024 * 3;

    // set color of bg in hex - 0-1 can be set for alpha - opacity
    renderer.setClearColor("#02020A");
    // sets size of app
    renderer.setSize(window.innerWidth, window.innerHeight);
    // appends renderer to html doc as canvas to draw in browser
    document.body.appendChild(renderer.domElement);

    // -- controls: allows mouse controls such as click+drag, zoom, etc.
    // Add mouse controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.minDistance = 4;
    orbitControls.maxDistance = 60;

    // css renderer testing
    // displays that psyche label in the scene
    // using this for testing
    const psycheDiv = document.createElement('label-psyche');
    psycheDiv.textContent = 'Psyche';
    psycheDiv.style.marginTop = '-1em';
    psycheDiv.style.color = 'white';
    const psycheLabel = new CSS2DObject(psycheDiv);
    psycheLabel.position.set(-200,10,0);
    scene.add(psycheLabel);

    document.getElementById("tip").style.visibility = 'hidden';
    document.getElementById("orbit-a").style.visibility = 'hidden';
    document.getElementById("orbit-b").style.visibility = 'hidden';
    document.getElementById("orbit-c").style.visibility = 'hidden';
    document.getElementById("orbit-d").style.visibility = 'hidden';
    // document.getElementById("16psyche").style.display = 'none';
    // document.getElementById("instrument").style.display = 'none';

    // allows me to display the css elements in our scene
    cssrenderer = new CSS2DRenderer();
    cssrenderer.setSize(window.innerWidth/2, window.innerHeight/2);
    cssrenderer.domElement.style.position = 'absolute';
    cssrenderer.domElement.style.top = '0px';
    document.body.appendChild(cssrenderer.domElement);

    // -- models: load object model resources
    loadPsyche('A'); // load psyche in orbit A can be updated later

    // Button listeners for the orbits
    const buttonOrbitA = document.getElementById('orbitA');
    buttonOrbitA.addEventListener('click', function(){
        if(orbit != "A") {
            orbit = "A";
            changeOrbit(orbit);
            document.getElementById("tip").style.visibility = 'visible';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'hidden';
            document.getElementById("orbit-c").style.visibility = 'hidden';
            document.getElementById("orbit-d").style.visibility = 'hidden';
        }
    });

    const buttonOrbitB = document.getElementById('orbitB');
    buttonOrbitB.addEventListener('click', function(){
        if(orbit != "B") {
            orbit = "B";
            changeOrbit(orbit);
            document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'visible';
            document.getElementById("orbit-c").style.visibility = 'hidden';
            document.getElementById("orbit-d").style.visibility = 'hidden';
        }
    });

    const buttonOrbitC = document.getElementById('orbitC');
    buttonOrbitC.addEventListener('click', function(){
        if(orbit != "C") {
            orbit = "C";
            changeOrbit(orbit);
            document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'hidden';
            document.getElementById("orbit-c").style.visibility = 'visible';
            document.getElementById("orbit-d").style.visibility = 'hidden';
        }
    });

    const buttonOrbitD = document.getElementById('orbitD');
    buttonOrbitD.addEventListener('click', function(){
        if(orbit != "D") {
            orbit = "D";
            changeOrbit(orbit);
            document.getElementById("tip").style.visibility = 'hidden';
            document.getElementById("orbit-a").style.visibility = 'hidden';
            document.getElementById("orbit-b").style.visibility = 'hidden';
            document.getElementById("orbit-c").style.visibility = 'hidden';
            document.getElementById("orbit-d").style.visibility = 'visible';
        }
    });

    scene.fog = new THREE.FogExp2(0x141414, 0.002);

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // for raycaster
        // (TODO: this doesn't seem to be exact, this may need little bit of tweaking
        // based on screen size, etc? y coordinates didn't seem 100% accurate, although
        // changing the constant from 1 to 0.95 has helped a whole lot. Change back to 1
        // to see original raycaster behavior.)
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
// for stars random color generator helper
var rgbToHex = function (rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};
// for stars random color generator
var fullColorHex = function(r,g,b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red+green+blue;
};
// for stars
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
    for (var zpos = -5000; zpos < 2000; zpos += 0.4) {
        // dynamic object initialisation method
        var geometry = new THREE.SphereGeometry(0.3, 5, 5);

        let material = new THREE.MeshBasicMaterial({
            color: generateRandomColor()
        });

        //make particle
        var particle = new THREE.Mesh(geometry, material);

        // give random (x,y) coords between -500 to 500
        particle.position.x = randomRange(-550,200);
        particle.position.y = randomRange(-550,200);
        // math.random returns 0 - 1 but not 1 inclusive
        // we multiply that by 1000 giving us 1000 or 0
        // and subtracting 500 from this value
        // resulting in 0 - 500 or 1000 - 500
        // which equals -500 or 500

        // z position
        particle.position.z = zpos;

        // make it bigger
        particle.scale.x = particle.scale.y = 1;
        // add to scene
        scene.add(particle);
        /// add particle to particle array
        particles.push(particle);

    }
    // need more stars to fill space
    const geo = new THREE.BufferGeometry();
    const vertices = [];

    for ( let i = 0; i < 20000; i++ ) {
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
        vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
        vertices.push( THREE.MathUtils.randFloatSpread( -2000 ) ); // z
    }

    geo.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    const BGparticles = new THREE.Points( geo,
        new THREE.PointsMaterial( { color: generateRandomColor() } ) );
    scene.add( BGparticles );
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
    var spacecraftMaterial = loadModelMaterial(0x8c8c8c);
    loadSpacecraftModel(spacecraftMaterial);

    var neutronSpectrometerMaterial = loadModelMaterial(0xFFFFFF);
    loadNeutronSpectrometer(neutronSpectrometerMaterial);

    var magnetometerMaterial = loadModelMaterial(0xFFFFFF);
    loadMagnetometers(magnetometerMaterial);

    loadImagers();
    loadGammaRaySpectrometer();
}

function loadGammaRaySpectrometer() {
    const objLoader = new OBJLoader();
    objLoader.load('../src/res/stl/instruments/gamma_ray_spectrometer.obj',
        function (gammaRaySpectrometer) {
            gammaRaySpectrometer.position.set(-1.1, 2.7, 0.1);
            gammaRaySpectrometer.rotation.y = (3 * Math.PI) / 2;
            gammaRaySpectrometer.scale.setScalar(0.2);
            gammaRaySpectrometer.name = "gammaRaySpectrometer";
            scene.add(gammaRaySpectrometer);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log('An error occurred');
        }
    );
}

function loadNeutronSpectrometer(material) {
    const stlLoader = new STLLoader();
    stlLoader.load(
        '../src/res/stl/instruments/neutron_spectrometer.stl',
        function (geometry) {
            neutronSpectrometerMesh = new THREE.Mesh(geometry, material)
            neutronSpectrometerMesh.position.set(-1.12,1.8,0.115);
            neutronSpectrometerMesh.rotation.x = -1 * Math.PI / 2;
            neutronSpectrometerMesh.rotation.z = 3 * Math.PI / 2;
            neutronSpectrometerMesh.scale.setScalar(0.14);
            neutronSpectrometerMesh.name = "neutronSpectrometer";
            scene.add(neutronSpectrometerMesh)
        },
        (xhr) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        (error) => {
            console.log(error)
        }
    )
}

function loadImagers() {
    loadImager(-1.175, 1.075, -0.25, 1);
    loadImager(-1.175, 1.075, -0.45, 2);
}

function loadImager(x, y, z, id) {
    const objLoader = new OBJLoader();
    objLoader.load('../src/res/stl/instruments/imager.obj',
        function (imager) {
            imager.position.set(x, y, z);
            imager.rotation.y = Math.PI;
            imager.scale.setScalar(0.09);
            imager.name = "imager" + id;
            scene.add(imager);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log('An error occurred');
        }
    );
}

function loadMagnetometers(material) {
    loadMagnetometer(-1.28, 2.7, -0.85, material);
    loadMagnetometer(-1.28, 2.2, -0.85, material);
}

function loadMagnetometerMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xDEDEDE,
        metalness: 0.25,
        roughness: 0.1,
        transparent: false,
        transmission: 0.99,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
    })
    return material;
}

function loadMagnetometer(x, y, z, material) {
    const stlLoader = new STLLoader();
    stlLoader.load(
        '../src/res/stl/instruments/magnetometer.stl',
        function (geometry) {
            magnetometerMesh = new THREE.Mesh(geometry, material)
            magnetometerMesh.rotation.set(-Math.PI / 2, 0,  Math.PI / 2);
            magnetometerMesh.rotation.y = Math.PI / 2;
            magnetometerMesh.position.set(x,y,z);
            magnetometerMesh.scale.setScalar(0.05);
            magnetometerMesh.name = "magnetometer";
            scene.add(magnetometerMesh)
        },
        (xhr) => {
            console.log(`${( xhr.loaded / xhr.total ) * 100}% loaded`);
        },
        (error) => {
            console.log(error)
        }
    )
}

function loadModelMaterial(color) {
    const material = new THREE.MeshPhysicalMaterial({
        color: color,
        // envMap: envTexture,
        metalness: 0.25,
        roughness: 0.1,
        //opacity: 2,
        transparent: false,
        transmission: 0.99,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25
    })
    return material;
}

function loadSpacecraftModel(material) {
    // Spacecraft Loader
    const stlLoader = new STLLoader();
    stlLoader.load(
        '../src/res/stl/spacecraft/spacecraft_with_frame.stl',
        function (geometry) {
            spacecraftMesh = new THREE.Mesh(geometry, material)
            // change these values to modify the x,y,z plane that this model sits on when it is loaded.

            // orbiting setup (DO NOT DELETE. Use this for final realistic orbiting view.)
            // spacecraftMesh.rotation.set(-Math.PI / 1.8, 0.3,  Math.PI / 2);
            // spacecraftMesh.rotation.z = Math.PI / 1.8;
            // spacecraftMesh.position.set(0,0,0.5);

            // DO NOT DELETE.
            // flat setup is used for loading & aligning other 3d objects.
            spacecraftMesh.rotation.set(-Math.PI / 2, 0,  Math.PI / 2);
            spacecraftMesh.rotation.z = Math.PI / 2;
            spacecraftMesh.position.set(-4,0,0);

            //todo: fix camera zoom to be closer on load.
            spacecraftMesh.scale.set(0.025,0.025,0.025);
            scene.add(spacecraftMesh)
            //camera.lookAt(spacecraftMesh);
            camera.position.x = -80;
            camera.position.y = -20;
            camera.position.z = 150;
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
// displaying enter AR if XR is supported
// if not it will display session not supported in the web dev browser
async function checkForXRSupport() {
    navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if (supported) {
            var enterXrBtn = document.createElement("ar");
            enterXrBtn.innerHTML = "ENTER AR";
            enterXrBtn.addEventListener("click", beginXRSession);
            document.body.appendChild(enterXrBtn);
        } else {
            console.log("Session not supported: ");
        }
    });
}

// update radius
function changeOrbit(orbit = char){
    var psyche = scene.getObjectByName( "psyche" );
    var x, y, z;
    switch(orbit) {
        case "A":
            x = -125;
            y = -25;
            z = 0;
            break;
        case "B":
            x = -100;
            y = -25;
            z = 0;
            break;
        case "C":
            x = -75;
            y = -25;
            z = 0;
            break;
        case "D":
            x = -50;
            y = -25;
            z = 0;
            break;
    }
    psyche.position.set(x, y, z);
}

// not working need to debug...
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

// Psyche object
function loadPsyche(orbit=char) {

    // psyche loader
    const objLoader = new OBJLoader();
    objLoader.load('../src/res/psyche.obj',
        function (psyche) {
            psyche.position.set(-125, -25, 0);
            psyche.scale.setScalar(15);
            psyche.name = "psyche";
            scene.add(psyche);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        function(error) {
            console.log('An error occurred');
        }
    );
}

// ability to interact with obj on screen
function renderRaycaster() {
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children, true );
    if (intersects.length > 0) {
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
            objectSelected = INTERSECTED;
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

document.body.onmousedown = function() {
    if(objectSelected != null) {
        if(objectSelected.parent.name == "spacecraft") {
            onSpacecraftClicked();
        }
        if(objectSelected.parent.name == "gammaRaySpectrometer") {
            onGammaRaySpectrometerClicked();
        }
        if(objectSelected.name == "neutronSpectrometer") {
            onNeutronSpectrometerClicked();
        }
        if(objectSelected.parent.name == "imager1" || objectSelected.parent.name == "imager2") {
            onImagerClicked();
        }
        if(objectSelected.name == "magnetometer") {
            onMagnetometerClicked();
        }
        if(objectSelected.parent.name == "psyche") {
            onPsycheClicked();
        }
    }
}

function onPsycheClicked() {
    console.log("Psyche clicked");
}

function onSpacecraftClicked() {
    console.log("Spacecraft clicked");
}

function onMagnetometerClicked() {
    console.log("Magnetometer clicked");
}

function onImagerClicked() {
    console.log("Imager clicked");
}

function onNeutronSpectrometerClicked() {
    console.log("Neutron Spectrometer clicked");
}

function onGammaRaySpectrometerClicked() {
    console.log("Gamma Ray Spectrometer clicked");
}

// render scene
// animation loop
// redraw scene 60FPS
// keep function at bottom
// needs to reference the above definitions
function animate() {
    // Rotate scene constantly
    var psyche = scene.getObjectByName( "psyche" );
    if(psyche != null) {
        //rotation
        psyche.rotation.y += 0.0025;

        if(psyche.position.x == -155) moveAway = false;

        //ellipse
        switch(orbit) {
            case "A":
                if(psyche.position.x <= -150) moveAway = false;
                if(psyche.position.x >= -100) moveAway = true;
                break;
            case "B":
                if(psyche.position.x <= -125) moveAway = false;
                if(psyche.position.x >= -75) moveAway = true;
                break;
            case "C":
                if(psyche.position.x <= -100) moveAway = false;
                if(psyche.position.x >= -50) moveAway = true;
                break;
            case "D":
                if(psyche.position.x <= -75) moveAway = false;
                if(psyche.position.x >= -25) moveAway = true;
                break;
        }
        //determine speed of ellipse
        if(moveAway == true) psyche.position.x -= 0.025;
        else psyche.position.x += 0.025;
    }
    renderRaycaster();
    renderer.render(scene, camera);
    cssrenderer.render(scene, camera);

    requestAnimationFrame(animate); // recursive call to animate function
    animateStars();
}

loadSpacecraft();
addStars();
checkForXRSupport();
animate();

/*

*****THE FOLLOWING IS LEGACY CODE FROM WHEN THE SPACECRAFT ORBITED THE ASTEROID*****

// radius changes the orbit distance, but this must also be modified with
// spacecraft placement because as the radius changes, the "starting point"
// must also change.
//not sure why calling multiple times speeds up the orbit, must investigate

function startSpacecraftOrbit(radius) {
    var r = 0, t = -1, a = 1;
    var p = new THREE.Vector3(0, 0, 0);
    var ax = new THREE.Vector3(0, 1, 0);
    var frames = 1000;

    setInterval(function(){
        t ++;
        if (t % frames == 0) {
            a++;
            p.x = (a == 1 ? 1 : -1) * radius;
            r = a == 1 ? -1 : 1;
        }
        spacecraftMesh.rotateAroundWorldAxis(p, ax, r * Math.PI * 2 / frames);
    }, 20);
}

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {

    var q = new THREE.Quaternion();

    return function rotateAroundWorldAxis(point, axis, angle) {
        q.setFromAxisAngle(axis, angle);
        this.applyQuaternion(q);
        this.position.sub(point);
        this.position.applyQuaternion(q);
        this.position.add(point);
        return this;
    }
}();

*****LEGACY CODE FOR REMOVING ENTITIES - STILL WORKS*****

// removes objects
// is this still working or needed?
// yes working, no longer needed - Odhran

function removeEntity(object) {
    var selectedObject = scene.getObjectByName(object.name);
    scene.remove( selectedObject );
    animate();
}

    //this code used to live in changeOrbit()
    loadSpacecraft();
    var radius = 0;
    switch(orbit){
        case "A":
            radius = 125;
            break;
        case "B":
            radius = 100;
            break;
        case "C":
            radius = 75;
            break;
        case "D":
            radius = 50;
            break;
     }

     startSpacecraftOrbit(radius);


// If the spacecraft is not orbiting, we do not need this code.
// It could be good to keep around in case we need it for similar stuff later.

*****END OF LEGACY CODE*****

*/