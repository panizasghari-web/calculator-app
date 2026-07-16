const _display = document.getElementById("display");
const displayInput = document.getElementById("display-input");
const displayResult = document.getElementById("display-result");

const _buttons = document.querySelectorAll("#buttons>button");
const _operatorsButtons = document.querySelectorAll(".operators");

let operators = ["+", "-", "×", "÷", "%"];

let input = "";
let result = "";
let lastCalculation = false;

// MAIN FUNCTION (PUT BTN VALUE INTO INPUT)
const calculate = (btnValue) => {
  // slicing for the last calculation result and backspace functionality
  const lastChar = input.slice(-1);
  const secondToLastChar = input.slice(-2, -1);
  const withoutLastChar = input.slice(0, -1);
  const isLastCharOperator = operators.includes(lastChar);
  const isInvalidResult = ["Error", "Infinity"].includes(result);
  let { openBrackets, closeBrackets } = countBrackets(input);

  // handle equals
  if (btnValue === "=") {
    // "if" for return function in these conditions:
    if (
      input === "" ||
      lastChar === "." ||
      lastChar === "(" ||
      (isLastCharOperator && lastChar !== "%") ||
      lastCalculation // can't clicK "=" more than once
    ) {
      return;
    }

    // close bracket after =
    while (openBrackets > closeBrackets) {
      input += ")";
      closeBrackets++;
    }

    const formattedInput = replaceOperators(input);
    // eval() or calculation
    try {
      const calculatedValue = input.includes("%")
        ? calculatePercentage(input)
        : eval(formattedInput); // eval() can calculate the input string and return the result
      result = parseFloat(calculatedValue.toFixed(10)).toString(); // round to 10 decimal places and convert to string
    } catch {
      result = "Error";
    }

    input += btnValue;

    // LAST CALCULATION
    lastCalculation = true;

    // inputs style when result is displayed
    displayResult.style.transition = "all 0.3s ease-in-out";
    displayInput.style.transition = "all 0.3s ease-in-out";

    displayInput.style.transform = "translateY(-50%)";
    displayInput.style.fontSize = "14px";
    displayResult.style.transform = "translateY(-50%)";
    displayResult.style.fontSize = "26px";
  } else if (btnValue === "AC") {
    // handle AC
    clearInput("");
  } else if (btnValue === "backspace") {
    // handle backspace
    if (lastCalculation) {
      // (5/0=infinity) clear it with one backspace like AC
      if (isInvalidResult) {
        clearInput("");
      }
      // backspace for result
      clearInput(result.slice(0, -1));
    } else {
      // backspace for input
      input = withoutLastChar;
    }
  } else if (operators.includes(btnValue)) {
    // handle operators
    if (lastCalculation) {
      if (isInvalidResult) {
        // infinity or error doesn't get an operator
        return;
      }
      // result goes in input with the operator
      clearInput(result + btnValue);
    } else if (
      ((input === "" || lastChar === "(") && btnValue !== "-") ||
      input === "-" ||
      lastChar === "." ||
      (secondToLastChar === "(" && lastChar === "-") ||
      ((lastChar === "%" || secondToLastChar === "%") && btnValue === "%")
    ) {
      return;
    } else if (lastChar === "%") {
      input += btnValue;
    } else if (isLastCharOperator) {
      input = withoutLastChar + btnValue;
    } else {
      input += btnValue;
    }
  } else if (btnValue === ".") {
    // handle decimal
    const decimalValue = "0.";
    if (lastCalculation) {
      clearInput(decimalValue);
    } else if (lastChar === ")" || lastChar === "%") {
      input += "×" + decimalValue;
    } else if (input === "" || isLastCharOperator || lastChar === "(") {
      input += decimalValue;
    } else {
      let lastOperatorIndex = -1;
      for (const operator of operators) {
        const index = input.lastIndexOf(operator);
        if (index > lastOperatorIndex) {
          lastOperatorIndex = index;
        }
      }
      if (!input.slice(lastOperatorIndex + 1).includes(".")) {
        input += btnValue;
      }
    }
  } else if (btnValue === "( )") {
    // handle brackets
    if (lastCalculation) {
      if (isInvalidResult) {
        clearInput("(");
      } else {
        clearInput(result + "×(");
      }
    } else if (lastChar === "(" || lastChar === ".") {
      return;
    } else if (input === "" || (isLastCharOperator && lastChar !== "%")) {
      input += "(";
    } else if (openBrackets > closeBrackets) {
      input += ")";
    } else {
      input += "×(";
    }
  } else {
    // handle numbers
    if (lastCalculation) {
      // if the last calculation has ended and the user presses a number, reset input and result
      clearInput(btnValue);

      // handle zero:
    } else if (input === "0") {
      input = btnValue;
    } else if (
      (operators.includes(secondToLastChar) || secondToLastChar === "(") &&
      lastChar === "0"
    ) {
      input = withoutLastChar + btnValue;
    } else if (lastChar === ")" || lastChar === "%") {
      input += "×" + btnValue;
    } else {
      input += btnValue;
    }
  }

  // update input and result
  displayInput.value = input;
  displayResult.value = result;

  // scroll to the right of the input
  displayInput.scrollLeft = displayInput.scrollWidth;
};

