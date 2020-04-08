let lBracketPattern = new RegExp('\\' + "(", 'g');
let rBracketPattern = new RegExp('\\' + ")", 'g');
let operationsRegExp = /~|->|&|\||!/g;
let symbolsRegExp = /^[A-Z]+\d*$/;
let OPERATOR = "operator";
let LEFT_OPERAND = "left";
let RIGHT_OPERAND = "right";
let OPERAND = "operand";
let TD = "TD";
let TR = "TR";

let linesNumber = 0;
let variables = [];
let linesValuesArr = [];
let truthTable = [];
let subformulsArr = [];
let answer;
let numberOfAttempts = 3;
let leftBracketsArr = 0;


var SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var NEGATION = "!";
var CONJUNCTION = "&";
var DISJUNCTION = "|";
var IMPLICATION = "->";
var EQUIVALENCE = "~";
var OPENING_BRACKET = "(";
var CLOSING_BRACKET = ")";
var Formula = "";
var testAnswer = "";
var disjuncts = [];


function main() {
    document.getElementById("error").innerHTML = "";
    if (truthTable.length !== 0) {
        linesNumber = 0;
        variables = [];
        linesValuesArr = [];
        truthTable = [];
        subformulsArr = [];
        numberOfAttempts = 3;
        disjuncts = [];
        answer = "";
        document.getElementById("tableA").innerHTML = "";
        document.getElementById("answer").value = "";
        document.getElementById("result").innerHTML = "";
        document.getElementById("l").disabled = false;
    }
    let formula = document.getElementById("formula").value.toString();
    if ((formula.includes("(") || formula.includes(")")) && !checkBracketsNum(formula)) {
        document.getElementById("error").innerHTML = "Проверьте введенную формулу";
        return;
    }
    if (getVariables(formula) === 1) {
        document.getElementById("answer").innerHTML = buildSKNF(formula);
    } else {
        document.getElementById("error").innerHTML = "Невозможно построить СКНФ для данной формулы";
    }
}

function checkBracketsNum(formula) {
    if (formula.includes("(") && formula.includes(")")) {
        let leftBracketsArr = formula.match(lBracketPattern);
        let rightBracketsArr = formula.match(rBracketPattern);
        if (leftBracketsArr.length !== rightBracketsArr.length) {
            return false;
        }
    } else if (formula.includes("(") && !formula.includes(")")) {
        return false;
    } else if (formula.includes(")") && !formula.includes("(")) {
        return false;
    }
    return true;
}

function getVariables(formula) {
    let atoms = formula.match(/[A-Z]+\d*/g);
    if (atoms !== null) {
        return unique(atoms)
    } else {
        return 0;
    }
}

function unique(arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        obj[str] = true;
    }
    variables = Object.keys(obj);
    return 1;
}

function buildSKNF(formula) {
    let sknf = "";
    let columnsNumber = variables.length;
    linesNumber = Math.pow(2, columnsNumber);
    buildVariablesColumns();
    buildTruthTable(formula);
    let disjuncts = createDisjucts();
    let disjunctsNumber = disjuncts.length;
    if (disjunctsNumber !== 0) {
        for (let disjunctIndex = 0; disjunctIndex < disjunctsNumber; disjunctIndex++) {
            if (disjunctIndex > 0 && disjunctIndex !== disjunctsNumber - 1) {
                sknf += "&" + "(";
            } else if (disjunctIndex > 0 && disjunctIndex === disjunctsNumber - 1) {
                sknf += "&";
            }
            sknf += disjuncts[disjunctIndex];
        }
        for (let disjunctIndex = 0; disjunctIndex < disjunctsNumber - 2; disjunctIndex++) {
            sknf += ")";
        }
        if (disjunctsNumber > 1) {
            sknf = "(" + sknf + ")";
        }
        answer = sknf;
        return answer;
    } else {
        answer = "Невозможно построить СКНФ для данной формулы";
    }

}

