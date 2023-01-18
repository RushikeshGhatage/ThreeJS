import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { DoubleSide, MeshLambertMaterial } from 'three';
import * as dat from 'dat-gui';

// Global Variables
//Essentials
var canvas;
var scene;
var sphere;
var plane;
var torus;
var renderer;
var camera;

var requestAnimationFrame_rvg = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.oRequestAnimationFrame ||
							window.msRequestAnimationFrame;

//Normal
var bFullscreen = false;

const cursor = {
	x	:	0,
	y	:	0
};

////////////// dat-gui //////////////
const gui = new dat.GUI()

////////////// Textures //////////////
var textureLoader		=	new THREE.TextureLoader();
var cubeTextureLoader	=	new THREE.CubeTextureLoader();

var matCapTexture;
var gradientTexture;

var controls;

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

	window.addEventListener("mousemove", (event) =>
	{
		cursor.x	= event.clientX / canvas.width - 0.5;
		cursor.y	= -(event.clientY / canvas.height - 0.5);
	});

    initialize();

    resize();

    display();
};

function toggleFullscreen()
{
	var fullscreen_element = document.fullscreenElement				||
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
}

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

	matCapTexture					=	textureLoader.load('/textures/matcaps/8.png');
	gradientTexture				=	textureLoader.load('/textures/gradients/3.jpg');
	gradientTexture.minFilter		=	THREE.NearestFilter;
	gradientTexture.magFilter		=	THREE.NearestFilter;
	gradientTexture.generateMipmaps	=	false;

	const environmentMapTexture = cubeTextureLoader.load([
		'/textures/environmentMaps/1/px.jpg',
		'/textures/environmentMaps/1/nx.jpg',
		'/textures/environmentMaps/1/py.jpg',
		'/textures/environmentMaps/1/ny.jpg',
		'/textures/environmentMaps/1/pz.jpg',
		'/textures/environmentMaps/1/nz.jpg'
	])

	// Create Scene
	scene = new THREE.Scene()

	const material		=	new THREE.MeshStandardMaterial();
	material.metalness	=	1.0;
	material.roughness	=	0.0;
	material.envMap	=	environmentMapTexture;
	material.side		=	DoubleSide;

	gui.add(material, 'metalness').min(0.0).max(1.0);
	gui.add(material, 'roughness').min(0.0).max(1.0);
	gui.add(material, 'aoMapIntensity').min(1).max(10);
	gui.add(material, 'displacementScale').min(0.0).max(1.0).step(0.01);

	sphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.5, 64, 64),
		material
	);

	sphere.geometry.setAttribute(
		'uv2', 
		new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
	);
	
	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1,1, 100, 100),
		material
	);

	plane.geometry.setAttribute(
		'uv2', 
		new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
	);

	torus = new THREE.Mesh(
		new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
		material
	);

	torus.geometry.setAttribute(
		'uv2', 
		new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
	);

	// Add Mesh to Scene
	scene.add(sphere, plane, torus);

	const pointLight = new THREE.PointLight(0xffffff, 0.75);
	pointLight.position.x	=	2;
	pointLight.position.y	=	2;
	pointLight.position.z	=	2;
	scene.add(pointLight);

	renderer.setClearColor("#000000");
};

function resize()
{
    // Code
    if (bFullscreen == true)
	{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		renderer.setSize(canvas.width, canvas.height);
	}
	else
	{
		canvas.width = canvasOriginalWidth;
		canvas.height = canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
	}

	// Set Camera
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.z = 4.5;

	// Add camera to Scene
	scene.add(camera);

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping		=	true;
	controls.autoRotate			=	true;
	controls.rotateSpeed		=	0.75;
	controls.enableRotate		=	true;
	controls.enableRotateSpeed	=	0.75;
};

function display()
{
	// Local Variable Declaration

	// Code
	sphere.position.x	= -1.5;
	plane.position.x	= 0.0;
	torus.position.x	= 1.5;

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
	torus	=	null;
	plane	=	null;
	sphere	=	null;
	material	=	null;
	scene	=	null;
	canvas	=	null;    
};
