var preferences= {
    hoveringCoor: 1,
    crosshairColor : "#000000",
    pointShape : "crosshair",
    selectedPointColor : "#000000",
}

$("#saveprefs").mousedown(function (e) {
    preferences.hoveringCoor =  $('input[name=hoveringCoor]')[0].checked
    preferences.crosshairColor = $('input[name=crosshairColor]').val()
    preferences.pointShape = $('input[name=pointShape]:checked').val()
    preferences.selectedPointColor = $('input[name=selectedPointColor]').val()
    console.log(preferences);
    $(".Preferences").hide()
    });
