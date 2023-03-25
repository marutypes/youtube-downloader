import Head from "next/head";
import { useState } from "react";
import Spinner from "./components/Spinner";
import DownloadLink from "./components/DownloadLink";
import classNames from "classnames";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [format, setFormat] = useState("mp3");
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState([]);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const meta = metadata || await getVideoMetadata();
    const response = await fetch(
      `/api/download?url=${encodeURIComponent(videoUrl)}&format=${format}`
    );
    if (response.ok) {
      const media = await response.blob();
      setLoading(false);

      setConverted((list) => [
        ...list,
        {
          filename: `${meta?.title || videoUrl}.${format}`,
          media,
          title: meta?.title,
        },
      ]);
      setVideoUrl("");
      setMetadata(null);
      setError(null);
    } else {
      setLoading(false);
      setError("Video fetching error. Make sure the URL is valid.");
    }
  }

  async function getVideoMetadata() {
    try {
      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(videoUrl)}&format=${format}`
      );
      if (response.ok) {
        const metadata = await response.json();
        setMetadata(metadata);
        setError(null);
        return metadata;
      } else {
        setError("Could not fetch video metadata. Make sure the URL is valid.");
      }
    } catch (error) {
      setError("Could not fetch video metadata. Make sure the URL is valid.");
    }
  }

  return (
    <>
      <Head>
        <title>Youtube Download</title>
        <meta
          name="description"
          content="Download youtube videos without weird nonsense"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={classNames(
          "bg-slate-800 md:bg-gradient-to-b md:from-purple-700 md:to-purple-900 min-h-screen flex items-center justify-start flex-col md:pt-16 xl:pt-32 2xl:pt-84",
          inter.className
        )}
      >
        <div className="bg-slate-800 px-8 py-4 md:rounded-md border-b-slate-600 md:border-b-0 border-b-2 md:shadow-lg w-full max-w-full md:max-w-xl xl:max-w-4xl mb-2">
          <h1 className="text-2xl font-semibold mb-4 text-slate-200 text-center">
            YouTube Downloader
          </h1>
          {error && (
            <div className="bg-red-900 p-2 rounded-sm text-slate-300 mb-4 text-center">
              {error}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="text-slate-400 flex flex-col"
          >
            <label htmlFor="url" className="block mb-2">
              YouTube Video URL:
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={videoUrl}
              onChange={(e) => {
                if (error) {
                  setError(null);
                }
                setVideoUrl(e.target.value);
              }}
              onBlur={(e) => {
                if (videoUrl && videoUrl.length > 0) {
                  getVideoMetadata(videoUrl);
                } else {
                  setMetadata(null);
                }
              }}
              className="w-full p-2 border border-slate-400 bg-slate-900 rounded mb-4"
              required
            />
            <div className="mb-4">
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  placeholder="Input a youtube video URL"
                  name="format"
                  value="mp3"
                  checked={format === "mp3"}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-purple-600"
                />
                <span className="ml-2">MP3</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="mp4"
                  checked={format === "mp4"}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-purple-600"
                />
                <span className="ml-2">MP4</span>
              </label>
            </div>
            <div className="flex flex-col xl:flex-row align-middle justify-between">
              <div className="mb-4 pt-2">
                {metadata ? metadata.title : "Input a URL above to start."}
              </div>
              <button
                type="submit"
                disabled={loading || error}
                className={classNames(
                  "w-full py-2 mb-4 px-4 bg-purple-600 flex flex-row text-white font-semibold rounded justify-center overflow-hidden xl:max-w-xs",
                  { "bg-gray-400": loading || error || metadata == null }
                )}
              >
                <span>
                  {format == "mp3" ? "Convert to MP3" : "Extract MP4"}
                </span>{" "}
                {loading && (
                  <Spinner className="fill-purple-500 self-end justify-self-end" />
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="flex flex-col align-top justify-start p-2">
          <h3 className="text-xl text-slate-200 mb-2 text-center">
            Converted Videos
          </h3>
          {converted.length == 0 && (
            <p className="text-slate-400 md:text-slate-200">
              Your files will appear here once they are converted.
            </p>
          )}
          {converted.map(({ media, filename, title }) => (
            <DownloadLink
              className="text-purple-200 rounded"
              blob={media}
              key={filename}
              filename={filename}
            >
              🔽{title}
            </DownloadLink>
          ))}
        </div>
      </div>
    </>
  );
}
