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
var level=0;//0 menu TODO
var fieldStatus=[0,0,0,0,0,0,0,0,0];//0=vuoto; 1=red x; 2=green circle; 3=green x; 4=red Circle
var player1Turn=true;
var movePossibilities=["","rX","gO"]//,"gX","rO"];
var rules=[Array("The player who succeeds in",
                 "placing three of their marks",
                 "in a horizontal, vertical,",
                 "or diagonal row wins."),
            Array("The player who places",
                 "three of their marks",
                 "in a horizontal, vertical,",
                 "or diagonal row LOSE."),
            Array("The player who succeeds in",
                 "placing three of their marks",
                 "in a horizontal, vertical,",
                 "or diagonal row wins. BUT",
                 "whenever a mark is placed",
                 "all touching marks FLIPS."),
            Array("The player who succeeds in",
                 "placing three of their marks",
                 "in a horizontal, vertical,",
                 "or diagonal row wins. You",
                 "can choose wich mark play by",
                 "clicking on it."),
            Array("","","")];
var activeRules=0;//0-classic 1-loserWins 2-placingFlipNearbyPositions, 3-choose mark
var isPlayer1Circle=true;
var isPlayer1Turn=true;
var endGame=false;
var isPlayer1Winner=false;
var isEnemyWinner=false;
var isCircleWinner=false;
var isCrossWinner=false;
var isHumanTurn=false;//used on simulations ONLY.
var circleWinnerStatuses=[];
var crossWinnerStatuses=[];
var drawStatuses=[];
var graphCross=[];
var graphCircle=[];
var IAdelay=50;
var nWins=0;
var nLost=0;
var nDraw=0;
var isGameOn=false;

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
//startGame();//TODO debug toglimi

//pictures

