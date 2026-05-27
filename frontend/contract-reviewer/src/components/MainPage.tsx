import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Document, Page } from 'react-pdf';
import { HighlightLegend } from '@/components/HighlightLegend';
import type { HighlightResult } from '@/components/utils/highlight';
import { applyHighlights } from '@/components/utils/highlight'
import { SideWindow } from '@/components/SideWindow'
import { useState, useEffect } from 'react'
import XarrowModule from 'react-xarrows'

const Xwrapper = (XarrowModule as any).Xwrapper;


type GPTAlert = {
  segmentIndex: number;
  text: string;
}

interface MainPageProps {
  file: string | null;
  onLoadSuccess: (doc: { numPages: number }) => void;
  pagesNumber: number;
  showPage: boolean;
  highlightCounts: HighlightResult['matched'] | null;
  explanation: GPTAlert[] | null;
  segments: string[] ;
  predictions: string[];
  showLegend: boolean;

}

export function MainPage({ file, onLoadSuccess, pagesNumber, showPage, highlightCounts, explanation, segments, predictions, showLegend }: MainPageProps) {

  //const [ spanBoundingClient, setSpanBoundingClient ] = useState<Array<DOMRect> | null>(null)
  const [highlightSpans, setHighlightSpans] = useState<HighlightResult['spans'] | null>(null);

  const [ pageReady, setPageReady ] = useState(false)


  // this runs whenever segments or predictions change (i.e. after analyse is clicked)
  function handleRenderSuccess() {
    setPageReady(true)
  }

    useEffect(() => {
      if (!segments.length || !predictions.length) {
        //setSpanBoundingClient(null);
        setHighlightSpans(null);
        return;
      }
      if (!pageReady) return;
      

      const timeoutId = setTimeout(() => {
        const result = applyHighlights(segments, predictions);

        const rects = result.spans.map(({ span }) =>
          span.getBoundingClientRect()
        );

        //setSpanBoundingClient(rects);
        setHighlightSpans(result.spans);

        console.log("highlight spans:", result.spans);
        console.log("highlight rects:", rects);
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [segments, predictions, pageReady]);

    return (
      <Xwrapper>
      <main className='grid grid-cols-[1fr_auto_1fr] items-start flex-1 pt-0 pb-4 px-4 bg-muted/20 min-h-[calc(100vh-4rem)]'>
        {/* Legend on the left */}
        {showPage && showLegend && (
          <aside className="flex justify-end pr-8 pt-4">
            <HighlightLegend counts={highlightCounts} />
          </aside>
        )}

          <div className="shadow-2xl border bg-text max-w-full overflow-auto">
            <Document file={file} onLoadSuccess={onLoadSuccess} loading="">
              <Page 
                pageNumber={pagesNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onRenderSuccess={handleRenderSuccess}
                loading=""
              />
            </Document>
          </div>
          {showPage && (
            <aside className='ml-20 mr-20'>
              <SideWindow explanation={explanation} highlightSpans={highlightSpans}/>
            </aside>
          )}
      </main>
      </Xwrapper>
    )
}