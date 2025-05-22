
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HeroImage = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-xl">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1170&auto=format&fit=crop"
          alt="Driving test illustration"
          className="object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  );
};

export default HeroImage;
