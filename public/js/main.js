
enchant();
 

window.onload = function() {

	var game = new Game(1000, 537);
	
	game.preload('images/BG.png', 'images/Char.png', 'images/Rock.png');

	game.fps = 30;
	game.scale = 1;
	game.onload = function() {
	

		var scene = new SceneIntro();
	
		game.pushScene(scene);
	}
	
	
	game.start(); 
	window.scrollTo(0,0);  
	
	var SceneIntro = Class.create(Scene, {
		initialize: function() {
			var introLabel, clickLabel;
			Scene.apply(this);
			this.backgroundColor = 'black';
			
			introLabel = new Label("WELCOME TO <br> <br>FLOATY GHOST <br> <br> <br>Dodge the flying rocks <br> <br> by clicking where you <br>want to go.");
			introLabel.x = game.width/3;
			introLabel.y = 128;
			introLabel.color = 'white';
			introLabel.font = '32px strong';
			introLabel.textAlign = 'center';
			
			clickLabel = new Label('Click to start');
			clickLabel.x = game.width/3;
			clickLabel.y = 30;
			clickLabel.color = 'white';
			clickLabel.font = '16px strong';
			clickLabel.textAlign = 'center';
			
			this.addChild(introLabel);
			this.addChild(clickLabel);
			
			this.addEventListener(Event.TOUCH_START, this.touchToStart);
			
		},
		touchToStart: function(evt) {
			var game = Game.instance;
			game.replaceScene(new SceneGame());
			
		}
	});
	
	
	var SceneGame = Class.create(Scene, {
		initialize: function() {
			var game, label, bg, ghost, rockGroup;
			
			Scene.apply(this);
			
			game = Game.instance;
	
			label = new Label('SCORE<br>0');
			label.x = this.width/2;
			label.y = 400;
			label.color = 'white';
			label.font = '20px strong';
			label.textAlign = 'center';
			label._style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
			this.scoreLabel = label;
			
			
			//replace backgroun size and img
			bg = new Sprite(1000,537);
			bg.image = game.assets['images/BG.png'];
			//place ghost on right side
			ghost = new Ghost();
			ghost.y = game.height/2 - ghost.height/2;
			ghost.x = 830;
			this.ghost = ghost;
			rockGroup = new Group();
			this.rockGroup = rockGroup;
			//Add child nodes
			this.addChild(bg);
		
			this.addChild(rockGroup);
			this.addChild(label);
			this.addChild(ghost);
			
			this.addEventListener(Event.TOUCH_START, this.handleTouchControl);
			this.addEventListener(Event.UP_BUTTON_DOWN, this.handleUpControl);
			this.addEventListener(Event.DOWN_BUTTON_DOWN, this.handleDownControl);
			this.addEventListener(Event.ENTER_FRAME, this.update);
			
			this.generateRockTimer = 0;
			this.scoreTimer = 0;
			this.score = 0;
			this.rockSpeed = 300;
			
		},
		handleDownControl: function(evt) {
			var laneHeight, curLane, nextLane;
			laneHeight = 537/3;
			curLane = Math.floor(this.ghost.y/laneHeight);
			curLane = Math.max(Math.min(2, curLane), 0);
			if (curLane < 3) {
				nextLane = curLane + 1;
			} else {
				nextLane = curLane;
			}
			this.ghost.switchToLaneNumber(nextLane);
		
			
		},
		handleUpControl: function(evt) {
			var laneHeight, curLane, nextLane;
			laneHeight = 537/3;
			curLane = Math.floor(this.ghost.y/laneHeight);
			curLane = Math.max(Math.min(2, curLane), 0);
			if (curLane > 0) {
				nextLane = curLane - 1;
			} else {
				nextLane = curLane;
			}
			this.ghost.switchToLaneNumber(nextLane);
		
			
		},
	
		handleTouchControl: function(evt) {
			var laneHeight, lane;
			laneHeight = 537/3;
			lane = Math.floor(evt.y/laneHeight);
			lane = Math.max(Math.min(2, lane), 0);
			this.ghost.switchToLaneNumber(lane);
		},
		update: function(evt) {

			
			//Randomize, also add health and points
			//For now, just get points working, not health
			this.generateRockTimer += evt.elapsed * 0.001;
			var speed = 5*(this.score) + 300;
			if (this.generateRockTimer >= 300.0/speed) {
				var rock;
				this.generateRockTimer -= 300.0/speed;
				console.log(speed);
				console.log(speed/300.0);
				rock = new Rock(Math.floor(Math.random()*3), speed);
				this.rockGroup.addChild(rock);
				
			}
			for (var i = this.rockGroup.childNodes.length -1; i >= 0; i--) {
				var rock;
				rock = this.rockGroup.childNodes[i];
				if (rock.intersect(this.ghost)) {
					this.rockGroup.removeChild(rock);
					
					
					game.replaceScene(new SceneGameOver(this.score));
					break;
				}
				
			}
			this.scoreTimer += evt.elapsed * 0.001;
			if (this.scoreTimer >= 0.5) {
				this.setScore(this.score + 1);
				this.scoreTimer -= 0.5;
			}
		},
		setScore: function(value) {
			this.score = value;
			this.scoreLabel.text = 'SCORE<br>' + this.score;
		}
	});
	
	var Ghost = Class.create(Sprite, {
		initialize: function() {
			//Call superclass constructor
			//resize and replace img
			Sprite.apply(this, [100, 130]);
			this.image = Game.instance.assets['images/Char.png'];
			//Animate
			this.animationDuration = 0;
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
			
		}, 
		updateAnimation: function(evt) {
			this.animationDuration += evt.elapsed * 0.001;
			if (this.animationDuration >= 0.25) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= 0.25;
			}
			
		},
		switchToLaneNumber: function(lane) {
			//switch to x and y, height and width
			var targetY = lane * (game.height/3);
			this.y = targetY;
		}
	});
	
	var Rock = Class.create(Sprite, {
		initialize: function(lane, speed) {
			//resize re img
			Sprite.apply(this, [80,86]);
			this.image = Game.instance.assets['images/Rock.png'];
			this.rotationSpeed = 0;
			this.speed = speed;
			console.log(speed);
			this.setLane(lane);
			this.addEventListener(Event.ENTER_FRAME, this.update);
			
		},
		setLane: function(lane) {
			var game, distance;
			game = Game.instance;
			distance = game.height/3;
			
			
			//swap x and y, height and width
			this.rotationSpeed = Math.random() * 100 - 50;
			this.y = game.height/2 - this.height/2 + (lane -1) * distance;
			this.x = 0;
			this.rotation = Math.floor(Math.random() * 360);	
		},
		
		update: function(evt) {
			//make x speed, not y
			var xSpeed, game, speedMod;
			game = Game.instance;
		
			xSpeed = this.speed;
			
			this.x += xSpeed * evt.elapsed * 0.001;
			this.rotation += this.rotationSpeed * evt.elapsed * 0.001;
			if (this.x > game.width) {
				this.parentNode.removeChild(this);
			}
		}
	});
	var SceneGameOver = Class.create(Scene, {
		initialize: function(score) {
			var gameOverLabel, scoreLabel;
			Scene.apply(this);
			this.backgroundColor = 'black';
			
			gameOverLabel = new Label("GAME OVER, <br><br>FOOLISH MORTAL<br><br>Click to restart");
			gameOverLabel.x = game.width/3;
			gameOverLabel.y = 128;
			gameOverLabel.color = 'white';
			gameOverLabel.font = '32px strong';
			gameOverLabel.textAlign = 'center';
			
			scoreLabel = new Label('SCORE<br>' + score);
			scoreLabel.x = game.width/3;
			scoreLabel.y = 30;
			scoreLabel.color = 'white';
			scoreLabel.font = '16px strong';
			scoreLabel.textAlign = 'center';
			
			this.addChild(gameOverLabel);
			this.addChild(scoreLabel);
			
			this.addEventListener(Event.TOUCH_START, this.touchToRestart);
			
		},
		touchToRestart: function(evt) {
			var game = Game.instance;
			game.replaceScene(new SceneGame());
			
		}
		
	});
};
	
