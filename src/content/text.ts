export const WASON_INSTRUCTIONS =
  'You will be given three numbers which conform to a simple rule that I have in mind. ' +
  'This rule is concerned with a relation between any three numbers and not with their absolute magnitude… ' +
  'When you feel highly confident that you have discovered it, and not before, you are to write it down.'

export const TRUE_RULE = 'Any three numbers in increasing order.'

/** First announcements in Wason (1960), Table I (n = 29). */
export const WASON_FIRST = { correct: 6, incorrect: 22, none: 1, n: 29 }

/** Mean number of triples tested before the first announcement, Wason (1960). */
export const WASON_PROBES = { correct: 8.0, incorrect: 3.68 }

export interface Reference {
  cite: string
  title: string
  url: string
  note: string
}

export const REFERENCES: Reference[] = [
  {
    cite: 'Wason, P. C. (1960). Quarterly Journal of Experimental Psychology, 12(3), 129–140.',
    title: 'On the failure to eliminate hypotheses in a conceptual task',
    url: 'https://doi.org/10.1080/17470216008416717',
    note: 'The original experiment. Twenty-nine undergraduates, a record sheet, and a rule almost nobody guessed first time.',
  },
  {
    cite: 'Klayman, J. & Ha, Y.-W. (1987). Psychological Review, 94(2), 211–228.',
    title: 'Confirmation, disconfirmation, and information in hypothesis testing',
    url: 'https://doi.org/10.1037/0033-295X.94.2.211',
    note: 'Testing cases you expect to fit is usually a fine strategy. It breaks down when your rule sits inside the real one, which is exactly what happens here.',
  },
  {
    cite: 'Tweney, R. D. et al. (1980). Quarterly Journal of Experimental Psychology, 32(1), 109–123.',
    title: 'Strategies of rule discovery in an inference task',
    url: 'https://doi.org/10.1080/00335558008248237',
    note: 'The DAX/MED version: asking people to find two complementary rules roughly triples success, to about 60%.',
  },
  {
    cite: 'Gale, M. & Ball, L. J. (2006). Quarterly Journal of Experimental Psychology, 59(5), 873–885.',
    title: 'Dual-goal facilitation in Wason’s 2-4-6 task: What mediates successful rule discovery?',
    url: 'https://doi.org/10.1080/02724980543000051',
    note: 'Replicates the DAX/MED effect and asks why it works.',
  },
  {
    cite: 'Evans, J. St. B. T. (2016). Quarterly Journal of Experimental Psychology, 69(10), 2076–2092.',
    title: 'Reasoning, biases and dual processes: The lasting impact of Wason (1960)',
    url: 'https://doi.org/10.1080/17470218.2014.914547',
    note: 'A retrospective on how this short paper shaped the psychology of reasoning.',
  },
  {
    cite: 'Yudkowsky, E. (2007). LessWrong.',
    title: 'Positive Bias: Look Into the Dark',
    url: 'https://www.lesswrong.com/posts/rmAbiEKQDpDnZzcRf/positive-bias-look-into-the-dark',
    note: 'The essay that inspired MBlume’s C++ version of this game, which this page is based on.',
  },
  {
    cite: 'Veritasium (2014). YouTube.',
    title: 'The Most Common Cognitive Bias',
    url: 'https://www.youtube.com/watch?v=vKA4w2O61Xo',
    note: 'Derek Muller plays the game with people on the street.',
  },
]
