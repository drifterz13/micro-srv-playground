'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Content {
  id: number;
  key: string;
  contentType: 'Image' | 'Video' | 'Pdf';
  createdAt: string;
  updatedAt: string;
}

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/contents');
      if (!response.ok) {
        throw new Error('Failed to fetch contents');
      }
      const data = await response.json();
      setContents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contents');
    } finally {
      setLoading(false);
    }
  };

  const getContentUrl = (key: string) => {
    return `http://localhost:8090/content/${key}`;
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'Image':
        return '🖼️';
      case 'Video':
        return '🎥';
      case 'Pdf':
        return '📄';
      default:
        return '📁';
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'Image':
        return 'bg-green-100 text-green-800';
      case 'Video':
        return 'bg-blue-100 text-blue-800';
      case 'Pdf':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchContents}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Gallery</h1>
              <p className="text-gray-600 mt-2">Browse all uploaded content</p>
            </div>
            <Link
              href="/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload New Content
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">📊</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{contents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">🖼️</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {contents.filter(c => c.contentType === 'Image').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">🎥</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {contents.filter(c => c.contentType === 'Video').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">📄</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {contents.filter(c => c.contentType === 'Pdf').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first file</p>
            <Link
              href="/upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Upload Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contents.map((content) => (
              <div key={content.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Content Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {content.contentType === 'Image' ? (
                    <img
                      src={getContentUrl(content.key)}
                      alt={`Content ${content.key}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="text-6xl text-gray-400">
                      {getContentTypeIcon(content.contentType)}
                    </div>
                  )}
                  {/* Fallback for failed images */}
                  <div className="hidden text-6xl text-gray-400">
                    {getContentTypeIcon(content.contentType)}
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContentTypeColor(content.contentType)}`}>
                      {getContentTypeIcon(content.contentType)} {content.contentType}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 font-mono truncate mb-2" title={content.key}>
                    {content.key}
                  </p>

                  <p className="text-xs text-gray-500">
                    {new Date(content.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex space-x-2">
                    <a
                      href={getContentUrl(content.key)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700"
                    >
                      View
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(getContentUrl(content.key))}
                      className="flex-1 bg-gray-200 text-gray-700 text-center py-2 px-3 rounded text-sm hover:bg-gray-300"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}