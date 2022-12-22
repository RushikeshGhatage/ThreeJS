import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

// Global Variables
//Essentials
var canvas;

var scene;

var material;
var mesh;

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

var controls;
var canvasOriginalWidth;
var canvasOriginalHeight;

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

	canvasOriginalWidth		= canvas.width;
	canvasOriginalHeight	= canvas.height;

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

		bFullscreen = false;
	}
};

function keyDown(event)
{
	switch(event.keyCode)
	{
		case 70:				//F or f
			toggleFullscreen();
			break;

		case 27:				//Esc
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
    renderer = new THREE.WebGLRenderer({ canvas: canvas })
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

	//////////// Geometry using Buffer Geometry in For loop ////////////
	const geometry = new THREE.BufferGeometry();

	const count		= 150
	const positionArray	= new Float32Array(count * 3 * 3)

	for (let i = 0; i < count * 3 * 3; i++)
	{
		positionArray[i] = (Math.random() - 0.5);
	}

	const positionAttribute = new THREE.BufferAttribute(positionArray, 3);
	geometry.setAttribute('position', positionAttribute);

    material = new THREE.MeshBasicMaterial({
		color: 'red' ,
		wireframe: true
	});

    mesh = new THREE.Mesh(geometry, material);

	// Add Mesh to Scene
	scene.add(mesh);

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
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.5, 1000);
	camera.position.z = 3;

	camera.lookAt(mesh.position);
	
	// Add camera to Scene
	scene.add(camera) ;

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
	controls.autoRotate		=	true;
	controls.rotateSpeed	=	0.2;
	controls.enableRotate	=	true;
};

function display()
{
	// Local Variable Declaration

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
	geometry	=	null;
	scene	=	null;
	canvas	=	null;    
};
