import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import type { HighlightResult } from '@/components/utils/highlight'
import XarrowModule, { useXarrow } from 'react-xarrows'
import { useLayoutEffect } from 'react'

const Xarrow = (XarrowModule as any).default ?? XarrowModule;

type GPTAlert = {
  segmentIndex: number;
  text: string;
}

interface Props {
  GPTResponse: GPTAlert[] | null;
  highlightSpans: HighlightResult['spans'] | null
}

export function Response({GPTResponse, highlightSpans}: Props) {
  console.log("Xarrow is:", Xarrow);
  const updateXarrow = useXarrow();

  // Run before visual is shown
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      updateXarrow();
    });
  }, [GPTResponse, highlightSpans, updateXarrow]);


  // If no GPT response then dont do anything
  if (!GPTResponse || GPTResponse.length === 0) return null;

  // Match response with highlights
  const matchedResponses = GPTResponse.filter(response =>
  highlightSpans?.some(highlight => highlight.segmentIndex === response.segmentIndex)
  );

  if (matchedResponses.length === 0) return null;

  return (
    <>
    <div className="space-y-6">
      {matchedResponses.map((response) => (
        <div key={response.segmentIndex} id={`response-segment-${response.segmentIndex}`} >

        <Alert className="py-0.5">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-foreground">
                {response.text}
              </AlertDescription>
            </Alert>
          </div>
      ))}
    </div>

      {matchedResponses.map((response) => {
          const highlight = highlightSpans?.find(
            (highlight) => highlight.segmentIndex === response.segmentIndex
          );

          if (!highlight) return null;

          return (
            <Xarrow
              key={`arrow-${response.segmentIndex}`}
              start={highlight.id}
              end={`response-segment-${response.segmentIndex}`}
              startAnchor="right"
              endAnchor="left"
              path='straight'
              strokeWidth={2}
              showHead={false}
              color='#e86209'
            />
          );
        })}
      </>
    );
  }