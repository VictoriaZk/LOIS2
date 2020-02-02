let LEFT_BRACKET = "(";
let RIGHT_BRACKET = ")";
let lBracketPattern = new RegExp('\\' + LEFT_BRACKET, 'g');
let rBracketPattern = new RegExp('\\' + RIGHT_BRACKET, 'g');

let KONJUNCTION = "&";
let DISJUNCTION = "|";
let NEGATION = "!";
let IMPICATION = "->";
let EQUIVALENCE = "~";

let operationsRegExp = /~|->|&|\||!/g;
let symbolsRegExp = /^[A-Z]+\d*$/;


let OPERATOR = "operator";
let LEFT_OPERATOR = "left";
let RIGHT_OPERATOR = "right";
let OPERAND = "operand";

let TD = "TD";
let TR = "TR";

let linesNumber = 0;
let variables = [];
let linesValuesArr = [];
let truthTable = [];
let subformulsArr = [];

function main() {
    let formula = document.getElementById("formula").value.toString();
    if ((formula.includes(LEFT_BRACKET) || formula.includes(RIGHT_BRACKET)) && !checkBracketsNum(formula)) {
        document.getElementById("error").innerHTML = "Проверьте введенную формулу";
        return;
    }
    if (getVariables(formula) === 1) {
        document.getElementById("answer").innerHTML = buildSKNF(formula);
    } else {
        document.getElementById("answer").innerHTML = "Невозможно построить СКНФ для данной формулы";
    }
}

function checkBracketsNum(formula){
    if (formula.includes(LEFT_BRACKET) && formula.includes(RIGHT_BRACKET)) {
        let leftBracketsArr = formula.match(lBracketPattern);
        let rightBracketsArr = formula.match(rBracketPattern);
        if (leftBracketsArr.length !== rightBracketsArr.length) {
            return false;
        }
    } else if (formula.includes(LEFT_BRACKET) && !formula.includes(RIGHT_BRACKET)) {
        return false;
    } else if (formula.includes(RIGHT_BRACKET) && !formula.includes(LEFT_BRACKET)) {
        return false;
    }
    return true;
}

function getVariables(formula){
    let atoms = formula.match(/[A-Z]+\d*/g);
    if (atoms !== null) {
        return unique(atoms)
    } else {
        return 0;
    }
}

function unique(arr){
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        obj[str] = true;
    }
    variables = Object.keys(obj);
    return 1;
}

function buildSKNF(formula){
    let sknf = "";
    let columnsNumber = variables.length;
    linesNumber = Math.pow(2, columnsNumber);
    buildVariablesColumns();
    buildTruthTable(formula);
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

    //let binary = number.toString(binRadix);
    let binary = number.toString();
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
        truthTable.push(processSubformula(formula, subformuls, linesValuesArr[lineIndex], lineIndex));
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

        if (operator === NEGATION) {
            let operand = getSubformOperand(formula, operatorIndex, false);
            subformuls[OPERAND] = operand;

            subformulsKey = LEFT_BRACKET + operator + operand + RIGHT_BRACKET;
        } else {
            let leftOperand = getSubformOperand(formula, operatorIndex, true);
            subformuls[LEFT_OPERATOR] = leftOperand;
            let rightOperand;
            if (operator === IMPICATION) {
                rightOperand = getSubformOperand(formula, operatorIndex+1, false);
            } else {
                rightOperand = getSubformOperand(formula, operatorIndex, false);
            }
            subformuls[RIGHT_OPERATOR] = rightOperand;
            subformulsKey = LEFT_BRACKET + leftOperand + operator + rightOperand + RIGHT_BRACKET;
        }
        subforms[subformulsKey] = subformuls;
    }
    return subforms;
}

function  processSubformula(subform, subforms, lineValue, lineIndex) {
    let subformValue;

    if (subform === "1" || subform === "0") {
        subformValue = Number(subform);
    } else if (symbolsRegExp.test(subform)) {
        subformValue = lineValue[subform];
    } else {
        subformValue = processOperation(subforms[subform], subforms, lineValue, lineIndex)
    }
    subformulsArr[lineIndex][subform] = subformValue;
    return subformValue;
}