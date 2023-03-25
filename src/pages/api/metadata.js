export default async function Route(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const response = await getYoutubeMetadata(url);
    if (!response.ok) {
      return res
        .status(500)
        .json({ error: "Fetching youtube metadata failed" });
    }
    const json = await response.json();
    res.json(json);
  } catch (error) {
    return res.status(500).json({ error: "Fetching youtube metadata failed" });
  }
}

async function getYoutubeMetadata(url) {
  const urlMetadata =
    `https://www.youtube.com/oembed?url=` + url + `&format=json`;
  return fetch(urlMetadata);
}
