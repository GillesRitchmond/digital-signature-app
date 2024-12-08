import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Link2,
  Pencil,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  documentUrl?: string;
  userName?: string;
}

export default function PDFViewer(props: PDFViewerProps){
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  function onDocumentLoadSuccess(pdf: any) {
    setNumPages(pdf.numPages);
  }

  // Ref pour le conteneur
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (containerRef.current) {
      // Mesure la largeur actuelle du conteneur
      setContainerWidth(containerRef.current.clientWidth);
    }
    // Si la taille du conteneur peut changer, ajouter un event listener sur le resize de la fenêtre.
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col rounded-lg bg-white shadow-sm">
      {/* Document Display Area */}
      <div
        ref={containerRef}
        className="relative bg-white h-[500px] overflow-auto flex justify-center items-start"
      >
        <Document
          file={props.documentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p>Chargement du PDF...</p>}
          noData={<p>Aucun PDF fourni</p>}
          className="inline-block bg-white absolute top-0 left-0 w-full"
          renderMode="canvas"
        >
          {containerWidth > 0 && (
            <Page
              pageNumber={currentPage}
              renderMode="canvas"
              className="outline-none"
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={containerWidth - 20}
              scale={zoom / 100}
            />
          )}
        </Document>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between gap-4 p-2 bg-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Zoom arrière"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            title="Zoom avant"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Page précédente"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            Page {currentPage} {numPages ? ` / ${numPages}` : ""}
          </span>
          <Button
            variant="ghost"
            size="icon"
            title="Page suivante"
            onClick={() =>
              setCurrentPage((prev) =>
                numPages && prev < numPages ? prev + 1 : prev
              )
            }
            disabled={!numPages || currentPage >= (numPages || 0)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
