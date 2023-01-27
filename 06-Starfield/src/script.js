import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'

// Global Variables
//Essentials
var	canvas;
var	scene;
var	particles;
var	renderer;
var	camera;
var	controls;

var	requestAnimationFrame_rvg = window.requestAnimationFrame		||
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

///////////// Texture /////////////
var	textureLoader		=	new THREE.TextureLoader();
var	particleTexture	=	textureLoader.load('/textures/particles/8.png');

///////////// Particles /////////////
var	particlesGeometry;
var	particlesMaterial;
var	count;

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
		cursor.x = event.clientX / canvas.width - 0.5;
		cursor.y = -(event.clientY / canvas.height - 0.5);
	});

    initialize();

    resize();

    display();
}

function toggleFullscreen()
{
	var	fullscreen_element	=	document.fullscreenElement			||
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
}

function initialize()
{
	// Code
	renderer = new THREE.WebGLRenderer({ canvas	:	canvas });

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

	// Geometry
	particlesGeometry	=	new THREE.BufferGeometry();
	count	=	5000;

	var	positions	=	new Float32Array(count * 3);
	var	colors	=	new Float32Array(count * 3);

	for (let i = 0; i < count * 3; i++)
	{
		positions[i] = (Math.random() - 0.5) * 10;
		colors[i] = Math.random();
	};

	particlesGeometry.setAttribute(
		'position',
		new THREE.BufferAttribute(positions, 3)
	);

	particlesGeometry.setAttribute(
		'color',
		new THREE.BufferAttribute(colors, 3)
	);

	// Materials
	particlesMaterial	=	new THREE.PointsMaterial();
	particlesMaterial.size			=	0.25;
	particlesMaterial.sizeAttenuation	=	true;
	particlesMaterial.transparent		=	true;
	particlesMaterial.alphaMap		=	particleTexture;
	particlesMaterial.depthWrite		=	false;
	particlesMaterial.blending		=	THREE.AdditiveBlending;
	particlesMaterial.vertexColors	=	true;

	// Points
    particles = new THREE.Points(particlesGeometry, particlesMaterial);

	// Add Mesh to Scene
	scene.add(particles)

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
		canvas.width = canvasOriginalWidth;
		canvas.height = canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
	}

	// Set Camera
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
	camera.position.z	=	7;

	camera.lookAt(particles.position);
	
	// Add camera to Scene
	scene.add(camera);

	controls	=	new OrbitControls(camera, canvas);
	controls.enableDamping = true;
};

function display()
{
	// Local Variable Declaration
	const elapsedTime = clock.getElapsedTime()

	// Code
	for (let i = 0; i < count; i++)
	{
		const i3	=	i * 3;
		const x	=	particlesGeometry.attributes.position.array[i3 + 0];
		particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x);
	}

	particlesGeometry.attributes.position.needsUpdate	=	true;

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
    particles	=	null;
    scene		=	null;
    canvas	=	null;
};
