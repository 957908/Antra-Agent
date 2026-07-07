/**
 * Logo Generator Module
 * Provides static ASCII logos and dynamic 3D ASCII rotating cubes.
 */

class LogoGenerator {
  static getASCII() {
    return `
   █████╗ ███╗   ██╗████████╗██████╗  █████╗ 
  ██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔══██╗
  ███████║██╔██╗ ██║   ██║   ██████╔╝███████║
  ██╔══██║██║╚██╗██║   ██║   ██╔══██╗██╔══██║
  ██║  ██║██║ ╚████║   ██║   ██║  ██║██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
   █████╗  ██████╗ ███████╗███╗   ██╗████████╗
  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
    `;
  }

  static getSmallASCII() {
    return `
  🤖 [ANTRA-AGENT] | Server Active 🙏
    `;
  }

  static get3D(angleX, angleY) {
    const width = 50;
    const height = 22;
    const grid = Array(height).fill(null).map(() => Array(width).fill(' '));
    const zBuffer = Array(height).fill(null).map(() => Array(width).fill(-Infinity));

    // 8 Vertices of a cube
    const size = 1.0;
    const vertices = [
      [-size, -size, -size],
      [ size, -size, -size],
      [ size,  size, -size],
      [-size,  size, -size],
      [-size, -size,  size],
      [ size, -size,  size],
      [ size,  size,  size],
      [-size,  size,  size]
    ];

    // 12 Edges connecting vertices
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
    ];

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    // Rotate and project vertices
    const projected = vertices.map(([x, y, z]) => {
      // Rotate around X
      let y1 = y * cosX - z * sinX;
      let z1 = y * sinX + z * cosX;

      // Rotate around Y
      let x2 = x * cosY + z1 * sinY;
      let z2 = -x * sinY + z1 * cosY;

      // Perspective projection
      const dist = 3.0; // Distance of camera
      const ooz = 1 / (dist - z2); // One over Z
      const xp = Math.floor(width / 2 + (x2 * 25 * ooz));
      const yp = Math.floor(height / 2 + (y1 * 11 * ooz)); // Adjusted for character aspect ratio

      return { x: xp, y: yp, z: z2 };
    });

    // Helper to draw a line on the grid
    const drawLine = (p1, p2, char = '#') => {
      let x0 = p1.x;
      let y0 = p1.y;
      let x1 = p2.x;
      let y1 = p2.y;

      let dx = Math.abs(x1 - x0);
      let dy = Math.abs(y1 - y0);
      let sx = (x0 < x1) ? 1 : -1;
      let sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;

      while (true) {
        if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
          // Average depth for the point
          const avgZ = (p1.z + p2.z) / 2;
          if (avgZ > zBuffer[y0][x0]) {
            zBuffer[y0][x0] = avgZ;
            grid[y0][x0] = char;
          }
        }

        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    };

    // Draw all edges
    edges.forEach(([u, v]) => {
      drawLine(projected[u], projected[v], '█');
    });

    // Add labels in the middle of the cube
    const label = "ANTRA";
    const startX = Math.floor((width - label.length) / 2);
    const centerY = Math.floor(height / 2);
    for (let i = 0; i < label.length; i++) {
      if (grid[centerY][startX + i] === ' ') {
        grid[centerY][startX + i] = label[i];
      }
    }

    return grid.map(row => row.join('')).join('\n');
  }

  static getColorful3D(angleX, angleY) {
    // Generate the standard 3D cube first
    const plainCube = this.get3D(angleX, angleY);
    
    // Add ANSI color escape sequences
    // Cyan for drawing parts, Blue for background elements, and Green for labels
    return plainCube.split('\n').map(line => {
      return line.split('').map(char => {
        if (char === '█') {
          return `\x1b[36m${char}\x1b[0m`; // Cyan for cube wireframe
        } else if ("ANTRA".includes(char) && char !== ' ') {
          return `\x1b[32m\x1b[1m${char}\x1b[0m`; // Bright Green for name
        }
        return char;
      }).join('');
    }).join('\n');
  }
}

module.exports = LogoGenerator;
