import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { DoubleSide, MeshLambertMaterial } from 'three';
import * as dat from 'dat-gui';

// Global Variables
//Essentials
var canvas;
var scene;
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
	x	: 0,
	y	: 0
};

////////////// dat-gui //////////////
const gui = new dat.GUI();

////////////// Textures //////////////
var textureLoader	=	new THREE.TextureLoader();
var matcapTexture	=	textureLoader.load('/textures/matcaps/8.png')

///////////// Font Loader /////////////
var fontLoader = new THREE.FontLoader();

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
	fontLoader.load(
		'/fonts/helvetiker_regular.typeface.json',
		(font)=>
		{
			const textGeometry = new THREE.TextBufferGeometry(
				'Rushikesh Ghatage',
				{
					font			:	font,
					size			:	0.5,
					height		:	0.2,
					curveSegments	:	6,
					bevelEnabled	:	true,
					bevelThickness	:	0.03,
					bevelSize		:	0.03,
					bevelSegments	:	4
				}
			);

			textGeometry.center();
		
			const material = new THREE.MeshMatcapMaterial({matcap: matcapTexture});
			const text = new THREE.Mesh(textGeometry, material);
			scene.add(text);

			const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20,45);
				
			for (let i = 0; i < 75; i++)
			{	
				
				const donut = new THREE.Mesh(donutGeometry, material)

				donut.position.x = (Math.random() - 0.5) * 10;
				donut.position.y = (Math.random() - 0.5) * 10;
				donut.position.z = (Math.random() - 0.5) * 10;

				donut.rotation.x = Math.random() * Math.PI;
				donut.rotation.y = Math.random() * Math.PI;

				let scale = Math.random();

				if (scale > 0.25)
				{
					donut.scale.x = scale;
					donut.scale.y = scale;
					donut.scale.z = scale;	
				}

				scene.add(donut)
			};

		}
	);

	const pointLight = new THREE.PointLight(0xffffff, 0.75);
	pointLight.position.x = 2;
	pointLight.position.y = 2;
	pointLight.position.z = 2;
	scene.add(pointLight);

	renderer.setClearColor("#000000");	
};

function resize()
{
    // Code
    if (bFullscreen == true)
	{
		canvas.width	= window.innerWidth;
		canvas.height	= window.innerHeight;
		renderer.setSize(canvas.width, canvas.height);
	}
	else
	{
		canvas.width	= canvasOriginalWidth;
		canvas.height	= canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
	}

	// Set Camera
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.z = 7

	// Add camera to Scene
	scene.add(camera);

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping	=	true;
	controls.autoRotate		=	true;
	controls.rotateSpeed	=	0.75;
	controls.enableRotate	=	true;
};

function display()
{
	// Local Variable Declaration
	const elapsedTime = clock.getElapsedTime();

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
	torus	=	null;
	plane	=	null;
	sphere	=	null;
	material	=	null;
	scene	=	null;
	canvas	=	null;
};
 