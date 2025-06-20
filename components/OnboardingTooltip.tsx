"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import "@/app/onboarding.css";

interface OnboardingTooltipProps {
  step: number;
  totalSteps: number;
  targetId: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isVisible: boolean;
  showOverlay?: boolean;
  forcePosition?: boolean; // If true, will try to force the specified position
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  step,
  totalSteps,
  targetId,
  title,
  description,
  position = "bottom",
  onNext,
  onPrev,
  onSkip,
  isVisible,
  showOverlay = true,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate position based on the target element
  useEffect(() => {
    if (!isVisible) return;
    
    const targetElement = document.getElementById(targetId);
    if (!targetElement || !tooltipRef.current) return;

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    // Calculate position based on available space
    // Prefer the specified position, but adjust if there's not enough space
    const spaceRight = viewportWidth - targetRect.right;
    const spaceLeft = targetRect.left;
    const spaceTop = targetRect.top;
    const spaceBottom = viewportHeight - targetRect.bottom;
    
    let actualPosition = position;
    
    // Check if the preferred position has enough space, otherwise choose another side
    if (position === "right" && spaceRight < tooltipRect.width + 20) {
      actualPosition = spaceLeft > tooltipRect.width + 20 ? "left" : 
                       spaceBottom > tooltipRect.height + 20 ? "bottom" : "top";
    } else if (position === "left" && spaceLeft < tooltipRect.width + 20) {
      actualPosition = spaceRight > tooltipRect.width + 20 ? "right" : 
                       spaceBottom > tooltipRect.height + 20 ? "bottom" : "top";
    } else if (position === "top" && spaceTop < tooltipRect.height + 20) {
      actualPosition = spaceBottom > tooltipRect.height + 20 ? "bottom" : 
                       spaceRight > tooltipRect.width + 20 ? "right" : "left";
    } else if (position === "bottom" && spaceBottom < tooltipRect.height + 20) {
      actualPosition = spaceTop > tooltipRect.height + 20 ? "top" : 
                       spaceRight > tooltipRect.width + 20 ? "right" : "left";
    }

    // Position the tooltip based on the adjusted position
    switch (actualPosition) {
      case "top":
        top = targetRect.top - tooltipRect.height - 12;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + 12;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - 12;
        break;
      default:  // bottom
        top = targetRect.bottom + 12;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    }

    // Ensure tooltip stays within viewport
    if (left < 20) left = 20;
    if (left + tooltipRect.width > viewportWidth - 20) {
      left = viewportWidth - tooltipRect.width - 20;
    }
    if (top < 20) top = 20;
    if (top + tooltipRect.height > viewportHeight - 20) {
      top = viewportHeight - tooltipRect.height - 20;
    }

    // Add window scroll positions
    top += window.scrollY;
    left += window.scrollX;
    
    // Handle large screens with fixed width layouts
    const mainContent = document.querySelector('.max-w-7xl');
    if (mainContent) {
      const mainContentRect = mainContent.getBoundingClientRect();
      const mainContentWidth = mainContentRect.width;
      
      // If we're on a large screen with a centered content area
      if (mainContentWidth < viewportWidth && targetElement.closest('.max-w-7xl')) {
        // Check if tooltip would overflow the main content
        if (left + tooltipRect.width > mainContentRect.right - 20) {
          left = mainContentRect.right - tooltipRect.width - 20;
        }
        
        // Ensure it doesn't go off the left edge of the main content either
        if (left < mainContentRect.left + 20) {
          left = mainContentRect.left + 20;
        }
      }
      
      // For the sidebar case (API Key link), handle differently
      if (targetId === "api-key-link") {
        // Position the tooltip to fit within the viewport without overlapping main content too much
        if (left + tooltipRect.width > mainContentRect.left) {
          // If there's enough space on the right of the target, place it there
          // otherwise position it more conservatively
          const rightSpace = viewportWidth - targetRect.right;
          if (rightSpace > tooltipRect.width + 40) {
            left = targetRect.right + 12;
          } else {
            left = Math.min(left, mainContentRect.left - tooltipRect.width - 12);
          }
        }
      }
    }

    setTooltipPosition({ top, left });
    
    // Highlight the target element with a more pronounced effect using CSS classes
    targetElement.classList.add('target-highlight');
    targetElement.classList.add('target-highlight-pulse');
    
    // If this is the API key link, make it even more prominent
    if (targetId === "api-key-link") {
      targetElement.classList.add('api-key-highlight');
    }
    
    return () => {
      // Clean up the CSS classes
      targetElement.classList.remove('target-highlight');
      targetElement.classList.remove('target-highlight-pulse');
      
      if (targetId === "api-key-link") {
        targetElement.classList.remove('api-key-highlight');
      }
    };
  }, [targetId, position, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Semi-transparent overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                width: '100vw',
                height: '100vh'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              position: "fixed", // Changed from absolute to fixed for better positioning on all screens
              zIndex: 60,
              maxWidth: "calc(100vw - 40px)", // Ensure it doesn't overflow viewport width
            }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-72 border border-slate-200 dark:border-slate-700"
          >
            {/* Close button */}
            <button 
              onClick={onSkip} 
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Close tooltip"
            >
              <X size={16} />
            </button>
            
            {/* Content */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-center mb-3">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 mx-0.5 rounded-full ${
                    i === step ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPrev} 
                disabled={step === 0}
                className="px-3"
              >
                Back
              </Button>
              <Button
                variant="default" 
                size="sm" 
                onClick={onNext}
                className="px-3"
              >
                {step === totalSteps - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTooltip;
