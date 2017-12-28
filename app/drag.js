// Code from https://www.w3schools.com/howto/howto_js_draggable.asp

//Make the DIV element draggagle:

$(".prefs").mousedown(function (e) {
    $('.Preferences').draggable({
  create: function( event, ui ) {
      $(this).css({
          top: $(this).position().top,
          bottom: "auto"
      });
  }
});
    
})
