var buttons = [];
var vol = 1;
var play = false;
var playTimer;
var totSeq = 10;

var game = {
  play: false,
  playTimer: null,
  timerTime: 1000,
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
var test_instance = {
  id: null,
  num: null,
  seq: null,
  initiated: false,
  start_time: new Date(),
  init_time: new Date(),
  end_time: new Date(),
  finished: true,
  distance: 0,
  mouse: {
    cul: 0,
    init_cul: 0,
    last: {
      x: 0,
      y: 0,
    }
  },
  start_pos: {
    x: 0,
    y: 0,
  },
  end_pos: {
    x: 0,
    y: 0,
  },
  init_v: {
    done: false,
    angle: 0,
    force: 0,
  },
  reset: function(){
    this.initiated = false;
    this.start_time = new Date();
    this.init_time = new Date();
    this.end_time = new Date();
    this.finished = true;
    this.distance = 0;
    this.mouse.cul = 0;
    this.mouse.init_cul = 0;
    this.start_pos = {
      x: 0,
      y: 0,
    };
    this.end_pos = {
      x: 0,
      y: 0,
    };
    this.init_v = {
      done: false,
      angle: 0,
      force: 0,
    };
  }
}

var test_results = {
  id: null,
  num: null,
  seq: 0,
  time_until_move_tot: 0,
  travel_time_tot: 0,
  total_time_tot: 0,
  distance_tot: 0,
  init_distance_tot: 0,
  init_vector_force_tot: 0,
  vector_angle_dif_tot: 0,
  reset: function(){
    id = null;
    num = null;
    seq = 0;
    time_until_move_tot = 0;
    travel_time_tot = 0;
    total_time_tot = 0;
    distance_tot = 0;
    init_distance_tot = 0;
    init_vector_force_tot = 0;
    vector_angle_dif_tot = 0;
  }
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }
}
//https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

var user_token = getQueryVariable('token');
var user_id = getQueryVariable('id');

function postTest(test){
  $.ajax({
    type: "POST",
    url: 'http://' + window.location.host + "/api/testinstance",
    data: JSON.stringify(test),
    contentType: "application/json; charset=utf-8",
    crossDomain: true,
    dataType: "json",
    success: function (data, status, jqXHR) {
      console.log('AJAX POST SUCCESS')
      console.log(JSON.stringify(data));
      console.log(JSON.stringify(status));
      console.log(JSON.stringify(jqXHR));
      //window.location.href = '/test?token=' + data.key;
      var score = game.score;
      var level = game.level;
      clearButtons();
      game.lost = true;
      game.lose_sound.play();
      //TODO maybe redirect to a thanks for completion page?
    },
    error: function (jqXHR, status) {
        // error handler
        console.log(jqXHR);
        alert('Error' + status.code + ':' + status.body);
    }
 });
}

// Enable navigation prompt
window.onbeforeunload = function() {
    return true;
};