function buildVariablesColumns() {
    let columnsNumber = variables.length;
    for (let i = 0; i < linesNumber; i++) {
        let lineValue = {};
        let binary = convertToBinaryWithLength(i, columnsNumber);
        for (let j = 0; j < columnsNumber; j++) {
            lineValue[variables[j]] = Number(binary[j]);
        }
        linesValuesArr.push(lineValue);
    }
}

function convertToBinaryWithLength(number, length) {
    const binRadix = 2;
    let binary = number.toString(binRadix);
    let binaryLength = binary.length;
    if (binaryLength < length) {
        let addingNumber = length - binaryLength;
        for (let i = 0; i < addingNumber; i++) {
            binary = '0' + binary;
        }
    }
    return binary;
}

function buildTruthTable(formula) {
    let subformuls = parseSubformuls(formula);
    for (let lineIndex = 0; lineIndex < linesNumber; lineIndex++) {
        subformulsArr[lineIndex] = {};
        truthTable.push(calculateSubformula(formula, subformuls, linesValuesArr[lineIndex], lineIndex));
    }
    printTruthTable(subformuls);
}


function parseSubformuls(formula) {
    let subforms = {};
    let found;
    while ((found = operationsRegExp.exec(formula))) {
        let subformuls = {};
        let subformulsKey;
        let operator = found[0];
        let operatorIndex = found.index;
        subformuls[OPERATOR] = operator;
        if (operator === "!") {
            let operand = getSubformOperand(formula, operatorIndex, false);
            subformuls[OPERAND] = operand;
            subformulsKey = "(" + operator + operand + ")";
        } else {
            let leftOperand = getSubformOperand(formula, operatorIndex, true);
            subformuls[LEFT_OPERAND] = leftOperand;
            let rightOperand;
            if (operator === "->") {
                rightOperand = getSubformOperand(formula, operatorIndex + 1, false);
            } else {
                rightOperand = getSubformOperand(formula, operatorIndex, false);
            }
            subformuls[RIGHT_OPERAND] = rightOperand;
            subformulsKey = "(" + leftOperand + operator + rightOperand + ")";
        }
        subforms[subformulsKey] = subformuls;
    }
    return subforms;
}


function getSubformOperand(formula, operatorIndex, isLeft) {
    let openBracketsNum = 0;
    if (isLeft) {
        let formulaIndex = operatorIndex - 1;
        while (formulaIndex > 0) {
            if (formula[formulaIndex] === "(" && openBracketsNum === 0) {
                break;
            } else if (formula[formulaIndex] === ")") {
                openBracketsNum++;
            } else if (formula[formulaIndex] === "(") {
                openBracketsNum--;
            }
            formulaIndex--;
        }
        return formula.substring(formulaIndex + 1, operatorIndex);
    } else {
        let formulaIndex = operatorIndex + 1;
        while (formulaIndex < formula.length) {
            if (formula[formulaIndex] === "(") {
                openBracketsNum++;
            } else if (formula[formulaIndex] === ")" && openBracketsNum === 0) {
                break;
            } else if (formula[formulaIndex] === ")") {
                openBracketsNum--;
            }
            formulaIndex++;
        }
        return formula.substring(operatorIndex + 1, formulaIndex);
    }
}


function calculateSubformula(subform, subforms, lineValue, lineIndex) {
    let subformValue;
    if (subform === "1" || subform === "0") {
        subformValue = Number(subform);
    } else if (symbolsRegExp.test(subform)) {
        subformValue = lineValue[subform];
    } else {
        subformValue = performOperation(subforms[subform], subforms, lineValue, lineIndex)
    }
    subformulsArr[lineIndex][subform] = subformValue;
    return subformValue;
}


