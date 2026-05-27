// src/prompts/index.js

const LANGUAGE_META = {
  python: { docFormat: 'Google-style docstrings', testFramework: 'pytest', idioms: 'Pythonic, PEP 8, type hints' },
  javascript: { docFormat: 'JSDoc', testFramework: 'Jest', idioms: 'ES6+, async/await, modules' },
  typescript: { docFormat: 'TSDoc', testFramework: 'Vitest', idioms: 'strict types, interfaces, generics' },
  go: { docFormat: 'GoDoc', testFramework: 'Go testing package', idioms: 'error returns, goroutines, interfaces' },
  java: { docFormat: 'Javadoc', testFramework: 'JUnit 5', idioms: 'OOP, streams, checked exceptions' },
  rust: { docFormat: '/// doc comments', testFramework: 'cargo test', idioms: 'ownership, Result/Option, lifetimes' },
  cpp: { docFormat: 'Doxygen', testFramework: 'Google Test', idioms: 'RAII, STL, smart pointers' },
};

export function buildGeneratePrompt({ language, prompt, complexity, existingCode }) {
  const meta = LANGUAGE_META[language] || LANGUAGE_META.javascript;
  const complexityProfiles = {
    snippet: {
      title: `Generate a small ${language} snippet.`,
      scope: [
        'Return only the smallest code needed to satisfy the request.',
        'Keep the output between 5 and 15 lines.',
        'Focus only on the requested logic.',
        'Do not introduce classes, modules, architecture layers, or scaffolding.',
      ],
      requirements: [
        'Use minimal imports only if absolutely required.',
        'Do not add unnecessary comments or documentation.',
        'Do not add extensive validation or defensive programming unless explicitly requested.',
        `Keep the code idiomatic ${language} without making it enterprise-style.`,
      ],
      outputShape: 'Return a compact, directly usable code snippet.',
    },
    function: {
      title: `Generate a complete reusable ${language} function.`,
      scope: [
        'Return one focused function or method with a single clear responsibility.',
        'Keep the implementation production-ready but not over-engineered.',
      ],
      requirements: [
        'Include necessary validation and error handling relevant to the request.',
        `Include concise ${meta.docFormat} documentation or brief comments when helpful.`,
        'Include required imports only if they are needed for the function to work.',
        `Use idiomatic ${language} patterns and type information where applicable.`,
      ],
      outputShape: 'Return only the function/method and any strictly required imports.',
    },
    module: {
      title: `Generate a feature-level ${language} module.`,
      scope: [
        'Return multiple related functions, classes, or utilities when needed.',
        'Organize the code as a coherent module for a single feature.',
      ],
      requirements: [
        'Include proper imports and exports for the language ecosystem.',
        'Shared helpers and utilities are allowed when they improve clarity.',
        'Keep the structure organized and maintainable.',
        'Avoid unrelated scaffolding outside the requested feature.',
      ],
      outputShape: 'Return a complete module-level implementation in one code block.',
    },
    boilerplate: {
      title: `Generate a production-ready ${language} starter scaffold.`,
      scope: [
        'Return a full starter architecture appropriate for the request.',
        'Include setup, configuration, and project structure where relevant.',
      ],
      requirements: [
        'Multiple files or folders may be represented when needed.',
        'Include scaffold-level wiring, entry points, and configuration.',
        'Use a realistic production-ready structure.',
        'Keep the scaffold aligned to the requested stack and purpose.',
      ],
      outputShape: 'Return the scaffold clearly, including file sections when multiple files are needed.',
    },
  };

  const profile = complexityProfiles[complexity] || complexityProfiles.function;
  const contextSection = existingCode
    ? `\n\nExisting code in editor (match style and conventions):\n\`\`\`${language}\n${existingCode}\n\`\`\``
    : '';
  const formatList = (items) => items.map((item) => `- ${item}`).join('\n');

  return `You are an expert ${language} developer.

${profile.title}

Task: ${prompt}

Language expectations:
- Use idiomatic ${language} code (${meta.idioms})
- Follow the task exactly; do not switch to a different problem
- Do not add demo usage, test code, or example invocation unless explicitly requested

Complexity-specific scope:
${formatList(profile.scope)}

Complexity-specific requirements:
${formatList(profile.requirements)}${contextSection}

Expected output:
- ${profile.outputShape}

Return ONLY the code without markdown fences or explanation. Start with any required imports.`;
}

export function buildRefinePrompt({ language, existingCode, refinement }) {
  return `You are an expert ${language} developer. Refine the following code based on the instruction.

Original code:
\`\`\`${language}
${existingCode}
\`\`\`

Refinement instruction: ${refinement}

Return ONLY the refined code without markdown fences or explanation. Preserve all existing logic unless the refinement requires changing it.`;
}