$(document).ready(function() {
  // Get the token
  // Get the main testing canvas
  var canvas = document.getElementById('testing-area');

  function gametick(){
    if(game.play){
      game.latestUpdate = new Date();
      //randomButton(canvas);
      test_instance.seq = test_instance.seq + 1;
      instantiateTest(1, canvas);
      /*if(buttons.length > 2){
        // Lose if there is more then 2 buttons on the playing field
        var score = game.score;
        var level = game.level;
        clearButtons();
        game.lost = true;
        game.lose_sound.play();
      }else{
        setTimeout(gametick, game.timerTime);
      }*/
    }
  }

  function createButton(canvas, message, x, y, sound, isTest){
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
      test: isTest,
      success: new Pizzicato.Sound('../sound/success.wav'),
      onPress: function(index){
        // The button is part of the test
        if(this.test){
          test_instance.finished = true;
          test_instance.end_time = new Date();
          // Add test results to total test variables
          var start_angle = Math.atan2(test_instance.end_pos.y - test_instance.start_pos.y, test_instance.end_pos.y - test_instance.start_pos.x)
          test_results.time_until_move_tot    = test_results.time_until_move_tot + (test_instance.init_time.getTime() - test_instance.start_time.getTime());
          test_results.travel_time_tot        = test_results.travel_time_tot + (test_instance.end_time.getTime() - test_instance.init_time.getTime());
          test_results.total_time_tot         = test_results.total_time_tot + (test_instance.end_time.getTime() - test_instance.start_time.getTime());
          test_results.distance_tot           = test_results.distance_tot + test_instance.mouse.cul;
          test_results.init_distance_tot      = test_results.init_distance_tot + test_instance.mouse.init_cul;
          test_results.init_vector_force_tot  = test_results.init_vector_force_tot + test_instance.init_v.force;
          test_results.vector_angle_dif_tot   = test_results.vector_angle_dif_tot + Math.min((2 * Math.PI) - Math.abs(start_angle - test_instance.init_v.angle), Math.abs(start_angle - test_instance.init_v.angle));
          // If the player has played enough buttons already
          if(test_instance.seq >= totSeq){
            var data = {
              id: user_id,
              token: user_token,
              test_num: 1,
              test_seq: 1,
              init_dist: test_results.init_distance_tot/test_instance.seq,
              init_v_angle: 1,
              init_v_force: test_results.init_vector_force_tot/test_instance.seq,
              goal_v_angle: 1,
              goal_v_force: 1,
              time: test_results.total_time_tot/test_instance.seq,
              time_til_move: test_results.time_until_move_tot/test_instance.seq,
              travel_time: test_results.travel_time_tot/test_instance.seq,
              angle_dif: test_results.vector_angle_dif_tot/test_instance.seq,
            }
            postTest(data);
          }else{
            setTimeout(gametick, game.timerTime)
          }
        }
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
    //console.log('x: ' + x + ', y: ' + y)
    createButton(canvas, "Press Me", x, y, true, false);
  }

  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var cur_x = (evt.clientX - rect.left);
    var cur_y = (evt.clientY - rect.top);

    if(!test_instance.finished){
      var dX = Math.abs(cur_x - test_instance.mouse.last.x);
      var dY = Math.abs(cur_y - test_instance.mouse.last.y);
      if(!test_instance.initiated && (dX > 0 || dY > 0)){
        test_instance.initiated = true;
        test_instance.init_time = new Date();
      }
      test_instance.mouse.cul = test_instance.mouse.cul + dX + dY;

      if(!test_instance.init_v.done){
        test_instance.mouse.init_cul = test_instance.mouse.init_cul + dX + dY;
        // If mouse has traveled 25% of total distance calc init vector
        if(test_instance.mouse.init_cul > test_instance.distance*0.25){
          test_instance.init_v.done = true;
          test_instance.init_v.angle = Math.atan2(cur_y - test_instance.start_pos.y, cur_x - test_instance.start_pos.x);
          // Force is just the traveled way towards the current goal
          test_instance.init_v.force = Math.sqrt(Math.pow(cur_x - test_instance.start_pos.x,2) + Math.pow(cur_y - test_instance.start_pos.y, 2))/(new Date() - test_instance.init_time);
        }
      }
    }
    test_instance.mouse.last.x = cur_x;
    test_instance.mouse.last.y = cur_y;
    return {
      x: cur_x,
      y: cur_y
    };
  }

  function testButton(num, canvas){
    var x = Math.floor(Math.random()*14)*32; // 16 - 3 (width)
    var y = Math.floor(Math.random()*16)*32; // 16 - 1 (height)
    if(num == 0){ // 0 is without sound
      createButton(canvas, "Press Me", x, y, false, true);
    }else{
      createButton(canvas, "Press Me", x, y, true, true);
    }
    return {
      x: x + 24,
      y: y + 8
    }
  }

  function instantiateTest(num, canvas){
    test_instance.reset();
    test_instance.start_time = new Date();
    test_instance.finished = false;
    test_instance.start_pos.x = test_instance.mouse.last.x;
    test_instance.start_pos.y = test_instance.mouse.last.y;
    test_instance.init_v.done = false;
    test_instance.end_pos = testButton(num, canvas);
    test_instance.distance = Math.sqrt(Math.pow(test_instance.end_pos.x - test_instance.start_pos.x,2) + Math.pow(test_instance.end_pos.y - test_instance.start_pos.y, 2));

  }

  function render(canvas){
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    // Clear the context
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Render all the buttons
    buttons.forEach(function(button) {
      if(button.hover){
        ctx.fillStyle = '#5bc0de';
      }else{
        ctx.fillStyle = '#428bca';
      }
      ctx.strokeStyle = "#0275d8";
      //ctx.fillRect(button.x,button.y, button.width, button.height);
      roundRect(ctx, button.x, button.y, button.width, button.height, 3, true);
      ctx.fillStyle = '#f9f9f9';
      ctx.font = "16px Arial";
      ctx.fillText(button.message,button.x + 14,button.y + 21);
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
    var start_angle = Math.atan2(test_instance.end_pos.y - test_instance.start_pos.y, test_instance.end_pos.y - test_instance.start_pos.x) //TODO don't do these calculations all the time
    var obj = $('#test-info-box').text('id:' + test_instance.id +
      '\nnum: ' + test_instance.num +
      '\nseq: ' + test_instance.seq +
      '\ntime until movement: ' + (test_instance.init_time.getTime() - test_instance.start_time.getTime()) + 'ms' +
      '\ntravel time: ' + (test_instance.end_time.getTime() - test_instance.init_time.getTime()) + 'ms' +
      '\ntotal time: ' + (test_instance.end_time.getTime() - test_instance.start_time.getTime()) + 'ms' +
      '\nfinished: ' + test_instance.finished +
      '\ndistance: ' + test_instance.distance +
      '\nmouse culmunative: ' + test_instance.mouse.cul +
      '\nmouse last pos: ' + test_instance.mouse.last.x + ', ' + test_instance.mouse.last.y +
      '\nstart pos: ' + test_instance.start_pos.x + ', ' + test_instance.start_pos.y +
      '\nend pos x: ' + test_instance.end_pos.x + ', ' + test_instance.end_pos.y +
      '\nmovement initiated: ' + test_instance.initiated +
      '\ninit vector done: ' + test_instance.init_v.done +
      '\ninit mouse culmunative: ' + test_instance.mouse.init_cul +
      '\ninit vector angle: ' + test_instance.init_v.angle +
      '\ninit vector force: ' + test_instance.init_v.force +
      '\nstart vector angle: ' + start_angle + //TODO don't do these calculations all the time
      '\nvector angle dif: ' + Math.min((2 * Math.PI) - Math.abs(start_angle - test_instance.init_v.angle), Math.abs(start_angle - test_instance.init_v.angle)) + // calculate the min angle diff
      '\n------------ MEAN --------------' +
      '\ntime until move: ' + (test_results.time_until_move_tot/test_instance.seq).toFixed(2) + 'ms' +
      '\ntravel time: ' + (test_results.travel_time_tot/test_instance.seq).toFixed(2) + 'ms' +
      '\ntotal time: ' + (test_results.total_time_tot/test_instance.seq).toFixed(2) + 'ms' +
      '\ndistance: ' + (test_results.distance_tot/test_instance.seq).toFixed(2) + ' pixels' +
      '\ninitial distance: ' + (test_results.init_distance_tot/test_instance.seq).toFixed(2) +  ' pixels' +
      '\ninitial v force: ' + (test_results.init_vector_force_tot/test_instance.seq).toFixed(2) +  ' fu' +
      '\nvector angle diff: ' + (test_results.vector_angle_dif_tot/test_instance.seq).toFixed(2) + ' radians'
     );
     obj.html(obj.html().replace(/\n/g,'<br/>'));
  }
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
    //clearButtons();
    //instantiateTest(1, canvas);
    clearButtons();
    if(!game.play){
      $("#button-play").html("stop");
      // Engage play mode
      game.play = true;
      test_instance.seq = 0;
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
  }, false);

  // Mouse press listener
  canvas.addEventListener('click', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    checkButtonPress(mousePos.x, mousePos.y);
  });

});
