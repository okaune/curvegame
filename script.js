$(document).ready(function() {

  /********************

    REGISTER CANVAS

  ********************/

  var canvas = document.getElementById("theCanvas");
  canvas.width = $(this).width() - 200 - 6;
  canvas.height = $(this).height() - 6;
  var ctx = canvas.getContext("2d");

  /********************

    GLOBAL VARIABLES

  ********************/

  var CANVAS_WIDTH = canvas.width;
  var CANVAS_HEIGHT = canvas.height;

  var colors = ['#ff0000', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#0000ff' ];
  var buttons = [37, 39, 65, 68, 66, 77]; // Left, right | A, D | B, M

  var MAX_NUM_OF_PLAYERS = 3;
  var NUM_OF_PLAYERS;
  var NUM_DEAD = 0;

  var NUM_OF_POINTS;
  var pointsTable = [];

  var GAME_TICK = 0;
  var finalTime = 300;
  var countdownTime = 5;

  var win = false;

  var turnStrength = 2;
  var moveSpeed = 1.5;

  var dotRadius = 5;
  var sideBarWidth = 200;
  var borderWidth = 3;

  /**************

    KEY EVENTS

  **************/

  var keyState = {};

  window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
  },true);

  window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
  },true);

  function keyCheck(entity) {
    if (keyState[entity.leftArrow] /*|| keyState[entity.leftArrow+27]*/){
      entity.degrees -= turnStrength;
    }
    if (keyState[entity.rightArrow] /*|| keyState[entity.leftArrow+27]*/){
      entity.degrees += turnStrength;
    }
  }

  /****************

    PLAYER STUFF

  ****************/

  var playerList = [];

  function createPlayer(id, xPos, yPos, degrees, color, leftArrow, rightArrow) {
    var player = {
      id:id,
      xPos:xPos,
      xPrev:xPos,
      yPos:yPos,
      yPrev:yPos,
      degrees:degrees,
      color:color,
      leftArrow:leftArrow,
      rightArrow:rightArrow,
      alive:true,
      nextGap:0,
      gapSize:0,
      points:0,
    }

    playerList[id] = player;

  }

  function players(num) {
    NUM_OF_PLAYERS = num;
    NUM_OF_POINTS = (num - 1) * 10;

    for (var i = 1; i < num+1; i++) {
      var startX = Math.floor(Math.random() * CANVAS_WIDTH);
      var startY = Math.floor(Math.random() * CANVAS_HEIGHT);
      var startDeg = Math.floor(Math.random() * 360);


      createPlayer('P' + i, 
                    startX, 
                    startY, 
                    startDeg, 
                    colors[i-1], 
                    buttons[((i-1)*2)], 
                    buttons[((i-1)*2)+1]);
    }
  }

  // Player init
  function playerInit(entity) {
    makeDot(entity);

    // Preparing lineDrawing
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgb(0, 0, 0)';
    ctx.moveTo(entity.xPos, entity.yPos);
  }

  function makeDot(entity) {
    $("body").append("<div class='dot dot_" + entity.id + "' style='background: " + entity.color + "'></div>");
  }

  /****************

    LINE DRAWING

  ****************/

  function drawLine(entity) {
    ctx.lineWidth = 5;
    lineGap(entity);
    ctx.beginPath();
    ctx.moveTo(entity.xPrev, entity.yPrev);
    ctx.lineTo(entity.xPos, entity.yPos);
    ctx.stroke();

    entity.xPrev = entity.xPos;
    entity.yPrev = entity.yPos;
  }

  // Gaps in line
  function lineGap(entity) {
    if (entity.nextGap > 0) {
      ctx.strokeStyle = entity.color;
      entity.nextGap--;
    } else {
      if (entity.gapSize > 0) {
        ctx.strokeStyle = '#000000';
        entity.gapSize--;
      } else {
        ctx.strokeStyle = entity.color;
        entity.gapSize = Math.floor(Math.random() * 5) + 20; // From 20 to 25
        entity.nextGap = Math.floor(Math.random() * 300) + 50; // From 50 to 350
      }
    }
  }

  function moveDot(entity) {
    var xDeg = Math.cos(entity.degrees * (Math.PI / 180)) * moveSpeed;
    var yDeg = Math.sin(entity.degrees * (Math.PI / 180)) * moveSpeed;
    entity.xPos += xDeg;
    entity.yPos += yDeg;

    $(".dot_" + entity.id).css({
      'left': entity.xPos - dotRadius + sideBarWidth + borderWidth + 'px',
      'top': entity.yPos - dotRadius + borderWidth + 'px'
    });
  }

  /**************

    COLLITIONS

  **************/

  function collitionTest(entity) {

    var xCheck = entity.xPos + (Math.cos(entity.degrees * (Math.PI / 180)) * dotRadius);
    var yCheck = entity.yPos + (Math.sin(entity.degrees * (Math.PI / 180)) * dotRadius);

    var pixel = ctx.getImageData(xCheck, yCheck, 1, 1).data; 
    var hex = "#" + ("000000" + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6);

    if (hex != '#000000' || entity.xPos < 0 + dotRadius  || entity.xPos > CANVAS_WIDTH - dotRadius || entity.yPos < 0 + dotRadius || entity.yPos > CANVAS_HEIGHT - dotRadius) {
      // COLLITION
      
      NUM_DEAD++;
      entity.alive = false;
      updatePoints();
      updateScoreboard();
    }
  }

  function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) {
      throw "Invalid color component";
    }
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  /******************

    POINTS HANDLING

  ******************/

  function updatePoints() {
    for (var player in playerList) {
      if (playerList[player].alive) {
        playerList[player].points++;
      }
    }
  }

  /**************

    SCOREBOARD

  **************/

  function updateScoreboard() {

    // Sort playerList
    var count = 0;
    for (var player in playerList) {
      pointsTable[count] = [player, playerList[player].points];
      count++;
    }

    pointsTable.sort(sortArray);

    // Clear player list
    $(".scoreboard").html("<span class='playTo'>Spiller til " + NUM_OF_POINTS + " poeng.</span>");
    // Write new player list
    for(var i = 0; i < pointsTable.length; i++) {
      $(".scoreboard").append("<div style='color:" + playerList[pointsTable[i][0]].color + "'>" + pointsTable[i][0] + "<span class='pointsTable_points'> " + pointsTable[i][1] + "</span></div>");
    }

    function sortArray(a, b) {
      if (a[1] === b[1]) {
        return 0;
      }
      else {
        return (a[1] < b[1]) ? 1 : -1;
      }
    }
  }

  /**************

    RESET GAME

  **************/

  function resetGame() {
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

    checkWin();

    if (!win) {
      //countdown();
      for (var player in playerList) {
        var tempColor = playerList[player].color;
        playerList[player].color = '#000000';
        var newX = Math.floor(Math.random() * CANVAS_WIDTH);
        var newY = Math.floor(Math.random() * CANVAS_HEIGHT);
        playerList[player].xPrev = newX;
        playerList[player].yPrev = newY;
        playerList[player].xPos = newX;
        playerList[player].yPos = newY;
        playerList[player].degrees = Math.floor(Math.random() * 360);
        playerList[player].color = tempColor;
        playerList[player].alive = true;
      }
      NUM_DEAD = 0;
    }

  }

  function checkReset() {
    if (NUM_OF_PLAYERS - 1 === NUM_DEAD) {
      if (finalTime <= 0) {
        resetGame();
        GAME_TICK = 0;
        finalTime = 300;
      }
      finalTime--;
    } else if (NUM_OF_PLAYERS === NUM_DEAD) {
      resetGame();
      GAME_TICK = 0;
      finalTime = 300;
    }
  }


  // Denne må fikses
  function countdown() {
    setTimeout(function() {
      if (countdownTime > 0) {
        $(".countdown").html(countdownTime);
        $(".countdown").show();
        countdownTime--;
        countdown();
      } else {
        $(".countdown").hide();
        countdownTime = 5;
      }
    }, 1000);
  }

  /***********************

    CHECK WIN CONTITION

  ***********************/

  function checkWin() {
    var mostPoints = 0;
    for (var player in playerList) {
      if (playerList[player].points >= NUM_OF_POINTS) {
        updateScoreboard();
        $(".dot").remove();
        win = true;
        winMessage(playerList[pointsTable[0][0]]);
      }
    }
  }

  function winMessage(entity) {
    $("body").append("<div class='winMessage'><span style='color:" + entity.color + "'>" + entity.id + "</span> vant!</div>");
  }

  /******************

    PREPARING GAME

  *******************/

  function init(playerNum) {
    // Add players
    players(playerNum);
    // Player init
    for (var player in playerList) {
      playerInit(playerList[player]);
    }
    // Legger til scoreboard
    updateScoreboard();
  }
  
  /**************

    GAME LOOP

  **************/
  function update() {
    if (!win) {
      GAME_TICK++;

      for (var player in playerList) {
        if (playerList[player].alive) {
          keyCheck(playerList[player]);
          moveDot(playerList[player]);
          collitionTest(playerList[player]);
          drawLine(playerList[player]);
        }
      }
    }
    checkReset();
    setTimeout(update, 10);
  }

  /**************

    START GAME

  **************/

  $("#spiller2").click(function() {
    // Prepare game
    init(2);
    // Fjern startScreen
    $(".startScreen").hide();
    // Start game loop
    update();
  });

  $("#spiller3").click(function() {
    // Prepare game
    init(3);
    // Fjern startScreen
    $(".startScreen").hide();
    // Start game loop
    update();
  });
    

});