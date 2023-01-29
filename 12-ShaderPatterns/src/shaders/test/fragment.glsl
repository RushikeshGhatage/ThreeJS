varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                        vec2(12.9898,78.233))) * 43758.5453123);
}

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
	return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

//	by Stefan Gustavson
//
float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void main()
{
	//Pattern 3
	// float strength = vUv.x;

	//Pattern 4
	// float strength = vUv.y;

	//Pattern 5
	// float strength = 1.0 - vUv.y;

	//Pattern 6
	// float strength = vUv.y * 10.0;

	//Pattern 7
	// float strength = mod(vUv.y * 10.0, 1.0);

	//Pattern 8
	// float strength = mod(vUv.y * 10.0, 1.0);
	// strength = step(0.5, strength);

	//Pattern 9
	// float strength = mod(vUv.y * 10.0, 1.0);
	// strength = step(0.8, strength);

	//Pattern 10
	// float strength = mod(vUv.x * 10.0, 1.0);
	// strength = step(0.8, strength);

	//Pattern 11
	// float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
	// strength += step(0.8, mod(vUv.y * 10.0, 1.0));

	//Pattern 12
	// float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
	// strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

	//Pattern 13
	// float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
	// barX *= step(0.8, mod(vUv.y * 10.0, 1.0));

	// float barY = step(0.8, mod(vUv.x * 10.0, 1.0));
	// barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

	// float strength = barX + barY;

	//Pattern 14
	// float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
	// barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));

	// float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
	// barY *= step(0.4, mod(vUv.y * 10.0, 1.0));

	// float strength = barX + barY;

	//Pattern 15
	// float strength = min(abs(vUv.x - 0.5), (abs(vUv.y - 0.5)));

	//Pattern 16
	// float strength = max(abs(vUv.x - 0.5), (abs(vUv.y - 0.5)));

	//Pattern 17
	// float strength = step(0.2, max(abs(vUv.x - 0.5), (abs(vUv.y - 0.5))))
	
	//Pattern 18
	// float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
	// float square2 = 1.0 - step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
	// float strength = square1 * square2;

	//Pattern 19
	// float strength = floor(vUv.x * 10.0) / 10.0;

	//Pattern 20
	// float strength = floor(vUv.x * 10.0) / 10.0;
	// strength *= floor(vUv.y * 10.0) / 10.0;

	//Pattern 21
	// float strength = random(vUv);

	//Pattern 22
	// vec2 gridUv = vec2(
	// 	floor(vUv.x * 10.0) / 10.0,
	// 	floor(vUv.y * 10.0) / 10.0
	// );

	// float strength = random(gridUv);

	//Pattern 23
	// vec2 gridUv = vec2(
	// 	floor(vUv.x * 10.0) / 10.0,
	// 	floor(vUv.y * 10.0 + vUv.x * 0.5) / 10.0
	// );
	
	// float strength = random(gridUv);

	//Pattern 24
	// float strength = length(vUv);

	//Pattern 25
	// float strength = distance(vUv, vec2(0.5));

	//Pattern 26
	// float strength = 1.0 - distance(vUv, vec2(0.5));

	//Pattern 27
	// float strength = 0.02 / distance(vUv, vec2(0.5));

	//Pattern 28
	// vec2 lightUv = vec2(
	// 	vUv.x * 0.1 + 0.45,
	// 	vUv.y * 0.5 + 0.25
	// );
	// float strength = 0.015 / distance(lightUv, vec2(0.5));

	//Pattern 29
	// vec2 lightUvX = vec2(
	// 	vUv.x * 0.1 + 0.45,
	// 	vUv.y * 0.5 + 0.25
	// );
	// float lightX = 0.015 / distance(lightUvX, vec2(0.5));

	// vec2 lightUvY = vec2(
	// 	vUv.y * 0.1 + 0.45,
	// 	vUv.x  * 0.5 + 0.25
	// );
	// float lightY = 0.015 / distance(lightUvY, vec2(0.5));

	// float strength = lightX * lightY;

	//Pattern 30
	// vec2 lightUvX = vec2(
	// 	vUv.x * 0.1 + 0.45,
	// 	vUv.y * 0.5 + 0.25
	// );
	// float lightX = 0.015 / distance(lightUvX, vec2(0.5));

	// vec2 lightUvY = vec2(
	// 	vUv.y * 0.1 + 0.45,
	// 	vUv.x  * 0.5 + 0.25
	// );
	// float lightY = 0.015 / distance(lightUvY, vec2(0.5));

	// float strength = lightX * lightY;

	//Pattern 31
	// float strength = cnoise(vUv * 10.0);

	//Pattern 32
	// float strength = step(0.0, cnoise(vUv * 10.0));

	//Pattern 33
	// float strength = 1.0 - abs(cnoise(vUv * 10.0));

	//Pattern 34
	// float strength = sin(cnoise(vUv * 10.0) * 20.0);

	//Colored Version
	vec3 blackColor = vec3(0.0);
	vec3 uvColor = vec3(vUv, 1.0);
	vec3 mixedColor = mix(blackColor, uvColor, strength);

	gl_FragColor = vec4(mixedColor, 1.0);

	//My Pattern
	// float barX = abs(vUv.x - 0.5);
	// float barY = abs(vUv.y - 0.5);

	// float strength = barX * barY;

	//Black&White Version
	// gl_FragColor = vec4(strength, strength, strength, 1.0);
}