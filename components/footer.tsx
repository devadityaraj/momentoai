// components/BlurredFooter.tsx

import React from 'react';

/**
 * A minimal, sexy, blurred footer component.
 */
const Footer: React.FC = () => {
  return (
    <footer
      style={{
        // 1. Position at the bottom of the viewport
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100, // Ensure it sits above other content

        // 2. Minimalist styling
        padding: '1rem 0',
        textAlign: 'center',
        
        backgroundColor: 'rgba(0, 0, 0, 0.15)', // White with 15% opacity (adjust color/opacity for dark mode)
        backdropFilter: 'blur(10px) saturate(180%)', // The main blurring effect
        WebkitBackdropFilter: 'blur(10px) saturate(180%)', // For Safari compatibility
        
        // 4. Subtle Border/Shadow (Optional: Adds polish)
        borderTop: '1px solid rgba(255, 255, 255, 0.2)', // A thin, subtle border
        boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.1)', // Optional subtle upward shadow
        
        // 5. Text Styling
        color: '#f0f0f0', // Light text color
        fontSize: '0.9rem',
        fontWeight: 300,
        letterSpacing: '0.05em',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p>&copy; {new Date().getFullYear()} Momento AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;