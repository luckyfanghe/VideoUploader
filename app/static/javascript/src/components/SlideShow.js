import React from "react";
import { Fade } from 'react-slideshow-image';
import slide_img1 from '../assets/slides/1.jpg';
import slide_img2 from '../assets/slides/2.jpg';
import slide_img3 from '../assets/slides/3.jpg';
import slide_img4 from '../assets/slides/4.jpg';
import slide_img5 from '../assets/slides/5.jpg';

const fadeImages = [
  slide_img1,
  slide_img2,
  slide_img3,
  slide_img4,
  slide_img5
];

const SlideShow = () => {
  return (
    <div className="slide-container">
      <Fade>
        <div className="each-fade">
          <div className="image-container">
            <img src={slide_img1} />
          </div>
        </div>
        <div className="each-fade">
          <div className="image-container">
            <img src={slide_img2} />
          </div>
        </div>
        <div className="each-fade">
          <div className="image-container">
            <img src={slide_img3} />
          </div>
        </div>
        <div className="each-fade">
          <div className="image-container">
            <img src={slide_img4} />
          </div>
        </div>
        <div className="each-fade">
          <div className="image-container">
            <img src={slide_img5} />
          </div>
        </div>
      </Fade>
    </div>
  )
}

export default SlideShow;
