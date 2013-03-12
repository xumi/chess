function ChessView(controller){
  this.controller = controller;
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
  this.controller.container.html(html);
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
  this.controller.container.append(html);
};
ChessView.prototype.createCellMenu = function(){
  var controller = this.controller;
  var html = '<div class="cellmenu"><div class="background"></div><div class="content"></div></div>';
  controller.container.append(html);
  var cellmenu = controller.container.find('.cellmenu');
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