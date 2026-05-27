import { Button } from '@/components/ui/button'
import { AnalyseButton } from './Analyse';
import { useState } from 'react'

type GPTAlert = {
  segmentIndex: number;
  text: string;
}

interface Props {
  pagesNumber: number;
  numPages: number | undefined;
  setPagesNumber: React.Dispatch<React.SetStateAction<number>>;
  contractLink: string | null;
  setSegmentArray: React.Dispatch<React.SetStateAction<Array<string>>>
  setGPTResponse: React.Dispatch<React.SetStateAction<GPTAlert[] | null>>;
  setPrediction: React.Dispatch<React.SetStateAction<string []>>;
}

export function PageControls({pagesNumber, numPages, setPagesNumber, contractLink, setSegmentArray, setGPTResponse, setPrediction}: Props) {
  // Set state for analyse button
  const [ isAnalysing, setIsAnalysing ] = useState(false)

  function handlePreviousPage() {
    setPagesNumber(prev => Math.max(prev - 1, 1))
    setGPTResponse(null)
  }

  function handleNextPage() {
    setPagesNumber(prev => Math.min(prev + 1, numPages || 1))
    setGPTResponse(null)
  }


    return (
        <div className="flex items-center gap-4">
            <p className="font-medium">
              Page {pagesNumber} of {numPages || '-'}
            </p>
            <Button 
              variant="outline" 
              //onClick={() => setPagesNumber(prev => Math.max(prev - 1, 1))}
              onClick={handlePreviousPage}
              disabled={pagesNumber <= 1}
            >
              Previous
            </Button>
            <Button 
              //onClick={() => setPagesNumber(prev => Math.min(prev + 1, numPages || 1))}
              onClick={handleNextPage}
              disabled={pagesNumber >= (numPages || 1)}
            >
              Next Page
            </Button>
            <AnalyseButton 
            contractLink={contractLink} 
            pagesNumber={pagesNumber} 
            setSegmentArray={setSegmentArray} 
            setGPTResponse={setGPTResponse} 
            setPrediction={setPrediction}
            setIsAnalysing={setIsAnalysing}
            isAnalysing={isAnalysing}
            
            />

          </div>
    )
  }