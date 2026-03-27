import React from 'react'
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset } from 'react-icons/fa'

const features = [
  {
    icon: <FaTruck className="text-3xl" />,
    title: 'Free Shipping',
    description: 'Free shipping on orders over ₹999'
  },
  {
    icon: <FaShieldAlt className="text-3xl" />,
    title: 'Secure Payment',
    description: '100% secure payment methods'
  },
  {
    icon: <FaUndo className="text-3xl" />,
    title: 'Easy Returns',
    description: '30 days return policy'
  },
  {
    icon: <FaHeadset className="text-3xl" />,
    title: '24/7 Support',
    description: 'Dedicated customer support'
  }
]

const Features = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-pink-600 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features