import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { DoubleSide, MeshLambertMaterial } from 'three';
import * as dat from 'dat-gui'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

// Global Variables
//Essentials
var	canvas;
var	scene;
var	geometry;
var	waterMaterial;
var	water;
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

////////////// dat-gui //////////////
const gui = new dat.GUI({ width	:	340 });
const debugObject = { };

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
		cursor.x = event.clientX / canvas.width - 0.5
		cursor.y = -(event.clientY / canvas.height - 0.5)
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

	//Geometry
	geometry = new THREE.PlaneBufferGeometry(20, 20, 512, 512);

	debugObject.depthColor	=	'#186691';
	debugObject.surfaceColor	=	'#9bd8ff';

	gui
	.addColor(debugObject, 'depthColor')
	.name('depthColor')
	.onChange(() =>
	{
		waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
	});

	gui
	.addColor(debugObject, 'surfaceColor')
	.name('surfaceColor')
	.onChange(() =>
	{
		waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
	});

	//Material
	waterMaterial	=	new THREE.ShaderMaterial({
		vertexShader	:	waterVertexShader,
		fragmentShader	:	waterFragmentShader,
		uniforms:
		{
			uTime			:	{ value	:	0 } ,
			uBigWavesElevation	:	{ value	:	0.2 },
			uBigWavesFrequency	:	{ value	:	new THREE.Vector2(4, 1.5) },
			uBigWavesSpeed		:	{ value	:	0.75 },

			uSmallWavesElevation	:	{ value	:	0.15 },
			uSmallWavesFrequency	:	{ value	:	3 },
			uSmallWavesSpeed		:	{ value	:	0.2 },
			uSmallIterations		:	{ value	:	4 },

			uDepthColor		:	{	value	:	new THREE.Color(debugObject.depthColor)},
			uSurfaceColor		:	{	value	:	new THREE.Color(debugObject.surfaceColor)},
			uColorOffset		:	{	value	:	0.08 },
			uColorMultiplier	:	{	value	:	5 }
		}
	});
	waterMaterial.side	=	DoubleSide;

	water = new THREE.Mesh(geometry, waterMaterial);
	water.rotation.x	=	-Math.PI * 0.5;

	// Add Mesh to Scene
	scene.add(water);

	gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
	gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequency X');
	gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequency Y');
	gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed');

	gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation');
	gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency');
	gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed');
	gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations');

	gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
	gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');

	renderer.setClearColor("#9bd8ff");
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
	camera	=	new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(1, 1, 1);
	
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
	waterMaterial.uniforms.uTime.value = elapsedTime;

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
	camera		=	null;
	renderer		=	null;
	water		=	null;
	waterMaterial	=	null;
	scene		=	null;
	canvas		=	null;
};
