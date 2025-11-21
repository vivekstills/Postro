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
    maxCollapsedSlides?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
    slides,
    autoPlayInterval = 5000,
    maxCollapsedSlides = 5
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine which slides to show based on expanded state
    const displaySlides = isExpanded ? slides : slides.slice(0, maxCollapsedSlides);
    const totalSlides = displaySlides.length;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [totalSlides, autoPlayInterval]);

    // Reset to first slide when collapsing
    useEffect(() => {
        if (!isExpanded && currentSlide >= maxCollapsedSlides) {
            setCurrentSlide(0);
        }
    }, [isExpanded, currentSlide, maxCollapsedSlides]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`hero-carousel ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="carousel-container">
                {displaySlides.map((slide, index) => (
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

            {/* Expand/Collapse Button - Only show if there are more than maxCollapsedSlides */}
            {slides.length > maxCollapsedSlides && (
                <button className="carousel-expand-btn" onClick={toggleExpand}>
                    <span>{isExpanded ? '▲ Show Less' : `▼ Show All (${slides.length})`}</span>
                </button>
            )}

            {/* Dot Indicators */}
            <div className="carousel-dots">
                {displaySlides.map((_, index) => (
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
                    height: 300px;
                    overflow: hidden;
                    background: var(--black);
                    border-bottom: var(--border-chunky) solid var(--primary);
                    border-top: var(--border-thick) solid var(--primary);
                    transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 1;
                }

                .hero-carousel.expanded {
                    height: 500px;
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

                /* Expand/Collapse Button */
                .carousel-expand-btn {
                    position: absolute;
                    bottom: var(--space-lg);
                    right: var(--space-lg);
                    background: var(--primary);
                    color: var(--black);
                    border: var(--border-thick) solid var(--black);
                    padding: var(--space-sm) var(--space-lg);
                    font-family: var(--font-heading);
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    z-index: 4;
                    transition: all 0.2s ease;
                    box-shadow: var(--shadow-tag);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .carousel-expand-btn:hover {
                    background: var(--secondary);
                    transform: translate(2px, 2px);
                    box-shadow: 1px 1px 0 var(--black);
                }

                .carousel-expand-btn span {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
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
                        height: 250px;
                    }

                    .hero-carousel.expanded {
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

                    .carousel-expand-btn {
                        bottom: var(--space-md);
                        right: var(--space-md);
                        padding: var(--space-xs) var(--space-md);
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default HeroCarousel;