export function buildReviewPrompt({ language, code }) {
  return `You are a senior ${language} code reviewer with expertise in security and performance.

Review this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Analyze for:
1. Bugs (null refs, off-by-one, race conditions, unhandled exceptions)
2. Security (injection, XSS, hardcoded secrets, OWASP Top 10)
3. Performance (N+1, unnecessary loops, memory leaks, blocking calls)
4. Style (${LANGUAGE_META[language]?.idioms || 'language best practices'})

Return a JSON object (no markdown, no fences) with this exact structure:
{
  "grade": "A|B|C|D|F",
  "score": 85,
  "summary": "Brief overall assessment",
  "issues": [
    {
      "id": "issue-1",
      "severity": "error|warning|info|suggestion",
      "category": "bug|security|performance|style",
      "line": 5,
      "endLine": 7,
      "description": "Clear description of the issue",
      "suggestion": "How to fix it",
      "fixCode": "The corrected code snippet"
    }
  ],
  "stats": {
    "bugs": 0,
    "security": 0,
    "performance": 0,
    "style": 0
  }
}`;
}

export function buildExplainPrompt({ language, code, depth }) {
  const depthInstructions = {
    beginner: 'Explain every concept. Assume no prior programming knowledge. Use simple analogies. Define all technical terms.',
    intermediate: 'Explain the logic and patterns. Assume language familiarity. Focus on the why, not just the what.',
    expert: 'Focus on architectural decisions, edge cases, performance implications, and algorithmic complexity. Skip basics.',
  };

  return `You are an expert ${language} teacher. Explain the following code at ${depth} level.

${depthInstructions[depth]}

Code:
\`\`\`${language}
${code}
\`\`\`

Return a JSON object (no markdown, no fences):
{
  "overview": "One sentence: what this code does",
  "explanation": "Main explanation paragraph(s)",
  "lineAnnotations": [
    { "line": 1, "endLine": 3, "note": "What these lines do" }
  ],
  "parameters": [{ "name": "param", "type": "type", "description": "what it is" }],
  "returns": "What the code/function returns",
  "complexity": { "time": "O(n)", "space": "O(1)", "notes": "Why" },
  "algorithm": "Algorithm name if applicable, or null",
  "exampleUsage": "Example of how to use this code"
}`;
}

export function buildDocumentPrompt({ language, code }) {
  const meta = LANGUAGE_META[language] || LANGUAGE_META.javascript;

  return `You are an expert ${language} technical writer.

Generate ${meta.docFormat} documentation for this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Rules:
- Use correct ${meta.docFormat} format for ${language}
- Document every parameter with type and description
- Document return value
- Document exceptions/errors
- Include a usage example
- Be concise but complete

Return ONLY the documentation comment(s) in correct ${language} format, no extra text.`;
}

export function buildTestPrompt({ language, code }) {
  const meta = LANGUAGE_META[language] || LANGUAGE_META.javascript;

  return `You are an expert ${language} test engineer.

Generate comprehensive ${meta.testFramework} tests for this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Requirements:
- Use ${meta.testFramework} conventions and best practices
- Cover: happy path, edge cases (empty/null/boundary values), error cases
- Use proper mocking for external dependencies
- Arrange-Act-Assert pattern
- Descriptive test names that explain what is being tested
- Group tests logically

Return ONLY the complete test file code without markdown fences.`;
}

export function buildTranslatePrompt({ sourceLanguage, targetLanguage, code }) {
  const targetMeta = LANGUAGE_META[targetLanguage] || LANGUAGE_META.javascript;

  return `You are an expert polyglot developer. Translate code from ${sourceLanguage} to ${targetLanguage}.

Source ${sourceLanguage} code:
\`\`\`${sourceLanguage}
${code}
\`\`\`

Requirements:
- Produce idiomatic ${targetLanguage} code (${targetMeta.idioms}), NOT just syntax conversion
- Map libraries to ${targetLanguage} equivalents
- Add comments explaining non-obvious translation choices (e.g., // In Go, error handling replaces Python's try/except)
- Preserve all logic and behavior
- Include all necessary imports

Return ONLY the translated code without markdown fences.`;
}

export function buildRefactorPrompt({ language, code }) {
  return `You are a senior ${language} architect specializing in code quality.

Analyze and suggest refactoring for this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Identify improvements: extract functions, rename for clarity, reduce complexity, remove duplication (DRY), replace magic numbers, apply design patterns, simplify boolean expressions.

Return a JSON object (no markdown, no fences):
{
  "summary": "Overall assessment",
  "metrics": {
    "before": { "complexity": 5, "lines": 20, "nestingDepth": 3 },
    "after": { "complexity": 2, "lines": 15, "nestingDepth": 2 }
  },
  "suggestions": [
    {
      "id": "ref-1",
      "type": "extract_function|rename|dry|simplify|pattern|constant",
      "title": "Short title",
      "description": "Why this improves the code",
      "beforeCode": "Code before the change",
      "afterCode": "Code after the change"
    }
  ]
}`;
}

export function buildDetectLanguagePrompt({ code }) {
  return `Analyze this code and identify the programming language.

Code:
${code.substring(0, 500)}

Return a JSON object (no markdown, no fences):
{
  "language": "python|javascript|typescript|go|java|rust|cpp|unknown",
  "confidence": 0.95,
  "reason": "Brief reason for detection"
}`;
}