// replace × and ÷ with * and / for eval()
const replaceOperators = (input) => {
  return input.replace(/×/g, "*").replace(/÷/g, "/");
};

// AC BUTTON FUNCTIONALITY
const clearInput = (newInput) => {
  input = newInput;
  result = "";

  // reset endCalculation flag
  lastCalculation = false;

  displayInput.style.transform = "translateY(0)";
  displayInput.style.fontSize = "24px";
  displayResult.style.transform = "translateY(0)";
  displayResult.style.fontSize = "17px";
};

// FUNCTION TO COUNT BRACKETS IN INPUT
const countBrackets = (input) => {
  let openBrackets = 0;
  let closeBrackets = 0;
  for (const char of input) {
    if (char === "(") {
      openBrackets++;
    } else if (char === ")") {
      closeBrackets++;
    }
  }
  return { openBrackets, closeBrackets };
};

// FUNCTION TO HANDLE PERCENTAGE CALCULATION
const calculatePercentage = (input) => {
  let processedInput = "";
  let numberBuffer = "";
  const bracketState = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (!isNaN(char) || char === ".") {
      numberBuffer += char;
    } else if (char === "%") {
      const percentValue = parseFloat(numberBuffer) / 100;
      const prevOperator = i > 0 ? input[i - numberBuffer.length - 1] : "";
      const nextOperator =
        i + 1 < input.length && operators.includes(input[i + 1])
          ? input[i + 1]
          : "";
      if (
        !prevOperator ||
        prevOperator === "÷" ||
        prevOperator === "×" ||
        prevOperator === "("
      ) {
        processedInput += percentValue;
      } else if (prevOperator === "-" || prevOperator === "+") {
        if (nextOperator === "÷" || nextOperator === "×") {
          processedInput += percentValue;
        } else {
          processedInput +=
            "(" + processedInput.slice(0, -1) + ")*" + percentValue;
        }
      }
      numberBuffer = "";
    } else if (operators.includes(char) || char === "(" || char === ")") {
      if (numberBuffer) {
        processedInput += numberBuffer;
        numberBuffer = "";
      }
      if (operators.includes(char)) {
        processedInput += char;
      } else if (char === "(") {
        processedInput += "(";
        bracketState.push(processedInput);
        processedInput = "";
      } else {
        processedInput += ")";
        processedInput = bracketState.pop() + processedInput;
      }
    }
  }
  if (numberBuffer) {
    processedInput += numberBuffer;
  }
  return eval(replaceOperators(processedInput));
};

// CLICK EVENT LISTENER ON BUTTONS
// reset click press
const resetButtonPressState = (button) => {
  button.style.transition =
    "transform 120ms ease, box-shadow 120ms ease, filter 120ms ease";
  button.style.transform = "translateY(0) scale(1)";
  button.style.boxShadow = "";
  button.style.filter = "";
};

_buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.currentTarget;
    const btnValue = target.dataset.value ?? target.textContent.trim();

    if (btnValue) {
      calculate(btnValue);
    }
  });

  // click buttons down
  button.addEventListener("mousedown", () => {
    button.style.transition =
      "transform 120ms ease, box-shadow 120ms ease, filter 120ms ease";
    button.style.transform = "translateY(2px) scale(0.98)";
    button.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.2)";
    button.style.filter = "brightness(0.96)";
  });
  // click buttons up
  button.addEventListener("mouseup", () => resetButtonPressState(button));
});
