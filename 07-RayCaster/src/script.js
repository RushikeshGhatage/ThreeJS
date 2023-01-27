import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat-gui';

// Global Variables
//Essentials
var	canvas;
var	scene;
var	renderer;
var	camera;

var	requestAnimationFrame_rvg	=	window.requestAnimationFrame		||
								window.webkitRequestAnimationFrame	||
								window.mozRequestAnimationFrame	||
								window.oRequestAnimationFrame		||
								window.msRequestAnimationFrame;

//Normal
var	bFullscreen	=	false;

var cursor = {
	x	:	0,
	y	:	0
};

////////////// dat-gui //////////////
var	gui	=	new dat.GUI({ width	:	300 });
gui.closed	=	true;

var	controls;

var	raycaster;
var	object1;
var	object2;
var	object3;

var	mouse;

var	clock	=	new THREE.Clock();
var	canvasOriginalWidth;
var	canvasOriginalHeight;

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
	renderer = new THREE.WebGLRenderer({	canvas	:	canvas	});

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

	// Object 
	object1 = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.5, 16, 16),
		new THREE.MeshBasicMaterial({color:'#ff0000'})
	);
	object1.position.x	=	-2;

	object2 = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.5, 16, 16),
		new THREE.MeshBasicMaterial({color:'#ff0000'})
	);
	object2.position.x	=	0;

	object3 = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.5, 16, 16),
		new THREE.MeshBasicMaterial({color:'#ff0000'})
	);
	object3.position.x	=	2;

	scene.add(object1, object2, object3);

	//Raycaster
	raycaster = new THREE.Raycaster();

	mouse = new THREE.Vector2();

	window.addEventListener('mousemove', ()=>
	{
		mouse.x	=	event.clientX / canvas.width * 2 - 1;
		mouse.y	=	-(event.clientY / canvas.height * 2 -1);
	})

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

	// Set Camera
	camera	=	new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.z = 6;

	// Add camera to Scene
	scene.add(camera);

	controls	=	new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
};

function display()
{
	// Local Variable Declaration
	var elapsedTime = clock.getElapsedTime();

    // Code
	object1.position.y	=	Math.sin(elapsedTime * 0.3) * 1.5;
	object2.position.y	=	Math.sin(elapsedTime * 0.8) * 1.5;
	object3.position.y	=	Math.sin(elapsedTime * 0.4) * 1.5;

	// Cast a Ray
	raycaster.setFromCamera(mouse, camera);

	const objectToTest	=	[object1, object2, object3];
	const intersects	=	raycaster.intersectObjects(objectToTest);

	for (const object of objectToTest)
	{
		object.material.color.set('#ff0000');
	}

	for (const intersect of intersects)
	{
		intersect.object.material.color.set('#0000ff');
	}

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
	cube		=	null;
	material	=	null;
	scene	=	null;
	canvas	=	null;    
};
