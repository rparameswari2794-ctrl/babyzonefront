// components/CategoriesDropdown.jsx - Items are non-clickable (display only)
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoriesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = {
    "New Baby clothing": [
      "New born onesies & rompers",
      "New born nightwear & sleepsuits",
      "New born baby sets & suits",
      "New born baby dresses & frocks",
      "New born baby leggings & shorts",
      "New born baby t-shirts",
      "New born caps, gloves & mittens",
      "New born inner wear",
      "New born baby jackets",
      "New born baby sweaters"
    ],
    "New Baby feeding": [
      "Baby Booties",
      "Kids Footwear",
      "Kids casual shoes",
      "Kids sneakers & sports shoes",
      "Kids bellies",
      "Kids sandals",
      "Kids flip flops"
    ],
    "Breast Feeding": [
      "Electric breast pump",
      "Manual breast pump",
      "Feeding shawls",
      "Breast pads & nipple shields"
    ],
    "Maternity Clothing": [
      "Stretch mark cream",
      "Maternity pads",
      "Disposable maternity panties",
      "Maternity bed mats"
    ],
    "Baby Essentials": [
      "Bibs & burp cloths",
      "Feeding bottles",
      "Muslin",
      "Soothers & pacifiers",
      "Teethers & nibblers",
      "Baby food storage & milk storages",
      "Baby sippers & cups",
      "Weaning plates & bowls",
      "Kids water bottles & lunch box"
    ],
    "Baby skincare": [
      "Baby body oil & baby massage Oil",
      "Baby body wash",
      "Baby cream & baby lotion",
      "Baby diaper rash Cream",
      "Baby powder",
      "Baby wipes & tissues"
    ],
    "Baby boys clothing": [
      "Baby boys t-shirts",
      "Baby boys shirts",
      "Baby boys jeans & trousers",
      "Baby boys shorts",
      "Baby boys innerwear & thermals"
    ],
    "Fashion Accessories": [
      "Kids bags",
      "Kids hair accessories",
      "Kids caps & gloves",
      "Kids scarfs"
    ],
    "Maternity Wear": [
      "Maternity lingerie",
      "Maternity bottom wear",
      "Maternity sleep wear",
      "Maternity tops",
      "Maternity dresses"
    ],
    "Health & Safety": [
      "Baby care equipments",
      "Detergent & cleansers",
      "Humidifiers & air purifiers",
      "Mosquito repellants",
      "Sanitisers & hand cleansing gels"
    ]
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Split categories into 3 columns
  const categoryEntries = Object.entries(categories);
  const columnSize = Math.ceil(categoryEntries.length / 3);
  const columns = [
    categoryEntries.slice(0, columnSize),
    categoryEntries.slice(columnSize, columnSize * 2),
    categoryEntries.slice(columnSize * 2)
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn dropdown-toggle"
        type="button"
        onClick={toggleDropdown}
        style={{
          backgroundColor: '#fd99d7',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}
      >
        All categories
      </button>
      
      {isOpen && (
        <div 
          className="dropdown-menu show"
          style={{ 
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '8px',
            minWidth: '900px',
            maxWidth: '95vw',
            padding: '0',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: 'none',
            backgroundColor: 'white',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'nowrap',
            gap: '0'
          }}>
            {columns.map((column, colIndex) => (
              <div key={colIndex} style={{ 
                flex: 1,
                minWidth: '280px',
                borderRight: colIndex < columns.length - 1 ? '1px solid #e9ecef' : 'none',
                backgroundColor: 'white'
              }}>
                {column.map(([category, items]) => (
                  <div key={category}>
                    <div style={{ 
                      padding: '12px 16px 8px 16px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#d63384',
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      {category}
                    </div>
                    {items.map(item => (
                      // NON-CLICKABLE ITEMS - Just display, no link
                      <div
                        key={item}
                        style={{
                          display: 'block',
                          padding: '8px 16px 8px 32px',
                          fontSize: '13px',
                          color: '#495057',
                          cursor: 'default',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesDropdown;