import React, { useState, useEffect } from 'react';
import '../index.css';

interface CarouselSlide {
    image: string;
    title: string;
    subtitle: string;
    cta?: string;
}

interface HeroCarouselProps {
    slides: CarouselSlide[];
    autoPlayInterval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
    slides,
    autoPlayInterval = 5000
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [slides.length, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="hero-carousel">
            <div className="carousel-container">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    >
                        <div className="slide-image-wrapper">
                            <img src={slide.image} alt={slide.title} className="slide-image" />
                            <div className="slide-overlay"></div>
                        </div>
                        <div className="slide-content">
                            <h2 className="slide-title display-text">{slide.title}</h2>
                            <p className="slide-subtitle">{slide.subtitle}</p>
                            {slide.cta && (
                                <button className="slide-cta btn primary">{slide.cta}</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button className="carousel-arrow arrow-left" onClick={prevSlide}>
                <span>‹</span>
            </button>
            <button className="carousel-arrow arrow-right" onClick={nextSlide}>
                <span>›</span>
            </button>

            {/* Dot Indicators */}
            <div className="carousel-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>

            <style>{`
                .hero-carousel {
                    position: relative;
                    width: 100%;
                    height: 500px;
                    overflow: hidden;
                    background: var(--black);
                    border-bottom: var(--border-chunky) solid var(--primary);
                }

                .carousel-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .carousel-slide {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 0.5s ease-in-out;
                    pointer-events: none;
                }

                .carousel-slide.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                .slide-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .slide-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                }

                .slide-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to right, rgba(0,0,0,0.7), transparent);
                }

                .slide-content {
                    position: absolute;
                    top: 50%;
                    left: var(--space-3xl);
                    transform: translateY(-50%);
                    max-width: 600px;
                    z-index: 2;
                }

                .slide-title {
                    color: var(--white);
                    margin-bottom: var(--space-lg);
                    text-shadow: 4px 4px 0 var(--black);
                }

                .slide-subtitle {
                    color: var(--white);
                    font-size: 1.3rem;
                    font-family: var(--font-body);
                    margin-bottom: var(--space-xl);
                    font-weight: 500;
                }

                .slide-cta {
                    background: var(--primary);
                    color: var(--black);
                    border-color: var(--black);
                    font-size: 1.1rem;
                }

                .slide-cta:hover {
                    background: var(--secondary);
                }

                /* Navigation Arrows */
                .carousel-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: var(--white);
                    border: var(--border-thick) solid var(--black);
                    color: var(--black);
                    font-size: 3rem;
                    width: 60px;
                    height: 60px;
                    cursor: pointer;
                    z-index: 3;
                    transition: all 0.2s ease;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .carousel-arrow:hover {
                    background: var(--primary);
                    box-shadow: var(--shadow-tag);
                }

                .arrow-left {
                    left: var(--space-lg);
                }

                .arrow-right {
                    right: var(--space-lg);
                }

                /* Dot Indicators */
                .carousel-dots {
                    position: absolute;
                    bottom: var(--space-xl);
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: var(--space-md);
                    z-index: 3;
                }

                .carousel-dot {
                    width: 16px;
                    height: 16px;
                    border: var(--border-thick) solid var(--white);
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                }

                .carousel-dot.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    box-shadow: var(--shadow-tag);
                }

                .carousel-dot:hover {
                    background: var(--white);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-carousel {
                        height: 400px;
                    }

                    .slide-content {
                        left: var(--space-lg);
                        max-width: calc(100% - var(--space-2xl));
                    }

                    .slide-title {
                        font-size: 2.5rem;
                    }

                    .slide-subtitle {
                        font-size: 1rem;
                    }

                    .carousel-arrow {
                        width: 50px;
                        height: 50px;
                        font-size: 2rem;
                    }

                    .arrow-left {
                        left: var(--space-sm);
                    }

                    .arrow-right {
                        right: var(--space-sm);
                    }
                }
            `}</style>
        </div>
    );
};

export default HeroCarousel;
