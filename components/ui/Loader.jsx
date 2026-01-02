import React from 'react';
import styled from 'styled-components';

const Loader = ({ size = 40, speed = 1.4, color = '#4f46e5' }) => {
  return (
    <StyledWrapper $size={size} $speed={speed} $color={color}>
      <div className="newtons-cradle">
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Center the loader in its parent */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px; /* Minimum breathing room */

  .newtons-cradle {
    --uib-size: ${(props) => props.$size}px;
    --uib-speed: ${(props) => props.$speed}s;
    --uib-color: ${(props) => props.$color};
    
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--uib-size);
    height: var(--uib-size);
  }

  .newtons-cradle__dot {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    width: 25%;
    transform-origin: center top;
  }

  .newtons-cradle__dot::after {
    content: '';
    display: block;
    width: 100%;
    height: 25%;
    border-radius: 50%;
    
    /* 3D Effect using Gradient */
    background: radial-gradient(
      circle at 30% 30%, 
      #ffffff 0%, 
      var(--uib-color) 30%, 
      var(--uib-color) 100%
    );
    
    /* Subtle shadow for depth */
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  }

  .newtons-cradle__dot:first-child {
    animation: swing var(--uib-speed) linear infinite;
  }

  .newtons-cradle__dot:last-child {
    animation: swing2 var(--uib-speed) linear infinite;
  }

  @keyframes swing {
    0% {
      transform: rotate(0deg);
      animation-timing-function: ease-out;
    }
    25% {
      transform: rotate(70deg);
      animation-timing-function: ease-in;
    }
    50% {
      transform: rotate(0deg);
      animation-timing-function: linear;
    }
  }

  @keyframes swing2 {
    0% {
      transform: rotate(0deg);
      animation-timing-function: linear;
    }
    50% {
      transform: rotate(0deg);
      animation-timing-function: ease-out;
    }
    75% {
      transform: rotate(-70deg);
      animation-timing-function: ease-in;
    }
  }
`;

export default Loader;