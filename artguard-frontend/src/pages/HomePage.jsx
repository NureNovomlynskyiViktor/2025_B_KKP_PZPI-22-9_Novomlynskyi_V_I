import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import '../styles/HomePage.css';

import logo from '../assets/art-logo.png';
import scrollIcon from '../assets/scroll-icon.svg';

import art1 from '../assets/art1.jpg';
import art2 from '../assets/art2.png';
import art3 from '../assets/art3.jpg';
import art4 from '../assets/art4.jpg';
import art5 from '../assets/art5.jpg';

const artworks = [art1, art2, art3, art4, art5];

export default function HomePage() {
  const { t } = useTranslation();
  const sliderRef = useRef();

  const settings = {
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    centerMode: true,
    centerPadding: '0px',
    arrows: false,
    swipe: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="home-wrapper">
      <section className="hero-section">
        <img src={logo} alt="ArtGuard Logo" className="hero-logo" />
        <h1 className="hero-title">ArtGuard</h1>
        <p className="hero-subtitle">{t('homepage.tagline')}</p>
        <div
          className="scroll-down"
          style={{ backgroundImage: `url(${scrollIcon})` }}
        ></div>
      </section>

      <section className="importance-section">
        <h2>{t('homepage.whyPreserve')}</h2>
        <p>{t('homepage.whyPreserveDesc')}</p>
      </section>

      <section className="carousel-section">
        <button className="carousel-nav left" onClick={() => sliderRef.current.slickPrev()}>&larr;</button>
        <Slider ref={sliderRef} {...settings}>
          {artworks.map((img, index) => (
            <div key={index} className="carousel-item">
              <img src={img} alt={`Artwork ${index + 1}`} />
            </div>
          ))}
        </Slider>
        <button className="carousel-nav right" onClick={() => sliderRef.current.slickNext()}>&rarr;</button>
      </section>

      <footer className="footer">
        <p>{t('homepage.footer')}</p>
      </footer>
    </div>
  );
}
















