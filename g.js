// < >
var DEBUG=0;
//costant
var TO_RADIANS = Math.PI/180; 

//global variables
var canvas;
var canvasW;
var canvasH;
var ctx;
var activeTask;
var level=1;//0 menu TODO
var fieldStatus=["","","","","","","","",""];//""=vuoto; "rX"=red x; "rO"=red circle; "gX" = green X; "gO" = green O
var player1Turn=true;
var randomPossibilities=["","rX","rO","gX","gO"];

//mobile controls
var mousex=-100;
var mousey=-100;
var dragging=false;

//setup
canvas = document.getElementById("g");
ctx = canvas.getContext("2d");
canvasW=canvas.width  = window.innerWidth;
canvasH=canvas.height = window.innerHeight;

if (window.navigator.pointerEnabled) {
    canvas.addEventListener("pointermove", mossoMouse, false);
    canvas.addEventListener("pointerup", rilasciatoTap, false);
}
else
{
    canvas.addEventListener("touchmove", mossoTap);
    canvas.addEventListener("touchstart", cliccatoTap);
    canvas.addEventListener("touchend", rilasciatoTap);
}
canvas.addEventListener("mousemove",mossoMouse);
canvas.addEventListener("mousedown",cliccatoMouse);
canvas.addEventListener("mouseup",rilasciatoMouse);

activeTask=setInterval(run, 33);
//Initialize

//pictures

function run()
{
	ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle="#000000";
    ctx.fillRect(0,0,canvasW,canvasH);

    //manage clicks
    if(player1Turn && dragging)
    {
        var index=translateCoordInFieldIndex(mousex,mousey);
        if(index>=0)
        {
            fieldStatus[index]=randomPossibilities[rand(0,randomPossibilities.length)];
            dragging=false;
        }
    }

    drawPlayField();

    if(level==0)
    {
        for(i=0;i<9;i++)
            fieldStatus[i]=randomPossibilities[rand(0,randomPossibilities.length)];
    }
}

function translateCoordInFieldIndex(x,y)
{//< >
    var index=-1;
    //prima colonna
    if(mousex>250 && mousex<350)
        index=0;
    //seconda colonna
    else if(mousex>350 && mousex<450)
        index=1;
    //terza colonna
    else if(mousex>450 && mousex<550)
        index=2;

    if(index==-1)
        return -1;

    //prima riga
    if(mousey>200 && mousey<300)
        index=index;
    else if(mousey>300 && mousey<400)
        index+=3;
    else if(mousey>400 && mousey<500)
        index+=6;
    else index =-1;

    return index;
}

function drawPlayField()
{
    ctx.beginPath();
    ctx.moveTo(250,300);
    ctx.lineTo(550,300);
    ctx.moveTo(250,400);
    ctx.lineTo(550,400);
    ctx.moveTo(350,200);
    ctx.lineTo(350,500);
    ctx.moveTo(450,200);
    ctx.lineTo(450,500);
    ctx.closePath();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    //draw playfield status
    var i,x,y;
    x=300;
    y=250;
    for(i=0;i<9;i++)
    {
        if(fieldStatus[i]=="rO")
            drawCircle(x,y,25,"#F00");
        else if(fieldStatus[i]=="gO")
            drawCircle(x,y,25,"#0F0");
        else if(fieldStatus[i]=="rX")
            drawCross(x,y,25,"#F00");
        else if(fieldStatus[i]=="gX")
            drawCross(x,y,25,"#0F0");
        x+=100;
        if(x>500)
        {
            y+=100;
            x=300;
        }
    }
}
function drawCross(x,y,size,color)
{
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
}
function drawCircle(x, y, radius,color)
{
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2,false);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
}


/*#############
    Funzioni Utili
##############*/
function rand(da, a)
{
    if(da>a) return rand(a,da);
    a=a+1;
    return Math.floor(Math.random()*(a-da)+da);
}

//controlli mobile
function mossoTap(evt)
{
    evt.preventDefault();
    dragging=true;
    var rect = canvas.getBoundingClientRect();
    mousex = evt.targetTouches[0].pageX,
    mousey = evt.targetTouches[0].pageY;
}
function cliccatoTap(evt)
{
    evt.preventDefault();
    var rect = canvas.getBoundingClientRect();
    mousex = evt.targetTouches[0].pageX,
    mousey = evt.targetTouches[0].pageY;
}
function rilasciatoTap(evt)
{
    evt.preventDefault();
    dragging=false;
    mousey=-100;
    mousex=-100;
}
//uindows
function cliccatoMouse(evt)
{
    dragging=true;
    var rect = canvas.getBoundingClientRect();
    mousex=(evt.clientX-rect.left)/(rect.right-rect.left)*canvasW;
    mousey=(evt.clientY-rect.top)/(rect.bottom-rect.top)*canvasH;
}
function mossoMouse(evt)
{
    var rect = canvas.getBoundingClientRect();
    mousex=(evt.clientX-rect.left)/(rect.right-rect.left)*canvasW;
    mousey=(evt.clientY-rect.top)/(rect.bottom-rect.top)*canvasH;
}
function rilasciatoMouse(evt)
{
    dragging=false;
}