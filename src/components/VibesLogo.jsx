import React from 'react';

/**
 * 🎨 Vibes Studio Logo Component
 * 
 * Logo SVG ottimizzato per Vibes Studio
 * Basato sul design originale con lettera V stilizzata e equalizzatore
 */
const VibesLogo = ({ variant = 'default', size = 'medium', className = '' }) => {
  // Varianti: default (bianco su dark), light (nero su bianco), icon (solo icona)
  // Size: small, medium, large
  
  const sizeMap = {
    small: { fontSize: '1.5rem', studioSize: '0.5rem', gap: '6px' },
    medium: { fontSize: '2.5rem', studioSize: '0.75rem', gap: '8px' },
    large: { fontSize: '4rem', studioSize: '1.1rem', gap: '10px' }
  };
  
  const dimensions = sizeMap[size] || sizeMap.medium;
  
  // Colori in base alla variante
  const colors = {
    default: {
      text: '#FFFFFF',
      studio: '#FFFFFF',
      equalizer: ['#FCD34D', '#FB923C', '#F97316'] // Giallo → Arancione gradiente
    },
    light: {
      text: '#1F2937',
      studio: '#4B5563',
      equalizer: ['#F59E0B', '#EA580C', '#DC2626'] // Più scuro per contrasto
    },
    icon: {
      text: '#FFFFFF',
      studio: '#FFFFFF',
      equalizer: ['#FCD34D', '#FB923C', '#F97316']
    }
  };
  
  const colorScheme = colors[variant] || colors.default;
  
  if (variant === 'icon') {
    // Solo la V con equalizzatore (per favicon/icona)
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 80 80"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lettera V stilizzata semplificata */}
        <path
          d="M 15 15 L 15 55 L 40 65 L 65 55 L 65 25 L 50 15 Z"
          fill="none"
          stroke={colorScheme.text}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Equalizzatore (3 barre orizzontali angolate) */}
        <rect x="20" y="20" width="4" height="12" fill={colorScheme.equalizer[0]} rx="1" transform="rotate(-15 22 26)" />
        <rect x="24" y="24" width="4" height="10" fill={colorScheme.equalizer[1]} rx="1" transform="rotate(-15 26 29)" />
        <rect x="28" y="28" width="4" height="8" fill={colorScheme.equalizer[2]} rx="1" transform="rotate(-15 30 32)" />
      </svg>
    );
  }
  
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: dimensions.gap,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 700,
        userSelect: 'none'
      }}
    >
      {/* Logo principale VIBES */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        fontSize: dimensions.fontSize,
        letterSpacing: '-3px',
        color: colorScheme.text,
        fontWeight: 800,
        lineHeight: 1
      }}>
        {/* Lettera V con equalizzatore */}
        <div style={{ 
          position: 'relative', 
          display: 'inline-flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: dimensions.fontSize,
            fontWeight: 800,
            lineHeight: 1
          }}>
            V
          </span>
          {/* Equalizzatore bars (3 barre orizzontali sulla sinistra della V) */}
          <div style={{
            position: 'absolute',
            left: `calc(-${dimensions.fontSize} * 0.3)`,
            top: `calc(${dimensions.fontSize} * 0.05)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
          }}>
            {/* Barra 1 (più lunga, in alto) */}
            <div style={{
              width: `calc(${dimensions.fontSize} * 0.12)`,
              height: `calc(${dimensions.fontSize} * 0.08)`,
              background: colorScheme.equalizer[0],
              borderRadius: '2px',
              transform: 'rotate(-12deg)',
              boxShadow: `0 0 8px ${colorScheme.equalizer[0]}80`
            }} />
            {/* Barra 2 (media, al centro) */}
            <div style={{
              width: `calc(${dimensions.fontSize} * 0.12)`,
              height: `calc(${dimensions.fontSize} * 0.065)`,
              background: colorScheme.equalizer[1],
              borderRadius: '2px',
              transform: 'rotate(-12deg)',
              boxShadow: `0 0 8px ${colorScheme.equalizer[1]}80`
            }} />
            {/* Barra 3 (più corta, in basso) */}
            <div style={{
              width: `calc(${dimensions.fontSize} * 0.12)`,
              height: `calc(${dimensions.fontSize} * 0.05)`,
              background: colorScheme.equalizer[2],
              borderRadius: '2px',
              transform: 'rotate(-12deg)',
              boxShadow: `0 0 8px ${colorScheme.equalizer[2]}80`
            }} />
          </div>
        </div>
        
        <span style={{ 
          fontSize: dimensions.fontSize, 
          fontWeight: 800,
          letterSpacing: '-1px'
        }}>
          IBES
        </span>
      </div>
      
      {/* Sottotitolo STUDIO */}
      <div style={{
        fontSize: dimensions.studioSize,
        fontWeight: 400,
        letterSpacing: '3px',
        color: colorScheme.studio,
        opacity: 0.95,
        textTransform: 'uppercase',
        marginTop: '2px'
      }}>
        STUDIO
      </div>
    </div>
  );
};

export default VibesLogo;

