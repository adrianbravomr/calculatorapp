const operatorsChars=/[\+\-\/\*]/
const operandsChars=/[\d.,]/

let operation = 0;
let calculation = null;


document.addEventListener('keydown',e =>{
    keyPress(e);     
});


document.addEventListener('keyup',e =>{
    keyPress(e);   
});

//get the 2 lines of the screen in a array
let screen = document.querySelectorAll('.screenLine');
let buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', e => {
        newOperation(e);
    });
});

let clear = function(){
    operation = 0;
    calculation = null;
    updateScreen(0,'');
    updateScreen(1,'');
    updateScreen(2,'');
    updateScreen(3,'');
}

let deleteChar = function(){
    let operationArray=Array.from(operation);
    operation=operationArray.splice(0,operationArray.length-1).join('');
    checkDecimals();
    if(operation=='') operation=0;
    updateScreen(3,operation);
}


let addChar = function(char){
    operation = String(operation);
    let lastChar = operation.slice(-1);
    if (isOperator(lastChar) && isOperator(char)){
        operation=operation.slice(0,operation.length-1)+char;
    }
    else{
        operation == 0 ? operation=char : operation+=char;
        checkDecimals();
    }
    updateScreen(3,operation);
}

let isOperator = function(char){
    return operatorsChars.test(char);
}

let operate = function(a,operator,b){
    a=Number(a);
    b=Number(b);
    switch(operator){
        case "+":
            return a+b;
        case "-":
            return a+(-1*b);
        case "*":
            return a*b;
        case "/":
            return a/b;
        default:
            return b; 
    }
}

let calculate = function(){
    let result = getOperands().reduce((current,previous,index) => {
        if (index==0) return operate(current,"+",previous);
        return operate(current,getOperators(index-1),previous);
    },0);
    
    updateScreen(3,result);
    return result;
}


let newOperation = function(e){
    let type = e.target.dataset.key;
    let value = e.target.dataset.button;
    switch(type){
        case 'key':{
            //if there was a prev calc and not used an operator before calling an operand, it clear all the calcs and screen
            if (calculation!=null){
                if(isOperator(value)){
                    updateHistory();
                    operation=calculation;
                    calculation=null
                }
                else clear();
            };
            addChar(value);
            break;
        }
        case 'result':{
            calculation = calculate();
            break;
        }
        case 'erase':{
            deleteChar();
            break;
        }
        case 'clear':{
                clear();
                updateScreen(3,0);
            break;
        }
    }
    ;
}


let checkDecimals = function(){
    //Check if the current operand is a decimal, if so disable the decimal button
    let isDecimal = getLastOperand().split(".").length>1;
    document.querySelector('.fraction').disabled=isDecimal;
}

let getOperands = function(index=-1){
    //Get operands fron the operation, if index is specified, returns the operand at given index
    return index >= 0 ? operation.split(operatorsChars)[index] : operation.split(operatorsChars);
}

let getLastOperand = function(){
    //Get last operand from operation;
    return getOperands().splice(-1)[0];
}

let getOperators = function(index=-1){
    //Get operators fron the operation, if index is specified, returns the operator at given index;
    return index >= 0 ? operation.split(operandsChars).filter(e =>  e)[index] : operation.split(operandsChars).filter(e =>  e); 
}

let getLastOperator = function(){
    //Get last operator from operation;
    return getOperators().splice(-1)[0];
}


let keyPress = function(e){
    //Only works the first time the key is pressed, if remains pressed it will be not called again.
    if(!e.repeat){
        //regex's to check if the key presses are digits, operators, functions
        if(operandsChars.test(e.key)
        || operatorsChars.test(e.key)
        || e.key=='Enter'
        || e.key==' '
        || e.key=='Backspace'
        || e.key=='Escape'){
            //the best idea i had to have this as compact as possible and not make the querySelector every check. it check specials characters again and define the value to the corresponding keyboard key
            let value=e.key;
            if(e.key=='Enter' || e.key==' ')value="=";
            else if(e.key=='Backspace')value="e";
            else if(e.key=='Escape')value="C";
            else if(e.key==',')value=".";
            let button=document.querySelector(`[data-button="${value}"]`);
            if(e.type=='keydown'){
                button.classList.toggle('pressed');
                button.click();
            }
            else button.classList.remove('pressed');
        }      
    }; 
}

let updateScreen = function(line,text){
    text = String(text).split('');

    while (screen[line].firstChild) {
        screen[line].removeChild(screen[line].lastChild);
    }

    text.forEach(char=>{
        newChar = document.createElement('span');
        newChar.classList.add('screenChar');
        newChar.textContent=char;
        screen[line].appendChild(newChar);
    })
}

let updateHistory =function(){
    updateScreen(0,screen[1].textContent);
    updateScreen(1,screen[2].textContent);
    updateScreen(2,operation+"="+calculation);
    updateScreen(3,operation);
}