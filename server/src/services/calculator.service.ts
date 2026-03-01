export function tokenize(expression: string): string[] {
  const sanitized = expression.replace(/\s+/g, "");
  if (!sanitized) throw new Error("Expression is empty");

  const tokens: string[] = [];
  let numberBuffer = "";

  for (let i = 0; i < sanitized.length; i += 1) {
    const ch = sanitized[i];

    if (/\d|\./.test(ch)) {
      numberBuffer += ch;
      continue;
    }

    if (numberBuffer) {
      if ((numberBuffer.match(/\./g) || []).length > 1) {
        throw new Error("Invalid number format");
      }
      tokens.push(numberBuffer);
      numberBuffer = "";
    }

    if ("+-*/()".includes(ch)) {
      if (ch === "-" && (tokens.length === 0 || "(+-*/".includes(tokens[tokens.length - 1]))) {
        tokens.push("0");
      }
      tokens.push(ch);
      continue;
    }

    throw new Error(`Unsupported character: ${ch}`);
  }

  if (numberBuffer) {
    if ((numberBuffer.match(/\./g) || []).length > 1) {
      throw new Error("Invalid number format");
    }
    tokens.push(numberBuffer);
  }

  return tokens;
}

export function toRpn(tokens: string[]): string[] {
  const output: string[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

  tokens.forEach((token) => {
    if (!Number.isNaN(Number(token))) {
      output.push(token);
      return;
    }

    if (token in precedence) {
      while (ops.length > 0) {
        const top = ops[ops.length - 1];
        if (top in precedence && precedence[top] >= precedence[token]) {
          output.push(ops.pop() as string);
        } else {
          break;
        }
      }
      ops.push(token);
      return;
    }

    if (token === "(") {
      ops.push(token);
      return;
    }

    if (token === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") {
        output.push(ops.pop() as string);
      }
      if (ops.length === 0 || ops[ops.length - 1] !== "(") {
        throw new Error("Mismatched parentheses");
      }
      ops.pop();
      return;
    }

    throw new Error(`Invalid token: ${token}`);
  });

  while (ops.length > 0) {
    const token = ops.pop() as string;
    if (token === "(" || token === ")") {
      throw new Error("Mismatched parentheses");
    }
    output.push(token);
  }

  return output;
}

export function evalRpn(rpn: string[]): { result: number; steps: string[] } {
  const stack: number[] = [];
  const steps: string[] = [];

  rpn.forEach((token) => {
    if (!Number.isNaN(Number(token))) {
      stack.push(Number(token));
      return;
    }

    const b = stack.pop();
    const a = stack.pop();

    if (a === undefined || b === undefined) {
      throw new Error("Invalid expression");
    }

    let value = 0;
    switch (token) {
      case "+":
        value = a + b;
        break;
      case "-":
        value = a - b;
        break;
      case "*":
        value = a * b;
        break;
      case "/":
        if (b === 0) throw new Error("Division by zero");
        value = a / b;
        break;
      default:
        throw new Error("Unknown operator");
    }

    steps.push(`${a} ${token} ${b} = ${value}`);
    stack.push(value);
  });

  if (stack.length !== 1) throw new Error("Invalid expression");
  return { result: stack[0], steps };
}

export function calculateExpression(expression: string): { result: number; steps: string[] } {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  return evalRpn(rpn);
}
