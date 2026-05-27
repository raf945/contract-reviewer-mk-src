import { TopBar } from '@/components/ui/topBar'
import { Button } from '@/components/ui/button'
import { useState} from 'react';
import { pdfjs } from 'react-pdf';
import { MainPage } from '@/components/MainPage'
import { PageControls } from '@/components/PageControls'
import type { HighlightResult } from '@/components/utils/highlight';
import { Loader2 } from 'lucide-react';

type GPTAlert = {
  segmentIndex: number;
  text: string;
}

// Load worker for pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function Dashboard(){

  // State that sets the current page and page number
  const [numPages, setNumPages] = useState<number>();
  const [pagesNumber, setPagesNumber] = useState<number>(1);

  // Sets the file for the button and contract
  const [pdfFile, setFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<string | null>(null);

  // Show page number and buttons when pdf loads
  const [showPage, setShowPage] = useState<boolean>(false)

  // State that holds the azure text, and GPT predictions
  const [segmentArray, setSegmentArray] = useState<Array<string>>([]);
  const [predictionArray, setPredictionArray] = useState<Array<string>>([])

  const [highlightCounts, setHighlightCounts] = useState<HighlightResult['matched'] | null>(null);

  // State that holds GPT explaination
  const [explanationObject, setExplanationObject] = useState<GPTAlert[] | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dontShowButton, setDontShowButton] = useState(false);
  const [showLegend, setShowLegend] = useState(false);


  // When page loads, set current page number to 1
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setDontShowButton(true)
    setIsUploading(false); 
    setShowLegend(true)
  }



  // Handle upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fetch the bucket item
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
    setDontShowButton(false)
  };
  

  const handleUpload = async () => {
    if (pdfFile) {
      setIsUploading(true)

      // Clear previous contract state
      setExplanationObject(null);
      setSegmentArray([]);
      setPredictionArray([]);
      setHighlightCounts(null);
      setPagesNumber(1); 

      const formData = new FormData();
      formData.append('file', pdfFile)
      
      try {
        // Connect fetch api to bucket
        const result = await fetch('http://127.0.0.1:8000/api/files/upload_pdf', {
          method: 'POST',
          body: formData,
        });

        const data = await result.json();
        setContractFile(data.url)
        setShowPage(true);
        setShowLegend(false)

        console.log(data)
      } catch (error) {
        console.error(error)
        setIsUploading(false);
      }

    };
  };

  return(
    <div>
      <TopBar showPage={ showPage } 
        pageControls={<PageControls 
        pagesNumber={pagesNumber} 
        numPages={numPages} 
        setPagesNumber={setPagesNumber}
        contractLink={contractFile}
        setSegmentArray={setSegmentArray}
        setGPTResponse={setExplanationObject}
        setPrediction={setPredictionArray}
      />}>
      </TopBar>
        <div className="flex items-center w-full p-4 pl-40">
          <div className="flex flex-1 items-center gap-2">
          <input 
            id="pdfFile" 
            type="file" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf"
          />
          <Button onClick={() => document.getElementById('pdfFile')?.click()}>
            Select PDF
          </Button>
          
           {pdfFile && !dontShowButton && (
          <Button disabled={isUploading} onClick={handleUpload}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : `Upload ${pdfFile.name}`}
            </Button>
          )}
      </div>
      </div>
      <div >
        {showPage && contractFile && (<MainPage
          file={contractFile} 
          onLoadSuccess={onDocumentLoadSuccess}
          pagesNumber={pagesNumber}
          showPage={showPage}
          highlightCounts={highlightCounts}
          explanation={explanationObject}
          segments={segmentArray}
          predictions={predictionArray}
          showLegend={showLegend}
          />)}
        </div>
    </div>
  );
}

export default Dashboard