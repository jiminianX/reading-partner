// Configure PDF.js
if (typeof window !== 'undefined' && window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export const extractPDFText = async (file, setProgressText) => {
    setProgressText?.('Extracting text from PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        setProgressText?.(`Processing page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText;
};

export const extractImageText = async (file, setProgressText) => {
    setProgressText?.('Extracting text from image...');

    const result = await window.Tesseract.recognize(file, 'eng', {
        logger: m => {
            if (m.status === 'recognizing text') {
                setProgressText?.(`Extracting text: ${Math.round(m.progress * 100)}%`);
            }
        }
    });

    return result.data.text;
};
