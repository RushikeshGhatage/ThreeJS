import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { DoubleSide, MeshLambertMaterial } from 'three';

import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

// Global Variables
//Essentials
var	canvas;
var	scene;
var	geometry;
var	material;
var	mesh;
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

var	clock	=	new THREE.Clock();
var	canvasOriginalWidth;
var	canvasOriginalHeight;

main();

function main()
{
	// Code
	canvas	=	document.getElementById("RVG");
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
}

function initialize()
{
	// Code
	renderer	=	new THREE.WebGLRenderer({ canvas	:	canvas });
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

	//Geometry
	geometry	=	new THREE.PlaneBufferGeometry(16, 9, 32, 32);

	//Material
	material	=	new THREE.ShaderMaterial({
		vertexShader	:	testVertexShader,
		fragmentShader	:	testFragmentShader
	});

	material.side	=	DoubleSide;
	
	mesh	=	new THREE.Mesh(
		geometry,
		material
	);

	// Add Mesh to Scene
	scene.add(mesh);

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
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}
	else
	{
		canvas.width	=	canvasOriginalWidth;
		canvas.height	=	canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	// Set Camera
	camera	=	new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(0.25, -0.25, 2);
	
	// Add camera to Scene
	scene.add(camera);

	controls	=	new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
};

function display()
{
	// Local Variable Declaration
	const elapsedTime	=	clock.getElapsedTime();

	// Code
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
	mesh		=	null;
	material	=	null;
	scene	=	null;
	canvas	=	null;    
};
 