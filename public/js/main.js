// 1 - Start enchant.js
enchant();
 
// 2 - On document load 
window.onload = function() {
	// 3 - Starting point
	var game = new Game(1000, 537);
	// 4 - Preload resources
	//Preload new assets
	game.preload('images/BG.png', 'images/Char.png', 'images/Rock.png');
	// 5 - Game settings
	game.fps = 30;
	game.scale = 1;
	game.onload = function() {
		// 6 - Once Game finishes loading
		console.log("Hi, Ocean!");
		var scene = new SceneIntro();
		// 6 - Start scene
		game.pushScene(scene);
	}
	
	// 1 - Variables
	
	// 7 - Start
	game.start(); 
	window.scrollTo(0,0);  
	
	var SceneIntro = Class.create(Scene, {
		initialize: function() {
			var gameOverLabel, scoreLabel;
			Scene.apply(this);
			this.backgroundColor = 'black';
			
			gameOverLabel = new Label("WELCOME TO <br> <br>FLOATY GHOST <br> <br> <br>Dodge the flying rocks <br> <br> by clicking where you <br>want to go.");
			gameOverLabel.x = game.width/3;
			gameOverLabel.y = 128;
			gameOverLabel.color = 'white';
			gameOverLabel.font = '32px strong';
			gameOverLabel.textAlign = 'center';
			
			scoreLabel = new Label('Click to start');
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
	
	
	var SceneGame = Class.create(Scene, {
		initialize: function() {
			var game, label, bg, ghost, rockGroup;
			
			//Call the superclass constructor
			Scene.apply(this);
			//Access to the game singleton instance
			game = Game.instance;
			//Create child nodes
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
			//place penguin on right side
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
			this.addEventListener(Event.ENTER_FRAME, this.update);
			this.generateRockTimer = 0;
			this.scoreTimer = 0;
			this.score = 0;
			this.rockSpeed = 300;
			
		},
		
		//Swap horizontal and vertical lanes
		handleTouchControl: function(evt) {
			var laneHeight, lane;
			laneHeight = 537/3;
			lane = Math.floor(evt.y/laneHeight);
			lane = Math.max(Math.min(2, lane), 0);
			this.ghost.switchToLaneNumber(lane);
		},
		update: function(evt) {
			//Check if its time to create a new set of obstacles
			
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
			
			gameOverLabel = new Label("GAME OVER, <br><br>FOOLISH MORTAL<br><br>Tap to restart");
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
	
