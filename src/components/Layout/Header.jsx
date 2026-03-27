import React, { useState, useEffect } from 'react'

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      message: (
        <div className="div1">
          <div className="icon-box inline-flex">
            <svg width="30" height="20" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <path
                d="M50,5 C55,5 60,8 63,10 C68,8 73,10 75,15 C80,15 83,20 85,25 C90,27 90,32 88,37 C92,40 92,45 88,50 C92,55 92,60 88,63 C90,68 90,73 85,75 C83,80 80,85 75,85 C73,90 68,92 63,90 C60,92 55,95 50,95 C45,95 40,92 37,90 C32,92 27,90 25,85 C20,85 17,80 15,75 C10,73 10,68 12,63 C8,60 8,55 12,50 C8,45 8,40 12,37 C10,32 10,27 15,25 C17,20 20,15 25,15 C27,10 32,8 37,10 C40,8 45,5 50,5 Z"
                fill="#0c0c0cff"
              />
              <circle cx="50" cy="50" r="30" fill="#090909ff" />
              <text 
                x="50" 
                y="67" 
                textAnchor="middle" 
                fontSize="45" 
                fill="#fcb208ff" 
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
              >
                %
              </text>
            </svg>
          </div>
          <span className="text-sm md:text-base">
            Get Rs.250 additional off on cart value of Rs.2999 and above
          </span>
        </div>
      ),
    },
    {
      id: 2,
      message: (
        <div className="div2">
          <div className="smiley">
    <div className="eye left"></div>
    <div className="eye right"></div>
    <div className="mouth"></div>
</div>
          <span className="text-sm md:text-base">
            Autumn winter 2025 is here! Dress your little one in soft, breatheable fabrics for ultimate comfort and style!
          </span>
        </div>
      ),
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="header-slide">
      <div className="container mx-auto px-4">
        <div className="text-xs md:text-sm font-medium text-center animate-fadeIn">
          {slides[currentSlide].message}
        </div>
      </div>
    </div>
  )
}

export default Header