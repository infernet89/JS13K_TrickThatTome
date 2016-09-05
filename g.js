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
var fieldStatus=[0,0,0,0,0,0,0,0,0];//0=vuoto; 1=red x; 2=green circle; 3=green x; 4=red Circle
var player1Turn=true;
var movePossibilities=["","rX","gO"]//,"gX","rO"];
var rules=[Array("The player who succeeds in",
                 "placing three of their marks",
                 "in a horizontal, vertical,",
                 "or diagonal row wins."),
            Array("","","")];
var activeRules=0;
var isPlayer1Circle=true;
var isPlayer1Turn=true;
var endGame=false;
var isPlayer1Winner=false;
var isEnemyWinner=false;
var isCircleWinner=false;
var isCrossWinner=false;
var circleWinnerStatuses=[];
var crossWinnerStatuses=[];
var drawStatuses=[];
var graphCross=[];
var graphCircle=[];

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
precalculateEverything();
startGame();//TODO debug toglimi

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
            if(isPlayer1Circle)
                fieldStatus[index]=2;
            else
                fieldStatus[index]=1;
            dragging=false;
        }
    }

    drawPlayField();

    if(level==0)
    {
        for(i=0;i<9;i++)
            fieldStatus[i]=rand(0,movePossibilities.length);
    }
    else
    {
        checkEndingCondition();
        drawHud();
    }
}
function checkEndingCondition()
{
    endGame=false;
    isCircleWinner=false;
    isCrossWinner=false;

    if(activeRules==0)
    {
        //dall'angolo 0
        if( fieldStatus[0]!=0 &&
            (fieldStatus[0]==fieldStatus[1] && fieldStatus[0]==fieldStatus[2]) ||
            (fieldStatus[0]==fieldStatus[3] && fieldStatus[0]==fieldStatus[6]) ||
            (fieldStatus[0]==fieldStatus[4] && fieldStatus[0]==fieldStatus[8]) )
        {
            if(fieldStatus[0]==2)
                isCircleWinner=true;
            else if(fieldStatus[0]==1)
                isCrossWinner=true;
            endGame=true;
        }
        //dall'angolo 8
        if( fieldStatus[8]!=0 &&
            (fieldStatus[8]==fieldStatus[5] && fieldStatus[8]==fieldStatus[2]) ||
            (fieldStatus[8]==fieldStatus[7] && fieldStatus[8]==fieldStatus[6]) )
        {
            if(fieldStatus[8]==2)
                isCircleWinner=true;
            else if(fieldStatus[8]==1)
                isCrossWinner=true;
            endGame=true;
        }
        //dal centro
        if( fieldStatus[4]!=0 &&
            (fieldStatus[4]==fieldStatus[1] && fieldStatus[4]==fieldStatus[7]) ||
            (fieldStatus[4]==fieldStatus[3] && fieldStatus[4]==fieldStatus[5]) ||
            (fieldStatus[4]==fieldStatus[6] && fieldStatus[4]==fieldStatus[2]) )
        {
            if(fieldStatus[4]==2)
                isCircleWinner=true;
            else if(fieldStatus[4]==1)
                isCrossWinner=true;
            endGame=true;
        }
        //no more places left
        if(fieldStatus.indexOf(0)==-1)
            endGame=true;
    }


    if(isCircleWinner==isCrossWinner)
    {
        isPlayer1Winner=isCircleWinner;
        isEnemyWinner=isCrossWinner;
    }
    else if(isCircleWinner)
    {
        isPlayer1Winner=isPlayer1Circle;
    }
    else if(isCrossWinner)
    {
        isPlayer1Winner=!isPlayer1Circle;
    }
    return endGame;
}
function drawHud()
{
    ctx.fillStyle="#FFF"
    ctx.font = "30px Verdana";
    ctx.fillText("RULES",50,280);
    ctx.font = "14px Verdana";
    var offset=0;
    for(line of rules[activeRules])
    {
        ctx.fillText(line,10,330+offset);
        offset+=20;
    }
    ctx.font = "30px Verdana";
    ctx.fillText("You are ",10,550);
    if(isPlayer1Circle)
        drawCircle(150,540,15,"#0F0");
    else
        drawCross(150,540,15,"#F00");
    if(isPlayer1Turn)
        ctx.fillText("Your turn",320,50);
    else
        ctx.fillText("Enemy turn",320,50);
    ctx.font = "35px Verdana";    

    if(isPlayer1Winner && isEnemyWinner)
        ctx.fillText("Draw!",350,575);
    else if(isPlayer1Winner)
        ctx.fillText("You won!",320,575);
    else if(isEnemyWinner)
        ctx.fillText("You lost!",320,575);
    else
        ctx.fillText(fieldStatusToInt(fieldStatus),320,575);
}
function startGame()
{
    isPlayer1Turn=flipCoin();
    isPlayer1Circle=flipCoin();
    fieldStatus=[0,0,0,0,0,0,0,0,0]
    isPlayer1Winner=false;
    isEnemyWinner=false;
    isCircleWinner=false;
    isCrossWinner=false;
    endGame=false;
}
function flipCoin()
{
    if(rand(0,1))
        return false;
    else
        return true;
}
function IntTofieldStatus(number)
{
    var i;
    var base=movePossibilities.length;
    var tmp=[];
    for(i=8;i>=0;i--)
    {
        tmp[i]=number%base;
        number=number-tmp[i];
        number/=base;
    }
    return tmp;
}
function fieldStatusToInt(status)
{
    var ris=0;
    var base=movePossibilities.length;
    for(el of status)
    {
        ris*=base;
        ris+=el;
    }
    return ris;
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
        if(fieldStatus[i]==2)
            drawCircle(x,y,25,"#0F0");
        else if(fieldStatus[i]==4)
            drawCircle(x,y,25,"#F00");
        else if(fieldStatus[i]==1)
            drawCross(x,y,25,"#F00");
        else if(fieldStatus[i]==3)
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
function precalculateEverything()
{
    drawStatuses=[];
    circleWinnerStatuses=[];
    crossWinnerStatuses=[];
    var i,j;
    var possibilities=Math.pow(movePossibilities.length,9);
    for(i=0;i<possibilities;i++)
    {
        graphCross[i]=allMoves(i,1);
        graphCircle[i]=allMoves(i,2);
        fieldStatus=IntTofieldStatus(i);
        if(checkEndingCondition())
        {
            if(isCrossWinner == isCircleWinner)
                drawStatuses.push(i);
            else if(isCrossWinner)
                crossWinnerStatuses.push(i);
            else if(isCircleWinner)
                circleWinnerStatuses.push(i);
        }
    }
   // alert("Draws: "+drawStatuses.length+"\ncrossWin: "+crossWinnerStatuses.length+"\ncircleWin: "+circleWinnerStatuses.length);
}
function moveIA()
{
    var current=fieldStatusToInt(fieldStatus);
    var next;
    next=graphCircle[current][rand(0,graphCircle[current].length-1)];
    fieldStatus=IntTofieldStatus(next);
}
function evalBestMove(currentStatus, playableVal)
{
    if(playableVal==1 && crossWinnerStatuses.indexOf(currentStatus)!=-1)
        return 1;
    else if(playableVal==2 && crossWinnerStatuses.indexOf(currentStatus)!=-1)
        return -2;
    else if(playableVal==2 && circleWinnerStatuses.indexOf(currentStatus)!=-1)
        return 1;
    else if(playableVal==1 && circleWinnerStatuses.indexOf(currentStatus)!=-1)
        return -2;
    else if(drawStatuses.indexOf(currentStatus)!=-1)
        return 0;

}
//generate all valid moves from 'from'
function allMoves(from, playableVal)
{
    var i;
    var result=[];
    var tmpField=IntTofieldStatus(from);
    if(activeRules==0)
    {
        //mettere o un 1 o un 2 dove c'è zero
        for(i=0;i<9;i++)
        {
            if(tmpField[i]==0)
            {
                tmpField[i]=playableVal;
                result.push(fieldStatusToInt(tmpField));
                tmpField[i]=0;
            }
        }

    }
    return result;
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