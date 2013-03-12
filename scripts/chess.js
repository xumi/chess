function Chess(container,side){
  this.id           = ++Chess.ID;
  this.container    = container;
  this.currentPiece = false;
  this.currentCell  = false;
  this.initialized  = false;
  this.trash        = false;
  this.side         = side=='black'?'black':'white';
  this.degres       = (this.side=='black') ? 180 : 0;
  this.counter      = 0;
  this.theme        = 'classic';
  this.loadedThemes = {};
  this.assetsPath   = false;
  this.ready        = false;
}
Chess.DEFAULT_PIECE_SIZE = 58;
Chess.ID      = 0;
Chess.LETTERS = ['A','B','C','D','E','F','G','H'];
Chess.NUMBERS = [1,2,3,4,5,6,7,8];
Chess.PIECES  = ['king','queen','tower','bishop','knight','pawn'];
// ------------------------------------------------------------
Chess.prototype.paint = function(){
  this.addStylesheet('css/chess');
  this.refreshClasses();
  var current = 'odd';
  var html  = '<div class="cells">';
  var bottom   = 0;
  var left  = 0;
  for(var i=1;i<=64;i++){
    html += '<div class="cell '+current+'" style="left:'+left+'%;bottom:'+bottom+'%;">';
    html +=   '<div class="pieces"></div>';
    html += '</div>';
    current = current=='odd'?'even':'odd';
    if(i%8==0){
      current = current=='odd'?'even':'odd';
      bottom += 12.5;
      left = 0;
    }else left += 12.5;
  }
  html += '</div>';
  this.container.html(html);
  this.addHelper();
  this.addPieces();
  this.addEvents();
  this.initialized = true;
  this.applyTheme();
  this.container.addClass('ready');
  this.ready = true;
  return this;
}

Chess.prototype.refreshClasses = function(){
  this.container.removeAttr('class');
  this.container.addClass('chess');
  this.container.addClass(this.side);
  if(this.ready) this.container.addClass('ready');
  if(this.theme) this.container.addClass(this.theme);
  return this;
}

Chess.prototype.setAssetsPath = function(path){
  this.assetsPath = path;
  return this;
};

Chess.prototype.setTheme = function(t){
  this.theme = t;
  return this;
};

Chess.prototype.applyTheme = function(t){
  if(!this.assetsPath) return this;
  if(!t) t = this.theme;
  this.theme = t;
  if(!this.loadedThemes[t]){
    // Avoid multiple injections
    this.addStylesheetTag(this.assetsPath+'themes/'+t+'/'+t);
    this.loadedThemes[t] = true;
  }
  this.refreshClasses();
  return this;
};
  
Chess.prototype.updated = function(){
  socket.broadcast.emit('update',this.serialize());
  return this;
};
  
Chess.prototype.addHelper = function(){
  var html = '<div class="helper">';
  var _this = this;
  $(['white','black']).each(function(){
    var side = this;
    html += '<div class="'+side+'">';
    html += '<div class="letters">';
    $(_this.getLetters(side)).each(function(){html += '<div>'+this+'</div>';});
    html += '</div>';
    html += '<div class="numbers">';
    $(_this.getNumbers(side)).each(function(){html += '<div>'+this+'</div>';});
    html += '</div>';
    html += '</div>';
  });
  // The pieces trash
  html += '<div class="trash"></div>';
  // End of turn button (switching side)
  html += '<button class="endOfTurn">End of Turn</button>';
  this.container.append(html);
  this.trash = this.container.find('.trash');
  return this;
}
  
Chess.prototype.addEvents = function(){
  var _this = this;
  this.container.on('dblclick','.cell',function(){
    if(_this.currentCell) return false;
    _this.currentCell  = $(this);
    _this.currentCell.addClass('selected');
    _this.openCellMenu();
  });
  this.container.on('click','.endOfTurn',function(){_this.switchSide();});
  this.updateEvents();
  this.setOrientation();
  return this;
};
  
