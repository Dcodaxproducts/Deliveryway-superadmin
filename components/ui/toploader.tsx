"use client";

import NextTopLoader from "nextjs-toploader";

const TopLoader = () => {
  const primaryColor = "#CE181B";

  return (
    <NextTopLoader
      color={primaryColor}
      initialPosition={0.08}
      crawlSpeed={200}
      height={2}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow={`0 0 10px ${primaryColor}, 0 0 5px ${primaryColor}`}
    />
  );
};

export default TopLoader;
