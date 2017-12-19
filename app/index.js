'use strict';

const electron = require('electron');
const {
    app
} = electron;
const remote = require('electron').remote
const dialog = remote.dialog;
window.$ = window.jquery = require('jquery');
var dt = require('datatables.net')();
require("jquery-ui")
const Store = require('electron-store');
const store = new Store();

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())



$(".loaded-images-holder").sortable({
    axis: "x",
    revert: true,
    scroll: true,
    placeholder: "sortable-placeholder",
    cursor: "move",
    cancel: ".settings",
    forcePlaceholderSize: true,
    helper: "clone"
});

function iconSpan(i, files, iconHolderWidth) {
    return ('<span id=icon' + i + ' class="image-icon" style = "background-image:url(' + files.replace(/\\/g,"/") + '); background-size: contain; background-repeat: no-repeat; min-width:' + iconHolderWidth + 'px"><div class = "close" id =close' + i + '><i class="fa fa-close"></i></div></span>')
};

function canvasContainer(i, width, height) {
    return (
        '<div class="container" id="canvas-' + i + '"><div class="pre-canvas-container" ><div class="canvas-container" ><canvas class = "main-canvas" id="canvas-container-img-' + i + '" style = "display:inline;"  width="' + width + '" height="' + height + '"></canvas><canvas class = "canvas-selected main-canvas" id="canvas-container-selected-' + i + '" style = "display:inline;"  width="' + width + '" height="' + height + '"></canvas><canvas class = "main-canvas" id="canvas-container-' + i + '" style = "display:inline;"  width="' + width + '" height="' + height + '"></canvas><canvas class = "floating-canvas" height = "100" width = "100"></canvas></div></div><div class = "controls"><div class = "mini-canvas-container"><canvas class = "mini-canvas" width = "300" height = "300"></canvas></div> <span class="zoom"> <i class="fa fa-minus"></i></span><span class="zoom2 zoom" id ="zoom2"> <i class="fa fa-plus"></i></span><div class = "calibrate-container"><button class = "calibrate" disabled>Calibrate</button></div><div class = "name-input" ><div><label>Name</label></div><input type="text" name="name" value="Line 1"></div><div class = "coordinates"><div class= x-axis><div class="min-max"><div><label>X Minimum</label></div><input type="number" name="xlow" value="0"></div><div class="min-max"><div><label>X Maximum</label></div><input type="number" name="xhigh" value="1"></div><div class= log10><div><p>Log10</p></div><div class = "checkbox-container"><input type="checkbox" value="0" id="xlog10' + i + '" name="xlog10"/><label for="xlog10' + i + '"></label></div></div></div><div class="min-max"><div><label>Y Minimum</label></div><input type="number" name="ylow" value="0"></div><div class="min-max"><div><label>Y Maximum</label></div><input type="number" name="yhigh" value="1"></div><div class= log10><div><p>Log10</p></div><div class = "checkbox-container"><input type="checkbox" value="0" id="ylog10' + i + '" name="ylog10"/><label for="ylog10' + i + '"></label></div></div><div><button class = "save-coordinates" disabled>Save</button></div></div><table class="example" class="display" width="100%"></table><div class="export"><button class = "csv">CSV</button><button class = "R">R</button></div></div></div>'
    )
}

function addImageListener() {
    settingsEl.removeEventListener('click', addImageListener);
    addImage();
}

function addI() {
    i = i + 1;
}

var i = 0;
var settingsEl = document.querySelector('.settings');
settingsEl.addEventListener('click', addImageListener);

