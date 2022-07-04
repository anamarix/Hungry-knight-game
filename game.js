const KNIGHTSIZE = 84;
const TILESIZE = 16;
const BACKGROUNDTILESIZE = 16;

let map = {
  width: 16,
  height: 12,
  tiles: [
    70, 71, 70, 71, 70, 71, 70, 71, 70, 71, 70, 71, 70, 71, 70, 71, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 122, 122, 122, 122, 122, 10, 122, 122, 122, 122, 122, 122,
    122, 122, 122, 60, 122, 74, 122, 69, 122, 10, 58, 122, 122, 122, 122, 122,
    122, 30, 31, 32, 122, 82, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
    25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
    25,
  ],
};

class Game {
  constructor() {
    this.app = new PIXI.Application({ width: 800, height: 600 });
    document.body.appendChild(this.app.view);

    const loader = new PIXI.Loader();
    loader
      .add("knights", "./assets/knight iso char.png")
      .add("food", "./assets/Food.png")
      .add("background", "./assets/castle-tileset.png");

    loader.load((loader, resources) => this.doneLoading(loader, resources));
  }

  doneLoading(loader, resources) {
    this.app.view.focus();

    // preparing player frames
    let heroFrames = [];
    for (let i = 0; i < 8 * 5; i++) {
      let x = i % 8;
      let y = Math.floor(i / 8);
      heroFrames[i] = new PIXI.Texture(
        resources.knights.texture,
        new PIXI.Rectangle(
          x * KNIGHTSIZE,
          y * KNIGHTSIZE,
          KNIGHTSIZE,
          KNIGHTSIZE
        )
      );
    }

    // preparing food frames
    let foodFrames = [];
    for (let i = 0; i < 8 * 8; i++) {
      let x = i % 8;
      let y = Math.floor(i / 8);
      foodFrames[i] = new PIXI.Texture(
        resources.food.texture,
        new PIXI.Rectangle(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE)
      );
    }

    // preparing background frames
    let backgroundTexture = [];
    for (let i = 0; i < 8 * 16; i++) {
      let x = i % 8;
      let y = Math.floor(i / 8);
      backgroundTexture[i] = new PIXI.Texture(
        resources.background.texture,
        new PIXI.Rectangle(
          x * BACKGROUNDTILESIZE,
          y * BACKGROUNDTILESIZE,
          BACKGROUNDTILESIZE,
          BACKGROUNDTILESIZE
        )
      );
    }

    // creating new player
    this.hero = new Hero(
      [heroFrames[0], heroFrames[1], heroFrames[2]],
      heroFrames[15],
      heroFrames[21]
    );

    this.world = new PIXI.Container();
    for (let y = 0; y < map.width; y++) {
      for (let x = 0; x < map.width; x++) {
        let tile = map.tiles[y * map.width + x];
        let sprite = new PIXI.Sprite(backgroundTexture[tile]);
        sprite.x = x * BACKGROUNDTILESIZE;
        sprite.y = y * BACKGROUNDTILESIZE;
        this.world.addChild(sprite);
      }
    }
    this.world.scale.x = 3.1;
    this.world.scale.y = 3.1;

    this.healthBar = new PIXI.Container();
    this.healthBar.position.set(this.app.view.width - 170, 30);

    //Create health bar
    const outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xff3300);
    outerBar.drawRect(0, 0, 130, 15);
    outerBar.endFill();
    const hpStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 10,
      fill: "white",
    });
    const hp = new PIXI.Text("H P", hpStyle);


    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.hero);
    this.app.stage.addChild(this.healthBar);
    this.healthBar.addChild(outerBar);
    this.healthBar.addChild(hp)
    this.healthBar.outer = outerBar;
    hp.position.set(-20,0);

    this.hero.scale.x = 1.7;
    this.hero.scale.y = 1.7;
    this.hero.play();
    this.hero.animationSpeed = 0.1;
    this.hero.x = this.app.view.width / 2;
    this.hero.y = 0;

    // preparing end game message
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
    this.message = new PIXI.Text("YOU LOST!", style);
    this.message.alpha = 0.0;
    this.app.stage.addChild(this.message);

    this.app.ticker.add((delta) => {
      this.showPlayer();
    });

    this.pushFood(foodFrames, this.app);
  }

  // displaying player with animation
  showPlayer() {
    if (this.hero.y < 360) {
      this.hero.y += 8;
    }
  }

  // start sending food items
  pushFood(frames, app) {
    const foodSprites = [];
    const setIntervalHandler = setInterval(() => {
      let foodItem = new PIXI.Sprite(frames[Math.floor(Math.random() * 63)]);
      foodItem.scale.x = 2;
      foodItem.scale.y = 2;
      foodItem.x = Math.floor(Math.random() * 740);
      foodItem.vx = 0;
      foodItem.vy = 0;
      foodItem.hit = false;
      foodItem.lost = false;
      foodSprites.push(foodItem);
      app.stage.addChild(foodItem);
      app.ticker.add(() => {
        this.startGame(foodSprites, setIntervalHandler);
      });
    }, 2000);
  }

  //game logic
  startGame(sprites, handler) {
    sprites.forEach((el) => {
      if (el.hit) {
        el.alpha = 0.0;
      }
      //if the player missed the food shorten the health bar and check if the game has finished 
      if (el.y > 500 && !el.hit) {
        if (!el.lost && this.healthBar.outer.width > 0) {
          this.healthBar.outer.width -= 13;
        }

        el.alpha = 0.2;
        el.lost = true;
        this.checkIfLost(sprites, handler);
      }

      el.y += 0.1;
      if (this.hitTestRectangle(this.hero, el)) {
        el.hit = true;
      }
    });
  }

  // checking if player missed 10 items
  checkIfLost(sprites, handler) {
    const numberOfLost = sprites.filter((el) => el.lost === true);
    if (numberOfLost.length > 9) {
      this.message.alpha = 1.0;
      this.healthBar.visible = false;
      this.world.visible = false;
      clearInterval(handler);
    }
  }

  //checking if player hit the food item
  hitTestRectangle(r1, r2) {
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    hit = false;

    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    if (Math.abs(vx) < combinedHalfWidths) {
      if (Math.abs(vy) < combinedHalfHeights) {
        hit = true;
      } else {
        hit = false;
      }
    } else {
      hit = false;
    }

    return hit;
  }
}



class Hero extends PIXI.AnimatedSprite {
  constructor(texture, frameRight, frameLeft) {
    super(texture);
    this.frameRight = frameRight;
    this.frameLeft = frameLeft;

    window.addEventListener("keydown", (e) => this.move(e));
  }

  move(e) {
    if (e.key === "ArrowUp") {
      if (this.y > 20) {
        this.y -= 80;
      } else {
        this.y = this.y;
      }
    } else if (e.key === "ArrowRight") {
      this.texture = this.frameRight;
      if (this.x < 700) {
        this.x += 15;
      } else {
        this.y = this.y;
      }
    } else if (e.key === "ArrowLeft") {
      this.texture = this.frameLeft;
      if (this.x > -30) {
        this.x -= 15;
      }
    }
  }
}

const game = new Game();
