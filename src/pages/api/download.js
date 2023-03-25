import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import pathToFFMpeg from 'ffmpeg-static';

ffmpeg.setFfmpegPath(pathToFFMpeg);

export default async function Route(req, res) {
  const { url, format = 'mp3'} = req.query;

  if (!url || !format) {
    return res
      .status(400)
      .json({ error: "Missing videoUrl or format parameter" });
  }

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${videoTitle}.${format}`
    );
    res.setHeader(
      "Content-Type",
      format === "mp3" ? "audio/mpeg" : "video/mp4"
    );

    if (format === "mp3") {
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      const bestAudio = ytdl.chooseFormat(audioFormats, {
        quality: "highestaudio",
      });

      ffmpeg(bestAudio.url).format("mp3").pipe(res);
    } else if (format === "mp4") {
      const videoFormats = ytdl.filterFormats(info.formats, "videoandaudio");
      const highestQuality = ytdl.chooseFormat(videoFormats, {
        quality: "highestvideo",
      });

      res.setHeader("Content-Length", highestQuality.contentLength);
      res.setHeader("Content-Transfer-Encoding", "binary");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      ytdl(url, { format: highestQuality }).pipe(res);
    } else {
      return res
        .status(400)
        .json({ error: "Invalid format, only mp3 and mp4 are supported" });
    }
  } catch (error) {
    console.error("Error in video processing:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
