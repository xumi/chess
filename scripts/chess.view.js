function ChessView(controller){
  this.controller = controller;
}

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