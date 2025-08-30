uniform vec3 cameraPosition;
uniform sampler3D tex;
uniform vec3 size;

in vec3 pos;

layout (location = 0) out vec4 outColor;

void main() {
    int steps = 200;
    vec3 rayDir = normalize(pos - cameraPosition);
    // Start the ray from the camera position by default
    const float minDistFromCamera = 0.2;
    vec3 rayPos = cameraPosition + minDistFromCamera * rayDir;
    float stepSize = length(size) / float(steps);
    vec3 step = rayDir * stepSize;
    float max_intensity = 0.0;
    vec3 max_uvw;
    for (int i = 0; i < 200; i++) {
        if (rayPos.x < -0.501*size.x || rayPos.y < -0.501*size.y || rayPos.z < -0.501*size.z ||
        rayPos.x > 0.501*size.x || rayPos.y > 0.501*size.y || rayPos.z > 0.501*size.z) {
            // Out of bounds
            if (i == 0) {
                // Use the contact point on the box as the starting point
                rayPos = pos;
            } else {
                // Debug the number of steps:
                //outColor = vec4(0.0, float(i)/float(steps), 0.0, 1.0);
                break;
            }
        }
        vec3 uvw = (rayPos / size) + 0.5;
        if (texture(tex, uvw).r > max_intensity) {
            max_intensity = texture(tex, uvw).r;
            max_uvw = uvw;
        }
        rayPos += step;
    }

    outColor.rgb = calculate_lighting(cameraPosition, vec3(max_intensity), rayPos, vec3(1.0, 0.0, 0.0), 0.0, 1.0, 1.0);
    outColor.rgb = tone_mapping(outColor.rgb);
    outColor.rgb = color_mapping(outColor.rgb);
    outColor.a = 1.0;
}