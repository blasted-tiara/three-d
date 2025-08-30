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

    float min_intensity = 1.0;
    float threshold = 0.2;

    for (int i = 0; i < 200; i++) {
        if (rayPos.x < -0.501*size.x || rayPos.y < -0.501*size.y || rayPos.z < -0.501*size.z ||
        rayPos.x > 0.501*size.x || rayPos.y > 0.501*size.y || rayPos.z > 0.501*size.z) {
            // Out of bounds
            if (i == 0) {
                // Use the contact point on the box as the starting point
                rayPos = pos;
            } else {
                break;
            }
        }

        vec3 uvw = (rayPos / size) + 0.5;
        float val = texture(tex, uvw).r;
        if (val > threshold && val < min_intensity) {
            min_intensity = val;
        }
        rayPos += step;
    }

    if (min_intensity == 1.0) {
        min_intensity = 0.0;
    }
    outColor.rgb = calculate_lighting(cameraPosition, vec3(min_intensity), rayPos, vec3(1.0, 0.0, 0.0), 0.0, 1.0, 1.0);
    outColor.rgb = tone_mapping(outColor.rgb);
    outColor.rgb = color_mapping(outColor.rgb);
    outColor.a = 1.0;
}