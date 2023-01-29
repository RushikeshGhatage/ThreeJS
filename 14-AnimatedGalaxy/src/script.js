import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat-gui';
import galaxyVertexShader from './shaders/vertex.glsl'
import galaxyFragmentShader from './shaders/fragment.glsl'

// Global Variables
//Essentials
var	canvas;
var	scene;
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

var cursor = {
	x	:	0,
	y	:	0
}

////////////// dat-gui //////////////
var	gui	=	new dat.GUI({	width	:	300	});
gui.closed = true;

var	paramters	=	{};
paramters.count			=	200000;
paramters.size				=	0.005;
paramters.radius			=	5;
paramters.branches			=	4;
paramters.spin				=	1;
paramters.randomness		=	0.5;
paramters.randomnessPower	=	9;
paramters.insideColors		=	'#ff6030';
paramters.outsideColors		=	'#1b3984';

var	geometry	=	null;
var	materials	=	null;
var	points	=	null;
var	positions;
var	colors;

var	clock	=	new THREE.Clock();
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
	renderer	=	new THREE.WebGLRenderer({	canvas	:	canvas	});

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

	const generateGalaxy = () =>
	{
		if (points !== null)
		{
			geometry.dispose();
			materials .dispose();
			scene.remove(points);
		}

		geometry	=	new THREE.BufferGeometry();
		positions	=	new Float32Array(paramters.count * 3);
		colors	=	new Float32Array(paramters.count * 3);

		const scales		=	new Float32Array(paramters.count * 1);
		const randomness	=	new Float32Array(paramters.count * 3);
		const colorInside	=	new THREE.Color(paramters.insideColors);
		const colorOutside	=	new THREE.Color(paramters.outsideColors);
	
		for (let i = 0; i < paramters.count; i++)
		{
			var i3	=	i * 3;

			//Position
			var	radius	=	Math.random() * paramters.radius;
			var	branchAngle	=	(i % paramters.branches) / paramters.branches * Math.PI * 2;

			positions[i3 + 0]	=	Math.cos(branchAngle) * radius;
			positions[i3 + 1]	=	0;
			positions[i3 + 2]	=	Math.sin(branchAngle) * radius;

			var	randomX	=	Math.pow(Math.random(), paramters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
			var	randomY	=	Math.pow(Math.random(), paramters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
			var	randomZ	=	Math.pow(Math.random(), paramters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

			randomness[i3 + 0] = randomX;
			randomness[i3 + 1] = randomY;
			randomness[i3 + 2] = randomZ;

			//Color
			var	mixedColor	=	colorInside.clone();
			mixedColor.lerp(colorOutside, radius / paramters.radius);

			colors[i3 + 0] = mixedColor.r;
			colors[i3 + 1] = mixedColor.g;
			colors[i3 + 2] = mixedColor.b;

			scales[i] = Math.random();
		};
	
		geometry.setAttribute('position',		new THREE.BufferAttribute(positions, 3));	
		geometry.setAttribute('color',		new THREE.BufferAttribute(colors, 3));
		geometry.setAttribute('aScale',		new THREE.BufferAttribute(scales, 1));
		geometry.setAttribute('aRandomness',	new THREE.BufferAttribute(randomness, 3));

		materials = new THREE.ShaderMaterial({
			depthWrite	:	false,
			blending		:	THREE.AdditiveBlending,
			vertexColors	:	true,
			vertexShader	:	galaxyVertexShader,
			fragmentShader	:	galaxyFragmentShader,
			uniforms	:	{
				uTime	:	{	value	:	0},
				uSize	:	{	value	:	30 * renderer.getPixelRatio()}
			}
		});
	
		points = new THREE.Points(geometry, materials);
		scene.add(points);
	};
	
	generateGalaxy();

	gui.add(paramters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
	gui.add(paramters, 'radius').min(0.01).max(20).step(0.01).onChange(generateGalaxy);
	gui.add(paramters, 'branches').min(2).max(20).step(1).onChange(generateGalaxy);
	gui.add(paramters, 'randomness').min(0).max(2).step(0.001).onChange(generateGalaxy);
	gui.add(paramters, 'randomnessPower').min(1).max(10).step(0.001).onChange(generateGalaxy);
	gui.addColor(paramters, 'insideColors').onChange(generateGalaxy);
	gui.addColor(paramters, 'outsideColors').onChange(generateGalaxy);

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
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(0, 4, 10);
	
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
	materials.uniforms.uTime.value = elapsedTime;

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
	materials	=	null;
	scene	=	null;
	canvas	=	null;
};
 