import { Button } from '@/components/ui/button'
import { applyHighlights,type HighlightResult, } from '@/components/utils/highlight';
import { Loader2 } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL;


type GPTAlert = {
  segmentIndex: number;
  text: string
}

interface Props {
  contractLink: string | null;
  pagesNumber: number;
  setSegmentArray: React.Dispatch<React.SetStateAction<Array<string>>>;
  isAnalysing: boolean
  setIsAnalysing: React.Dispatch<React.SetStateAction<boolean>>;
  setHighlightCounts?: React.Dispatch<React.SetStateAction<HighlightResult['matched'] | null>>;
  setGPTResponse?: React.Dispatch<React.SetStateAction<GPTAlert[] | null>>;
  setPrediction: React.Dispatch<React.SetStateAction<string[]>>;
}

type ApiResponse = {
      Response: {
        segment: Record<string, string>;
        label: Record<string, string>;
      };
      explaination: {
        explain: Record<string, string>;
      }
    };



function valuesInIndexOrder(obj: Record<string, string>): string[] {
  return Object.entries(obj)
    .sort(([key], [value]) => Number(key) - Number(value))
    .map(([, value]) => value);
}

function explanationsToAlerts(obj: Record<string, string>): GPTAlert[] {
  return Object.entries(obj)
    .sort(([key], [value]) => Number(key) - Number(value))
    .map(([index, text]) => ({
      segmentIndex: Number(index),
      text,
    }));
}


const handleClick = async (
  fileLink: string | null, 
  pagesNumber: number, 
  setSegmentArray: React.Dispatch<React.SetStateAction<Array<string>>>,
  setIsAnalysing: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightCounts?: Props['setHighlightCounts'],
  setGPTResponse?: React.Dispatch<React.SetStateAction<GPTAlert[] | null>>,
  setPrediction?: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
  
  setIsAnalysing(true)

  try {
    const response = await fetch(`${API_BASE}/files/upload_pdf`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        fileName: fileLink,
        pageNumber: pagesNumber
      })
    });
    if (!response.ok) {
      throw new Error(`Response statis: ${response.status}`)
    }


    const result = await response.json();
    const clasificationResponse = result as ApiResponse;
    const segments = valuesInIndexOrder(clasificationResponse.Response.segment);
    const prediction = valuesInIndexOrder(clasificationResponse.Response.label);

    const explanations = explanationsToAlerts(clasificationResponse.explaination.explain);

    setSegmentArray(segments)
    const { matched, missed } = applyHighlights(segments, prediction);
    setHighlightCounts?.(matched);
    setGPTResponse?.(explanations)
    setPrediction?.(prediction)
    setIsAnalysing(false)

    if (missed.length) console.warn('Missed segments:', missed);
  } catch (error) {
    console.log(error);
  }
};
// Make analyse Button greyed out and put an icon to show the user that its loading
export const AnalyseButton = ({contractLink, pagesNumber, setSegmentArray, isAnalysing, setIsAnalysing, setHighlightCounts, setGPTResponse, setPrediction}: Props) => {


  return (
  <>
    <Button 
    disabled={isAnalysing}
    variant="outline" 
    onClick={() =>
     handleClick(
      contractLink, 
      pagesNumber, 
      setSegmentArray,
      setIsAnalysing, 
      setHighlightCounts, 
      setGPTResponse, 
      setPrediction
      )}>
        {isAnalysing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isAnalysing ? 'Analysing PDF..' : `Analyse`}
        </Button>
  </>
  )
}