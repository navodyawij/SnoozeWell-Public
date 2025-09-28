// Map of keywords to their corresponding image paths
const keywordImageMap = {
  'bedtime yoga': new URL('../assets/keywords/Bedtime Yoga.jpg', import.meta.url).href,
  'body scan': new URL('../assets/keywords/Body Scan.jpg', import.meta.url).href,
  'breathing': new URL('../assets/keywords/Breathing.jpg', import.meta.url).href,
  'caffeine': new URL('../assets/keywords/Caffeine.jpg', import.meta.url).href,
  'dark': new URL('../assets/keywords/Dark.jpg', import.meta.url).href,
  'meditation': new URL('../assets/keywords/Meditaion.jpg', import.meta.url).href,
  'morning yoga': new URL('../assets/keywords/Morning Yoga.jpg', import.meta.url).href,
  'relaxation': new URL('../assets/keywords/Relaxation.jpg', import.meta.url).href,
  'screen': new URL('../assets/keywords/Screen.jpg', import.meta.url).href,
  'sleep': new URL('../assets/keywords/Sleep.jpg', import.meta.url).href,
  'yoga': new URL('../assets/keywords/Yoga.jpg', import.meta.url).href,
  'workout': new URL('../assets/keywords/Workout.jpg', import.meta.url).href,
  'bodyweight': new URL('../assets/keywords/Bodyweight.jpg', import.meta.url).href,
  'dance': new URL('../assets/keywords/Dance.jpg', import.meta.url).href,
  'run': new URL('../assets/keywords/Run.jpg', import.meta.url).href,
  'core': new URL('../assets/keywords/Core.jpg', import.meta.url).href,
  'cycling': new URL('../assets/keywords/Cycling.jpg', import.meta.url).href,
  'hike': new URL('../assets/keywords/Hike.jpg', import.meta.url).href,
  'low': new URL('../assets/keywords/Low.jpg', import.meta.url).href,
  'walk': new URL('../assets/keywords/Walk.jpg', import.meta.url).href,
  'stretching': new URL('../assets/keywords/Stretching.jpg', import.meta.url).href,
  'strength': new URL('../assets/keywords/Strength.jpg', import.meta.url).href,
  'hiit': new URL('../assets/keywords/HIIT.jpg', import.meta.url).href,
  'cardio': new URL('../assets/keywords/Cardio.jpg', import.meta.url).href,
  'mindfulness': new URL('../assets/keywords/Mindfulness.jpg', import.meta.url).href,
  'noise': new URL('../assets/keywords/Noise.jpg', import.meta.url).href,
  'salutations': new URL('../assets/keywords/Salutations.jpg', import.meta.url).href,
};

/**
 * Finds a matching image for an exercise title based on keywords
 * @param {string} title - The exercise title to match
 * @returns {string} - The path to the matching image or a placeholder URL
 */
export function findMatchingImage(title) {
  if (!title) return 'https://placehold.co/400x300';
  
  const normalizedTitle = title.toLowerCase();
  
  // First try exact matches (for compound keywords)
  for (const [keyword, imagePath] of Object.entries(keywordImageMap)) {
    if (normalizedTitle.includes(keyword)) {
      return imagePath;
    }
  }
  
  // Then try individual word matches
  const words = normalizedTitle.split(/\s+/);
  for (const word of words) {
    if (keywordImageMap[word]) {
      return keywordImageMap[word];
    }
  }
  
  return 'https://placehold.co/400x300';
} 