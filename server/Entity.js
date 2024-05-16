const Entity = () => {
  const self = {
    x: 250,
    y: 250,
    spdX: 0,
    spdY: 0,
    id: "",
  };
  self.update = (maxSpeed = 5) => {
    self.updatePosition(maxSpeed);
  };
  self.updatePosition = (maxSpeed) => {
    const speed = Math.sqrt(self.spdX * self.spdX + self.spdY * self.spdY);
    if (speed !== 0) {
      const normalizedX = self.spdX / speed;
      const normalizedY = self.spdY / speed;
      self.x += normalizedX * maxSpeed;
      self.y += normalizedY * maxSpeed;
    }
  };
  self.getDistance = (pt) => {
    return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
  };
  return self;
};

module.exports = Entity;
