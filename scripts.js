const operatorsChars=/[\+-\/\*]/
const operandsChars=/[\d.,]/

let operand = 0;
let prevOperand = null;
let operator = null;
let calculation = null;
let isDecimal = false;

document.addEventListener('keydown',e =>{
    keyPress(e);     
});


document.addEventListener('keyup',e =>{
    keyPress(e);   
});

//get the 4 lines of the screen in a array
let screen = document.querySelectorAll('.screenLine');
let buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', e => {
        keyFromScreen(e);
    });
});

let clear = function(){
    operand = 0;
    prevOperand = null;
    operator = null;
    calculation = null;
    updateScreen(0,'');
    updateScreen(1,'');
    updateScreen(2,'0');
    updateScreen(3,'');
}


let operate = function(operator,a,b){
    a=Number(a);
    b=Number(b);
    console.log(operator,a,b);
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


let addOperation = function(key,value){
    switch(key){
        case 'operand':{
            //if there was a prev calc and not used an operator before calling an operand, it clear all the calcs and screen
            if (calculation!=null){
                clear();
            };
            operand == 0 ? operand=value : operand+=value;
            checkDecimals();
            updateScreen(2,operand);
            //updateScreen(3,'');
            break;
        }
        case 'operator':{
            operator = value;
            //If there was a prev. calculation, takes the results as operand and erase call
            if(calculation!=null){
                prevOperand=calculation;
                calculation=null;
            }
            //Else takes prev operand
            else{
                prevOperand=operand;
            };
            updateScreen(0,prevOperand);
            updateScreen(1,operator);
            updateScreen(2,'');
            updateScreen(3,'');
            operand = 0;
            break;
        }
        case 'result':{
             //if a operator is selected, makes the calculation, else returns the operand;
            if(operator!=null){
                calculation=operate(operator,prevOperand,operand);
                updateScreen(3,calculation);      
            }
            else{
                updateScreen(3,operand);
            }
            operand=0;
            break;
        }
        case 'erase':{
            if(operand!=0){
                let operandArray=Array.from(operand);
                operand=operandArray.splice(0,operandArray.length-1).join('');
                checkDecimals();
                if(operand=='') operand=0;
                updateScreen(2,operand);
            }
            else{
                clear();
            }
            break;
        }
    }
    ;
}


let checkDecimals = function(){
    //Check if the operand is a decimal, if so disable the decimal button
    let isDecimal = String(operand).split(".").length>1;
    document.querySelector('.fraction').disabled=isDecimal;
}

       
let keyFromScreen = function(e){
    //Need some work, previously the idea was to have different functions pressing keyboard or screen, but solved by using .click() method on keypress
    let key = e.target.dataset.key;
    let value;
    if(key=='operator') value = e.target.dataset.button;
    else value = e.target.textContent;
    addOperation(key,value);
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
            else if(e.key=='Backspace')value="C";
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
    if(line==3 && text!=''){
        text = Number(text);
        text="= "+(Number.isInteger(text)? text :text.toFixed(2));
    }
    let textArray = Array.from(String(text));
    while (screen[line].firstChild) {
        screen[line].removeChild(screen[line].lastChild);
    }
    textArray.forEach(char=>{
        newChar = document.createElement('span');
        newChar.classList.add('screenChar');
        newChar.textContent=char;
        screen[line].appendChild(newChar);
    })
}