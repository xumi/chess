function ChessView(controller){
  this.controller = controller;
  this.container  = controller.container;
}
// ------------------------------------------------------------
ChessView.DEFAULT_PIECE_SIZE = 58;
// ------------------------------------------------------------
ChessView.prototype.getCells = function(){
  return this.container.find('.cell');
};
ChessView.prototype.getPieces = function(){
  return this.getCells().find('.piece');
};
ChessView.prototype.movePieceToCell = function(piece, target){
  var data = piece.data();
  var previousCell = piece.parents('.cell');
  piece.remove();
  if(target.is('.cell')){
    this.controller.setPieceOnCell(target,data);
  }else if(target.is('.trash')){
    this.controller.setPieceOn(this.container.trash,data);
  }
  this.updateCell(previousCell);
};
ChessView.prototype.rotate = function(degres, animate){
  if(degres==0) return;
  this.controller.degres = degres;
  this.rotateElement(this.container.find('.cells'),degres, animate);
  this.rotateElement(this.getPieces(),degres*-1, animate);
  // For the Drag&Drop Clone
  this.rotateElement(this.container.find('.ui-draggable-dragging'),0, animate);
  return this;
};
ChessView.prototype.rotateElement = function(element, degres, animate){
  $(element).css('transform','rotate('+degres+'deg)');
};
ChessView.prototype.clearCell = function(cell){
  cell.find('> .pieces').empty();
}
// ------------------------------------------------------------
ChessView.prototype.appendHTML = function(){
  var html    = '<div class="cells">';
  var bottom  = 0;
  var left    = 0;
  var current = 'odd';
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
};

ChessView.prototype.addHelper = function(){
  var html = '<div class="helper">';
  var controller = this.controller;
  $(['white','black']).each(function(){
    var side = this;
    html += '<div class="'+side+'">';
    html += '<div class="letters">';
    $(controller.getLetters(side)).each(function(){html += '<div>'+this+'</div>';});
    html += '</div>';
    html += '<div class="numbers">';
    $(controller.getNumbers(side)).each(function(){html += '<div>'+this+'</div>';});
    html += '</div>';
    html += '</div>';
  });
  // The pieces trash
  html += '<div class="trash"></div>';
  // End of turn button (switching side)
  html += '<button class="endOfTurn">End of Turn</button>';
  this.container.append(html);
};

ChessView.prototype.createCellMenu = function(){
  var controller = this.controller;
  var html = '<div class="cellmenu"><div class="background"></div><div class="content"></div></div>';
  this.container.append(html);
  var cellmenu = this.container.find('.cellmenu');
  html = '';
  html += '<div class="clear">';
  html += '<button data-action="clear">Clear</button>';
  html += '</div>';
  html += '<div class="change">';
  html += '<h3>Or Set</h3>'
  $(['white','black']).each(function(){
    var side = this;
    html += '<div class="side '+side+'">';
    $(controller.playablePieces()).each(function(){
      html += '<div class="piece '+this+' '+side+'" data-alias="'+this+'" data-side="'+side+'" title="'+this+'"></div>';
    });
    html += '</div>';
  })
  html += '</div>';
  cellmenu.find('.content').html(html);
  return this;
}
// ------------------------------------------------------------
ChessView.prototype.setPieceOn = function(on,data){
  var html = '<div class="piece '+data.alias+' '+data.side+'" id="item'+(++this.controller.counter)+'"></div>';
  if(on.is('.cell')){
      return $(html).appendTo(on.find('.pieces'));
  }
  return $(html).appendTo(this.controller.trash);
};

ChessView.prototype.updateCell = function(cell){
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
  var size = parseInt(ChessView.DEFAULT_PIECE_SIZE/ratio);
  pieces.width(size).height(size);
  return this.controller;
};