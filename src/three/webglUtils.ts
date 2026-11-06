import * as THREE from 'three';

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function afterDraw(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  setTimerId: (id: number) => void
): void {
  try {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          setTimerId(window.setTimeout(poll, 5));
        } else {
          if (sync) gl.deleteSync(sync);
          setTimerId(window.setTimeout(cb, 80));
        }
      };
      setTimerId(window.setTimeout(poll, 5));
      return;
    }
  } catch {
    // Fallback if fenceSync unavailable
  }
  setTimerId(window.setTimeout(cb, 80));
}

export function createProceduralTexture(
  kind: 'wood' | 'straw' | 'ground',
  maxAnisotropy: number,
  isColor = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (kind === 'wood') {
    ctx.fillStyle = isColor ? '#6B482B' : '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const y = (i / 90) * 256;
      ctx.strokeStyle = isColor
        ? i % 2 === 0
          ? 'rgba(42, 24, 12, 0.28)'
          : 'rgba(138, 98, 60, 0.2)'
        : i % 2 === 0
        ? 'rgba(40,40,40,0.3)'
        : 'rgba(200,200,200,0.25)';
      ctx.lineWidth = 1.5 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y + Math.sin(i) * 5, 170, y - Math.cos(i) * 5, 256, y);
      ctx.stroke();
    }
  } else if (kind === 'straw') {
    ctx.fillStyle = isColor ? '#C9A45C' : '#888888';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 220; i++) {
      const x = (i * 47) % 256;
      const y = (i * 83) % 256;
      const angle = ((i * 29) % 180) * (Math.PI / 180);
      const len = 18 + (i % 24);
      ctx.strokeStyle = isColor
        ? i % 3 === 0
          ? '#DFBF7A'
          : i % 3 === 1
          ? '#9E7B38'
          : '#E8CE92'
        : i % 2 === 0
        ? '#CCCCCC'
        : '#555555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = isColor ? '#7B7254' : '#808080';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 36; i++) {
      const x = (i * 73) % 256;
      const y = (i * 137) % 256;
      const r = 26 + (i % 34);
      const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
      grad.addColorStop(
        0,
        isColor
          ? i % 2 === 0
            ? 'rgba(84, 102, 58, 0.24)'
            : 'rgba(136, 118, 82, 0.22)'
          : 'rgba(160,160,160,0.18)'
      );
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = Math.max(1, maxAnisotropy);
  texture.needsUpdate = true;
  return texture;
}

export function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(16, 22, 14, 0.72)');
  grad.addColorStop(0.55, 'rgba(16, 22, 14, 0.32)');
  grad.addColorStop(1, 'rgba(16, 22, 14, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
