import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// Global Variables
//Essentials
var	canvas;
var	scene;
var	renderer;
var	camera;
var	effectComposer;
var	renderPass;
var	displacementPass
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

////////////// Loaders //////////////
var	gltfLoader		=	new GLTFLoader();
var	cubeTextureLoader	=	new THREE.CubeTextureLoader();
var	textureLoader		=	new THREE.TextureLoader();

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
	renderer = new THREE.WebGLRenderer({ 
		canvas	:	canvas,
		antialias	:	true
	});

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

	////////////// Model //////////////
	gltfLoader.load(
		'/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
		(gltf)=>
		{
			gltf.scene.scale.set(2,2,2);
			gltf.scene.rotation.y	=	Math.PI * 0.5;
			scene.add(gltf.scene);
		}
	);

	////////////// Environment Map //////////////
	var environmentMap = cubeTextureLoader.load([
		'/textures/environmentMaps/0/px.jpg',
		'/textures/environmentMaps/0/nx.jpg',
		'/textures/environmentMaps/0/py.jpg',
		'/textures/environmentMaps/0/ny.jpg',
		'/textures/environmentMaps/0/pz.jpg',
		'/textures/environmentMaps/0/nz.jpg',
	]);

	environmentMap.encoding	=	THREE.sRGBEncoding;
	scene.background		=	environmentMap;
	scene.environment		=	environmentMap;

	//////////////// Lights ////////////////
	var directionalLight = new THREE.DirectionalLight('#ffffff', 3);
	directionalLight.castShadow		=	true;
	directionalLight.shadow.camera.far	=	15;
	directionalLight.shadow.normalBias	=	0.05;
	directionalLight.shadow.mapSize.set(1024, 1024);
	directionalLight.position.set(0.25, 3, -2.25);
	
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
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}
	else
	{
		canvas.width	=	canvasOriginalWidth;
		canvas.height	=	canvasOriginalHeight;
		renderer.setSize(canvas.width, canvas.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	renderer.shadowMap.enabled		=	true;
	renderer.shadowMap.type			=	THREE.PCFSoftShadowMap;
	renderer.physicallyCorrectLights	=	true;
	renderer.outputEncoding			=	THREE.sRGBEncoding;
	renderer.toneMapping			=	THREE.ReinhardToneMapping;
	renderer.toneMappingExposure		=	1.5;

	// Set Camera
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.01, 1000);
	camera.position.set(4, 1, -10);
	
	// Add camera to Scene
	scene.add(camera);

	controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;

	////////////////// Render Target //////////////////
	let RenderTargetClass = null;

	if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
	{
		RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
	}
	else
	{
		RenderTargetClass = THREE.WebGLRenderTarget;
	}

	const renderTarget = new THREE.WebGLRenderTarget(
		800,
		600,
		{
			minFilter	:	THREE.LinearFilter,
			magFilter	:	THREE.LinearFilter,
			format	:	THREE.RGBAFormat,
			encoding	:	THREE.sRGBEncoding
		}
	);

	effectComposer	=	new EffectComposer(renderer);
	effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	effectComposer.setSize(canvas.width, canvas.height);
	
	renderPass	=	new RenderPass(scene, camera);
	effectComposer.addPass(renderPass);

	dotScreenpass	=	new DotScreenPass();
	glitchpass	=	new GlitchPass();

	const umrealBloomPass		=	new UnrealBloomPass();
	umrealBloomPass.strength		=	0.3;
	umrealBloomPass.radius		=	1;
	umrealBloomPass.threshold	=	0.6;
	effectComposer.addPass(umrealBloomPass);

	///////////////// Displacement Pass /////////////////
	const DisplacementShader = {
		uniforms: {
			tDiffuse		:	{	value	:	null	},
			uNormalMap	:	{	value	:	null	}
		},

		vertexShader: `
			varying vec2 vUv;
			void main()
			{
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				vUv = uv;
			}
		`,
		fragmentShader: `
			uniform sampler2D tDiffuse;
			uniform sampler2D uNormalMap;

			varying vec2 vUv;
			void main() 
			{
				vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
				vec2 newUv = vUv + normalColor.xy * 0.1;
				vec4 color = texture2D(tDiffuse, newUv);

				vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
				float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);

				// color.rgb += lightness * 2.0; 
				
				gl_FragColor = color;
			}
		`
	};

	displacementPass	=	new ShaderPass(DisplacementShader);
	displacementPass.material.uniforms.uNormalMap.value	=	textureLoader.load('/textures/interfaceNormalMap.png');
	effectComposer.addPass(displacementPass);

	/////////// Tint Pass ///////////
	const TintShader = {
		uniforms	:	{
			tDiffuse	:	{	value	:	null	},
			uTint	:	{	value	:	null	}
		},
		vertexShader: `
			varying vec2 vUv;
			void main()
			{
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				vUv = uv;
			}
		`,
		fragmentShader: `
			uniform sampler2D tDiffuse;
			uniform vec3 uTint;
			varying vec2 vUv;
			void main() 
			{
				vec4 color = texture2D(tDiffuse, vUv);
				color.rgb += uTint;

				gl_FragColor = color;
			}
		`
	};

	const tintPass	=	new ShaderPass(TintShader);
	tintPass.material.uniforms.uTint.value	=	new THREE.Vector3();
	effectComposer.addPass(tintPass);
};

function display()
{
	// Local Variable Declaration
	const elapsedTime = clock.getElapsedTime();

	// Code
	// Animation Display
	controls.update();

	// Draw using Renderer
	effectComposer.render();

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
