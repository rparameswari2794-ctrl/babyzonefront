import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-pink-100 to-purple-100 py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-pink-600">BabyZone</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your one-stop shop for all baby essentials. Quality products, expert advice, 
            and a supportive community for your parenting journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/products"
              className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition"
            >
              Shop Now
            </Link>
            <Link
              to="/parenting-classes"
              className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition"
            >
              Join Classes
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <img
            src="https://via.placeholder.com/500x400?text=Baby+Zone"
            alt="Baby Zone"
            className="rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  )
}

export default HeroSection