import * as THREE from '../assets/js/three.min';
import Sea from './Sea';
import Sky from './Sky';
import Airplane from './Airplane';
// import * as THREE from 'three';
// import Game from '../game/Game';

class Game {

    //THREEJS RELATED VARIABLES
    scene;
    camera;
    fieldOfView;
    aspectRatio;
    nearPlane;
    farPlane;
    HEIGHT;
    WIDTH;
    renderer;
    container;

    //LIGHTS
    hemisphereLight;
    shadowLight;
    ambientLight;

    airplane;
    sea;
    sky;

    mousePos = {
        x: 0,
        y: 0
    };

    createScene() {
        // Get the width and the height of the screen,
        // use them to set up the aspect ratio of the camera 
        // and the size of the renderer.
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;

        // Create the scene
        this.scene = new THREE.Scene();

        // Add a fog effect to the scene; same color as the
        // background color used in the style sheet
        this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

        // Create the camera
        this.aspectRatio = this.WIDTH / this.HEIGHT;
        this.fieldOfView = 60;
        this.nearPlane = 1;
        this.farPlane = 10000;
        this.camera = new THREE.PerspectiveCamera(
            this.fieldOfView,
            this.aspectRatio,
            this.nearPlane,
            this.farPlane
        );

        // Set the position of the camera
        this.camera.position.x = 0;
        this.camera.position.z = 200;
        this.camera.position.y = 100;

        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({
            // Allow transparency to show the gradient background
            // we defined in the CSS
            alpha: true,

            // Activate the anti-aliasing; this is less performant,
            // but, as our project is low-poly based, it should be fine :)
            antialias: true
        });

        // Define the size of the renderer; in this case,
        // it will fill the entire screen
        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        // Enable shadow rendering
        this.renderer.shadowMap.enabled = true;

        // Add the DOM element of the renderer to the 
        // container we created in the HTML
        this.container = document.getElementById('world');
        this.container.appendChild(this.renderer.domElement);

        // Listen to the screen: if the user resizes it
        // we have to update the camera and the renderer size
        window.addEventListener('resize', this.handleWindowResize.bind(this), false);
    }

    createLights() {
        // an ambient light modifies the global color of a scene and makes the shadows softer
        this.ambientLight = new THREE.AmbientLight(0xdc8874, .5);
        this.scene.add(this.ambientLight);
        //A hemsphere light is a gradient colored light
        //the first parameter is the sky color, the second parameter is the groudn color,
        //the third parameter is the intensity of the light
        this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

        //A directional light shines from a specific direction
        //It acts like the sun, that means that all the rays produced are paralel
        this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);

        //set the direction of the light
        this.shadowLight.position.set(150, 350, 350);

        //Allow shadow casting
        this.shadowLight.castShadow = true;

        //Define the visible area of the projected shadow
        this.shadowLight.shadow.camera.left = -400;
        this.shadowLight.shadow.camera.right = 400;
        this.shadowLight.shadow.camera.top = 400;
        this.shadowLight.shadow.camera.bottom = -400;
        this.shadowLight.shadow.camera.near = 1;
        this.shadowLight.shadow.camera.far = 1000;

        //Define the resolution of the shadow; the higher the better
        //but also the more expensive and less performant
        this.shadowLight.shadow.mapSize.width = 2048;
        this.shadowLight.shadow.mapSize.height = 2048;

        //to activae the lights. just add them to the scene
        this.scene.add(this.hemisphereLight);
        this.scene.add(this.shadowLight);
    }

    updatePlane() {
        //let's move the plane between -100 and 100 on the horizontal axis
        //and between 25 and 175 on the vertical axis,
        //depending on the mouse position which ranges between -1 and 1 on both axes;
        //to achieve that we use a normalize function 
        var targetX = this.normalize(this.mousePos.x, -1, 1, -100, 100);
        var targetY = this.normalize(this.mousePos.y, -1, 1, 25, 175);

        //update the airplane position
        // Move the plane at each frame by adding a fraction of the remaining distance
        this.airplane.mesh.position.y += (targetY - this.airplane.mesh.position.y) * 0.1;
        // this.airplane.mesh.position.y = targetY;
        this.airplane.mesh.position.x = targetX;

        // Rotate the plane proportionally to the remaining distance
        this.airplane.mesh.rotation.z = (targetY - this.airplane.mesh.position.y) * 0.0128;
        this.airplane.mesh.rotation.x = (this.airplane.mesh.position.y - targetY) * 0.0064;

        //rotate the prppeller, the sea and the sky
        this.airplane.propeller.rotation.x += 0.3;
        this.airplane.pilot.updateHairs();
    }

    handleMouseMove(event) {
        // here we are converting the mouse position value recived to a normalized value varying between -1 and 1
        //this is the formula for the horizontal axis
        var tx = -1 + (event.clientX / this.WIDTH) * 2;

        //for the vertical axis, we need to inverse the formula
        //because the 2D yaxis goes the opposite direction of the 3D y-axis
        var ty = 1 - (event.clientY / this.HEIGHT) * 2;
        this.mousePos = { x: tx, y: ty };
    }

    normalize(v, vmin, vmax, tmin, tmax) {
        var nv = Math.max(Math.min(v, vmax), vmin);
        var dv = vmax - vmin;
        var pc = (nv - vmin) / dv;
        var dt = tmax - tmin;
        var tv = tmin + (pc * dt);
        return tv;
    }

    loop() {

        this.sea.mesh.rotation.z += 0.005;
        this.sky.mesh.rotation.z += 0.01;

        //update the plabe on each frame
        this.updatePlane();
        this.sea.moveWaves();



        //render tge scene
        this.renderer.render(this.scene, this.camera);

        //call the loop function again
        requestAnimationFrame(this.loop.bind(this));
    }

    handleWindowResize() {
        //update height and width of the renderer and the camera
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.camera.aspect = this.WIDTH / this.HEIGHT;
        this.camera.updateProjectionMatrix();
    }

    createSky() {
        this.sky = new Sky();
        this.sky.mesh.position.y = -600;
        this.scene.add(this.sky.mesh);
    }

    createSea() {
        this.sea = new Sea();

        //push it a little bit at bottom of the screen
        this.sea.mesh.position.y = -600;

        //add the mesh of the sea to the scene
        this.scene.add(this.sea.mesh);
    }

    createPlane() {
        this.airplane = new Airplane();
        this.airplane.mesh.scale.set(.25, .25, .25);
        this.airplane.mesh.position.y = 100;
        this.scene.add(this.airplane.mesh);
    }

    init() {

        // set up the scene, the camera and the renderer
        this.createScene();

        // add the lights
        this.createLights();

        // add the objects
        this.createSea();

        this.createSky();
        this.createPlane();

        //add the listener
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        // start a loop that will update the objects' positions 
        // and render the scene on each frame
        this.loop();

    }
}

export default Game;