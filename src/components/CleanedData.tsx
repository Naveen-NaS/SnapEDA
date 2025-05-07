'use client';

import { useEffect, useState } from 'react';

const CleanedPage = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [isCleaned, setIsCleaned] = useState(false);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('cleaned-data.csv');

  const handleCleanData = async () => {
    setIsCleaning(true);
    setPreviewData(null);
    setDownloadUrl(null);

    try {
      const response = await fetch('https://snapeda-server.onrender.com/clean-data', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Data cleaning failed');

      const downloadResponse = await fetch('https://snapeda-server.onrender.com/download');
      if (!downloadResponse.ok) throw new Error('Download failed after cleaning');

      const blob = await downloadResponse.blob();
      const contentDisposition = downloadResponse.headers.get('Content-Disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) setFilename(match[1]);
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const text = await blob.text();
      const rows = text.split('\n').map(row => row.split(',').slice(0, 5));
      setPreviewData(rows.slice(0, 10));
      setIsCleaned(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    handleCleanData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center mb-6">✨ Cleaned & Preprocessed Data</h1>

        {/* <div className="flex justify-center mb-6">
          <button
            onClick={handleCleanData}
            disabled={isCleaning}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-300 ${
              isCleaning
                ? 'bg-blue-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isCleaning ? 'Cleaning...' : 'Re-clean Data'}
          </button>
        </div> */}

        {isCleaned && previewData && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">📋 Preview of Cleaned Data</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <tbody className="divide-y divide-gray-100">
                  {previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-100">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300"
              >
                ⬇ Download CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanedPage;
