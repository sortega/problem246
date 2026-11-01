# 2-4-6

An interactive version of Peter Wason's 1960 rule-discovery experiment, live at
<https://sortega.github.io/problem246/>.

You get the triple **2, 4, 6** and are told it follows a rule. You test triples of your own until you're sure you
know the rule, write it down, and answer a short quiz. Most people settle on a rule that is too specific, because
they only test triples they expect to pass.

## What's different from the classic version

The quiz isn't fixed. The app keeps a family of plausible rules (`src/engine/hypotheses.ts`), many of them taken
from the wrong answers Wason's subjects gave. It then:

1. removes every rule your own tests have already contradicted,
2. weights the rest by how well they explain the triples you *chose* to test. People tend to test cases they expect
   to fit (Klayman & Ha, 1987), so narrow rules that fit all your tests get the most weight,
3. greedily picks quiz triples that separate the likeliest of those rules from the real one, and
4. after the quiz, reports which rule your answers match and shows the triple that would have proved it wrong.

If you get it wrong, you're told how many answers were wrong (not which ones) and can keep experimenting, as in
Wason's original procedure.

## Development

```sh
npm install
npm run dev      # http://localhost:5173/problem246/
npm test         # engine unit tests
npm run lint
npm run build
```

Pushing to `master` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Credits

- P. C. Wason (1960), *On the failure to eliminate hypotheses in a conceptual task*, QJEP 12(3), 129–140.
- Based on MBlume's C++ program, found on [LessWrong](https://www.lesswrong.com/w/positive-bias).