function run()
{
	ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle="#000000";
    ctx.fillRect(0,0,canvasW,canvasH);

    drawPlayField();

    if(level==0)
    {
        for(i=0;i<9;i++)
            fieldStatus[i]=rand(0,movePossibilities.length);
        ctx.font = "40px Courier";
        ctx.fillStyle="#666666";
        ctx.fillRect(340,520,120,80);
        ctx.fillStyle="#0000FF";
        ctx.fillText("PLAY",350,570);
        ctx.fillRect(350,600-20,90,1);
        if(dragging && mousex>340 && mousex<460 && mousey>520 && mousey<600)
        {
            dragging=false;
            level=1;
            startGame();
        }
    }
    else
    {
        if(checkEndingCondition() && isGameOn)
        {
            isGameOn=false;
            if(isCircleWinner == isCrossWinner)
            {
                var tmp=fieldStatus;
                nDraw++;
                //GLITCHES AND CHANGE RULES HERE
                activeRules=rand(0,3);
                precalculateEverything();
                fieldStatus=tmp;
            }                
            if(activeRules<3)
            {
                if(isPlayer1Circle && isCircleWinner)
                    nWins++;
                else if(!isPlayer1Circle && isCrossWinner)
                    nWins++;
                else
                    nLost++;
            }
            else if(activeRules==3)
            {
                if(isPlayer1Turn)
                    nLost++;
                else
                    nWins++;
            }
        }
        drawHud();
        //manage plays
        if(!endGame)
        {
            if(isPlayer1Turn && dragging)
            {
                var index=translateCoordInFieldIndex(mousex,mousey);
                if(index>=0 && fieldStatus[index]==0)
                {
                    //maybe rules can be differnt here
                    if(isPlayer1Circle)
                        fieldStatus[index]=2;
                    else
                        fieldStatus[index]=1;
                    if(activeRules==2)
                    {
                        if([1,4,3].indexOf(index)!=-1)
                            fieldStatus[0]=flipMark(fieldStatus[0]);
                        if([0,3,4,5,2].indexOf(index)!=-1)
                            fieldStatus[1]=flipMark(fieldStatus[1]);
                        if([1,4,5].indexOf(index)!=-1)
                            fieldStatus[2]=flipMark(fieldStatus[2]);
                        if([0,1,4,7,6].indexOf(index)!=-1)
                            fieldStatus[3]=flipMark(fieldStatus[3]);
                        if([0,1,2,3,5,6,7,8].indexOf(index)!=-1)
                            fieldStatus[4]=flipMark(fieldStatus[4]);
                        if([2,1,4,7,8].indexOf(index)!=-1)
                            fieldStatus[5]=flipMark(fieldStatus[5]);
                        if([3,4,7].indexOf(index)!=-1)
                            fieldStatus[6]=flipMark(fieldStatus[6]);
                        if([6,3,4,5,8].indexOf(index)!=-1)
                            fieldStatus[7]=flipMark(fieldStatus[7]);
                        if([7,4,5].indexOf(index)!=-1)
                            fieldStatus[8]=flipMark(fieldStatus[8]);
                    }
                    dragging=false;
                    isPlayer1Turn=false;
                    isHumanTurn=false;
                }
                else if(activeRules==3 && mousex>130 && mousex<170 && mousey>520 && mousey<560)//TODO check if inside marker
                {
                    //flip mark
                    isPlayer1Circle=!isPlayer1Circle;
                    dragging=false;
                }
            }
            else if(!isPlayer1Turn)
            {
                if(--IAdelay>0)
                {
                    drawThinking();
                    return;
                }
                else
                    IAdelay=20;
                moveIA();
                isPlayer1Turn=true;
                isHumanTurn=true;
            }
        } 
    }
}
function flipMark(val)
{
    if(val==1)
        return 2;
    else if(val==2)
        return 1;
    else
        return val;
}
function checkEndingCondition()
{
    endGame=false;
    isCircleWinner=false;
    isCrossWinner=false;

    if(activeRules<=3)
    {
        //dall'angolo 0
        if( fieldStatus[0]!=0 && (
            (fieldStatus[0]==fieldStatus[1] && fieldStatus[0]==fieldStatus[2]) ||
            (fieldStatus[0]==fieldStatus[3] && fieldStatus[0]==fieldStatus[6]) ||
            (fieldStatus[0]==fieldStatus[4] && fieldStatus[0]==fieldStatus[8]) ) )
        {
            if(fieldStatus[0]==2)
                isCircleWinner=true;
            else if(fieldStatus[0]==1)
                isCrossWinner=true;
            endGame=true;
            //console.log("Win dall'angolo zero");
        }
        //dall'angolo 8
        if( fieldStatus[8]!=0 && (
            (fieldStatus[8]==fieldStatus[5] && fieldStatus[8]==fieldStatus[2]) ||
            (fieldStatus[8]==fieldStatus[7] && fieldStatus[8]==fieldStatus[6]) ) )
        {
            if(fieldStatus[8]==2)
                isCircleWinner=true;
            else if(fieldStatus[8]==1)
                isCrossWinner=true;
            endGame=true;
            //console.log("Win dall'angolo otto");
        }
        //dal centro
        if( fieldStatus[4]!=0 && (
            (fieldStatus[4]==fieldStatus[1] && fieldStatus[4]==fieldStatus[7]) ||
            (fieldStatus[4]==fieldStatus[3] && fieldStatus[4]==fieldStatus[5]) ||
            (fieldStatus[4]==fieldStatus[6] && fieldStatus[4]==fieldStatus[2]) ) )
        {
            if(fieldStatus[4]==2)
                isCircleWinner=true;
            else if(fieldStatus[4]==1)
                isCrossWinner=true;
            endGame=true;
            //console.log("Win dal centro");
        }
        //no more places left
        if(fieldStatus.indexOf(0)==-1)
        {
            endGame=true;
            //console.log("no more places left");
        }
           
    }
    //losers wins
    if(endGame && activeRules ==1)
    {
        var tmp=isCircleWinner;
        isCircleWinner=isCrossWinner;
        isCrossWinner=tmp;
    }
    //choose marker
    if(endGame && activeRules==3)
    {
        if(isHumanTurn)
            isPlayer1Winner=isCrossWinner || isCircleWinner;
        else
            isEnemyWinner=isCrossWinner || isCircleWinner;
    }


    if(isCircleWinner==isCrossWinner)
    {
        isPlayer1Winner=isCircleWinner;
        isEnemyWinner=isCrossWinner;
    }
    else if(isCircleWinner)
    {
        isPlayer1Winner=isPlayer1Circle;
        isEnemyWinner=!isPlayer1Circle;
    }
    else if(isCrossWinner)
    {
        isPlayer1Winner=!isPlayer1Circle;
        isEnemyWinner=isPlayer1Circle;
    }
    //console.log(endGame);
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
    if(endGame)
        ctx.fillText("Game ended",320,50);
    else if(isPlayer1Turn)
        ctx.fillText("Your turn",320,50);
    else
        ctx.fillText("Enemy turn",320,50);
    ctx.font = "35px Verdana";    

    if(isPlayer1Winner && isEnemyWinner)
        ctx.fillText("Draw!",350,180);
    else if(isPlayer1Winner)
        ctx.fillText("You won!",320,180);
    else if(isEnemyWinner)
        ctx.fillText("You lost!",320,180);
    else if(endGame)
         ctx.fillText("Draw!",350,180);
    /*else
        ctx.fillText(fieldStatusToInt(fieldStatus),320,575);*/
    ctx.font = "13px Monospace";
    ctx.fillText("Wins: "+nWins,600,540);
    ctx.fillText("Lost: "+nLost,600,555);
    ctx.fillText("Draw: "+nDraw,600,570);

    if(endGame)
    {
        ctx.font = "40px Courier";
        ctx.fillStyle="#666666";
        ctx.fillRect(330,520,160,80);
        ctx.fillStyle="#0000FF";
        ctx.fillText("REPLAY",340,570);
        ctx.fillRect(340,580,140,1);
        if(dragging && mousex>330 && mousex<490 && mousey>520 && mousey<600)
        {
            dragging=false;
            level=1;
            startGame();
        }
    }
}
function startGame()
{
    isPlayer1Turn=flipCoin();
    isHumanTurn=isPlayer1Turn;
    isPlayer1Circle=flipCoin();
    fieldStatus=[0,0,0,0,0,0,0,0,0]
    isPlayer1Winner=false;
    isEnemyWinner=false;
    isCircleWinner=false;
    isCrossWinner=false;
    endGame=false;
    isGameOn=true;
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
function drawThinking()
{
    //some graphic feedback
    var stringa;
    ctx.clearRect(0, 0, 100, 100);
    ctx.font = "15px Verdana";
    ctx.fillStyle="#000000";
    ctx.fillRect(0,0,200,200);
    if(IAdelay%3==0)
        stringa="Thinking...";
    else if(IAdelay%2==0)
        stringa="Thinking..";
    else stringa="Thinking.";
    ctx.fillStyle="#FFF";
    ctx.fillText(stringa,10,20);
}
function moveIA()
{
    var current=fieldStatusToInt(fieldStatus);
    //small fix for too much waiting
    if([0,13122,6561,4374,2187,1458,729,486,243,162,81,54,18,27,9,6,3,2,1].indexOf(current)!=-1 && activeRules==3)
    {
        if(current==0)
            fieldStatus=IntTofieldStatus(81);
        if(current==13122)
            fieldStatus=IntTofieldStatus(15309);
        if(current==6561)
            fieldStatus=IntTofieldStatus(6588);
        if(current==4374)
            fieldStatus=IntTofieldStatus(10935);
        if(current==2187)
            fieldStatus=IntTofieldStatus(2196);
        if(current==1458)
            fieldStatus=IntTofieldStatus(8019);
        if(current==729)
            fieldStatus=IntTofieldStatus(972);
        if(current==486)
            fieldStatus=IntTofieldStatus(7047);
        if(current==243)
            fieldStatus=IntTofieldStatus(972);
        if(current==162)
            fieldStatus=IntTofieldStatus(2349);
        if(current==81)
            fieldStatus=IntTofieldStatus(4455);
        if(current==54)
            fieldStatus=IntTofieldStatus(2241);
        if(current==18)
            fieldStatus=IntTofieldStatus(6579);
        if(current==27)
            fieldStatus=IntTofieldStatus(6588);
        if(current==9)
            fieldStatus=IntTofieldStatus(2196);
        if(current==6)
            fieldStatus=IntTofieldStatus(2193);
        if(current==3)
            fieldStatus=IntTofieldStatus(6564);
        if(current==2)
            fieldStatus=IntTofieldStatus(6563);
        if(current==1)
            fieldStatus=IntTofieldStatus(2188);
        return;
    }
    var j;
    var tmp;
    var max=-99999999;
    var maxStatus=0;
    if(activeRules<=2 && isPlayer1Circle)
        for(j=0;j<graphCross[current].length;j++)
        {
            tmp=evalBestMove(graphCross[current][j],1,1);
            if(tmp>max)
            {
                max=tmp;
                maxStatus=graphCross[current][j];
            }
            else if(tmp==max && flipCoin())
                maxStatus=graphCross[current][j];
            //console.log(tmp+" status: "+graphCross[current][j]);
        }
            
    else if(activeRules<=2 && !isPlayer1Circle)
        for(j=0;j<graphCircle[current].length;j++)
        {
            tmp=evalBestMove(graphCircle[current][j],0,1);
            if(tmp>max)
            {
                max=tmp;
                maxStatus=graphCircle[current][j];
            }
            else if(tmp==max && flipCoin())
                maxStatus=graphCircle[current][j];
            //console.log(tmp+" status: "+graphCircle[current][j]);
        }
    //we need to explore BOTH graphs
    else if(activeRules==3)
    {
        for(j=0;j<graphCross[current].length;j++)
        {
            tmp=evalBestMove(graphCross[current][j],1,1);
            if(tmp>max)
            {
                max=tmp;
                maxStatus=graphCross[current][j];
            }
            else if(tmp==max && flipCoin())
                maxStatus=graphCross[current][j];
            //console.log(tmp+" status: "+graphCross[current][j]);
        }
        for(j=0;j<graphCircle[current].length;j++)
        {
            tmp=evalBestMove(graphCircle[current][j],1,1);
            if(tmp>max)
            {
                max=tmp;
                maxStatus=graphCircle[current][j];
            }
            else if(tmp==max && flipCoin())
                maxStatus=graphCircle[current][j];
            //console.log(tmp+" status: "+graphCircle[current][j]);
        }
    }
            
    if(maxStatus!=0)
    {
        fieldStatus=IntTofieldStatus(maxStatus);
    }
}
function evalBestMove(currentStatus, playedVal,depth)//playedVal 0=circle 1=x TODO fix aggregation, its still wrong..
{
    //drawThinking(); //cant do feedback on executing actions :(
    depth=depth+1;
    if(drawStatuses.indexOf(currentStatus)!=-1)
        return 0;

    if(activeRules==3 && (crossWinnerStatuses.indexOf(currentStatus)!=-1 || circleWinnerStatuses.indexOf(currentStatus)!=-1))
    {
        if(playedVal==0)
            return -2000;
        else
            return 1000;
    }

    if(isPlayer1Circle && crossWinnerStatuses.indexOf(currentStatus)!=-1)
        return 1000;
    else if(!isPlayer1Circle && crossWinnerStatuses.indexOf(currentStatus)!=-1)
        return -2000;
    else if(!isPlayer1Circle && circleWinnerStatuses.indexOf(currentStatus)!=-1)
        return 1000;
    else if(isPlayer1Circle && circleWinnerStatuses.indexOf(currentStatus)!=-1)
        return -2000;
    else
    {
        var j;
        var min=9999999;
        var max=-99999999
        var tmp;
        if(activeRules==3)
        {
            for(j=0;j<graphCross[currentStatus].length;j++)
            {
                tmp=evalBestMove(graphCross[currentStatus][j],1-playedVal,depth);
                if(min>tmp) min=tmp;
                if(max<tmp) max=tmp;
            }
            for(j=0;j<graphCircle[currentStatus].length;j++)
            {
                tmp=evalBestMove(graphCircle[currentStatus][j],1-playedVal,depth);
                if(min>tmp) min=tmp;
                if(max<tmp) max=tmp;
            }
        }
        else if(activeRules<=2 && playedVal==0)
            for(j=0;j<graphCross[currentStatus].length;j++)
            {
                tmp=evalBestMove(graphCross[currentStatus][j],1,depth);
                if(min>tmp) min=tmp;
                if(max<tmp) max=tmp;
            }
        else if(activeRules<=2 && playedVal==1)
            for(j=0;j<graphCircle[currentStatus].length;j++)
            {
                tmp=evalBestMove(graphCircle[currentStatus][j],0,depth);
                if(min>tmp) min=tmp;
                if(max<tmp) max=tmp;
            }

        if(activeRules==3)
        {
            if(playedVal==1)
                return min/depth;
            else
                return max/depth;
        }

        if(isPlayer1Circle && playedVal==1)
            return min/depth;
        else if(!isPlayer1Circle && playedVal==0)
            return min/depth;
        else
            return max/depth;
    }

}
//generate all valid moves from 'from'
function allMoves(from, playableVal)
{
    var i;
    var result=[];
    var tmpField=IntTofieldStatus(from);
    if(activeRules<=3)
    {
        //mettere o un 1 o un 2 dove c'è zero
        for(i=0;i<9;i++)
        {
            if(tmpField[i]==0)
            {
                tmpField[i]=playableVal;
                //flip nearby
                if(activeRules==2)
                {
                    if([1,4,3].indexOf(i)!=-1)
                        tmpField[0]=flipMark(tmpField[0]);
                    if([0,3,4,5,2].indexOf(i)!=-1)
                        tmpField[1]=flipMark(tmpField[1]);
                    if([1,4,5].indexOf(i)!=-1)
                        tmpField[2]=flipMark(tmpField[2]);
                    if([0,1,4,7,6].indexOf(i)!=-1)
                        tmpField[3]=flipMark(tmpField[3]);
                    if([0,1,2,3,5,6,7,8].indexOf(i)!=-1)
                        tmpField[4]=flipMark(tmpField[4]);
                    if([2,1,4,7,8].indexOf(i)!=-1)
                        tmpField[5]=flipMark(tmpField[5]);
                    if([3,4,7].indexOf(i)!=-1)
                        tmpField[6]=flipMark(tmpField[6]);
                    if([6,3,4,5,8].indexOf(i)!=-1)
                        tmpField[7]=flipMark(tmpField[7]);
                    if([7,4,5].indexOf(i)!=-1)
                        tmpField[8]=flipMark(tmpField[8]);
                }
                result.push(fieldStatusToInt(tmpField));
                if(activeRules==2)
                {
                    if([1,4,3].indexOf(i)!=-1)
                        tmpField[0]=flipMark(tmpField[0]);
                    if([0,3,4,5,2].indexOf(i)!=-1)
                        tmpField[1]=flipMark(tmpField[1]);
                    if([1,4,5].indexOf(i)!=-1)
                        tmpField[2]=flipMark(tmpField[2]);
                    if([0,1,4,7,6].indexOf(i)!=-1)
                        tmpField[3]=flipMark(tmpField[3]);
                    if([0,1,2,3,5,6,7,8].indexOf(i)!=-1)
                        tmpField[4]=flipMark(tmpField[4]);
                    if([2,1,4,7,8].indexOf(i)!=-1)
                        tmpField[5]=flipMark(tmpField[5]);
                    if([3,4,7].indexOf(i)!=-1)
                        tmpField[6]=flipMark(tmpField[6]);
                    if([6,3,4,5,8].indexOf(i)!=-1)
                        tmpField[7]=flipMark(tmpField[7]);
                    if([7,4,5].indexOf(i)!=-1)
                        tmpField[8]=flipMark(tmpField[8]);
                }
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