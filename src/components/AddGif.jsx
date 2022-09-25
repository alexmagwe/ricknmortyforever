import React, { useState } from "react";
import { Blocks } from "react-loader-spinner";

function AddGif(props) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (link.length > 0) {
      setLoading(true);
      await props.addGif(link);
      setLoading(false);
      setLink("")
    }
  };
  return (
    <div className="connected-container">
      <form className='add-gif-form'onSubmit={handleSubmit}>
        <input
          placeholder="Enter gif link"
          onChange={(e) => setLink(e.target.value)}
          value={link}
          type="text"
          className=""
        />
        {loading ? (
          <div className="loading">
          <Blocks
            visible={true}
            height="80"
            width="80"
            ariaLabel="blocks-loading"
            wrapperStyle={{}}
            wrapperClass="blocks-wrapper"
          />
          </div>
        ) : (
          <button className="submit-gif-button">Submit</button>
        )}
      </form>
    </div>
  );
}

export default AddGif;