Chess.prototype.updateEvents = function(){
  var _this = this;
  // Includes trash
  var allPieces = this.container.find('.cells, .helper').find('.piece');
  allPieces.draggable({
    appendTo:       _this.container,
    helper:         "clone",
    zIndex:         5,
    addClasses:     false,
    start:          function(ui,event){
      currentPiece = $(ui.currentTarget);
      _this.setOrientation();
      currentPiece.addClass('moved');
    },
    stop:           function(){
      currentPiece.removeClass('moved');
      _this.setOrientation();
      currentPiece = false;
    }
  });
  this.getCells().droppable({
    accept: allPieces,
    addClasses : false,
    hoverClass: 'pieceOver',
    drop: function(event, ui){
      var cell = $(this);
      var data = currentPiece.data();
      var previousCell = currentPiece.parents('.cell');
      currentPiece.remove();
      _this.setPieceOnCell(cell,data);
      _this.updateCell(previousCell);
    }
  });
  this.trash.droppable({
    accept: allPieces,
    hoverClass: 'pieceOver',
    drop: function(event, ui){
      var data = currentPiece.data();
      var previousCell = currentPiece.parents('.cell');
      currentPiece.remove();
      _this.updateCell(previousCell);
      _this.setPieceOn(_this.trash,data);
        
    }
  });
  return this;
}
  
Chess.prototype.openCellMenu = function(){
  var _this = this;
  if(this.container.find('.cellmenu').length==0) this.createCellMenu();
  this.container.find('.cellmenu').show();
  this.setOrientation();
};
  
Chess.prototype.createCellMenu = function(){
  var _this = this;
  this.container.append('<div class="cellmenu"><div class="background"></div><div class="content"></div></div>');
  var cellmenu = this.container.find('.cellmenu');
  var cellmenuContent = cellmenu.find('.content');
  cellmenuContent.on('click','.clear button',function(){
    _this.clearCell(_this.currentCell);
    _this.currentCell.removeClass('selected');
    _this.currentCell = false;
    _this.container.find('.cellmenu').hide();
  });
  cellmenuContent.on('click','.piece',function(){
    var data = $(this).data();
    _this.setPieceOnCell(_this.currentCell, data);
    _this.currentCell.removeClass('selected');
    _this.currentCell = false;
    _this.container.find('.cellmenu').hide();
    _this.updateEvents();
    _this.setOrientation();
  });
    
  var html = '';
  html += '<div class="clear">';
  html += '<button data-action="clear">Clear</button>';
  html += '</div>';
  html += '<div class="change">';
  html += '<h3>Or Set</h3>'
  $(['white','black']).each(function(){
    var side = this;
    html += '<div class="side '+side+'">';
    $(_this.playablePieces()).each(function(){
      html += '<div class="piece '+this+' '+side+'" data-alias="'+this+'" data-side="'+side+'" title="'+this+'"></div>';
    });
    html += '</div>';
  })
  html += '</div>';
  cellmenu.find('.content').html(html).end();
  return this;
}

Chess.prototype.playablePieces = function(){
  return Chess.PIECES;
};

Chess.prototype.initialPositions = function(){
  return [
    // White
    {coords:'A1', pieces:[{side:'white', alias:'tower'}]},
    {coords:'B1', pieces:[{side:'white', alias:'knight'}]},
    {coords:'C1', pieces:[{side:'white', alias:'bishop'}]},
    {coords:'D1', pieces:[{side:'white', alias:'queen'}]},
    {coords:'E1', pieces:[{side:'white', alias:'king'}]},
    {coords:'F1', pieces:[{side:'white', alias:'bishop'}]},
    {coords:'G1', pieces:[{side:'white', alias:'knight'}]},
    {coords:'H1', pieces:[{side:'white', alias:'tower'}]},
    {coords:'A2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'B2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'C2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'D2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'E2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'F2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'G2', pieces:[{side:'white', alias:'pawn'}]},
    {coords:'H2', pieces:[{side:'white', alias:'pawn'}]},
    // Blacks
    {coords:'A8', pieces:[{side:'black', alias:'tower'}]},
    {coords:'B8', pieces:[{side:'black', alias:'knight'}]},
    {coords:'C8', pieces:[{side:'black', alias:'bishop'}]},
    {coords:'D8', pieces:[{side:'black', alias:'queen'}]},
    {coords:'E8', pieces:[{side:'black', alias:'king'}]},
    {coords:'F8', pieces:[{side:'black', alias:'bishop'}]},
    {coords:'G8', pieces:[{side:'black', alias:'knight'}]},
    {coords:'H8', pieces:[{side:'black', alias:'tower'}]},
    {coords:'A7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'B7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'C7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'D7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'E7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'F7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'G7', pieces:[{side:'black', alias:'pawn'}]},
    {coords:'H7', pieces:[{side:'black', alias:'pawn'}]}
  ];
};
  
Chess.prototype.addPieces = function(){
  var _this = this;
  $(this.initialPositions()).each(function(){
    _this.setOnBoard(this);
  });
  return this;
}
  
