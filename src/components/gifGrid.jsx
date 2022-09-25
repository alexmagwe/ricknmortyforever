import React from "react";

function GifGrid(props) {
  return (
    <div>
      <div className="gif-grid">
        {props.gifs && props.gifs.map((gif, i) => <Gif key={i} link={gif.gifLink} />)}
      </div>
    </div>
  );
}

export default GifGrid;
const Gif = ({ link }) => {
  return (
    <div className="gif-item">
      <img src={link} alt="rick and morty awesome gif"></img>
    </div>
  );
};
