import Lenis from 'lenis';

class LenisManager {
  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  init() {
    if (typeof window === 'undefined') return;

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    // Add classes to html element for CSS
    document.documentElement.classList.add('lenis');

    const raf = (time: number) => {
      if (this.lenis) {
        this.lenis.raf(time);
      }
      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    document.documentElement.classList.remove('lenis');
  }

  getInstance() {
    return this.lenis;
  }
}

export default new LenisManager();