Chess.prototype.setOnBoard = function(data){
  var matrix = {'A':0,'B':1,'C': 2,'D':3,'E':4,'F':5,'G':6,'H':7};
  var tmp = data.coords.split('');
  var letter = tmp[0];
  var number = tmp[1];
  var x = matrix[letter];
  var y = parseInt(number)-1;
  var i = (y*8)+x;
  var _this = this;
  var cell = _this.container.find('.cell:eq('+i+')');
  if(data.pieces){
    $(data.pieces).each(function(){
      _this.setPieceOnCell(cell,this);
    })
  };
  return this;
};
  
Chess.prototype.clearCell = function(cell){
  cell.find('> .pieces').empty();
  return this;
};
  
Chess.prototype.setPieceOnCell = function(cell, data){
  this.setPieceOn(cell,data);
  return this;
};
  
Chess.prototype.setPieceOn = function(on,data){
  var html = '<div class="piece '+data.alias+' '+data.side+'" id="item'+(++this.counter)+'"></div>';
  if(on.is('.cell')){
      var piece = $(html).appendTo(on.find('.pieces'));
      this.updateCell(on);
  }else{
    var piece = $(html).appendTo(this.trash);
  }
  piece.data(data);
  this.updateEvents();
  return this;
};
  
Chess.prototype.updateCell = function(cell){
  var pieces = cell.find('.pieces .piece');
  var amount = pieces.length;
  var ratio    = 1;
  var previous = 1;
  for(var i=1;i<100;i++){ // 1000 pieces on a cell is enough I think
    var sq = i*i;
    if(amount>previous && amount<sq+1){
      ratio = i;
      break;
    }
    previous = sq;
  }
  var size = parseInt(Chess.DEFAULT_PIECE_SIZE/ratio);
  pieces.width(size).height(size);
  return this;
};
  
Chess.prototype.serialize = function(){
  var board = {'white': [],'black': []};
  var _this = this;
  this.getCells().each(function(){
    var cell = $(this);
    var piece = $(this).find('.piece');
    if(piece.length==0) return true;
    var side = piece.data('side');
    var alias = piece.data('alias');
    var coords = _this.getCellCoords(cell);
    board[side].push({position:coords, alias:alias});
  });
  return board;
};
  
Chess.prototype.getPieces = function(){
  return this.getCells().find('.piece');
}
  
Chess.prototype.getCells = function(){
  return this.container.find('.cell');
}
  
Chess.prototype.getNumbers = function(side){
  if(!side) side = this.side
  var numbers = Chess.NUMBERS.slice(0); // Clone
  return side=='white' ? numbers.reverse() : numbers;
};

Chess.prototype.getLetters = function(side){
  if(!side) side = this.side;
  var letters = Chess.LETTERS.slice(0); // Clone
  return side=='white' ? letters : letters.reverse();
};
  
Chess.prototype.switchSide = function(){
  this.side = this.side=='white' ? 'black':'white';
  this.container.removeClass('white black').addClass(this.side);
  this.degres += 180;
  this.setOrientation();
  return this;
};
  
Chess.prototype.setOrientation = function(){
  this.rotate(this.degres);
  return this;
};
  
Chess.prototype.rotate = function(degres, animate){
  if(degres==0) return;
  this.degres = degres;
  this.rotateElement(this.container.find('.cells'),degres, animate);
  this.rotateElement(this.getPieces(),degres*-1, animate);
  // For the Drag&Drop Clone
  this.rotateElement(this.container.find('.ui-draggable-dragging'),0, animate);
  return this;
};

Chess.prototype.rotateElement = function(element, degres, animate){
  $(element).css('transform','rotate('+degres+'deg)');
};
  
Chess.prototype.getCellCoords = function(cell){
  var index = this.getCells().index(cell);
  var number = 0;
  var letter = 0;
  for(var i=0;i<this.getNumbers().length*this.getLetters().length;i++){
    if(i==index){
      number = Chess.NUMBERS[parseInt(i/8)];
      letter = Chess.LETTERS[letter];
      return letter+number;
    } 
    if(++letter>=this.getLetters().length) letter = 0;
  }
  return false;
};
// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
Chess.prototype.addJavascript = function(script, callback){
  jQuery.getScript(this.assetsPath+script+'.js',callback);
};
Chess.prototype.addStylesheet = function(css){
  this.addStylesheetTag(this.assetsPath+css)
};
Chess.prototype.addStylesheetTag = function(path){
  $("head").append('<link rel="stylesheet" type="text/css" href="'+path+'.css" />');
};
// ------------------------------------------------------------
(function($) {
  $.fn.chess = function(side) {
    return new Chess($(this),side);
  }
})(jQuery);

