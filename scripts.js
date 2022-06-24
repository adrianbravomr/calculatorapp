const operatorsChars=/[\+\-\/\*]+/
const operandsChars=/[\d.,]/
const allowedKeys=['Enter','Backspace','Escape',' ','ArrowLeft','ArrowUp','ArrowRight','ArrowDown'];

let expression = [''];
let opIndex = 0;

let calculation = null;

let history = [[0]];
let historyIndex = 0;

document.addEventListener('keydown',e =>{
    keyPress(e);     
});


document.addEventListener('keyup',e =>{
    keyPress(e);   
});

//get the 2 lines of the screen in a array so we can print on it later
const screen = document.querySelectorAll('.screenLine');

const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', e => {
        newOperation(e);
    });
});


const clear = function(){
    //clear expression and calculation variables, clears the screen, the history isn't cleared to keep possible to go backward and forward past operations
    expression = [0];
    opIndex = 0;
    calculation = null;
    updateScreen(0,'');
    updateScreen(1,'');
    updateScreen(2,'');
    updateScreen(3,'0');
    updateScreen(4,'');
}


const deleteChar = function(exp,qty=1){
    //get last char of expression string and delete it, return new expression string 
    if (calculation!=null){
        return [0];
    } 

    let op = exp[opIndex];
    op = op.slice(0,-1);
    checkDecimals(op);

    //if this op is blank, then pop from array and reduce Index
    if(op==''){
        exp.pop()
        opIndex--;
    }
    else{
        exp[opIndex]=op;
    }
    return exp;
}


const addChar = function(op,char){
    //Add a new char to the expression string which will be parsed later
    if(op===undefined) op = 0;
    op = String(op);
    op == '0' ? op=char : op+=char;
    checkDecimals(op);
    return op;
}


const isOperator = function(char){
    //check if is operator using regex const in line 1
    return operatorsChars.test(char);
}


const operate = {
    //Based on the operator, performns the operation and return result
    "*":(a,b) => a*b,
    "/":(a,b) => a/b,
    "+":(a,b) => a+b,
    "-":(a,b) => a-b,
}


const calculate = function(op){
    //takes the expression as a array, loops over it using BEDMAS order and keeps reducing it while the expression has operators
    let operators = Object.keys(operate);
    let newOp = [...op];
    operators.forEach(operator => {
        while(newOp.includes(operator)) newOp = calc(operator,newOp);
    });
    history.push(op);
    historyIndex++;
    return newOp;
}

const calc = function(operator,op){
    let index = op.indexOf(operator);
    let a = getOperand(op[index-1]);
    let b = getOperand(op[index+1]);
    let ans = operate[operator](a,b);
    //if a is blank, first operator is -, return -b
    if (a=='' && operator=='-' && b!='') ans = -b;
    //else If one of the operands is blank, just return the one isn't
    else if (a=='' || b=='') ans = operate["+"](a,b);
    op = reduceOp(op,index,ans);
    return op;
}

const getOperand = function(number){
    //I had to add this to handle negative numbers with a workaround character
    number = number.replace('_','-');
    return Number(number)
}

const reduceOp = function(op,index,ans){
    //takes the expression, and replaces the operation with the answer
    ans = String(ans);
    op.splice(index-1,3,ans);
    return op
}

const newOperation = function(e){

    let char = e.target.dataset.button;
    let lastOp = expression.slice(-1)[0];
    switch(char){
        default:{
            //if there was a prev calc and not used an operator before calling an operand, it clear all the calcs and screen
            if(isOperator(char) != isOperator(lastOp) || char=='-' && (lastOp=='*'||lastOp=='/')){
                opIndex++;
            }

            //If calculation has ben done, the result is the new expression;
            if (calculation!=null){
                if(isOperator(char)){
                    expression=[String(calculation)];
                    calculation=null
                }
                else clear();
            };

            if (isOperator(char)){
                //if both the new char and last Op are operators, replace the last one by the new, except the previous was a * or /, and the new is - , in this case insert a fake negative symbol that will be parse later;
                if(isOperator(lastOp)){
                    if(char=='-' && (lastOp=='*' || lastOp=='/')){
                        char="_";
                    }
                    else{
                        expression.pop();
                    }
                }
                expression[opIndex]=addChar(expression[opIndex],char);
                updateScreen(3,expression.join(''));
            }

            else expression[opIndex]=addChar(expression[opIndex],char);
            updateScreen(3,expression.join(''));
            break;
        }
        case '=':{
            //check that the last componet of the operation is a operand
            while(isOperator(lastOp) || lastOp=='_'){
                expression.pop();
                opIndex--;
                lastOp = expression.slice(-1)[0];
            }
            calculation = calculate(expression);
            newExpression();
            break;
        }
        case 'C':{
            expression = deleteChar(expression);
            updateScreen(3,expression.join(''));
            break;
        }
        case 'AC':{
            clear();
            break;
        }
        case 'undo':{
            expression = historian(-1);
            break;
        }
        case 'redo':{
            expression = historian(1);
            break;
        }
    }
    ;
}


const checkDecimals = function(op){
    //Check if the current operand is a decimal, if so disable the decimal button
    let isDecimal;
    if(op!=null) {
        isDecimal = op.split(".").length>1
        document.querySelector('[data-button="."]').disabled = isDecimal;
    }
    return isDecimal;
}


const key2Button = function(key){
    //Check if key is one of special function keys and remap its value to the data-button attribute of the equivalent button, else return key
    if(key=='Enter' || key==' ') return "=";
    else if(key=='Backspace') return "C";
    else if(key=='Escape') return "AC";
    else if(key==',') return ".";
    else if(key=='ArrowLeft' || key=='ArrowUp')return "undo";
    else if(key=='ArrowRight' || key=='ArrowDown') return "redo";
    else return key;
}


const keyPress = function(e){
    //Only works the first time the key is pressed, if remains pressed it will be not called again.
    if(!e.repeat){
        //regex's to check if the key presses are digits, operators or allowed keys for function buttons
        if(operandsChars.test(e.key)
        || operatorsChars.test(e.key)
        || allowedKeys.includes(e.key)){
            //converts key to button data-button attribute and query it from the DOM to use it
            let value=key2Button(e.key);
            let button=document.querySelector(`[data-button="${value}"]`);
            if(e.type=='keydown'){
                button.classList.toggle('pressed');
                button.click();
            }
            else button.classList.remove('pressed');
        }      
    }; 
}


const historian = function(step=-1){
    //moves backward or forward the expressions historian based on steps input
    historyIndex+=step;
    if(historyIndex>=history.length) historyIndex=history.length-1;
    if(historyIndex<=0) historyIndex=0;
    let op = history[historyIndex];
    opIndex = op.length-1;
    updateScreen(3,op.join(''));
    calculation = null;
    return op;
}


const updateScreen = function(line,text){
    //Updates the given screen line with input text, uses spans for doing some cool animations on each character.
    text = String(text).split('');

    while (screen[line].firstChild) {
        screen[line].removeChild(screen[line].lastChild);
    }

    text.forEach(char=>{
        //Replace underscore to minus for negative numbers
        if(char=='_')char='-';
        let newChar = document.createElement('span');
        newChar.classList.add('screenChar');
        newChar.textContent=char;
        screen[line].appendChild(newChar);
    })
}


const newExpression =function(){
    //Update all the lines from screen with last expressions and calculations
    updateScreen(0,screen[1].textContent);
    updateScreen(1,screen[2].textContent);
    updateScreen(2,`${expression.join('')}=${calculation}`);
    updateScreen(3,calculation);
    updateScreen(4,'');
    opIndex=0;
}