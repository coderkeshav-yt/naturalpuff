
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { SquareAspectRatio } from '@/components/ui/square-aspect-ratio';

interface ImageCarouselProps {
  images: string[];
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

export function ImageCarousel({ 
  images, 
  className = '', 
  aspectRatio = 'square' 
}: ImageCarouselProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Carousel className={`w-full ${className}`}>
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              {aspectRatio === 'square' ? (
                <SquareAspectRatio className="overflow-hidden rounded-lg">
                  <img 
                    src={image} 
                    alt={`Carousel image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </SquareAspectRatio>
              ) : aspectRatio === 'video' ? (
                <div className="relative w-full pt-[56.25%] overflow-hidden rounded-lg">
                  <img 
                    src={image} 
                    alt={`Carousel image ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ) : aspectRatio === 'wide' ? (
                <div className="relative w-full pt-[42.85%] overflow-hidden rounded-lg">
                  <img 
                    src={image} 
                    alt={`Carousel image ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg">
                  <img 
                    src={image} 
                    alt={`Carousel image ${index + 1}`}
                    className="w-full h-auto transition-transform duration-700 hover:scale-105"
                  />
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 md:left-8 bg-white/80 backdrop-blur-sm hover:bg-white" />
      <CarouselNext className="absolute right-4 md:right-8 bg-white/80 backdrop-blur-sm hover:bg-white" />
    </Carousel>
  );
}
