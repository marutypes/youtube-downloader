import React, { useState, useEffect } from "react";

export default function DownloadLink({ blob, filename, className, children }) {
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    // Create a Blob URL and set it as the download URL
    const blobUrl = URL.createObjectURL(blob);
    setDownloadUrl(blobUrl);

    // Clean up the Blob URL when the component is unmounted
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blob]);

  return (
    <a href={downloadUrl} download={filename} className={className}>
      {children || filename}
    </a>
  );
};