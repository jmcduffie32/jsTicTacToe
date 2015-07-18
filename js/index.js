
$(document).ready(function(){
  game = new Game();
  var pic1 = new Image();
  var pic2 = new Image();
  pic1.src = 'https:/dl.dropboxusercontent.com/s/i579euba4wexums/ecks.png?dl=0';
  pic2.src = 'https://dl.dropboxusercontent.com/s/c7us03xf00ped03/oh.png?dl=0';
  var s = Snap('#drawing-board');
  var lineAttr = {stroke:'black',strokeWidth: 5};
  s.line(102.5,0,102.5,310).attr(lineAttr);
  s.line(207.5,0,207.5,310).attr(lineAttr);
  s.line(0,102.5,310,102.5).attr(lineAttr);
  s.line(0,207.5,310,207.5).attr(lineAttr);

  //game.numPlayers = Number(prompt('1 or 2 players?'));
  $('#start').on('click',function() {
    game.numPlayers = Number($('#numPlayers').val());
    console.log(game.numPlayers);
    $('#menu-cover').fadeOut();
    
    if (game.numPlayers === 1) {
      game.player2 = new Ai('oh','Computer');
    }else {
      game.player2 = new User('oh','Player 2');
    }
    
    $('.square').off().one('click', runGame);
  });  
});

function runGame() {
  var $board = $('#board');
  game.move($(this));
  game.checkForWin();
  if (game.isWon){
    $board.fadeOut('slow');
    if (confirm(game.currentPlayer.title+" won. Wanna play again?")){
      game.reset();
      $board.fadeIn('fast');
      return;
    }else {
      game.reset();
      $board.fadeIn();
      $('#menu-cover').fadeIn();
      return;
    }
  }
  
  game.checkForDraw();
  if (game.isDrawn) {
    $board.fadeOut('slow');
    if (confirm("It's a draw. Wanna play again?")) {
      game.reset();
      $board.fadeIn('fast');
      return;
    }else {
      game.reset();
      $board.fadeIn();
      $('#menu-cover').fadeIn();
      return;
    }
  }else {
    game.next();
  }
}

function Game() {  
  this.player1 = new User('ecks','Player 1');
  this.turn = 0;
  this.currentPlayer = this.player1;
  this.isWon = false;
  this.isDrawn = false;
  this.board = [
    'blank','blank','blank',
    'blank','blank','blank',
    'blank','blank','blank'
               ];

}

Game.prototype.promptNumPlayers = function() {
  this.numPlayers = prompt('1 or 2 players?');
  return this;
};

Game.prototype.next = function() {
  this.turn++;
  this.currentPlayer = [this.player1,this.player2][this.turn % 2];
  if (this.numPlayers === 1 && this.currentPlayer === this.player2) {
    setTimeout(this.player2.takeTurn,300);
  }
};

Game.prototype.getRowsCols = function() {
  var board = this.board;
  return [
    board.slice(0,3),
    board.slice(3,6),
    board.slice(6,9),
    [board[0],board[3],board[6]],
    [board[1],board[4],board[7]],
    [board[2],board[5],board[8]],
    [board[0],board[4],board[8]],
    [board[6],board[4],board[2]]
  ];
};

Game.prototype.checkForWin = function() {
  var arrToCheck = this.getRowsCols();
  for (var i = 0; i <= 7; i++) {
    var currentRow = arrToCheck[i];
    if (currentRow[0] !== 'blank' && currentRow[0] === currentRow[1] && currentRow[1] === currentRow[2]) {
      this.isWon = true;
      return this; 
    }
  }
};

Game.prototype.checkForDraw = function() {
  if (this.board.filter(function(value){return value === 'blank';}).length === 0) {
    this.isDrawn = true;
    return this;
  }
};

Game.prototype.move = function(box) {
  var boxNum = box.data('box');
  if (this.board[boxNum]==='blank') {
    this.board[boxNum]=this.currentPlayer.symbol;
    box.addClass(this.currentPlayer.symbol);
  }
  
  return this;
};

Game.prototype.reset = function() {
  this.board = this.board.map(function(value){return value = 'blank';});
  this.turn = 0;
  this.isWon = false;
  this.isDrawn = false;
  this.currentPlayer = this.player1;
  $('.square').removeClass('ecks oh');
  $('.square').off().one('click',runGame);
  return this;
};


function Player(symbol, name) {
  this.symbol = symbol;
  this.title = name;
}


function User(symbol,name) {
  Player.call(this, symbol, name);
}

User.prototype = Object.create(Player);



function Ai(symbol,name) {
  Player.call(this,symbol,name);
}

Ai.prototype = Object.create(Player);

Ai.prototype.findBestMove = function() {  
  var board = game.board;
  var bestMove = 4;
  var arrToCheck = game.getRowsCols();
  var indexMap = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [6,4,2]
      ];
  
  
  
  for (var i = 0; i <= 7; i++) {
    if (arrToCheck[i].filter(function(value){return value === 'oh';}).length === 2 && arrToCheck[i].filter(function(value){return value === 'ecks';}).length !== 1) {
      bestMove = indexMap[i][arrToCheck[i].indexOf('blank')];
      return bestMove;
    }
  }
  
  for (var i = 0; i <= 7; i++){
    if (arrToCheck[i].filter(function(value){return value === 'ecks';}).length === 2 && arrToCheck[i].filter(function(value){return value === 'oh';}).length !== 1) {
      bestMove = indexMap[i][arrToCheck[i].indexOf('blank')];
      return bestMove;
    }
  }
  
  if (game.board[4]=== 'blank') {
    return bestMove;
  }
  
  for (var j = 0; j <= 8; j++) {
    if (board[j]==='blank') {
      return j;
    }
  }
};

Ai.prototype.takeTurn = function(bestMove) {
  bestMove = game.player2.findBestMove();
  $(".square[data-box='"+bestMove+"']").trigger('click');
};