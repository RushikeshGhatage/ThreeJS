import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper, DirectionalLightShadow, DoubleSide, MeshLambertMaterial, SpotLight } from 'three';
import * as dat from 'dat-gui';

// Global Variables
//Essentials
var canvas;
var scene;
var material;
var sphere;
var cube;
var torus;
var plane;
var renderer;
var camera;

var requestAnimationFrame_rvg = window.requestAnimationFrame		||
							window.webkitRequestAnimationFrame	||
							window.mozRequestAnimationFrame	||
							window.oRequestAnimationFrame		||
							window.msRequestAnimationFrame;

//Normal
var bFullscreen = false;

const cursor = {
	x: 0,
	y: 0
};

////////////// dat-gui //////////////
var gui = new dat.GUI();
gui.closed = true;

////////////// Lights //////////////
var ambientLight;
var directionalLight;
var spotLight;
var pointLight;

////////////// Helpers //////////////
var directionalLightHelper;

var controls;

var clock = new THREE.Clock();
var canvasOriginalWidth;
var canvasOriginalHeight;

main()

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
		cursor.x = event.clientX / canvas.width - 0.5;
		cursor.y = -(event.clientY / canvas.height - 0.5);
	});

    initialize();

    resize();

    display();
};

function toggleFullscreen()
{
	var fullscreen_element = document.fullscreenElement				||
								document.webkitFullscreenElement	||
								document.mozFullScreenElement		||
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

		bFullscreen = true;
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

		bFullscreen =  false;
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
	renderer = new THREE.WebGLRenderer({ canvas: canvas });

	if(!renderer)
	{
		console.log("Obtaining Renderer Failed!");
	}
	else
	{
		console.log("Renderer obtained Successfully!");
	}

	// Create Scene
	scene = new THREE.Scene();

	// Create Mesh
	const material = new THREE.MeshStandardMaterial();
	material.side = DoubleSide;

	sphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.5, 32, 32),
		material
	);

	sphere.castShadow = true;

	gui
	.add(sphere.material, 'metalness')
	.min(0)
	.max(1)
	.step(0.01);

	gui
	.add(sphere.material, 'roughness')
	.min(0)
	.max(1)
	.step(0.01);

	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(10, 10),
		material
	);
	plane.receiveShadow = true;

	// Add Mesh to Scene
	scene.add(sphere, plane);

	/////////// Lights ///////////
	//Ambient Light
	ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambientLight);

	gui
	.add(ambientLight, 'intensity')
	.min(0.0)
	.max(1.0)
	.step(0.01);

	//Directional Light
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
	
	directionalLight.position.set(2, 1, 2);
	directionalLight.castShadow			=	true;
	directionalLight.shadow.mapSize.width	=	1024;
	directionalLight.shadow.mapSize.height	=	1024;

	directionalLight.shadow.camera.top		=	2;
	directionalLight.shadow.camera.right	=	2;
	directionalLight.shadow.camera.bottom	=	-2;
	directionalLight.shadow.camera.left	=	-2;
	directionalLight.shadow.radius		=	10;
	directionalLight.shadow.camera.near	=	1;
	directionalLight.shadow.camera.far		=	10;

	// const DirectionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
	// scene.add(DirectionalLightCameraHelper)

	scene.add(directionalLight);

	gui.add(directionalLight.shadow, 'radius')
	.min(0)
	.max(100)
	.step(1);

	gui
	.add(directionalLight, 'intensity')
	.min(0.0)
	.max(1.0)
	.step(0.01);

	gui
	.add(directionalLight.position, 'x')
	.min(-1.0)
	.max(1.0)
	.step(0.01);

	gui
	.add(directionalLight.position, 'y')
	.min(-1.0)
	.max(1.0)
	.step(0.01);

	gui
	.add(directionalLight.position, 'z')
	.min(-1.0)
	.max(1.0)
	.step(0.01);


	//Spot Light
	spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
	spotLight.position.set(0, 2.5, -2);

	spotLight.castShadow			=	true;
	spotLight.shadow.mapSize.width	=	1024;
	spotLight.shadow.mapSize.height	=	1024;
	spotLight.shadow.camera.fov		=	50;
	spotLight.shadow.camera.near		=	1;
	spotLight.shadow.camera.far		=	6;

	scene.add(spotLight);
	
	// var spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
	// scene.add(spotLightCameraHelper)

	//Point Light
	pointLight = new THREE.PointLight(0xffffff, 0.3);
	pointLight.position.set(0,3,0);

	pointLight.castShadow			=	true;
	pointLight.intensity			=	0.1;
	pointLight.shadow.mapSize.width	=	1024;
	pointLight.shadow.mapSize.height	=	1024;
	pointLight.shadow.camera.near		=	0.1;
	pointLight.shadow.camera.far		=	5;

	scene.add(pointLight);

	// var pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
	// scene.add(pointLightCameraHelper)

	/////////// Helpers ///////////
	//Directional Light
	// directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.1)
	// scene.add(directionalLightHelper)

	// var pointLightHelper = new THREE.PointLightHelper(pointLight, 0.1)
	// scene.add(pointLightHelper)

	// var spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.1)
	// scene.add(spotLightHelper)

	renderer.setClearColor("#000000");
};

function resize()
{
	// Code
	if (bFullscreen == true)
	{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		renderer.setSize(canvas.width, canvas.height)
	}
	else
	{
		canvas.width = canvasOriginalWidth;
		canvas.height = canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height)
	}

	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;


    // Set Camera
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.z = 4.5;
	
	// Add camera to Scene
	scene.add(camera);

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
	controls.rotateSpeed	=	0.75;
}

function display()
{
	// Local Variable Declaration
	const elapsedTime = clock.getElapsedTime();

	// Code
	plane.rotation.x = - Math.PI * 0.5;
	plane.position.y = - 0.5;

	sphere.position.x = Math.sin(elapsedTime);
	sphere.position.z = Math.cos(elapsedTime);
	sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

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
}

function uninitialize()
{
	// Code
	camera				=	null;
	renderer				=	null;
	torus				=	null;
	cube					=	null;
	sphere				=	null;
	material				=	null;
	ambientLight			=	null;
	directionalLight		=	null;
	directionalLightHelper	=	null;
	scene				=	null;
	canvas				=	null;
}
