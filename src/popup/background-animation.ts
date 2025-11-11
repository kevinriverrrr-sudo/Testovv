export class BackgroundAnimation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private country: string = 'default';

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    this.initParticles();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  private initParticles(): void {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }
  }

  setCountry(country: string): void {
    this.country = country.toLowerCase();
    // Update particle colors/behavior based on country
    this.particles.forEach(p => p.updateTheme(this.country));
  }

  start(): void {
    this.animate();
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach(particle => {
      particle.update(this.canvas.width, this.canvas.height);
      particle.draw(this.ctx);
    });

    // Draw connections between nearby particles
    this.drawConnections();

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawConnections(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${0.2 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1;
    this.color = 'rgba(102, 126, 234, 0.6)';
  }

  updateTheme(country: string): void {
    // Change particle colors based on country
    switch (country) {
      case 'japan':
        this.color = 'rgba(255, 192, 203, 0.6)'; // Cherry blossom pink
        break;
      case 'iceland':
        this.color = 'rgba(0, 255, 255, 0.6)'; // Aurora cyan
        break;
      case 'brazil':
        this.color = 'rgba(255, 215, 0, 0.6)'; // Beach gold
        break;
      default:
        this.color = 'rgba(102, 126, 234, 0.6)';
    }
  }

  update(canvasWidth: number, canvasHeight: number): void {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

    // Keep within bounds
    this.x = Math.max(0, Math.min(canvasWidth, this.x));
    this.y = Math.max(0, Math.min(canvasHeight, this.y));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
