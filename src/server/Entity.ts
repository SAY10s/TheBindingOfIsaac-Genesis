class Entity {
  constructor() {
    this.x = 250;
    this.y = 250;
    this.spdX = 0;
    this.spdY = 0;
    this.id = "";
  }

  update(maxSpeed = 5) {
    this.updatePosition(maxSpeed);
  }

  updatePosition(maxSpeed) {
    const speed = Math.hypot(this.spdX, this.spdY);
    if (speed > 0) {
      const scale = maxSpeed / speed;
      this.x += this.spdX * scale;
      this.y += this.spdY * scale;
    }
  }

  getDistance(pt) {
    return Math.hypot(this.x - pt.x, this.y - pt.y);
  }
}

export default Entity;
