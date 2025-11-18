# From Python to Production: Building TreeType with Claude - A Developer's Journey into the Unknown

## The Audacity of Ignorance (Or: How I Built a TypeScript App Without Knowing TypeScript)

I'm a Python developer. Six years of Django, Flask, and Pandas have made me comfortable in the backend world. JavaScript? That thing I copy-paste from Stack Overflow when I absolutely must. TypeScript? Never touched it in production.

So naturally, I decided to build a sophisticated web application using TypeScript and modern frontend architecture.

This is the story of how I did it—not despite my ignorance, but perhaps because of it. With Claude as my pair programmer, a methodical approach to learning, and an unhealthy amount of documentation, I turned an experimental idea into a production-ready application.

## The Spark: When Curiosity Meets Frustration

It started with `tree-sitter`, a parsing library I'd been exploring for fun. The initial `CONTEXT.md` was clear: this was an **exploratory, learning-focused project**. The goal wasn't to build a parser—it was to understand how code could be broken down, categorized, and reconstructed.

My first sessions with Claude were archaeological work—peeling back layers of abstraction.

- How does tree-sitter represent code?
- Can we extract tokens with position metadata?
- Can we reconstruct the original source to validate our understanding?

Then came the pivot. Why not turn this analysis into something _useful_? A typing practice app for code—not prose, but actual Python, JavaScript, and TypeScript. Let users build muscle memory for programming syntax, not just words.

## The Philosophy: Plan First, Code Later

Here's where my backend experience proved invaluable. I've seen too many projects fail because they "just started coding." So I did something that felt unnatural for a learning project: I planned.

The `phased_plan.md` wasn't a vague roadmap; it was a contract with myself:

- **Phase 1**: Static rendering (Just display code).
- **Phase 2**: Typing mechanics (Can you type through a snippet?).
- **Phase 3**: Auto-jump behavior (Does skipping spaces feel good?).
- **Phase 4**: Multi-line handling (Move between lines smoothly).
- **Phase 5**: Configuration system (Let users customize difficulty).

The rule was simple: **Don't start Phase N+1 until Phase N is proven to work.** This conservative planning enabled aggressive execution.

## The Learning Curve: TypeScript Without the Tutorial Hell

I'd watched TypeScript tutorials. I understood the concepts intellectually. But I'd never written TypeScript in anger.

My approach was unconventional: I built the entire app in vanilla JavaScript first, then _migrated_ it to TypeScript, following a detailed `ts_migration_plan.md`. This gave me two crucial advantages:

1.  **A working reference implementation**: When TypeScript confused me, I could look at "what it used to do" in JavaScript.
2.  **Incremental learning**: Each TypeScript concept was learned in context, not in isolation.

The migration itself became a curriculum:

- **Phase 1**: Setup infrastructure (TypeScript + Vite).
- **Phase 2**: Create type definitions (document your data structures).
- **Phase 3**: Extract pure functions (timer calculations, config logic).
- **Phase 4**: Migrate the main application logic.

Claude was instrumental here. Not because it wrote the code—though it did—but because it _explained the decisions_. Why `strict: true` in `tsconfig.json`? Why classes instead of functions? Why this import pattern? Every conversation was a mini code review where I learned not just _what_ to type, but _why_ it mattered.

## The Bugs: A 5-Session Debugging Saga

Let me tell you about the bug that almost broke me.

In TSX (React) files, users had to manually press the spacebar inside JSX tags. `<p>Loading item...</p>` required typing the space between "Loading" and "item". In every other language, spaces were skipped automatically.

This bug took **five sessions** to fix. Here's why:

- **Session 33**: "It's probably the TypeScript config." → Built a test suite with wrong assumptions.
- **Session 34**: "Let me fix the config." → Discovered the dev server was misconfigured.
- **Session 35**: "What's _actually_ happening?" → Found tokens with empty categories.
- **Session 36**: "What were the original design rules?" → Archaeological document review.
- **Session 37**: "Just two lines of Python." → Fixed it in the parser.

The bug wasn't in the frontend at all. It was in the Python parser that generated the JSON. The `jsx_text` token type wasn't being assigned a category, so the filtering logic didn't know to exclude it.

Two lines of code. Five sessions to find them.

## The Methodology: How to Build What You Don't Understand

My workflow became surprisingly consistent:

### 1. Document First, Then Code

Every major decision got written down. Not in comments—in actual markdown documents: `CONTEXT.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`. When that 5-session bug hunt happened, I realized we'd been debugging _assumptions_, not code. After Session 38, I stopped coding and spent a full session just writing documentation. It felt like slowing down, but it was actually the fastest way forward.

### 2. Test the Assumptions, Not the Code

I'm a `pytest` person in Python. `Vitest` felt alien at first. But the principle was the same: **write tests that encode requirements**. When I finally wrote the tests in Session 39, they were based on the written requirements from Session 38. This gave me a safety net that let me move fast and fearlessly.

### 3. Pair Programming with an AI

Claude wasn't just a code generator. It was a:

- **Knowledge base**: "Why does TypeScript need this syntax?"
- **Code reviewer**: "This will work, but here's why this other approach is better."
- **Rubber duck**: "Explain what you're trying to do; let's reason through it."
- **Historian**: "Look at Session 17 where you decided the token categories."

The trick was learning _how_ to ask. Vague questions got vague answers. Specific questions with context got gold.

## The Payoff: What Production-Ready Actually Means

After 41 sessions, TreeType is:

- **Type-safe**: 100% TypeScript coverage, strict mode enabled.
- **Tested**: 38 tests, all passing, comprehensive coverage.
- **Documented**: Three major docs explaining why, how, and what.
- **Fast**: A tiny gzipped bundle, 18ms test execution.
- **Deployed**: Live on GitHub Pages, with a battle-tested deployment script.
- **Maintainable**: Clear architecture, ready for new features.

But here's what surprised me: **the learning was the product**. I didn't just build an app. I built confidence in TypeScript, an understanding of modern frontend tooling, and a systematic approach to debugging and development that I'll carry into every project from now on.

## Lessons Learned: What I'd Tell Past Me

1.  **Your Ignorance is an Asset**. I didn't know TypeScript conventions, so I learned them _in context_. Not knowing the "proper" way lets you find a better way.
2.  **Plan in Phases, Not Features**. Don't plan "build the typing game." Plan "Phase 1: prove you can render code statically." Each phase should be shippable.
3.  **Document Decisions, Not Just Code**. When that bug took 5 sessions, it was because the _requirements were unwritten_. Once we documented them, the fix took 20 minutes.
4.  **Pair Programming with AI is Real Work**. Explaining my thinking to Claude made me think more clearly. It's not cheating; it's leveraging a tool that can explain _why_, not just _what_.

## The Bottom Line

Can a Python developer build a production-ready TypeScript application in a stack they barely know? Yes, with:

- **A solid plan** (phased implementation)
- **Good documentation** (requirements, architecture, context)
- **Systematic testing** (requirements-driven, not code-driven)
- **Patient debugging** (archaeology beats guesswork)
- **AI pair programming** (Claude as teacher, not just code generator)

The app took 41 sessions. The learning will last a career. And if you're a backend developer wondering if you can build frontend apps—yes. You absolutely can. Just start with Phase 1, document your decisions, and don't skip the tests.

The rest is just typing.

---

_TreeType is open source and deployed at [akbargherbal.github.io/treetype](https://akbargherbal.github.io/treetype). The full session history, migration plan, and architecture docs are in the repository. If you're learning TypeScript or building with AI, I hope my stumbles save you some sessions._
