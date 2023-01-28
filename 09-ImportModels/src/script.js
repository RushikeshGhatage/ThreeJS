import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { DoubleSide } from 'three';
import * as dat from 'dat-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Global Variables
//Essentials
var	canvas;
var	scene;
var	floor;
var	renderer;
var	camera;
var	controls;

var	requestAnimationFrame_rvg	=	window.requestAnimationFrame		||
window.webkitRequestAnimationFrame	||
								window.mozRequestAnimationFrame	||
								window.oRequestAnimationFrame		||
								window.msRequestAnimationFrame;

//Normal
var	bFullscreen	=	false;

const cursor = {
	x	:	0,
	y	:	0
};

////////////// GLTF //////////////
const dracoLoader	=	new DRACOLoader();
const gltfLoader	=	new GLTFLoader();

var	mixer	=	null;
var	action;

////////////// dat-gui //////////////
const gui	=	new dat.GUI();

////////////// Lights //////////////
var	ambientLight;
var	directionalLight;

var	clock		=	new THREE.Clock();
var	previousTime	=	0;
var	deltaTime		=	0;

var	canvasOriginalWidth;
var	canvasOriginalHeight;

main();

function main()
{
    // Code
	canvas = document.getElementById("RVG");

	if(!canvas)
	{
		console.log("Obtaining Canvas Failed!");
	}
	else
	{
		console.log("Canvas obtained Successfully!");
	}

	canvasOriginalWidth		=	canvas.width;
	canvasOriginalHeight	=	canvas.height;

	window.addEventListener("keydown", keyDown, false);
	window.addEventListener("click", mouseDown, false);
	window.addEventListener("resize", resize, false);

	window.addEventListener("mousemove", (event)=>
	{
		cursor.x	=	event.clientX / canvas.width - 0.5;
		cursor.y	=	-(event.clientY / canvas.height - 0.5);
	});

    initialize();

    resize();

    display();
};

function toggleFullscreen()
{
	var	fullscreen_element	=	document.fullscreenElement		||
							document.webkitFullscreenElement	||
							document.mozFullScreenElement 	||
							document.msFullscreenElement 		||
							null;

	if (fullscreen_element == null)
	{
		if (canvas.requestFullscreen)
		{
			canvas.requestFullscreen();
		}
		else if (canvas.webkitRequestFullscreen)
		{
			canvas.webkitRequestFullscreen();
		}
		else if (canvas.mozRequestFullScreen)
		{
			canvas.mozRequestFullScreen();
		}
		else if (canvas.msRequestFullscreen)
		{
			canvas.msRequestFullscreen();
		}

		bFullscreen	=	true;
	}
	else
	{
		if (document.exitFullscreen)
		{
			document.exitFullscreen();
		}
		else if (document.webkitExitFullscreen)
		{
			document.webkitExitFullscreen();
		}
		else if (document.mozCancelFullScreen)
		{
			document.mozCancelFullScreen();
		}
		else if (document.msExitFullscreen)
		{
			document.msExitFullscreen();
		}

		bFullscreen	=	false;
	}
};

function keyDown(event)
{
	switch(event.keyCode)
	{
		case 70:	//F or f
			toggleFullscreen();
			break;

		case 27:	//Esc
			uninitialize();
			window.close();
			break;

		default:
			break;
	}
};

function mouseDown() 
{
	// Code
};

function initialize()
{
	// Code
	renderer	=	new THREE.WebGLRenderer({	canvas	:	canvas })

	if(!renderer)
	{
		console.log("Obtaining Renderer Failed!");
	}
	else
	{
		console.log("Renderer obtained Successfully!");
	}

	// Create Scene
	scene	=	new THREE.Scene();

	dracoLoader.setDecoderPath('/draco/');
	gltfLoader.setDRACOLoader(dracoLoader);

	// GLTF LOADER
	gltfLoader.load(
		'/models/Fox/glTF/Fox.gltf',
		(gltf)=>
		{
			mixer	=	new THREE.AnimationMixer(gltf.scene);
			action	=	mixer.clipAction(gltf.animations[1]);

			action.play();

			gltf.scene.scale.set(0.025, 0.025, 0.025,);

			scene.add(gltf.scene);
		}
	);

	// Create Mesh
	floor	=	new THREE.Mesh(
		new THREE.PlaneBufferGeometry(10, 10),
		new THREE.MeshStandardMaterial({
			color	:	'#444444',
			metalness	:	0,
			roughness	:	0.5,
			side		:	DoubleSide
		})
	);

	floor.receiveShadow	=	true;
	floor.rotation.x	=	-Math.PI * 0.5;
	scene.add(floor);

	// Add Mesh to Scene
	scene.add(floor);

	/////////// Lights ///////////
	//Ambient Light
	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);

	//Directional Light
	directionalLight	=	new THREE.DirectionalLight(0xffffff, 0.6);
	directionalLight.castShadow			=	true;
	directionalLight.shadow.camera.far		=	15;
	directionalLight.shadow.camera.left	=	-7;
	directionalLight.shadow.camera.top		=	7;
	directionalLight.shadow.camera.right	=	7;
	directionalLight.shadow.camera.bottom	=	-7;
	directionalLight.shadow.mapSize.set(1024, 1024);
	directionalLight.position.set(5, 5, 5);
	scene.add(directionalLight);

	renderer.setClearColor("#000000");
};

function resize()
{
	// Code
	if (bFullscreen == true)
	{
		canvas.width	=	window.innerWidth;
		canvas.height	=	window.innerHeight;
		renderer.setSize(canvas.width, canvas.height);
	}
	else
	{
		canvas.width	=	canvasOriginalWidth;
		canvas.height	=	canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
	}

	renderer.shadowMap.enabled	=	true;
	renderer.shadowMap.type		=	THREE.PCFSoftShadowMap;

	// Set Camera
	camera	=	new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(2, 2, 2);

	// Add camera to Scene
	scene.add(camera);

	controls	=	new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
};

function display()
{
	// Local Variable Declaration
	const elapsedTime	=	clock.getElapsedTime();
	deltaTime			=	elapsedTime - previousTime;
	previousTime		=	elapsedTime;

	//Update Mixer
	if(mixer !== null)
	{
		mixer.update(deltaTime);
	}
	
	// Code
	floor.rotation.x = - Math.PI * 0.5;

	// Draw using Renderer
	renderer.render(scene, camera);

	// Animation Display
	controls.update();
	update();
	requestAnimationFrame_rvg(display, canvas);
};

function update()
{
	//Code
};

function uninitialize()
{
	// Code
	camera	=	null;
	renderer	=	null;
	scene	=	null;
	canvas	=	null;
};
 