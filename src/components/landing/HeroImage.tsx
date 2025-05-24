
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HeroImage = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg sm:shadow-xl">
      <AspectRatio ratio={16 / 9} className="bg-muted">
        <img
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1170&auto=format&fit=crop"
          alt="Student taking exam on laptop"
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </AspectRatio>
    </div>
  );
};

export default HeroImage;