function performOperation(subform, subforms, lineValue, lineIndex) {
    switch (subform.operator) {
        case "!":
            return negation(calculateSubformula(subform.operand, subforms, lineValue, lineIndex));
        case "|":
            return calculateSubformula(subform[LEFT_OPERAND], subforms, lineValue, lineIndex) |
                calculateSubformula(subform[RIGHT_OPERAND], subforms, lineValue, lineIndex);
        case "&":
            return calculateSubformula(subform[LEFT_OPERAND], subforms, lineValue, lineIndex) &
                calculateSubformula(subform[RIGHT_OPERAND], subforms, lineValue, lineIndex);
        case "~":
            return equivalence(calculateSubformula(subform[LEFT_OPERAND], subforms, lineValue, lineIndex),
                calculateSubformula(subform[RIGHT_OPERAND], subforms, lineValue, lineIndex));
        case "->":
            return implication(calculateSubformula(subform[LEFT_OPERAND], subforms, lineValue, lineIndex),
                calculateSubformula(subform[RIGHT_OPERAND], subforms, lineValue, lineIndex));
    }
}

function negation(operand) {
    if (operand === 1) {
        return 0;
    } else {
        return 1;
    }
}

function equivalence(leftOperand, rightOperand) {
    if (leftOperand === rightOperand) {
        return 1;
    } else {
        return 0;
    }
}

function implication(leftOperand, rightOperand) {
    return negation(leftOperand) | rightOperand;
}

function createDisjucts() {
    disjuncts = [];
    for (let lineIndex = 0; lineIndex < linesNumber; lineIndex++) {
        if (truthTable[lineIndex] === 0) {
            let disjunct = "";
            let keys = Object.keys(linesValuesArr[lineIndex]);
            let keysNumber = keys.length;
            for (let keyIndex = 0; keyIndex < keysNumber; keyIndex++) {
                let key = keys[keyIndex];
                if (keyIndex > 0 && keyIndex !== keysNumber - 1) {
                    disjunct += "|" + "(";
                } else if (keyIndex > 0 && keyIndex === keysNumber - 1) {
                    disjunct += "|";
                }
                if (linesValuesArr[lineIndex][key] === 0) {
                    disjunct += key;
                } else {
                    disjunct += "(" + "!" + key + ")";
                }
            }
            for (let i = 0; i < keysNumber - 2; i++) {
                disjunct += ")";
            }
            if (keysNumber > 1) {
                disjunct = "(" + disjunct + ")";
            }
            disjuncts.push(disjunct);
        }
    }
    return disjuncts;
}

function printTruthTable(subformuls) {
    console.log(truthTable);
    tbody = document.getElementById("truthTable").getElementsByTagName("TBODY")[0];
    let row = document.createElement(TR);
    for (let varIndex = 0; varIndex < variables.length; varIndex++) {
        let td = document.createElement(TD);
        td.appendChild(document.createTextNode(variables[varIndex]));
        row.appendChild(td);
    }
    for (let key in subformuls) {
        let td = document.createElement(TD);
        td.appendChild(document.createTextNode(key));
        row.appendChild(td);
    }
    tbody.appendChild(row);
    for (let lineIndex = 0; lineIndex < linesNumber; lineIndex++) {
        let row = document.createElement(TR);
        for (let variableIndex = 0; variableIndex < variables.length; variableIndex++) {
            let td = document.createElement(TD);
            td.appendChild(document.createTextNode(linesValuesArr[lineIndex][variables[variableIndex]]));
            row.appendChild(td);
        }
        for (let key in subformuls) {
            let td = document.createElement(TD);
            td.appendChild(document.createTextNode(subformulsArr[lineIndex][key]));
            row.appendChild(td);
        }
        let td = document.createElement(TD);
        button = document.createElement('BUTTON');
        buttonClick = document.createAttribute("onclick");
        buttonClick.value = `viewIndex(${lineIndex})`;
        button.setAttributeNode(buttonClick);
        td.appendChild(button);
        row.appendChild(td);
        tbody.appendChild(row);
    }
}

