'use strict';

var regression = require('regression');


var fs = require('fs'); // require only if you don't already have it


var setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
var setNull = obj => setAll(obj, null);
var colors=["#e6194b","#3cb44b", "#ffe119","#0082c8","#f58231","#911eb4","#46f0f0","#f032e6"]


$('body').css('min-width', window.screen.width + 'px');

function calcAUC (data) {
    data.sort(function(a, b) {
        return a[0]-b[0]
    });
    var aucSum = 0;
    for (let n = 0; n < data.length - 1; n++){
        var diffx = data[n + 1][0] - data[n][0]
        var avgy = (data[n + 1][1] + data[n][1])/2
        aucSum += diffx * avgy
    }
    return(aucSum)
}


function determineScreenShot(){

    return{
        width:window.screen.width*  window.devicePixelRatio,
        height:window.screen.height * window.devicePixelRatio

    }
}


function findDistance(x1, y1, x2, y2) {
    var xdiff = x2 - x1;
    var ydiff = y2 - y1;
    return (Math.sqrt(xdiff * xdiff + ydiff * ydiff));

}

function copyToClipboard(val){
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.setAttribute("id", "dummy_id");
  document.getElementById("dummy_id").value=val;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

// shape parameters
function Shape(x, y, len, fill, outline) {
    this.x = x || 0;
    this.y = y || 0;
    this.len = len || 15;
    this.fill = fill || 'rgb(170, 170, 170)';
    this.outline = outline || 'rgb(255, 255, 255)'
}

// Draws a crosshair shape to a given context
Shape.prototype.draw = function (ctx, shapeType) {
    var x = this.x;
    var y = this.y;
    var length = this.len;

    if (shapeType == "crosshair"){ 
    ctx.strokeStyle = this.outline;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(x, y + length / 2 + 1 );
    ctx.lineTo(x, y - length / 2 - 1 );
    ctx.moveTo(x + length / 2 + 1 , y);
    ctx.lineTo(x - length / 2 - 1 , y);
    ctx.stroke();

    ctx.strokeStyle = this.fill;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(x, y + length / 2);
    ctx.lineTo(x, y - length / 2);
    ctx.moveTo(x + length / 2, y);
    ctx.lineTo(x - length / 2, y);
    ctx.stroke();
    }
    
    if (shapeType == "circle"){ 
    ctx.strokeStyle = this.outline;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(x,y,4,0,2*Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = this.fill;
    ctx.beginPath();
    ctx.arc(x,y,3,0,2*Math.PI);
    ctx.fill();
    }
}

function CanvasState(canvas, img) {
    //Setting up state variables
    //will need to export these for saving project

    this.id = canvas.id; // does not need to be saved, a new id should be created when loading project
    this.i = this.id[this.id.length -1]; //get canvas number ie 0,1,2,3 etc. To be used with corresponding tab icon
    this.width = canvas.width;
    this.height = canvas.height;
    this.canvas = canvas; // save
    this.ctx = canvas.getContext('2d');
    this.canvasSelected = $('#' + this.id).parent().parent().parent().find('.canvas-selected')[0];
    this.canvasSelectedCtx = this.canvasSelected.getContext('2d');
    this.xlowInput = 0; //save in calibration file
    this.ylowInput = 0; //save in calibration file
    this.xhighInput = 1; //save in calibration file
    this.yhighInput = 1; //save in calibration file
    this.nearestPoint = null;
    this.nearestPointIndex = null;
    this.nearestCoordinate = null;
    this.nearestCoordinateIndex = null;

    this.coordinates = []; //save in calibration file
    this.calibrations = [];

    this.points = []; //save
    this.dataPoints = []; //save
    this.currentx = null;
    this.currenty = null;
    this.scale = 2; //save

    // **** Keep track of state! ****

    this.valid = false; // when set to false, the canvas will redraw everything
    this.miniCanvasValid = false;
    this.floatingCanvasValid = false;
    this.calibrated = false;
    this.scaleValid = false;
    this.tableValid = true;
    this.shifted=false;
    
    this.xlocked = true;
    this.ylocked = true;

    var table = $('#' + this.id).parent().parent().parent().find('.example');

    table.DataTable({
        data: this.dataPoints,
        scrollY: 150,
        columns: [
            { title: "X <span class = 'x-unlock'> <i class='fa fa-lock'></i> </span>" },
            { title: "Y <span class = 'y-unlock'> <i class='fa fa-lock'></i> </span>" },
            { title: "Line" },
            { title: "Point #", className: "points" }
        ],
        paging: false,
        searching: false,
        info : false,
        order: [[3, 'desc']]

    });



    


        

    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    var myState = this;
    
    $("#"+this.id).on("remove", function () {
    setNull(myState);
    })
    
    $('#icon' + this.i).click(function(){
        setTimeout(function () {
        myState.valid = false
        myState.draw(img);},10)
    })

    
    $("#zoom"+this.i).click(function () {
        myState.valid = false
        myState.draw(img);


        
    })
    $("#zoom2"+this.i).click(function () {
        myState.valid = false
        myState.draw(img);
    })

    $("#zoom3"+this.i).click(function () {
        myState.valid = false
        myState.draw(img);
    })

    $("#zoom4"+this.i).click(function () {
        myState.valid = false
        myState.draw(img);
    })
    //
    //Redraw after right click (devarion)
    $("#"+this.id).mousedown(function (e) {
        if (e.which === 3) {
            if (myState.nearestPoint != null) {
                myState.points.splice(myState.nearestPointIndex, 1);
                myState.dataPoints.splice(myState.nearestPointIndex, 1);
            }
            myState.nearestPointIndex = null;
            myState.nearestPoint = null;
        }
    });

    //  click for making new shapes
    $("#"+this.id).mousedown( function (e) {
        if (e.which === 1) {
            var mouse = myState.getMouse(e);
            myState.addPoint(mouse.x / this.width, mouse.y / this.height)
            myState.valid = false;
            myState.nearestPoint = null;
            myState.nearestPointIndex = null;
            var points = myState.points
            var l = points.length;
            var distance = .05;

            var x1 = mouse.x / myState.width;
            var y1 = -1 * mouse.y / myState.height + 1;
            var x2 = null;
            var y2 = null;
            for (var i = 0; i < l; i++) {
                x2 = points[i][0];
                y2 = points[i][1];
                if (findDistance(x1, y1, x2, y2) < distance) {
                    myState.nearestPoint = [x2, y2];
                    distance = findDistance(x1, y1, x2, y2);
                    myState.nearestPointIndex = i;
                }
            }
        }
    });
    

    
    
    var canMove = true;
    $(window).keydown( function (canmove) {
        if ($('#' + myState.id).hasClass('active-canvas')) {
            if (!canMove) return false;
            canMove = false;
            setTimeout(function () {
                canMove = true;
            }, 60);
            switch (event.key) {
                case "w":

                    if (myState.nearestPointIndex != null) {
                        var i = myState.nearestPointIndex;
                        myState.points[i][1] = myState.points[i][1] + 1 / myState.height;
                        myState.dataPoints[i][0] = myState.transformXY(myState.points[i][0], myState.points[i][1])[0];
                        myState.dataPoints[i][1] = myState.transformXY(myState.points[i][0], myState.points[i][1])[1];
                        myState.nearestPoint = null;
                        myState.valid = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        myState.currenty = myState.currenty - 1;
                        
                        myState.currenty = myState.height * (1- myState.points[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.points[i][0]; // set current x to point center//                        myState.tableValid = false;
                    }

                    if (myState.nearestCoordinateIndex != null & !myState.calibrated) {
                        var i = myState.nearestCoordinateIndex;
                        myState.coordinates[i][1] = myState.coordinates[i][1] + 1 / myState.height;
                        myState.nearestCoordinate = null;
                        myState.calibrated = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        myState.currenty = myState.height * (1- myState.coordinates[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.coordinates[i][0]; // set current x to point center

                    }

                    break;
                case "a":
                    if (myState.nearestPointIndex != null) {
                        var i = myState.nearestPointIndex;
                        myState.points[i][0] = myState.points[i][0] - 1 / myState.width;
                        myState.dataPoints[i][0] = myState.transformXY(myState.points[i][0], myState.points[i][1])[0];
                        myState.dataPoints[i][1] = myState.transformXY(myState.points[i][0], myState.points[i][1])[1];
                        myState.nearestPoint = null;
                        myState.valid = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        myState.currenty = myState.height * (1- myState.points[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.points[i][0]; // set current x to point center
                    }

                    if (myState.nearestCoordinateIndex != null & !myState.calibrated) {
                        var i = myState.nearestCoordinateIndex;
                        myState.coordinates[i][0] = myState.coordinates[i][0] - 1 / myState.width;
                        myState.nearestCoordinate = null;
                        myState.calibrated = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        
                        myState.currenty = myState.height * (1- myState.coordinates[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.coordinates[i][0]; // set current x to point center
                    }

                    break;
                case "s":
                    if (myState.nearestPointIndex != null) {
                        var i = myState.nearestPointIndex;
                        myState.points[i][1] = myState.points[i][1] - 1 / myState.height;
                        myState.dataPoints[i][0] = myState.transformXY(myState.points[i][0], myState.points[i][1])[0];
                        myState.dataPoints[i][1] = myState.transformXY(myState.points[i][0], myState.points[i][1])[1];
                        myState.nearestPoint = null;
                        myState.valid = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        myState.currenty = myState.height * (1- myState.points[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.points[i][0]; // set current x to point center
                    }

                    if (myState.nearestCoordinateIndex != null & !myState.calibrated) {
                        var i = myState.nearestCoordinateIndex;
                        myState.coordinates[i][1] = myState.coordinates[i][1] - 1 / myState.height;
                        myState.nearestCoordinate = null;
                        myState.calibrated = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        
                        myState.currenty = myState.height * (1- myState.coordinates[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.coordinates[i][0]; // set current x to point center
                    }

                    break;
                case "d":
                    if (myState.nearestPointIndex != null) {
                        var i = myState.nearestPointIndex;
                        myState.points[i][0] = myState.points[i][0] + 1 / myState.width;
                        myState.dataPoints[i][0] = myState.transformXY(myState.points[i][0], myState.points[i][1])[0];
                        myState.dataPoints[i][1] = myState.transformXY(myState.points[i][0], myState.points[i][1])[1];
                        myState.nearestPoint = null;
                        myState.valid = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        myState.currenty = myState.height * (1- myState.points[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.points[i][0]; // set current x to point center
                    }

                    if (myState.nearestCoordinateIndex != null & !myState.calibrated) {
                        var i = myState.nearestCoordinateIndex;
                        myState.coordinates[i][0] = myState.coordinates[i][0] + 1 / myState.width;
                        myState.nearestCoordinate = null;
                        myState.calibrated = false;
                        myState.miniCanvasValid = false;
                        myState.floatingCanvasValid = false;
                        
                        myState.currenty = myState.height * (1- myState.coordinates[i][1]); // set current y to point center
                        myState.currentx = myState.width * myState.coordinates[i][0]; // set current x to point center
                    }

                    break;
                case "z":
                    myState.scale = myState.scale + 1;
                    myState.scaleValid = false;
                    myState.miniCanvasValid = false;
                    myState.floatingCanvasValid = false;
                    myState.valid = false;


                    break;
                case "x":
                    myState.scale = myState.scale - 1;
                    myState.scaleValid = false;
                    myState.miniCanvasValid = false;
                    myState.floatingCanvasValid = false;
                    myState.valid = false;

                    break;
                default:
                    return; // Quit when this doesn't handle the key event.

            }
            myState.draw(img)
        }

    });
    
    $(window).keyup( function () {
        if ($('#' + myState.id).hasClass('active-canvas')) {

            switch (event.key) {
                case "w":
                        myState.tableValid = false;
                    break;
                case "a":
                        myState.tableValid = false;

                    


                    break;
                case "s":
                        myState.tableValid = false;

                    

                    break;
                case "d":
                        myState.tableValid = false;
                    break;

                default:
                    return; // Quit when this doesn't handle the key event.

            }
            myState.draw(img);

        }

    });
    
     $(document).on('keydown', function(e){     if(e.keyCode==16){
                                                myState.shifted= !myState.shifted;
                                                myState.valid = false;
                                                myState.miniCanvasValid = false;

                                                myState.floatingCanvasValid = false;
                                                myState.draw(img);}} );







    $("#"+this.id).mousemove( function (e) {
        var mouse = myState.getMouse(e);
        myState.currentx = mouse.x;
        myState.currenty = mouse.y;
        myState.miniCanvasValid = false;
        myState.floatingCanvasValid = false;
        myState.draw(img)
        


    });




    $("#"+this.id).mousedown( function (e) {
            myState.miniCanvasValid = false;
            myState.floatingCanvasValid = false;
            myState.tableValid = false;
            myState.valid = false;
            myState.draw(img)
    });


     $('#' + myState.id).parent().parent().parent().find('.calibrate').click( function () {
        $('#' + myState.id).parent().parent().parent().find('.coordinates').slideDown();
        $('#' + myState.id).parent().parent().parent().find('.save-coordinates').prop("disabled", true);
        $('#' + myState.id).parent().parent().parent().find('.calibrate').prop("disabled", true);
        //        new Store({name:"boogity2"}).set('myState',myState);
        myState.calibrations.push({
            "coordinate": myState.coordinates,
            "points": myState.points,
            "dataPoint": myState.dataPoints
        })

        myState.coordinates = [];
        myState.points = [];
        myState.dataPoints = [];
        myState.calibrated = false;
        myState.draw(img)
    })

    $('#' + myState.id).parent().parent().parent().find('.save-coordinates').click( function () {
        $('#' + myState.id).parent().parent().parent().find('.coordinates').slideUp();
        $('#' + myState.id).parent().parent().parent().find('.name-input').fadeIn(3000).css("display", "inline-block");
        $('#' + myState.id).parent().parent().parent().find('.calibrate').prop("disabled", false);
        //$('#' + myState.id).parent().parent().parent().find('.prev').prop("disabled", false);
        myState.calibrated = true;
        myState.valid = false;
        //     var loadstate = new Store({name:"boogity2"}).get('myState');
        //        myState.points = loadstate.points;
        //        myState.lockedPoints = loadstate.lockedPoints;
        //        myState.coordinates = loadstate.coordinates;
        //        myState.dataPoints = loadstate.dataPoints;
        myState.draw(img)

    })
    
//    $('#' + myState.id).parent().parent().parent().find('.prev').click( function () {
//
//        //        new Store({name:"boogity2"}).set('myState',myState);
//
//        myState.coordinates = myState.calibrations[0].coordinate;
//        myState.points = myState.calibrations[0].points;
//        myState.dataPoints = myState.calibrations[0].dataPoint;
//
//    })

//    //find nearest point
    $("#"+this.id).mousemove( function (e) {

        var mouse = myState.getMouse(e);
        var points = myState.points;
        myState.nearestPoint = null;
        myState.nearestPointIndex = null;

        var l = points.length;
        var distance = .05;

        var x1 = mouse.x / myState.width;
        var y1 = -1 * mouse.y / myState.height + 1;
        var x2 = null;
        var y2 = null;

        for (var i = 0; i < l; i++) {
            x2 = points[i][0];
            y2 = points[i][1];
            if (findDistance(x1, y1, x2, y2) < distance) {
                myState.nearestPoint = [x2, y2];
                distance = findDistance(x1, y1, x2, y2);
                myState.nearestPointIndex = i;

            }
        }

    });

    //find nearest calibration coordinate
    $("#"+this.id).mousemove( function (e) {

        var mouse = myState.getMouse(e);
        var coordinates = myState.coordinates;
        myState.nearestCoordinate = null;
        myState.nearestCoordinateIndex = null;

        var l = coordinates.length;
        var distance = .05;

        var x1 = mouse.x / myState.width;
        var y1 = -1 * mouse.y / myState.height + 1;
        var x2 = null;
        var y2 = null;
        for (var i = 0; i < l; i++) {
            x2 = coordinates[i][0];
            y2 = coordinates[i][1];
            if (findDistance(x1, y1, x2, y2) < distance) {
                myState.nearestCoordinate = [x2, y2];
                distance = findDistance(x1, y1, x2, y2);
                myState.nearestCoordinateIndex = i;

            }
        }

    });
    
    
    $('#' + myState.id).parent().parent().parent().find('.csv').mousedown( function () {
    
    var table = $('#' + myState.id).parent().parent().parent().find('.example');
    var data = table.DataTable().rows().data().toArray();
    console.log(data)
    var filename=dialog.showSaveDialog({ filters: [

     { name: '.csv', extensions: ['csv'] }

    ]}, function (filename) {

        
    let csvContent = "";
    data.forEach(function(rowArray){
    let row = rowArray.join(",");
    csvContent += row + "\r\n"; // add carriage return
    }); 
        
        
    fs.writeFileSync(filename, csvContent, 'utf-8');
  }); 
    })
    

    $('#' + myState.id).parent().parent().parent().find('.R').mousedown( function () {
    
    var table = $('#' + myState.id).parent().parent().parent().find('.example');
    var data = table.DataTable().rows().data().toArray();
    console.log(data)
    var lineDataNoQuotes = table.DataTable().column(2).data().toArray()
    console.log(lineDataNoQuotes.join('-'))

    let csvContent = "";
    var XData = "data.frame(X = c("+ table.DataTable().column(0).data().toArray().join(',');
    var YData = "),\nY = c("+ table.DataTable().column(1).data().toArray().join(',');
    var LineData = "),\nName = c("+"'"+lineDataNoQuotes.join("','")+"'";
    var PointData = "),\nPoint= c("+ table.DataTable().column(3).data().toArray().join(',');
    var content = XData+YData+LineData+PointData+"))"


    

        
    copyToClipboard(content)



        


    })
    
    
    $("#saveprefs").mousedown(function (e) {
    myState.valid = false
    myState.draw(img)
    });
    
    $(".x-unlock").click(function(e) {
        myState.xlocked = !myState.xlocked;
        $(this).find('.fa').removeClass('fa-lock');

        $(this).find('.fa').removeClass('fa-unlock');
        
        if(myState.xlocked){
            $(this).find('.fa').addClass('fa-lock');
        }else{
            $(this).find('.fa').addClass('fa-unlock');

        }

        e.stopPropagation(); //prevent triggering upstream events
        myState.tableValid = false;
        myState.draw(img)
        
    });
    
    $(".y-unlock").click(function(e) {
        
        myState.ylocked = !myState.ylocked;
        
        $(this).find('.fa').removeClass('fa-lock');

        $(this).find('.fa').removeClass('fa-unlock');
        
        if(myState.ylocked){
            $(this).find('.fa').addClass('fa-lock');
        }else{
            $(this).find('.fa').addClass('fa-unlock');

        }
        
        e.stopPropagation(); //prevent triggering upstream events
        
        myState.tableValid = false;
        myState.draw(img)
    });
    
    $('#' + myState.id).parent().parent().parent().find('.screen-cap-button').mousedown( function () {
        var windowPos = remote.getCurrentWindow().getPosition();
        console.log(windowPos)

        const thumbSize = determineScreenShot();
        let options = {types:['screen'], thumbnailSize:thumbSize}

        $(".main-container").css("background"," rgba(171, 163, 163, 0)");
        $('.screen-cap-button').hide()
        $('.floating-canvas').hide()
        $('.floating-coordinates').hide()
        console.log(options)


        setTimeout(function(){    // need small delay for css to udpate
            desktopCapturer.getSources(options).then(function(sources){
            sources.forEach(function(source){
                var time;
                var d = new Date()
                time = d.getTime()
                console.log(time)
                const screenshotPath = path.join(os.tmpdir(),"screenshot"+time+".png");
                console.log(screenshotPath)
                console.log(windowPos[0])
                console.log(windowPos)

                var xpos = windowPos[0]*window.devicePixelRatio
                var ypos = (windowPos[1]+112)*window.devicePixelRatio
                var captureWidth = $(".active-canvas ").width()*window.devicePixelRatio
                var captureHeight = ($(".active-canvas ").parent().parent().height()- windowPos[1])*window.devicePixelRatio 

                console.log(captureHeight*window.devicePixelRatio)
                console.log(captureWidth *window.devicePixelRatio)
                fs.writeFile(screenshotPath, source.thumbnail.crop({x: xpos, 
                                                                    y: ypos,
                                                                    width: captureWidth ,
                                                                    height:captureHeight}).toPNG({scaleFactor:1/window.devicePixelRatio}), 
                                                                    () => {addDragImage("file://"+screenshotPath)
                                                                    $(".main-container").css("background"," rgba(171, 163, 163, 0.17)");
                                                    $('.screen-cap-button').show()
                                                    $('.floating-canvas').show()
                                                                    $('.floating-coordinates').show()});


        })
        }, error =>{ console.log(error)})




        },200)
    })


}





CanvasState.prototype.addPoint = function (x, y) {
    if (this.calibrated) {
        this.points.unshift([x, -1 * y + 1]);
        this.dataPoints.unshift(this.transformXY(x, -1 * y + 1))
        var table = $('#' + this.id).parent().parent().parent().find('.example');
//     table.DataTable().rows().invalidate('data').draw();




    };

    if (!this.calibrated) {
        this.coordinates.push([x, -1 * y + 1])
    }
}

CanvasState.prototype.clear = function (ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.load = function () {
    new Store({
        name: "boogity2"
    }).get('myState');
}


// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function (img) {

    if (!this.scaleValid) {
        // alert('boogity')
        if (this.scale >= 1) {
            var scale = this.scale;
        } else {
            var scale = 1 / (-this.scale + 2);
        }
        $('#' + this.id).parent().parent().parent().find('.mini-canvas')[0].getContext('2d').clearRect(0, 0, 300, 300);
        $('#' + this.id).parent().parent().parent().find('.floating-canvas')[0].getContext('2d').clearRect(0, 0, 100, 100);
        $('#' + this.id).parent().parent().parent().find('.mini-canvas')[0].getContext('2d').setTransform(1, 0, 0, 1, 0, 0)
        $('#' + this.id).parent().parent().parent().find('.mini-canvas')[0].getContext('2d').scale(scale, scale)
       // $('#' + this.id).parent().parent().parent().find('.floating-canvas')[0].getContext('2d').setTransform(1, 0, 0, 1, 0, 0)
        //$('#' + this.id).parent().parent().parent().find('.floating-canvas')[0].getContext('2d').scale(scale, scale)
        this.scaleValid = true;
    }

    var coordinates = this.coordinates;
    if (!this.calibrated) {
        this.changeSize();
        var ctx = this.ctx;
        this.clear(ctx);
        


        if (this.coordinates.length >= 4) {
            $('#' + this.id).parent().parent().parent().find('.save-coordinates').prop("disabled", false);
        };
        var l = this.coordinates.length;
        for (var i = 0; i < l; i++) {
            new Shape(Math.round(this.coordinates[i][0] * this.width), Math.round((-1 * this.coordinates[i][1] + 1) * this.height), 20, 'rgb(0, 108, 255)').draw(ctx,preferences.pointShape);
            
            switch (i) {
                case 0: {ctx.font = "15px Arial";
                         ctx.fillStyle = "red";
                         ctx.fillText("X-Min",this.coordinates[i][0] * this.width-15,(-1 * this.coordinates[i][1] + 1) * this.height-15);
                         break
                        }
                case 1: {ctx.font = "15px Arial";
                         ctx.fillStyle = "red";
                         ctx.fillText("X-Max",this.coordinates[i][0] * this.width-15,(-1 * this.coordinates[i][1] + 1) * this.height-15);
                         break

                        }
                case 2: {ctx.font = "15px Arial";
                         ctx.fillStyle = "red";
                         ctx.fillText("Y-Min",this.coordinates[i][0] * this.width-15,(-1 * this.coordinates[i][1] + 1) * this.height-15);
                         break
                        }
                case 3: {ctx.font = "15px Arial";
                         ctx.fillStyle = "red";
                         ctx.fillText("Y-Max",this.coordinates[i][0] * this.width-15,(-1 * this.coordinates[i][1] + 1) * this.height-15);
                          break
                       }
                    
            }
        }



        if (l >= 2) {
            if (this.coordinates[0][1].toFixed(8)==this.coordinates[1][1].toFixed(8)){
                var color = "#1ffd1f";
            }else{ 
                var color = "red";
            }
            
            ctx.beginPath();
            ctx.moveTo(this.coordinates[0][0] * this.width, (-1 * this.coordinates[0][1] + 1) * this.height);
            ctx.lineTo(this.coordinates[1][0] * this.width, (-1 * this.coordinates[1][1] + 1) * this.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        if (l >= 4) {
            if (this.coordinates[2][0].toFixed(8)==this.coordinates[3][0].toFixed(8)){
                var color = "#1ffd1f";
            }else{ 
                var color = "red";
            }
            
            ctx.beginPath();
            ctx.moveTo(this.coordinates[2][0] * this.width, (-1 * this.coordinates[2][1] + 1) * this.height);
            ctx.lineTo(this.coordinates[3][0] * this.width, (-1 * this.coordinates[3][1] + 1) * this.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
        }

        if (this.nearestCoordinate != null) {
            var nearestCoordinate = this.nearestCoordinate;
            var x = nearestCoordinate[0];
            var y = nearestCoordinate[1];
            new Shape(Math.round(x * this.width), Math.round((-1 * y + 1) * this.height), 20, 'rgb(0, 108, 255)', 'rgb(252, 13, 13)').draw(ctx,preferences.pointShape);
        }



        this.valid = true
    }

    if (!this.valid) {
        var ctx = this.ctx;
        var lengthCalibrations = this.calibrations.length
        var points = this.points;
        for (var i =0; i<lengthCalibrations;i++){
            points = points.concat(this.calibrations[i].points)
        }
        
        var dataPoints = this.dataPoints;
        var lengthCalibrations = this.calibrations.length

        
            for (var i =lengthCalibrations-1; i>0-1;i--){
                dataPoints = dataPoints.concat(this.calibrations[i].dataPoint)
            }
        l = dataPoints.length;

        for (var i = 0; i < l; i++) {
            dataPoints[i][3] = l - (i)
        }
        console.log(dataPoints)
        var lines = dataPoints.map(function(value,index) { return value[2]; });
        var uniquelines = [... new Set(lines)]
        
        var colorsindices = []
        for (var i=0; i < lines.length;i++){
            colorsindices.push(uniquelines.length-uniquelines.indexOf(lines[i]))
        }
        
    
        this.clear(ctx);
        this.changeSize();

        // draw all shapes
        var l = points.length;
        for (var i = 0; i < l; i++) {
            new Shape(Math.round(points[i][0] * this.width), Math.round((-1 * points[i][1] + 1) * this.height), 20, colors[colorsindices[i]]).draw(ctx,preferences.pointShape);
        }
        

        this.valid = true;
    }

    if (this.nearestPoint != this.nearestPointLast) {
        var selectedCtx = this.canvasSelectedCtx;
        this.clear(selectedCtx);
        var cells = $('#' + this.id).parent().parent().parent().find('.points');
        cells.parent().css({"border-radius": "", "box-shadow": "" })

        if (this.nearestPoint != null) {
            var nearestPoint = this.nearestPoint;
            var x = nearestPoint[0];
            var y = nearestPoint[1];
            new Shape(Math.round(x * this.width), Math.round((-1 * y + 1) * this.height), 20, preferences.selectedPointColor, 'rgb(252, 13, 13)').draw(selectedCtx,preferences.pointShape);
            
            var dataPoints = this.dataPoints;
            var lengthCalibrations = this.calibrations.length

        
            for (var i =lengthCalibrations-1; i>0-1;i--){
                dataPoints = dataPoints.concat(this.calibrations[i].dataPoint)
            }
            l = dataPoints.length;
            var nearestPointIndex=l-this.nearestPointIndex;
            cells.filter(function() {
            return $(this).html() == nearestPointIndex ;
            }).parent().css({"border-radius": "5px", "box-shadow": "rgb(220, 220, 220) 0px 0px 19px 1px inset" })


            var el =  cells.filter(function() {
                    return $(this).html() == nearestPointIndex ;
                    }).parent();
        if(el.offset()){
              var elOffset = el.position().top;
              var elHeight = el.outerHeight();
              var frameHeight = el.parent().parent().parent().outerHeight();
              var offset;

              offset =  elOffset - (frameHeight / 2);

              el.parent().parent().parent().animate({
                scrollTop: offset
              }, 1);
        };

            
        }
        this.nearestPointLast = this.nearestPoint;


    }


    if (!this.tableValid) {


        var dataPoints = this.dataPoints;
        var lengthCalibrations = this.calibrations.length

        
            for (var i =lengthCalibrations-1; i>0-1;i--){
                dataPoints = dataPoints.concat(this.calibrations[i].dataPoint)
            }
        l = dataPoints.length;

        for (var i = 0; i < l; i++) {
            dataPoints[i][3] = l - (i)
        }

        var table = $('#' + this.id).parent().parent().parent().find('.example');
        table.DataTable().clear().rows.add(dataPoints).draw();
        console.log(dataPoints)
        
        if(this.xlocked) {
             $( "tr td:nth-child(1)" ).attr( "contenteditable", "false" );
        } else {
             $( "tr td:nth-child(1)" ).attr( "contenteditable", "true" );
        }   
        
        if(this.ylocked) {
             $( "tr td:nth-child(2)" ).attr( "contenteditable", "false" );
        } else {
             $( "tr td:nth-child(2)" ).attr( "contenteditable", "true" );
        }   

        $( "tr td:nth-child(3)" ).attr( "contenteditable", "true" );
        $( "tr td:nth-child(3)" ).attr( "tabindex", "0" );
        
        var a = this;
        
        //add listerners to cells
        $("tr td:nth-child(1)").keyup(function(){
            var i = l - $(this).next().next().next().html(); // get index number of point

            a.dataPoints[i][0] = $(this).html(); // update point in table
            a.valid = false;
            a.miniCanvasValid = false;
            a.floatingCanvasValid = false;

            a.draw(img);
        })
        
        $("tr td:nth-child(2)").keyup(function(){
            var i = l - $(this).next().next().html(); // get index number of point

            a.dataPoints[i][1] = $(this).html(); // update point in table
            a.valid = false;
            a.miniCanvasValid = false;
            a.floatingCanvasValid = false;

            a.draw(img);
        })
        
        $("tr td:nth-child(3)").keyup(function(){
            var i = l - $(this).next().html();

            a.dataPoints[i][2] = $(this).html();
            a.valid = false;
            a.miniCanvasValid = false;
            a.floatingCanvasValid = false;

            a.draw(img);
        })
        
        $("td").focusout(function(){
            a.tableValid = false;
            a.draw(img);

            
        })
        
        // Numerical Summary
        var lines = dataPoints.map(function(value,index) { return value[2]; });
        var uniquelines = [... new Set(lines)]
        
        var numSum = [];
        for ( var i = 0; i < uniquelines.length; i++){
            var lineI = uniquelines[i];
            var setI = [];
            var sumX = 0;
            var sumY = 0;
            var n = 0;

            for (var j = 0; j < l; j++){
                if(dataPoints[j][2] == lineI){
                    setI.push([parseFloat(dataPoints[j][0]), parseFloat(dataPoints[j][1])] ); 
                    n = n + 1
                    sumX = sumX + parseFloat(dataPoints[j][0]);                    
                    sumY = sumY + parseFloat(dataPoints[j][1]);
                    var avgX = sumX/n
                    var avgY = sumY/n

                }
            }
            
            var resultLin = regression.linear(setI, {precision: 4 });
            var resultExpo = regression.exponential(setI, {precision: 4 });
            var resultAUC = calcAUC(setI);
            numSum.push([lineI, 
                         resultLin.equation[0], 
                         resultLin.equation[1],
                         resultExpo.equation[1],
                         (-Math.log(2)/resultExpo.equation[1]).toFixed(4),
                         resultExpo.equation[0],
                         avgX.toFixed(4), 
                         avgY.toFixed(4),
                         resultAUC]);
            console.log(numSum)
        }
        
        // Append data summary to control div
        
        var controls = $('#' + this.id).parent().parent().parent().find('.controls');
         $('#' + this.id).parent().parent().parent().find('.numSum').remove();
  
        
        for ( var i = 0; i < uniquelines.length; i++){
            controls.append('<div class = "numSum"> <div class = "results">' + 
                            '<div> <h3 class = "line-header" style = "background-color:' + colors[uniquelines.length - i] + '">' + numSum[i][0] + '</h3> </div>' + 
                            '<div><h4 class = "model-header"> Linear Model </h4></div>' +
                            '<div class = "model-results"> Slope: ' + numSum[i][1] + '</div>' +
                            '<div class = "model-results"> Intercept: ' + numSum[i][2] + '</div>' +
                            '<hr>' +
                            '<div><h4 class = "model-header"> Exponential Model </h4></div>' +
                            '<div class = "model-results"> Slope: ' + numSum[i][3] + '</div>' +
                            '<div class = "model-results"> Half-Life: ' + numSum[i][4] + '</div>' +
                            '<div class = "model-results"> Intercept: ' + numSum[i][5] + '</div>' +
                            '<hr>' +
                            '<div><h4 class = "model-header">Summary </h4></div>' +
                            '<div class = "model-results"> Average X: ' + numSum[i][6] + '</div>' +
                            '<div class = "model-results"> Average Y: ' + numSum[i][7] + '</div>' +
                            '<div class = "model-results"> AUC: ' + numSum[i][8] + '</div>' +
                            '</div> </div>');
        }
            
        
        
        
        this.tableValid = true;
    }

    if (!this.miniCanvasValid) {

        var imageCanvas = $('#' + this.id).prev().prev()[0]
        var selectedCanvas = $('#' + this.id).prev()[0]

        var miniCtx = $('#' + this.id).parent().parent().parent().find('.mini-canvas')[0].getContext('2d')
        miniCtx.clearRect(0, 0, 300, 300);
        if (this.scale >= 1) {
            var scale = this.scale;
        } else {
            var scale = 1 / (-this.scale + 2);
        }

        miniCtx.drawImage(imageCanvas, 150 * 1 / scale - this.currentx, 150 * 1 / scale - this.currenty);
        
        if(!this.shifted){
        miniCtx.drawImage(this.canvas, 150 * 1 / scale - this.currentx, 150 * 1 / scale - this.currenty);


        miniCtx.drawImage(selectedCanvas, 150 * 1 / scale - this.currentx, 150 * 1 / scale - this.currenty);
        }


        this.miniCanvasValid = true

    }

    if (!this.floatingCanvasValid) {
        

        $('#' + this.id).parent().parent().parent().find('.floating-canvas').css({
            top: this.currenty - 51,
            left: this.currentx - 51// + Math.floor((Math.max(0,window.screen.width*0.75-this.width))/2) //adjust if less tahn 1000px
        });
        
        if (this.currenty - 51 - 45 < 10){
            var yPosition = this.currenty + 51
        } else {
            var yPosition = this.currenty - 51 - 45
        }
        
        $('#' + this.id).parent().parent().parent().find('.floating-coordinates').css({
            top: yPosition,
            left: this.currentx - $('#' + this.id).parent().parent().parent().find('.floating-coordinates').width()/2 - 5
        });
        
        if(preferences.hoveringCoor){
             $('#' + this.id).parent().parent().parent().find('.floating-coordinates').css("display", "inline-block")
        } else {
                $('#' + this.id).parent().parent().parent().find('.floating-coordinates').css("display", "none")

        }
        
        if(this.calibrated){
            var xy = this.transformXY(this.currentx/this.width, -1 * this.currenty/this.height + 1)
            $('#' + this.id).parent().parent().parent().find('.floating-coordinates').html(xy[0] +" | " + xy[1]);
        } else{
            if(this.coordinates.length == 0){
                $('#' + this.id).parent().parent().parent().find('.floating-coordinates').html("Click X-Min");
            }
            
            if(this.coordinates.length == 1){
                $('#' + this.id).parent().parent().parent().find('.floating-coordinates').html("Click X-Max");
            }
            
            if(this.coordinates.length == 2){
                $('#' + this.id).parent().parent().parent().find('.floating-coordinates').html("Click Y-Min");
            }
            
            if(this.coordinates.length == 3){
                $('#' + this.id).parent().parent().parent().find('.floating-coordinates').html("Click Y-Max");
            }
            
            if(this.coordinates.length == 4){
                $('#' + this.id).parent().parent().parent().find('.floating-coordinates').html("Enter Calibration Points and Save");
            }
        }
      


        var imageCanvas = $('#' + this.id).prev().prev()[0]
        var selectedCanvas = $('#' + this.id).prev()[0]
        var miniCtx1 = $('#' + this.id).parent().parent().parent().find('.mini-canvas')[0]

        var miniCtx = $('#' + this.id).parent().parent().parent().find('.floating-canvas')[0].getContext('2d')
        
        if (this.scale >= 1) {
            var scale = this.scale;
        } else {
            var scale = 1 / (-this.scale + 2);
        }
        miniCtx.clearRect(0, 0, 100, 100);

//        }
        
        //draw cross hairs on floating canvas
        miniCtx.drawImage(miniCtx1,-100,-100)
        miniCtx.beginPath();
        miniCtx.strokeStyle = preferences.crosshairColor;
        miniCtx.lineWidth = 1;
        miniCtx.moveTo(0, 49.5 );
        miniCtx.lineTo(100 , 49.5 );
        miniCtx.moveTo(49.5, 0 * 1 / scale);
        miniCtx.lineTo(49.5 , 100 );
        miniCtx.stroke();
        
        
        /// draw cross hairs on mini canvas
        miniCtx1.getContext('2d').beginPath();
        miniCtx1.getContext('2d').strokeStyle = preferences.crosshairColor;
        miniCtx1.getContext('2d').lineWidth = 1 / scale;
        miniCtx1.getContext('2d').moveTo(0 * 1 / scale, 150 * 1 / scale);
        miniCtx1.getContext('2d').lineTo(300 * 1 / scale, 150 * 1 / scale);
        miniCtx1.getContext('2d').moveTo(150 * 1 / scale, 0 * 1 / scale);
        miniCtx1.getContext('2d').lineTo(150 * 1 / scale, 300 * 1 / scale);
        miniCtx1.getContext('2d').stroke();
        
        // place coordinates on top of magnifying glass
        


        this.floatingCanvasValid = true


    }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
CanvasState.prototype.getMouse = function (e) {

    var mx, my;

    mx = e.clientX - $('#' + this.id).offset().left
    my = e.clientY - $('#' + this.id).offset().top

   // mx = e.originalEvent.layerX
    //my = e.originalEvent.layerY
    



    // We return a simple javascript object (a hash) with x and y defined
    return {
        x: mx,
        y: my
    };
}

function init(id, img) {
    new CanvasState(document.getElementById(id), img);
}



CanvasState.prototype.changeSize = function () {
    if (document.getElementById(this.id) != null) {
        if (this.width != document.getElementById(this.id).width) {
            this.width = document.getElementById(this.id).width;
            this.height = document.getElementById(this.id).height;
        }
    }
};


CanvasState.prototype.transformXY = function (x, y) {
    var inputXLow = parseFloat($('#' + this.id).parent().parent().parent().find($('input[name=xlow]')).val())
    var inputXHigh = parseFloat($('#' + this.id).parent().parent().parent().find($('input[name=xhigh]')).val())
    var inputYLow = parseFloat($('#' + this.id).parent().parent().parent().find($('input[name=ylow]')).val())
    var inputYHigh = parseFloat($('#' + this.id).parent().parent().parent().find($('input[name=yhigh]')).val())

    var clickedXLow = this.coordinates[0][0];
    var clickedXHigh = this.coordinates[1][0];
    var clickedYLow = this.coordinates[2][1];
    var clickedYHigh = this.coordinates[3][1];
    var xlog10 = $('#' + this.id).parent().parent().parent().find($('input[name=xlog10]'))[0].checked
    var ylog10 = $('#' + this.id).parent().parent().parent().find($('input[name=ylog10]'))[0].checked
    var xskew = (this.coordinates[1][1] - this.coordinates[0][1]) / (this.coordinates[1][0] - this.coordinates[0][0])
    var yskew = (this.coordinates[3][0] - this.coordinates[2][0]) / (this.coordinates[3][1] - this.coordinates[2][1])

    this.xlowInput = inputXLow;
    this.xhighInput = inputXHigh;
    this.xlowInput = inputXLow;
    this.xhighInput = inputXHigh;



    
        if (!xlog10) {
            var inputXDiff = inputXHigh - inputXLow;
            var clickedXDiff = clickedXHigh - clickedXLow;
            var scaleX = inputXDiff / clickedXDiff;
            var inputYDiff = inputYHigh - inputYLow;
            var clickedYDiff = clickedYHigh - clickedYLow;
            var scaleY = inputYDiff / clickedYDiff;

            var xReturn = ((x - clickedXLow) * scaleX - (y - clickedYLow) * yskew * scaleX + inputXLow).toFixed(4);
        }

        if (xlog10) {
            var inputXDiff = Math.log10(inputXHigh / inputXLow);
            var clickedXDiff = clickedXHigh - clickedXLow;
            var scaleX = inputXDiff / clickedXDiff;

            var xReturn = (10 ** ((x - clickedXLow) * scaleX + Math.log10(inputXLow))).toFixed(4);
        }
    


        if (!ylog10) {
            var inputXDiff = inputXHigh - inputXLow;
            var clickedXDiff = clickedXHigh - clickedXLow;
            var scaleX = inputXDiff / clickedXDiff;
            var inputYDiff = inputYHigh - inputYLow;
            var clickedYDiff = clickedYHigh - clickedYLow;
            var scaleY = inputYDiff / clickedYDiff;
            var yReturn = ((y - clickedYLow) * scaleY - (x - clickedXLow) * xskew * scaleY + inputYLow).toFixed(4);
        }

        if (ylog10) {
            var inputYDiff = Math.log10(inputYHigh / inputYLow);
            var clickedYDiff = clickedYHigh - clickedYLow;
            var scaleY = inputYDiff / clickedYDiff;
            var yReturn = (10 ** ((y - clickedYLow) * scaleY + Math.log10(inputYLow))).toFixed(4);
        }
    




    var name = $('#' + this.id).parent().parent().parent().find($('input[name=name]')).val()
    return [xReturn, yReturn, name]
};


