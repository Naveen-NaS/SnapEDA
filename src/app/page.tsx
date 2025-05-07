'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import CleanedPage from '@/components/CleanedData';

interface DataType {
  shape: number[];
  head: string[][];
  info: { [key: string]: string };
  duplicates: number;
  cleaned: string[][];
  // New fields for EDA
  summary: { [key: string]: { [key: string]: any } };
  missingValues: { [key: string]: number };
  correlations: number[][];
  corrColumns: string[];
  visualizations: VisualizationType[];
  targetAnalysis: { [key: string]: any };
  outliers: { [key: string]: number[] };
  dataTypes: { [key: string]: string };
  filePath?: string;
}

interface VisualizationType {
  type: string;
  title: string;
  description: string;
  imageData: string;
  column?: string;
  xColumn?: string;
  yColumn?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [data, setData] = useState<DataType | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  const visualizationsRef = useRef<HTMLDivElement>(null);
  const [isShowClean, setIsShowClean] = useState(true);
  const [isCleaned, setIsCleaned] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsText(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
  });

  const handleReupload = () => {
    setFile(null);
    setPreview(null);
    setUploadSuccess(false);
    setData(null);
    setActiveTab('overview');
    setSelectedVisualization(null);
  };

  
  const handleContinueProcessing = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }
  
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await fetch('https://snapeda-server.onrender.com/upload', { method: 'POST', body: formData });

      let data = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Response not in JSON format:', text);
      }

      console.log(data);

      setData(data);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error uploading file:', error); 
    } finally {
      setIsUploading(false);
    }
  };


  const filterVisualizations = (type: string | null = null, column: string | null = null) => {
    if (!data?.visualizations) return [];
    
    return data.visualizations.filter(viz => 
      (type === null || viz.type === type) && 
      (column === null || viz.column === column || viz.xColumn === column || viz.yColumn === column)
    );
  };


  const handleVisualizationClick = (vizId: string) => {
    setSelectedVisualization(selectedVisualization === vizId ? null : vizId);
    
    // Scroll to visualization section if needed
    if (visualizationsRef.current) {
      visualizationsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };



  const handleCleanData = async () => {
      setIsShowClean(false);
      setIsCleaned(true);
  };
  

  const renderTabContent = () => {
    if (!data) return null;
    console.log('Rendering tab content for:', activeTab);
    console.log('Data:', data);

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Shape:</h3>
              <p className="text-gray-600">{data.shape[0]} rows x {data.shape[1]} columns</p>
            </div>
    
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Head:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-md shadow-md">
                  <thead>
                    <tr>
                      {data.head[0].map((header, index) => (
                        <th key={index} className="px-4 py-2 text-left text-gray-700">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.head.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-100">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-gray-600">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
    
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Info:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-md shadow-md">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700">Column Name</th>
                      <th className="px-4 py-2 text-left text-gray-700">Data Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.info).map(([colName, dataType], index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-2 text-gray-600">{colName}</td>
                        <td className="px-4 py-2 text-gray-600">{dataType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
    
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Duplicates:</h3>
              <p className="text-gray-600">{data.duplicates} duplicates found</p>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Statistical Summary:</h3>
            
            {Object.entries(data.summary).map(([colName, stats]) => (
              <div key={colName} className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h4 className="font-bold text-blue-700 text-lg mb-2">{colName}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700">Statistic</th>
                        <th className="px-4 py-2 text-left text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats as Record<string, any>).map(([stat, value], idx) => (
                        <tr key={idx} className="hover:bg-gray-100">
                          <td className="px-4 py-2 text-gray-600">{stat}</td>
                          <td className="px-4 py-2 text-gray-600">
                            {typeof value === 'number' ? value.toFixed(4) : JSON.stringify(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Quick visualizations buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* {filterVisualizations(null, colName).length > 0 && (
                    <button 
                      onClick={() => handleVisualizationClick(colName)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      View Visualizations
                    </button>
                  )} */}
                  
                  {data.outliers[colName]?.length > 0 && (
                    <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                      {data.outliers[colName].length} outliers detected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'visualizations':
        return (
          <div className="space-y-6" ref={visualizationsRef}>
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={() => setSelectedVisualization(null)}
                className={`px-4 py-2 rounded ${selectedVisualization === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                All Visualizations
              </button>
              <button 
                onClick={() => setSelectedVisualization('histograms')}
                className={`px-4 py-2 rounded ${selectedVisualization === 'histograms' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Histograms
              </button>
              <button 
                onClick={() => setSelectedVisualization('boxplots')}
                className={`px-4 py-2 rounded ${selectedVisualization === 'boxplots' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Box Plots
              </button>
              <button 
                onClick={() => setSelectedVisualization('correlations')}
                className={`px-4 py-2 rounded ${selectedVisualization === 'correlations' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Correlations
              </button>
              <button 
                onClick={() => setSelectedVisualization('target')}
                className={`px-4 py-2 rounded ${selectedVisualization === 'target' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Target Analysis
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.visualizations
                .filter(viz => {
                  if (selectedVisualization === null) return true;
                  if (selectedVisualization === 'histograms') 
                    return viz.type === 'histogram' || viz.type === 'distribution';
                  if (selectedVisualization === 'boxplots') 
                    return viz.type === 'boxplot';
                  if (selectedVisualization === 'correlations') 
                    return viz.type === 'heatmap' || viz.type === 'scatterplot';
                  if (selectedVisualization === 'target') 
                    return viz.title.includes('Target') || 
                           (viz.yColumn && viz.yColumn === data.targetAnalysis.column) ||
                           (viz.column && viz.column === data.targetAnalysis.column);
                  return viz.column === selectedVisualization || 
                         viz.xColumn === selectedVisualization || 
                         viz.yColumn === selectedVisualization;
                })
                .map((viz, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="font-bold text-blue-700 text-lg mb-2">{viz.title}</h4>
                    <p className="text-gray-600 mb-3">{viz.description}</p>
                    <div className="flex justify-center">
                      <img src={viz.imageData} alt={viz.title} className="max-w-full" />
                    </div>
                  </div>
                ))}
            </div>
            
            {data.visualizations.filter(viz => {
              if (selectedVisualization === null) return true;
              if (selectedVisualization === 'histograms') 
                return viz.type === 'histogram' || viz.type === 'distribution';
              if (selectedVisualization === 'boxplots') 
                return viz.type === 'boxplot';
              if (selectedVisualization === 'correlations') 
                return viz.type === 'heatmap' || viz.type === 'scatterplot';
              if (selectedVisualization === 'target') 
                return viz.title.includes('Target') || 
                       (viz.yColumn && viz.yColumn === data.targetAnalysis.column) ||
                       (viz.column && viz.column === data.targetAnalysis.column);
              return viz.column === selectedVisualization || 
                     viz.xColumn === selectedVisualization || 
                     viz.yColumn === selectedVisualization;
            }).length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No visualizations found for the selected filter.
              </div>
            )}
          </div>
        );
        
      case 'correlations':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Correlation Analysis:</h3>
            
            {data.correlations && data.correlations.length > 0 ? (
              <>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full bg-white rounded-md shadow-md">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700">Feature</th>
                        {data.corrColumns.map((col, idx) => (
                          <th key={idx} className="px-4 py-2 text-left text-gray-700">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.correlations.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-100">
                          <td className="px-4 py-2 text-gray-700 font-medium">{data.corrColumns[rowIdx]}</td>
                          {row.map((val, colIdx) => (
                            <td 
                              key={colIdx} 
                              className="px-4 py-2"
                              style={{
                                backgroundColor: val > 0 
                                  ? `rgba(0, 0, 255, ${Math.abs(val) * 0.2})` 
                                  : `rgba(255, 0, 0, ${Math.abs(val) * 0.2})`,
                                color: Math.abs(val) > 0.7 ? 'white' : 'black'
                              }}
                            >
                              {val.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h4 className="font-bold text-lg mb-2">Correlation Heatmap</h4>
                  {data.visualizations.find(viz => viz.type === 'heatmap') && (
                    <div className="flex justify-center">
                      <img 
                        src={data.visualizations.find(viz => viz.type === 'heatmap')?.imageData} 
                        alt="Correlation Heatmap" 
                        className="max-w-full" 
                      />
                    </div>
                  )}
                </div>
                
              </>
            ) : (
              <p className="text-gray-600">No correlation data available. This dataset may not have enough numeric columns for correlation analysis.</p>
            )}
          </div>
        );
        
      case 'target':
        const targetColumn = data.targetAnalysis?.column;
        const targetType = data.targetAnalysis?.type;
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Target Analysis: <span className="text-blue-600">{targetColumn}</span>
              </h3>
              <p className="text-gray-600 mb-4">
                Target type: <span className="font-medium">{targetType === 'numeric' ? 'Numeric (Regression)' : 'Categorical (Classification)'}</span>
              </p>
              
              {/* Target visualizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {data.visualizations
                  .filter(viz => 
                    viz.column === targetColumn || 
                    viz.title.includes('Target') ||
                    (viz.yColumn && viz.yColumn === targetColumn)
                  )
                  .map((viz, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-bold text-green-700 text-lg mb-2">{viz.title}</h4>
                      <p className="text-gray-600 mb-3">{viz.description}</p>
                      <div className="flex justify-center">
                        <img src={viz.imageData} alt={viz.title} className="max-w-full" />
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Feature importance/relationship */}
              <div className="mt-8">
                <h4 className="font-bold text-lg mb-4">Feature Relationships with Target</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.visualizations
                    .filter(viz => 
                      viz.type === 'scatterplot' && 
                      (viz.xColumn !== targetColumn && viz.yColumn === targetColumn)
                    )
                    .map((viz, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">{viz.title}</h5>
                        <div className="flex justify-center">
                          <img src={viz.imageData} alt={viz.title} className="max-w-full" />
                        </div>
                      </div>
                    ))}
                    
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'missing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Missing Values Analysis:</h3>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700">Column</th>
                      <th className="px-4 py-2 text-left text-gray-700">Missing Values</th>
                      <th className="px-4 py-2 text-left text-gray-700">Missing Percentage</th>
                      <th className="px-4 py-2 text-left text-gray-700">Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.missingValues)
                      .sort((a, b) => b[1] - a[1]) // Sort by missing percentage (descending)
                      .map(([colName, percentage], idx) => (
                        <tr key={idx} className="hover:bg-gray-100">
                          <td className="px-4 py-2 text-gray-600">{colName}</td>
                          <td className="px-4 py-2 text-gray-600">
                            {Math.round((percentage / 100) * data.shape[0])} / {data.shape[0]}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    percentage > 20 ? 'bg-red-500' : 
                                    percentage > 5 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className={`
                                ${percentage > 20 ? 'text-red-700' : 
                                percentage > 5 ? 'text-yellow-700' : 'text-green-700'}
                              `}>
                                {percentage.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {filterVisualizations(null, colName).length > 0 && (
                              <button 
                                onClick={() => {
                                  setSelectedVisualization(colName);
                                  setActiveTab('visualizations');
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {/* Missing values summary */}
              <div className="mt-6 p-4 bg-gray-50 text-gray-500 rounded-lg">
                <h4 className="font-medium mb-2">Summary:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {Object.values(data.missingValues).filter(v => v > 0).length} out of {Object.keys(data.missingValues).length} columns contain missing values.
                  </li>
                  <li>
                    {Object.entries(data.missingValues).filter(([_, v]) => v > 20).length} columns have more than 20% missing values.
                  </li>
                  <li>
                    Average missing percentage: {
                      (Object.values(data.missingValues).reduce((a, b) => a + b, 0) / Object.keys(data.missingValues).length).toFixed(2)
                    }%
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a tab to view analysis</div>;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Rotating"
            width={128}
            height={128}
            className="animate-spin-slow"
          />  
        </div>

        <h1 className="text-4xl font-extrabold text-blue-500 text-center mb-6">
          Snap<span className='text-green-500'>EDA</span>
        </h1>
        <p className="text-xl text-gray-600 text-center mb-8">
          SnapEDA - Fast and efficient tool for csv analysis and visualization, with Data Pre-Processing and EDA (Exploratory Data Analysis) features.
        </p>

        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-400 hover:border-gray-700'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <p className="text-lg text-gray-500 font-semibold mb-2">File uploaded: {file.name}</p>
              {preview && (
                <div className="bg-white p-4 rounded-md shadow-sm mb-4 max-h-40 overflow-y-auto">
                  <pre className="text-sm text-gray-700">{preview}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col items-center'>
              <Image
                src="/drag&drop.png"
                alt="Drag and Drop"
                width={125}
                height={125}
              />
              <p className="mt-4 text-gray-500">
                {isDragActive ? 'Drop the CSV file here' : 'Drag and drop a CSV file here, or click to select a file'}
              </p>
            </div>
          )}
        </div>

        {file && !uploadSuccess && (
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleReupload}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Re-upload
            </button>
            <button
              onClick={handleContinueProcessing}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Continue Processing'}
            </button>
          </div>
        )}

        {isUploading && (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {uploadSuccess && data && (
          <div className="mt-6 flex flex-col items-center animate-fade-in-up w-full">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-green-500">File uploaded and processed successfully!</p>
    
            <div className="flex border-b mb-4 overflow-x-auto">
              <button 
                className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'visualizations' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('visualizations')}
              >
                Visualizations
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'missing' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('missing')}
              >
                Missing Values
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'correlations' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('correlations')}
              >
                Correlations
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'target' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('target')}
              >
                Target
              </button>
            </div>
            
            {/* Tab content */}
            <div className="mt-4">
              {renderTabContent()}
            </div>

            <div className="mt-4 flex space-x-4">
              {isShowClean && (
                <button
                  onClick={handleCleanData}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-green-300"
                >
                  Clean and Process Data
                </button>
              )}
              
              {isCleaned && (
                <CleanedPage />
              )}
            </div>

            <button
              onClick={handleReupload}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
