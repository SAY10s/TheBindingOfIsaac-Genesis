class Entity {
  x: number;
  y: number;
  spdX: number;
  spdY: number;
  id: string;
  constructor() {
    this.x = 640;
    this.y = 340;
    this.spdX = 0;
    this.spdY = 0;
    this.id = "";
  }

  update(maxSpeed = 5) {
    this.updatePosition(maxSpeed);
  }

  updatePosition(maxSpeed: number) {
    const speed = Math.hypot(this.spdX, this.spdY);
    if (speed > 0) {
      const scale = maxSpeed / speed;
      this.x += this.spdX * scale;
      this.y += this.spdY * scale;
    }
  }

  getDistance(pt: { x: number; y: number }) {
    return Math.hypot(this.x - pt.x, this.y - pt.y);
  }
}

export default Entity;
