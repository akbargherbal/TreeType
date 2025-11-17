# From Python to Production: Building TreeType with Claude - A Developer's Journey into the Unknown

## The Audacity of Ignorance (Or: How I Built a TypeScript App Without Knowing TypeScript)

I'm a Python developer. Six years of Django, Flask, and Pandas have made me comfortable in the backend world. JavaScript? That thing I copy-paste from Stack Overflow when I absolutely must. TypeScript? Never touched it in production. React? Watched some tutorials once.

So naturally, I decided to build a sophisticated web application using TypeScript, React tooling, and modern frontend architecture.

This is the story of how I did it—not despite my ignorance, but perhaps because of it. With Claude as my pair programmer, a methodical approach to learning, and an unhealthy amount of documentation, I turned an experimental idea into a production-ready application.

## The Spark: When Curiosity Meets Frustration

It started with tree-sitter, a parsing library I'd been exploring for fun. I wanted to understand how code could be broken down into tokens, categorized, and reconstructed. The goal wasn't to build a parser—tree-sitter already does that brilliantly. I wanted to understand how it _worked_.

My first sessions with Claude were exploratory:

- How does tree-sitter represent code?
- Can we extract tokens with position metadata?
- Can we reconstruct the original source to validate our understanding?

These early explorations felt like archaeological work—peeling back layers of abstraction until the mechanics became clear. Claude helped me avoid the trap of premature optimization, keeping me focused on understanding rather than engineering.

Then came the pivot. Why not turn this analysis into something _useful_? A typing practice app for code—not prose, but actual Python, JavaScript, and TypeScript. Let users build muscle memory for programming syntax, not just words.

## The Philosophy: Plan First, Code Later

Here's where my backend experience proved invaluable. I've seen too many projects fail because they "just started coding." So I did something that felt unnatural for a learning project: I planned.

Not just a vague roadmap—a _phased implementation plan_ with:

- Clear deliverables for each session
- Success criteria that didn't involve subjective "looks good"
- Rollback strategies if things went wrong
- Time estimates (that I consistently beat, which was satisfying)

This approach came from a successful project I'd done before: forking a multiplayer typing game into a single-player version. That project taught me that **conservative planning enables aggressive execution**.

Each phase had a specific goal:

- Phase 1: Static rendering (just display code, nothing interactive)
- Phase 2: Typing mechanics (can you type through a snippet?)
- Phase 3: Auto-jump behavior (spaces/punctuation disappear)
- Phase 4: Multi-line handling (move between lines smoothly)
- Phase 5: Configuration system (let users customize difficulty)

The rule was simple: _Don't start Phase N+1 until Phase N is proven to work_.

## The Learning Curve: TypeScript Without the Tutorial Hell

I'd watched TypeScript tutorials. I understood the concepts intellectually. But I'd never written TypeScript in anger—never had to make types work in a real codebase.

My approach was unconventional: I built the entire app in vanilla JavaScript first, then _migrated_ it to TypeScript. This gave me two crucial advantages:

1. **Working reference implementation**: When TypeScript confused me, I could look at "what it used to do" in JavaScript
2. **Incremental learning**: Each TypeScript concept was learned in context, not in isolation

The migration itself became a learning curriculum:

- Phase 1: Setup infrastructure (TypeScript + Vite)
- Phase 2: Create type definitions (document your data structures)
- Phase 3: Extract pure functions (timer calculations, config logic)
- Phase 4: Migrate main application (class-based architecture)

Claude was instrumental here. Not because it wrote the code—though it did—but because it _explained the decisions_. Why `strict: true` in tsconfig? Why classes instead of functions? Why this import pattern?

Every conversation was a mini code review where I learned not just _what_ to type, but _why_ it mattered.

## The Bugs: A 5-Session Debugging Saga

Let me tell you about the bug that almost broke me.

In TSX (React) files, users had to manually press spacebar inside JSX tags. `<p>Loading item...</p>` required typing the space between "Loading" and "item". In Python, JavaScript, and TypeScript? Spaces auto-jumped. Perfect behavior.

This bug took **five sessions** to fix. Here's why:

**Session 33**: "It's probably the TypeScript config" → Built a test suite (with wrong assumptions)  
**Session 34**: "Let me fix the config" → Discovered the dev server was misconfigured  
**Session 35**: "What's _actually_ happening?" → Found tokens with empty categories  
**Session 36**: "What were the original design rules?" → Archaeological document review  
**Session 37**: "Just two lines of Python" → Fixed it in the parser

The bug wasn't in the frontend at all. It was in the Python parser that generated the JSON. The `jsx_text` token type wasn't being assigned a category, so the filtering logic didn't know to exclude it in certain modes.

Two lines of code. Five sessions to find them.

## The Methodology: How to Build What You Don't Understand

My workflow became surprisingly consistent:

### 1. Document First, Then Code

Every major decision got written down. Not in comments—in actual markdown documents:

- `CONTEXT.md`: Why this project exists, what it isn't trying to do
- `ARCHITECTURE.md`: How the system works, why it's designed this way
- `REQUIREMENTS.md`: What the system _must_ do (the formal spec)

When that 5-session bug hunt happened, I realized we'd been debugging _assumptions_, not code. We hadn't written down what the system should do, so we kept guessing.

After Session 38, I stopped coding and spent a full session just writing documentation. It felt like slowing down, but it was actually the fastest way forward.

### 2. Test the Assumptions, Not the Code

I'm a pytest person in Python. Vitest (the JavaScript equivalent) felt alien at first. But the principle was the same: **write tests that encode requirements**.

When I finally wrote the tests (Session 39), they were based on the written requirements from Session 38. This meant:

- Tests that would have caught the 5-session bug immediately
- Tests that served as documentation for future me
- Tests that enabled fearless refactoring