function viewIndex(lineIndex){
    output = document.getElementById('answer');
    let subformul = [];
    for(let i = 0; i < variables.length; i++){
        if(linesValuesArr[lineIndex][variables[i]] === 1){
            subformul.push(`(!${variables[i]})`);
        }else{
            subformul.push(`${variables[i]}`);
        }
    }
    let outputString = subformul.join('|');
    let neg = new RegExp("^\\(![A-Z]\\)$")
    console.log(outputString.match(neg));
    console.log(outputString.search(neg));
    if(outputString.length > 1 && outputString.match(neg) == null){
        outputString = `(${outputString})`;
    }

    if(output.value != ""){
        output.value += '&' + outputString;
    }else {
        output.value = outputString;
    }
}

function newFormula() {
    var type = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    switch (type) {
        case 1:
            var answer = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
            if (answer == 1) Formula = "1";
            else Formula = "0";
            break

        case 2:
            var answer = Math.floor(Math.random() * (25 - 0 + 1)) + 0;
            Formula = SYMBOLS[answer];
            break

        case 3:
            Formula = newFormula();
            Formula = OPENING_BRACKET + NEGATION + Formula + CLOSING_BRACKET
            break

        case 4:
            var relation = "";
            var type = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
            switch (type) {
                case 1:
                    relation = CONJUNCTION
                    break

                case 2:
                    relation = DISJUNCTION
                    break

                case 3:
                    relation = IMPLICATION
                    break

                case 4:
                    relation = EQUIVALENCE
                    break
            }

            var leftFormula = newFormula();
            var rightFormula = newFormula();
            Formula = OPENING_BRACKET + leftFormula + relation + rightFormula + CLOSING_BRACKET;
            break
    }
    return Formula;
}

function generate() {
    document.getElementById("formula").value = newFormula();
}

function checkAnswer() {
    testAnswer = document.getElementById("answer").value;
    let correctAnswer = answer;
    if (correctAnswer.length === 1 && testAnswer.length !== 1) {
        numberOfAttempts--;
        document.getElementById("result").innerHTML = "Вы ответи неверно, у вас осталось " + numberOfAttempts
            + " попытки";
    } else {
        if (parse(testAnswer)) {
            document.getElementById("result").innerHTML = "Вы ответили верно";
        } else {
            numberOfAttempts--;
            document.getElementById("result").innerHTML = "Вы ответи неверно, у вас осталось " + numberOfAttempts
                + " попытки";
        }
    }
    if (numberOfAttempts === 0) {
        document.getElementById("result").innerHTML = "Правильный ответ: " + correctAnswer;
        document.getElementById("l").disabled = true;
        document.getElementById("answer").value = "";
    }
}

function parse(testAnswer) {
    let mas = [];
    mas = testAnswer.split('&');
    if (checkBracketsNum(testAnswer) && checkNegation(mas))
        if (disjuncts.length === mas.length) {
            for (let i = 0; i < mas.length; i++) {
                while (mas[i].includes("(") || mas[i].includes(")") ||
                disjuncts[i].includes("(") || disjuncts[i].includes(")")) {
                    mas[i] = mas[i].replace("(", "");
                    mas[i] = mas[i].replace(")", "");
                    disjuncts[i] = disjuncts[i].replace("(", "");
                    disjuncts[i] = disjuncts[i].replace(")", "");
                }
            }
            let sknf = disjuncts.join(';');
            sknf = ';' + sknf + ';';
            for (let i = 0; i < mas.length; i++) {
                if (sknf.indexOf(mas[i]) < 0 || (sknf[sknf.indexOf(mas[i]) + mas[i].length] !== ';')
                    || (sknf[sknf.indexOf(mas[i]) - 1] !== ';')) {
                    return false;
                } else {
                    sknf = sknf.replace(mas[i], '');
                }
            }
            return true;
        } else {
            return false;
        }
}

function checkNegation(formula) {
    for (let i = 0; i < formula.length;) {
        if (formula[i].includes("!") && formula[i].match(/(\(!([A-Z]|[10])\))/)) {
            i++;
        } else {
            if (formula[i].includes("!") && !formula[i].match(/(\(!([A-Z]|[10])\))/)) {
                return false;
            } else {
                i++;
            }
        }
    }
    return true;
}




