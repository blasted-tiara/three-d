use crate::core::*;
use crate::renderer::*;

///
/// A material that renders the projection of a volume of voxel data in the [VolumeProjectionMaterial::voxels].
/// The material is calculated by raycasting through a volume where the red channel of the voxel data is equal to the density, and calculating either minimum, maximum or average values.
/// This material should be applied to a cube with center in origo, for example [CpuMesh::cube].
///
#[derive(Clone)]
pub struct VolumeProjectionMaterial {
    /// Voxel data.
    pub voxels: std::sync::Arc<Texture3D>,
    /// The size of the cube that is used to render the voxel data. The texture is scaled to fill the entire cube.
    pub size: Vec3,
    /// Rendering style
    pub rendering_style: VolumeProjectionRenderingStyle,
}

///
/// Rendering style of a volume projection. Supports several related styles.
/// 
#[derive(Clone)]
pub enum VolumeProjectionRenderingStyle {
    /// The color of the pixel will be the same as the minimum intensity encountered on the ray path.
    MinimumIntensityProjection,
    /// The color of the pixel will be the same as the maximum intensity encountered on the ray path.
    MaximumIntansityProjection,
    /// The color of the pixel will be the same as the average intensity encountered on the ray path.
    AverageIntensityProjection,
}

impl Material for VolumeProjectionMaterial {
    fn id(&self) -> EffectMaterialId {
        EffectMaterialId::VolumePojectionMaterial
    }

    fn fragment_shader_source(&self, lights: &[&dyn Light]) -> String {
        let mut source = lights_shader_source(lights);
        source.push_str(ToneMapping::fragment_shader_source());
        source.push_str(ColorMapping::fragment_shader_source());
        match self.rendering_style {
            VolumeProjectionRenderingStyle::MaximumIntansityProjection => {
                source.push_str(include_str!("shaders/mip_material.frag"));
            },
            VolumeProjectionRenderingStyle::MinimumIntensityProjection => {
                source.push_str(include_str!("shaders/mip_material.frag"));
            },
            VolumeProjectionRenderingStyle::AverageIntensityProjection => {
                source.push_str(include_str!("shaders/mip_material.frag"));
            }
        }
        source
    }

    fn use_uniforms(&self, program: &Program, viewer: &dyn Viewer, lights: &[&dyn Light]) {
        viewer.tone_mapping().use_uniforms(program);
        viewer.color_mapping().use_uniforms(program);
        for (i, light) in lights.iter().enumerate() {
            light.use_uniforms(program, i as u32);
        }
        program.use_uniform("cameraPosition", viewer.position());
        program.use_uniform("size", self.size);
        program.use_texture_3d("tex", &self.voxels);
    }
    fn render_states(&self) -> RenderStates {
        RenderStates {
            blend: Blend::TRANSPARENCY,
            ..Default::default()
        }
    }
    fn material_type(&self) -> MaterialType {
        MaterialType::Transparent
    }
}

impl FromCpuVoxelGrid for VolumeProjectionMaterial {
    fn from_cpu_voxel_grid(context: &Context, cpu_voxel_grid: &CpuVoxelGrid) -> Self {
        Self {
            voxels: std::sync::Arc::new(Texture3D::new(context, &cpu_voxel_grid.voxels)),
            size: cpu_voxel_grid.size,
            rendering_style: VolumeProjectionRenderingStyle::MaximumIntansityProjection,
        }
    }
}