function addImage() {
    var filesa = dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{
            name: 'Images',
            extensions: ['jpg', 'png', 'gif']
        }]
    });
    var j = 0;
    var newimage = true;
    if (filesa !== undefined) {
        var isnewimage = setInterval(function () {
            if (newimage) {
                newimage = false;
                var files = filesa[j]
                if (filesa[j] !== undefined) {
                    var img = new Image(); // Create new img element
                    img.addEventListener('load', function () {
                        var thisi = i;
                        $(".container").hide(); //hide all canvas
                        $('.image-icon').removeClass("image-icon-selected")
                        var height = 1000 * img.height / img.width;
                        var width = 1000;
                        $(".canvas-holder").prepend(canvasContainer(thisi, width, height));

                        var iconHolderWidth = 60 * img.width / img.height;
                        //create new icon in icon bar
                        $(".settings").after(iconSpan(thisi, files, iconHolderWidth));
                        //add event listeners
                        var iconEl = $('#icon' + thisi);
                        iconEl.addClass("image-icon-selected")
                        var canvasi = $('#canvas-' + thisi);
                        var canvascontaineri = $('#canvas-container-' + thisi);
                        $('canvas').removeClass("active-canvas");
                        $('.main-canvas').attr( "height", "0px" )
                        $('.main-canvas').attr( "width", "0px" )

                        canvascontaineri.addClass("active-canvas");
                        canvascontaineri.attr( "height", height )
                        canvascontaineri.attr( "width", width )
                        canvascontaineri.prev().attr( "height", height )
                        canvascontaineri.prev().attr( "width", width )
                        canvascontaineri.prev().prev().attr( "height", height )
                        canvascontaineri.prev().prev().attr( "width", width )
                        var ctx = document.getElementById("canvas-container-img-" + thisi).getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        init('canvas-container-' + thisi, img);
                        iconEl.click(function () {
                            $('.container').hide();
                            $('canvas').removeClass("active-canvas");
                            canvasi.show();
                            canvascontaineri.addClass("active-canvas");
                            $('.image-icon').removeClass("image-icon-selected")
                            $(this).addClass("image-icon-selected")
                            
                            $('.main-canvas').attr( "height", "0px" )
                            $('.main-canvas').attr( "width", "0px" )
                            canvascontaineri.attr( "height", height )
                            canvascontaineri.attr( "width", width )
                            canvascontaineri.prev().attr( "height", height )
                            canvascontaineri.prev().attr( "width", width )
                            canvascontaineri.prev().prev().attr( "height", height )
                            canvascontaineri.prev().prev().attr( "width", width )
                            var ctx = document.getElementById("canvas-container-img-" + thisi).getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            
//                            $("#canvas-container-" + thisi)[0].width = width;
//                            $("#canvas-container-" + thisi)[0].height = height;
//                            ctx.drawImage(img, 0, 0, $("#canvas-container-" + thisi)[0].width, $("#canvas-container-" + thisi)[0].height);
//                            
                        })

                        var a = $("#canvas-container-img-" + thisi)[0].getBoundingClientRect().width;
                        $(".zoom")[0].addEventListener('mousedown', function () {
                            ctx.clearRect(0, 0, a, a * img.height / img.width);
                            a = a * 0.9
                            $("#canvas-container-img-" + thisi)[0].width = a;
                            $("#canvas-container-img-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-" + thisi)[0].width = a;
                            $("#canvas-container-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-selected-" + thisi)[0].width = a;
                            $("#canvas-container-selected-" + thisi)[0].height = a * img.height / img.width;
                            ctx.drawImage(img, 0, 0, $("#canvas-container-" + thisi)[0].width, $("#canvas-container-" + thisi)[0].height);

                        })

                        $("#zoom2")[0].addEventListener('mousedown', function () {
                            ctx.clearRect(0, 0, a, a * img.height / img.width);
                            a = a * 10 / 9
                            $("#canvas-container-img-" + thisi)[0].width = a;
                            $("#canvas-container-img-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-" + thisi)[0].width = a;
                            $("#canvas-container-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-selected-" + thisi)[0].width = a;
                            $("#canvas-container-selected-" + thisi)[0].height = a * img.height / img.width;
                            ctx.drawImage(img, 0, 0, $("#canvas-container-" + thisi)[0].width, $("#canvas-container-" + thisi)[0].height);

                        })

                        var closei = $("#close" + thisi);
                        closei.click(function () {
                            $(this).parent().remove();
                            canvasi.remove();
                        });
                        settingsEl.addEventListener('click', addImageListener)
                        newimage = true;
                        addI();
                    }, false);
                    img.src = files;
                    j++;
                    if (j == filesa.length) {
                        clearInterval(isnewimage)
                        
                    };
                }
            }
        })
    } else {
        settingsEl.addEventListener('click', addImageListener)
    }
}


settingsEl.ondragover = () => {
    return false;
};

settingsEl.ondragleave = () => {
    return false;
};

settingsEl.ondragend = () => {
    return false;
};

settingsEl.ondrop = (e) => {
    e.preventDefault();

    for (let f of e.dataTransfer.files) {
        addDragImage(f.path)
    }

    return false;
};



