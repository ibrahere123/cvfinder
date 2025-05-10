"use client";

import React, { useState } from "react";

interface ResumeMetadata {
  filename: string;
  name?: string;
  skills?: string[];
  total_experience?: number;
}

export default function ExternalStoragePage() {
  const [googleCredentials, setGoogleCredentials] = useState("");
  const [dropboxToken, setDropboxToken] = useState("");
  const [googleFiles, setGoogleFiles] = useState<{ id: string; name: string }[]>([]);
  const [dropboxFiles, setDropboxFiles] = useState<{ id: string; name: string }[]>([]);
  const [localResumes, setLocalResumes] = useState<ResumeMetadata[]>([]);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDropbox, setLoadingDropbox] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newResume, setNewResume] = useState<ResumeMetadata>({
    filename: "",
    name: "",
    skills: [],
    total_experience: 0,
  });

  const fetchGoogleFiles = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      const res = await fetch("/external_storage/google_drive/list_files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials_json: googleCredentials }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to fetch Google Drive files");
      }
      const data = await res.json();
      setGoogleFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const fetchDropboxFiles = async () => {
    setError(null);
    setLoadingDropbox(true);
    try {
      const res = await fetch("/external_storage/dropbox/list_files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: dropboxToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to fetch Dropbox files");
      }
      const data = await res.json();
      setDropboxFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDropbox(false);
    }
  };

  const fetchLocalResumes = async () => {
    setError(null);
    setLoadingLocal(true);
    try {
      const res = await fetch("/external_storage/local_db/list_resumes");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to fetch local resumes");
      }
      const data = await res.json();
      setLocalResumes(data.resumes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingLocal(false);
    }
  };

  const saveResumeMetadata = async () => {
    setError(null);
    try {
      const res = await fetch("/external_storage/local_db/save_resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResume),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to save resume metadata");
      }
      await fetchLocalResumes();
      alert("Resume metadata saved successfully");
      setNewResume({ filename: "", name: "", skills: [], total_experience: 0 });
    } catch (err: any) {
      setError(err.message);
    }
  };

  React.useEffect(() => {
    fetchLocalResumes();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">External Storage Integration</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Google Drive Section */}
      <section className="border rounded p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Google Drive</h2>
        <textarea
          className="w-full border rounded p-2 mb-2 font-mono text-sm"
          rows={6}
          placeholder="Paste Google Service Account JSON here"
          value={googleCredentials}
          onChange={(e) => setGoogleCredentials(e.target.value)}
        />
        <button
          onClick={fetchGoogleFiles}
          disabled={loadingGoogle}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loadingGoogle ? "Loading..." : "List Files"}
        </button>
        <ul className="mt-3 max-h-48 overflow-auto">
          {googleFiles.map((file) => (
            <li key={file.id} className="border-b py-1">
              {file.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Dropbox Section */}
      <section className="border rounded p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Dropbox</h2>
        <input
          type="text"
          className="w-full border rounded p-2 mb-2"
          placeholder="Enter Dropbox Access Token"
          value={dropboxToken}
          onChange={(e) => setDropboxToken(e.target.value)}
        />
        <button
          onClick={fetchDropboxFiles}
          disabled={loadingDropbox}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loadingDropbox ? "Loading..." : "List Files"}
        </button>
        <ul className="mt-3 max-h-48 overflow-auto">
          {dropboxFiles.map((file) => (
            <li key={file.id} className="border-b py-1">
              {file.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Local DB Section */}
      <section className="border rounded p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Local Database</h2>
        <button
          onClick={fetchLocalResumes}
          disabled={loadingLocal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mb-4"
        >
          {loadingLocal ? "Loading..." : "Refresh Resumes"}
        </button>
        <ul className="max-h-48 overflow-auto">
          {localResumes.map((resume) => (
            <li key={resume.filename} className="border-b py-1">
              <strong>{resume.name || resume.filename}</strong> - Skills:{" "}
              {resume.skills?.join(", ")} - Experience: {resume.total_experience} years
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-semibold text-lg">Add Resume Metadata</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Filename"
            className="w-full border rounded p-2"
            value={newResume.filename}
            onChange={(e) => setNewResume({ ...newResume, filename: e.target.value })}
          />
          <input
            type="text"
            placeholder="Name"
            className="w-full border rounded p-2"
            value={newResume.name}
            onChange={(e) => setNewResume({ ...newResume, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Skills (comma separated)"
            className="w-full border rounded p-2"
            value={newResume.skills?.join(", ")}
            onChange={(e) =>
              setNewResume({ ...newResume, skills: e.target.value.split(",").map((s) => s.trim()) })
            }
          />
          <input
            type="number"
            placeholder="Total Experience (years)"
            className="w-full border rounded p-2"
            value={newResume.total_experience}
            onChange={(e) =>
              setNewResume({ ...newResume, total_experience: Number(e.target.value) })
            }
          />
          <button
            onClick={saveResumeMetadata}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Resume Metadata
          </button>
        </div>
      </section>
    </div>
  );
}
