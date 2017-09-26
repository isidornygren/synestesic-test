var buttons = [];
var vol = 1;
var play = false;
var playTimer;
var game = {
  play: false,
  playTimer: null,
  timerTime: 2000,
  level: 0,
  score: 0,
  latestUpdate: 0,
  clicked: 0,
  lost: false,
  lose_sound: new Pizzicato.Sound('../sound/lose.wav'),
  reset: function(){
    this.timerTime = 2000;
    this.level = 0;
    this.lost = false;
    this.score = 0;
    this.latestUpdate = 0;
    this.clicked = 0;
  }
}

// Enable navigation prompt
window.onbeforeunload = function() {
    return true;
};

function createButton(canvas, message, x, y, sound){
  var button = {
    x: x,
    y: y,
    width: 96,
    height: 32,
    message: message,
    time: 0,
    score: 10,
    hover:false,
    press:false,
    success: new Pizzicato.Sound('../sound/success.wav'),
    onPress: function(index){
      this.success.play();
      this.remove(index);
    },
    remove: function(index){
      clearInterval(this.timer);
      this.sound.stop();
      if(game.play){
        game.score = game.score + this.score + game.level;
        game.clicked = game.clicked + 1;
        // every fifth level
        if(game.clicked%5 == 0){
          game.level = game.level + 1;
          game.timerTime = game.timerTime*0.9;
        }
      }
      buttons.splice(index, 1)
    }
  };
  if(sound){
    button.sound = new Pizzicato.Sound({
        source: 'wave',
        options: {
            type: 'sine',
            frequency: 256 + Math.abs(y - 512),
            volume: vol
        }
      });
    button.sound.play();
    button.timer = setInterval(function(){
      osc = Math.sin(button.time);
      button.time = button.time + (x/512)/2;
      button.sound.volume = (osc + 1)/2 * vol;
    }, 10);
  }
  // Add the button to the button list
  buttons.push(button);
}

function clearButtons(){
  buttons.forEach(function(button) {
    clearInterval(button.timer);
    button.sound.stop();
  });
  buttons = [];
}

function checkButtonColl(button, x, y){
  if(x > button.x && x < (button.x + button.width)){
    if(y > button.y && y < (button.y + button.height)){
      return button;
    }
  }
  return false;
}

function checkButtonHover(x, y){
  buttons.forEach(function(button) {
    if(checkButtonColl(button, x, y)){
      button.hover = true;
    }else{
      button.hover = false;
    }
  });
};

function checkButtonPress(x, y){
  buttons.forEach(function(button, i) {
    if(checkButtonColl(button, x, y)){
      button.press = true;
      button.onPress(i);  // Call the press function
    }else{
      button.press = false;
    }
  });
};

function randomButton(canvas){
  var x = Math.floor(Math.random()*14)*32; // 16 - 3 (width)
  var y = Math.floor(Math.random()*16)*32; // 16 - 1 (height)
  console.log('x: ' + x + ', y: ' + y)
  createButton(canvas, "Press Me", x, y, true);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function render(canvas){
  ctx = canvas.getContext('2d');
  // Clear the context
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Render all the buttons
  buttons.forEach(function(button) {
    if(button.hover){
      ctx.fillStyle = '#5bc0de';
    }else{
      ctx.fillStyle = '#428bca';
    }
    ctx.fillRect(button.x,button.y, button.width, button.height);
    ctx.fillStyle = '#f9f9f9';
    ctx.font = "16px Arial";
    ctx.fillText(button.message,button.x + 14,button.y + 20);
  });
  if(game.lost){
    ctx.fillStyle = 'black';
    ctx.font = "30px Arial";
    ctx.fillText('Well done!',200,120);
    ctx.font = "22px Arial";
    ctx.fillText('Score:' + game.score,200,160);
    ctx.fillText('Level:' + game.level,200,180);
  }
  // Update game info text
  $('#game-score').text('score: ' + game.score);
  $('#game-level').text('level: ' + game.level);
  if(game.play){
    $('#game-next').text('next: ' + Math.round((game.timerTime - (new Date() - game.latestUpdate))/100)/10);
  }else{
    $('#game-next').text('next: nil');
  }
}

$(document).ready(function() {
  // Handler for the volume slider
  var slider = document.getElementById('vol-slider');
  slider.oninput = function() {
    vol = this.value;
    if(vol < 0.01){
      $("#volume-icon").attr("class", "fa fa-volume-off");
    }else if(vol < 1/2){
      $("#volume-icon").attr("class", "fa fa-volume-down");
    }else{
      $("#volume-icon").attr("class", "fa fa-volume-up");
    }
  }

  // Get the main testing canvas
  var canvas = document.getElementById('testing-area');

  function gametick(){
    if(game.play){
      game.latestUpdate = new Date();
      randomButton(canvas);
      if(buttons.length > 2){
        // Lose if there is more then 2 buttons on the playing field
        var score = game.score;
        var level = game.level;
        clearButtons();
        game.lost = true;
        game.lose_sound.play();
      }else{
        setTimeout(gametick, game.timerTime);
      }
    }
  }

  // Initiate the buttons
  $("#button-add").click(function() {
    randomButton(canvas);
  });
  $("#button-sub").click(function() {
    var b = buttons[0];
    clearInterval(b.timer);
    b.sound.stop();
    buttons.shift();
  });

  $("#button-clear").click(function() {
    clearButtons();
  });

  $("#button-rand").click(function() {
    clearButtons();
    var n = Math.abs(Math.random()*10);
    for (i = 0; i < n; i++) {
        randomButton(canvas);
    }
  });

  $("#button-play").click(function() {
    clearButtons();
    if(!game.play){
      $("#button-play").html("stop");
      // Engage play mode
      game.play = true;
      setTimeout(gametick, game.timerTime);
      //game.playTimer = setInterval(function(){
      //  game.latestUpdate = new Date();
      //  randomButton(canvas);
      //}, (game.timerTime));  // Create a new button every 10th second
    }else{
      $("#button-play").html("play");
      game.play = false;
      //clearInterval(game.playTimer);
      game.reset();
    }
  });

  // Main loop
  var loop = setInterval(function(){
    render(canvas);
  }, (1000/60));

  // Mouse pos listener
  canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    checkButtonHover(mousePos.x, mousePos.y);
    var message = 'Mouse position: x: ' + mousePos.x + ', y: ' + mousePos.y;
    $('#testing-info').text(message);
  }, false);

  // Mouse press listener
  canvas.addEventListener('click', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    checkButtonPress(mousePos.x, mousePos.y);
  });

});
