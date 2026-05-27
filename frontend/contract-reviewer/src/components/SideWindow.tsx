import { Response } from '@/components/GPTResponse'
import type { HighlightResult } from '@/components/utils/highlight'

interface Props {
  explanation: GPTAlert[] | null;
  highlightSpans: HighlightResult['spans'] | null
}

type GPTAlert = {
  segmentIndex: number;
  text: string;
}


export function SideWindow({explanation, highlightSpans}: Props) {

  console.log(explanation)

  return (
    <>
      {explanation && <Response GPTResponse={explanation} highlightSpans={highlightSpans} />}
    </>
  )
}