38 tests. All passing. 18 milliseconds to run. That's the kind of safety net that lets you move fast.

### 3. Pair Programming with an AI

Claude wasn't just a code generator. It was a:

- **Knowledge base**: "Why does TypeScript need this syntax?"
- **Code reviewer**: "This will work, but here's why this other approach is better"
- **Rubber duck**: "Explain what you're trying to do, let's reason through it"
- **Historian**: "Look at Session 17 where you decided the token categories"

The trick was learning _how_ to ask. Vague questions got vague answers. Specific questions with context got gold:

❌ "How do I handle JSX in TypeScript?"  
✅ "I have a token with type `jsx_text` and empty categories. My config excludes `string_content` in minimal mode. Should I categorize `jsx_text` as `string_content` in the parser, or add special handling in the config?"

The second question gets an architectural discussion. The first gets a tutorial.

## The Architecture: Simplicity Through TypeScript

The final application has a beautifully simple architecture, largely _because_ I migrated from JavaScript:

```
TreeTypeApp (orchestrator)
    ↓
    ├── CodeRenderer (handles DOM, syntax highlighting)
    ├── KeyboardHandler (validates input, calls callbacks)
    ├── Timer Functions (pure functions for WPM/accuracy)
    ├── Config System (preset management, token filtering)
    └── Storage (localStorage wrapper)
```

Each component has _one_ job. Each component is _testable_. Each component has _clear types_.

Before TypeScript:

- 1,000+ lines of inline JavaScript in HTML
- Global state scattered everywhere
- No clear boundaries between responsibilities

After TypeScript:

- 6 lines of imports in HTML
- ~1,180 lines of modular, typed code
- Clear separation of concerns

The TypeScript migration didn't just add types—it forced me to _think about structure_. You can't write spaghetti code when the type system demands clarity.

## The Payoff: What Production-Ready Actually Means

After 40 sessions (roughly 80-100 hours of work), TreeType is:

- **Type-safe**: 100% TypeScript coverage, strict mode enabled
- **Tested**: 38 tests, all passing, comprehensive coverage
- **Documented**: Three major docs explaining why, how, and what
- **Fast**: 5.57 KB gzipped bundle, 18ms test execution
- **Deployed**: Auto-deployed to GitHub Pages via CI/CD
- **Maintainable**: Clear architecture, can add features confidently

But here's what surprised me: **the learning was the product**.

I didn't just build an app. I built:

- Confidence in TypeScript for future projects
- Understanding of modern frontend tooling (Vite, Vitest)
- Appreciation for type-driven development
- Experience with class-based architecture
- Skills in systematic debugging

## Lessons Learned: What I'd Tell Past Me

### 1. Your Ignorance is an Asset

I didn't know TypeScript conventions, so I learned them _in context_. I didn't know React patterns, so I built what made sense. Sometimes not knowing the "proper" way lets you find a better way.

### 2. Plan in Phases, Not Features

Don't plan "build the typing game." Plan "Phase 1: prove you can render code statically." Each phase should be shippable—even if you never ship it.

### 3. Document Decisions, Not Just Code

When that bug took 5 sessions, it wasn't because the code was complex. It was because the _requirements were unwritten_. Once we documented them, the fix took 20 minutes.

### 4. Test Requirements, Not Implementation

Tests based on "this is how the code works" break when you refactor. Tests based on "this is what the system must do" catch bugs regardless of implementation.

### 5. Pair Programming with AI is Real Work

Explaining my thinking to Claude made me think more clearly. Debugging with Claude made me better at debugging. Learning from Claude made me better at learning.

It's not cheating. It's leveraging a tool—like using a framework, or a library, or Stack Overflow. The difference is the tool can explain _why_, not just _what_.

## The Meta-Lesson: Building in Public (With Yourself)

Every session ended with a markdown summary. Not for an audience—for future me. When I hit that 5-session bug, I could review:

- What did I try?
- What did I learn?
- What assumptions did I make?

This discipline of "session summaries" became my external memory. When Session 35 said "look at Session 17," I could—because Session 17 was documented.

This is the habit I'm keeping: **treat every project like someone else will need to understand it**. That someone is usually future me, confused about why I made a decision.

## What's Next?

TreeType is "done" in the sense that it works perfectly for its intended purpose. But software is never finished. Future phases might include:

- **Community snippets**: Let users share their favorite code patterns
- **Analytics dashboard**: Track progress over time, identify weak spots
- **Multi-language support**: Expand beyond the current 4 languages
- **Mobile optimization**: Make it work on tablets/phones

But honestly? The real "next" is applying these lessons to the next project. Because I know how to:

- Plan in phases
- Document decisions
- Test requirements
- Debug systematically
- Learn incrementally

And I know how to do it in TypeScript now. Not despite being a Python developer, but because I approached it like a Python developer: methodically, with clear goals, and a healthy respect for things I don't understand.

## The Bottom Line

Can a Python developer build a production-ready TypeScript application in a stack they barely know? Yes, with:

- **A solid plan** (phased implementation)
- **Good documentation** (requirements, architecture, context)
- **Systematic testing** (requirements-driven, not code-driven)
- **Patient debugging** (archaeology beats guesswork)
- **AI pair programming** (Claude as teacher, not just code generator)

The app took 40 sessions. The learning will last a career.

And if you're a backend developer wondering if you can build frontend apps—yes. You absolutely can. Just start with Phase 1, document your decisions, and don't skip the tests.

The rest is just typing.

---

_TreeType is open source and deployed at [akbargherbal.github.io/treetype](https://akbargherbal.github.io/treetype). The full session history, migration plan, and architecture docs are in the repository. If you're learning TypeScript or building with AI, I hope my stumbles save you some sessions._
