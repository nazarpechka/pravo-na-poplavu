import axios from "axios";
import fs from "fs";

interface SearchResponse {
  nextPageToken: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Video[];
}

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
  };
}

const API_URL = "https://www.googleapis.com/youtube/v3/";
const API_SEARCH_PATH = "search";
const API_VIDEOS_PATH = "videos";
const API_KEY = "?key=AIzaSyCVl7zmLvYqtKpxLLKCoGR4BAGV3KDZvKQ&";
const API_SEARCH_PARAMS =
  "channelId=UCwCkRo2WQx_9JRWISLC47fw&part=snippet,id&order=date&maxResults=50&publishedAfter=2022-02-23T00:00:00Z";
const API_VIDEOS_PARAMS = "part=snippet&id=";

let videos: Video[] = [];

const load = (pageToken: string) => {
  axios
    .get(API_URL + API_SEARCH_PATH + API_KEY + API_SEARCH_PARAMS + pageToken)
    .then((res: any) => {
      console.log("running");
      videos = [...videos, ...res.data.items];
      if (res.data.nextPageToken) {
        load("&pageToken=" + res.data.nextPageToken);
      } else {
        loadDescriptions();
      }
    })
    .catch((err) => {
      console.log(err.response.data);
    });
};

const loadDescriptions = () => {
  const promises = videos.map((video) => {
    return axios
      .get(
        API_URL +
          API_VIDEOS_PATH +
          API_KEY +
          API_VIDEOS_PARAMS +
          video.id.videoId
      )
      .then((res: any) => {
        const vid = res.data.items[0];
        console.log(vid);
        return {
          id: vid.id,
          publishedAt: vid.snippet.publishedAt,
          title: vid.snippet.title,
          description: vid.snippet.description,
          thumbnails: vid.snippet.thumbnails,
        };
      })
      .catch((err) => console.log(err));
  });

  Promise.all(promises)
    .then((data) => {
      fs.writeFileSync("public/videos.json", JSON.stringify(data));
    })
    .catch((err) => console.log(err));
};

load("");

export {};