function addDragImage(path) {
    var filesa = [path]
    var j = 0;
    var newimage = true;
    if (filesa !== undefined) {
        var isnewimage = setInterval(function () {
            if (newimage) {
                newimage = false;
                var files = filesa[j]
                if (filesa[j] !== undefined) {
                    var img = new Image(); // Create new img element
                    img.addEventListener('load', function () {
                        var thisi = i;
                        $(".container").hide(); //hide all canvas
                        $('.image-icon').removeClass("image-icon-selected")
                        var height = 1000 * img.height / img.width;
                        var width = 1000;
                        $(".canvas-holder").prepend(canvasContainer(thisi, width, height));

                        var iconHolderWidth = 60 * img.width / img.height;
                        //create new icon in icon bar
                        $(".settings").after(iconSpan(thisi, files, iconHolderWidth));
                        //add event listeners
                        var iconEl = $('#icon' + thisi);
                        iconEl.addClass("image-icon-selected")
                        var canvasi = $('#canvas-' + thisi);
                        var canvascontaineri = $('#canvas-container-' + thisi);
                        $('canvas').removeClass("active-canvas");
                        $('.main-canvas').attr( "height", "0px" )
                        $('.main-canvas').attr( "width", "0px" )

                        canvascontaineri.addClass("active-canvas");
                        canvascontaineri.attr( "height", height )
                        canvascontaineri.attr( "width", width )
                        canvascontaineri.prev().attr( "height", height )
                        canvascontaineri.prev().attr( "width", width )
                        canvascontaineri.prev().prev().attr( "height", height )
                        canvascontaineri.prev().prev().attr( "width", width )
                        var ctx = document.getElementById("canvas-container-img-" + thisi).getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        init('canvas-container-' + thisi, img);
                        iconEl.click(function () {
                            $('.container').hide();
                            $('canvas').removeClass("active-canvas");
                            canvasi.show();
                            canvascontaineri.addClass("active-canvas");
                            $('.image-icon').removeClass("image-icon-selected")
                            $(this).addClass("image-icon-selected")
                            
                            $('.main-canvas').attr( "height", "0px" )
                            $('.main-canvas').attr( "width", "0px" )
                            canvascontaineri.attr( "height", height )
                            canvascontaineri.attr( "width", width )
                            canvascontaineri.prev().attr( "height", height )
                            canvascontaineri.prev().attr( "width", width )
                            canvascontaineri.prev().prev().attr( "height", height )
                            canvascontaineri.prev().prev().attr( "width", width )
                            var ctx = document.getElementById("canvas-container-img-" + thisi).getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);                     
                        })

                        var a = $("#canvas-container-img-" + thisi)[0].getBoundingClientRect().width;
                        $(".zoom")[0].addEventListener('mousedown', function () {
                            ctx.clearRect(0, 0, a, a * img.height / img.width);
                            a = a * 0.9
                            $("#canvas-container-img-" + thisi)[0].width = a;
                            $("#canvas-container-img-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-" + thisi)[0].width = a;
                            $("#canvas-container-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-selected-" + thisi)[0].width = a;
                            $("#canvas-container-selected-" + thisi)[0].height = a * img.height / img.width;
                            ctx.drawImage(img, 0, 0, $("#canvas-container-" + thisi)[0].width, $("#canvas-container-" + thisi)[0].height);

                        })

                        $("#zoom2")[0].addEventListener('mousedown', function () {
                            ctx.clearRect(0, 0, a, a * img.height / img.width);
                            a = a * 10 / 9
                            $("#canvas-container-img-" + thisi)[0].width = a;
                            $("#canvas-container-img-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-" + thisi)[0].width = a;
                            $("#canvas-container-" + thisi)[0].height = a * img.height / img.width;
                            $("#canvas-container-selected-" + thisi)[0].width = a;
                            $("#canvas-container-selected-" + thisi)[0].height = a * img.height / img.width;
                            ctx.drawImage(img, 0, 0, $("#canvas-container-" + thisi)[0].width, $("#canvas-container-" + thisi)[0].height);

                        })

                        var closei = $("#close" + thisi);
                        closei.click(function () {
                            $(this).parent().remove();
                            canvasi.remove();
                        });

                        settingsEl.addEventListener('click', addImageListener)
                        newimage = true;
                        addI();


                    }, false);
                    img.src = files;
                    j++;

                    if (j == filesa.length) {
                        clearInterval(isnewimage)
                        
                    };
                }
            }
        })
    } else {
        settingsEl.addEventListener('click', addImageListener)
    }
}