uniform vec3 cameraPosition;
uniform sampler3D tex;
uniform vec3 size;
uniform int rendering_style;

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

    float min_intensity = 1.0;
    float min_intensity_threshold = 0.05;

    float avg_intensity = 0.0;
    int used_samples_for_avg = 0;

    for (int i = 0; i < steps; i++) {
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
        
        if (rendering_style == 0) {
            if (val > min_intensity_threshold && val < min_intensity) {
                min_intensity = val;
            }
        } else if (rendering_style == 1) {
            avg_intensity += val;
            used_samples_for_avg++;
        } else if (rendering_style == 2) {
            if (val > max_intensity) {
                max_intensity = val;
            }
        }

        rayPos += step;
    }

    if (rendering_style == 0) {
        if (min_intensity == 1.0) {
            min_intensity = 0.0;
        }
        outColor = vec4(vec3(min_intensity), 1.0);
    } else if (rendering_style == 1) {
        outColor = vec4(vec3(avg_intensity / used_samples_for_avg), 1.0);
    } else if (rendering_style == 2) {
        outColor = vec4(vec3(max_intensity), 1.0);
    }

    outColor.rgb = tone_mapping(outColor.rgb);
    outColor.rgb = color_mapping(outColor.rgb);
}