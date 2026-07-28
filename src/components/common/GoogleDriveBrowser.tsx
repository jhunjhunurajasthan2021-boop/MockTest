import React, { useState, useEffect } from 'react';
import { googleSignIn, getAccessToken } from '../../firebase';
import { Folder, FileText, FileSpreadsheet, Loader2, X } from 'lucide-react';

interface GoogleDriveBrowserProps {
  onFilePicked: (fileId: string, fileName: string, mimeType: string, accessToken: string) => void;
  onCancel: () => void;
  allowedMimeTypes?: string[];
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export const GoogleDriveBrowser: React.FC<GoogleDriveBrowserProps> = ({
  onFilePicked,
  onCancel,
  allowedMimeTypes = [],
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([{id: 'root', name: 'My Drive'}]);

  useEffect(() => {
    loadFiles(folderStack[folderStack.length - 1].id);
  }, [folderStack]);

  const loadFiles = async (folderId: string) => {
    setLoading(true);
    setError('');
    try {
      let token = await getAccessToken();
      if (!token) {
        try {
          const authResult = await googleSignIn();
          if (authResult) {
            token = authResult.accessToken;
          } else {
            setError('Google sign-in was cancelled.');
            setLoading(false);
            return;
          }
        } catch (authErr: any) {
          setError(
            authErr?.message ||
              'Unable to open Google popup in preview frame. Please upload your document directly using "Select Word Document" / "Select Excel File" or open in new tab.'
          );
          setLoading(false);
          return;
        }
      }

      // Build query
      let q = `'${folderId}' in parents and trashed = false`;
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&orderBy=folder,name`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Google Drive');
      }

      const data = await response.json();
      
      // Filter out files that don't match allowed types (but keep folders)
      const filtered = data.files.filter((f: DriveFile) => 
        f.mimeType === 'application/vnd.google-apps.folder' || 
        allowedMimeTypes.length === 0 || 
        allowedMimeTypes.includes(f.mimeType)
      );
      
      setFiles(filtered || []);
    } catch (err: any) {
      console.error(err);
      setError('Error loading Google Drive files. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      setFolderStack([...folderStack, { id: file.id, name: file.name }]);
    } else {
      const token = await getAccessToken();
      if (token) {
        onFilePicked(file.id, file.name, file.mimeType, token);
      }
    }
  };

  const navigateUp = () => {
    if (folderStack.length > 1) {
      setFolderStack(folderStack.slice(0, -1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Select File from Google Drive</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <span className="font-bold shrink-0">💡 नोट:</span>
          <p>
            ब्राउज़र सुरक्षा (iframe preview) के कारण Google Login पॉप-अप ब्लॉक हो सकता है। यदि ड्राइव फ़ाइलें लोड न हों, तो कृपया अपने डिवाइस/कंप्यूटर से फ़ाइल चुनने हेतु "Cancel" करके डायरेक्ट <span className="font-bold underline">"Select File"</span> बटन का उपयोग करें, या ऐप को <span className="font-bold underline">"Open in New Tab"</span> करें।
          </p>
        </div>

        <div className="p-3 bg-gray-50 border-b flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
          {folderStack.map((folder, index) => (
            <React.Fragment key={folder.id}>
              {index > 0 && <span>/</span>}
              <button 
                onClick={() => setFolderStack(folderStack.slice(0, index + 1))}
                className="hover:text-blue-600 hover:underline whitespace-nowrap"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading files...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full">
                <X className="w-8 h-8" />
              </div>
              <p className="text-xs text-red-600 max-w-md font-medium leading-relaxed bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Upload Directly from Device (डिवाइस से अपलोड करें)
                </button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-gray-500 text-center mt-10">No compatible files found in this folder.</div>
          ) : (
            <ul className="space-y-1">
              {files.map(file => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                const isExcel = file.mimeType.includes('spreadsheet') || file.mimeType.includes('excel');
                const isWord = file.mimeType.includes('document') || file.mimeType.includes('word');
                
                return (
                  <li key={file.id}>
                    <button 
                      onClick={() => handleFileClick(file)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-md transition-colors text-left"
                    >
                      {isFolder ? (
                        <Folder className="text-gray-400" size={20} />
                      ) : isExcel ? (
                        <FileSpreadsheet className="text-green-500" size={20} />
                      ) : isWord ? (
                        <FileText className="text-blue-500" size={20} />
                      ) : (
                        <FileText className="text-gray-400" size={20} />
                      )}
                      <span className="truncate flex-1 text-gray-700">{file.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
