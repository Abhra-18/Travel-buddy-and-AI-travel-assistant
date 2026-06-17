/**
 * A curated engine for high-quality destination imagery.
 * Uses robust Unsplash source URLs for specific cities/regions,
 * and falls back to a curated list of generic travel/nature photos.
 */

const destinationImages = {
  // Asia
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  bangkok: 'https://images.unsplash.com/photo-1583307843818-5a6767ebc238?auto=format&fit=crop&w=1200&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
  seoul: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',

  // Europe
  paris: 'https://images.unsplash.com/photo-1502602898657-3e907a5ea82c?auto=format&fit=crop&w=1200&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  venice: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1517736996303-4e84a5507b79?auto=format&fit=crop&w=1200&q=80',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  swiss: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?auto=format&fit=crop&w=1200&q=80',

  // Americas
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  losangeles: 'https://images.unsplash.com/photo-1515896769750-31548ea180ed?auto=format&fit=crop&w=1200&q=80',
  hawaii: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80',
  cancun: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=1200&q=80',
  rio: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',

  // Oceania
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
  newzealand: 'https://images.unsplash.com/photo-1469521669194-babbdf9ff939?auto=format&fit=crop&w=1200&q=80',

  // Africa
  capetown: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80',
  safari: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
};

const genericImages = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80', // Boat / lake
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80', // Mountain hike
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80', // Airplane wing
  'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=1200&q=80', // Map and camera
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', // Beach
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80', // Sunset city
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80', // Road trip
];

/**
 * Returns a high-quality image URL based on a destination string.
 * Uses a simple keyword match to find curated images.
 * @param {string} destination 
 * @returns {string} Unsplash image URL
 */
export const getDestinationImage = (destination) => {
  if (!destination) return genericImages[0];

  const lowerDest = destination.toLowerCase().replace(/[^a-z]/g, '');
  
  // Try exact match in curated list
  const matchKey = Object.keys(destinationImages).find(key => lowerDest.includes(key));
  
  if (matchKey) {
    return destinationImages[matchKey];
  }

  // Fallback: Use string hash to predictably pick from generic pool so it stays consistent per trip
  let hash = 0;
  for (let i = 0; i < lowerDest.length; i++) {
    hash = lowerDest.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % genericImages.length;
  
  return genericImages[index];
};
