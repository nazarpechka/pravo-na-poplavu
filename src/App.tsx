import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Accordion from "react-bootstrap/Accordion";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Fuse from "fuse.js";

interface Video {
  id: string;
  publishedAt: string;
  title: string;
  description: string;
  link: string;
  chapters: Chapter[];
  score: number;
}

interface Chapter {
  time: string;
  title: string;
  link: string;
}

const CHAPTER_REGEX =
  /(?<time>\d{1}:\d{2}:\d{2}|\d{2}:\d{2})\s(\-)?(\s)?(?<chapterTitle>.*)/g;
const YOUTUBE_VIDEO_LINK = "https://youtu.be/";

const App = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  useEffect(() => {
    axios
      .get("./videos.json")
      .then((res) => {
        const vids = res.data.map((vid: Video) => {
          const matches = [...vid.description.matchAll(CHAPTER_REGEX)];
          const chapters = matches.map((match: any) => {
            const time = match.groups.time;
            let totalSeconds = 0;
            if (time.length > 5) {
              const [hours, minutes, seconds] = time.split(":");
              totalSeconds = +hours * 60 * 60 + +minutes * 60 + +seconds;
            } else {
              const [minutes, seconds] = time.split(":");
              totalSeconds = +minutes * 60 + +seconds;
            }

            return {
              time,
              title: match.groups.chapterTitle,
              link: YOUTUBE_VIDEO_LINK + vid.id + "?t=" + totalSeconds + "s",
            };
          });

          return { ...vid, link: YOUTUBE_VIDEO_LINK + vid.id, chapters };
        });
        setVideos(vids);
        setFilteredVideos(vids);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    if (query) {
      const filteredVids = videos.reduce<Video[]>(
        (vids: Video[], vid: Video) => {
          const fuse = new Fuse(vid.chapters, {
            keys: ["title"],
            threshold: 0.3,
            ignoreLocation: true,
            includeScore: true,
          });

          const fuseMatches = fuse
            .search(query)
            .map((match) => ({ ...match.item, score: match.score }));
          const literalMatches = vid.chapters.filter(
            (chapter) =>
              !fuseMatches.some((match: any) => match.time === chapter.time) &&
              chapter.title.toLowerCase().includes(query.toLowerCase())
          );
          let maxMatch = 0;
          if (literalMatches.length > 0) {
            maxMatch = 1;
          } else {
            maxMatch = Math.max(
              ...fuseMatches.map((match: any) => match!.score)
            );
          }
          const matches = literalMatches.concat(fuseMatches);
          if (matches.length) {
            vids.push({
              ...vid,
              chapters: matches,
              score: maxMatch,
            });
          }
          vids.sort((a: Video, b: Video) => b.score - a.score);
          return vids;
        },
        []
      );
      setFilteredVideos(filteredVids);
    } else {
      setFilteredVideos(videos);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="/logo.jpg"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            Право на Поплаву
          </Navbar.Brand>
          <div>
            <Button
              variant="danger"
              href="https://www.youtube.com/channel/UCwCkRo2WQx_9JRWISLC47fw"
              target="_blank"
            >
              YouTube
            </Button>
            <Button
              variant="primary"
              href="https://savelife.in.ua/donate/"
              target="_blank"
              className="ms-4"
            >
              Донат на ЗСУ
            </Button>
          </div>
        </Container>
      </Navbar>
      <Container>
        <div className="d-flex justify-content-center align-items-center my-4">
          <h1>Пошук</h1>
          <Form.Control
            size="lg"
            type="text"
            placeholder="Запитання"
            className="ms-5"
            onChange={handleSearchChange}
          />
        </div>

        {filteredVideos.length ? (
          <Accordion>
            {filteredVideos?.map((video: Video) => (
              <Accordion.Item eventKey={video.id} key={video.id}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100">
                    {video.title}
                    <a href={video.link} target="_blank">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="red"
                        className="bi bi-youtube me-3"
                        viewBox="0 0 16 16"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" />
                      </svg>
                    </a>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  {video.chapters?.map((chapter) => (
                    <a
                      key={chapter.link}
                      className="d-block"
                      href={chapter.link}
                      target="_blank"
                    >
                      {chapter.time + " " + chapter.title}
                    </a>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <h3>Нічого не знайдено, спробуйте шукати по ключових словах ;)</h3>
        )}
      </Container>
    </>
  );
};

export default App;
