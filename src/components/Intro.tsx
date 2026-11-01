import { WASON_INSTRUCTIONS } from '../content/text'
import { Triple, Verdict } from './Triple'

export default function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="card prose">
      <p className="lede">
        I’m thinking of a rule that sorts sequences of three numbers into <em>awesome</em> ones and not-so-awesome ones.
        Here is one I can tell you about for free:
      </p>
      <p className="center"><Triple triple={[2, 4, 6]} /> <Verdict awesome /></p>
      <p>
        Your job is to work out the rule. Type in any three whole numbers and I’ll tell you whether they’re awesome.
        Test as many as you like; there is no time limit. Next to each one you can note <em>why</em> you picked it,
        just like on the record sheet in the original experiment.
      </p>
      <p>
        When you’re sure, press <strong>I know the rule</strong>, write it down, and I’ll check it by asking you about a few
        triples I pick.
      </p>
      <blockquote>
        <p>“{WASON_INSTRUCTIONS}”</p>
        <cite>Peter Wason’s instructions to his subjects, 1960</cite>
      </blockquote>
      <p className="center">
        <button className="primary" onClick={onStart}>Start experimenting</button>
      </p>
    </section>
  )
}
