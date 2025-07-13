export const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice and keyboard testing.",
  
  "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
  
  "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
  
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
  
  "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little.",
  
  "Yesterday is history, tomorrow is a mystery, but today is a gift. That is why it is called the present. We must learn to live in the moment and appreciate what we have.",
  
  "The art of programming is the skill of controlling complexity. We will never remove the basic complexity, but we can organize it in a way that makes it manageable and understandable.",
  
  "In the beginning was the Word, and the Word was with God, and the Word was God. All things were made through him, and without him was not any thing made that was made.",
  
  "Space: the final frontier. These are the voyages of the starship Enterprise. Its continuing mission: to explore strange new worlds, to seek out new life and new civilizations.",
  
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed: that all men are created equal and endowed with certain unalienable rights.",
  
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it.",
  
  "Life is what happens to you while you're busy making other plans. Every moment is precious, and we should cherish the time we have with our loved ones and pursue our dreams.",
  
  "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference. Sometimes the unconventional path leads to the greatest rewards.",
  
  "The greatest glory in living lies not in never falling, but in rising every time we fall. Resilience and perseverance are the keys to overcoming life's challenges.",
  
  "Innovation distinguishes between a leader and a follower. Those who dare to think differently and challenge the status quo are the ones who change the world for the better.",
  
  "Education is the most powerful weapon which you can use to change the world. Knowledge empowers individuals and communities to break free from the cycles of poverty and ignorance.",
  
  "The journey of a thousand miles begins with one step. Every great achievement starts with a single action, a moment of courage to begin despite uncertainty.",
  
  "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that. We must choose compassion over conflict in our daily lives.",
  
  "Success is not final, failure is not fatal: it is the courage to continue that counts. What matters most is our ability to persist through both triumph and setback.",
  
  "The future belongs to those who believe in the beauty of their dreams. Vision and determination are the foundations upon which extraordinary accomplishments are built.",
  
  "Technology is best when it brings people together. In our digital age, we must remember that human connection and empathy remain more important than any algorithm or device.",
  
  "Climate change is not a distant threat but a present reality. We must act now to protect our planet for future generations through sustainable practices and renewable energy.",
  
  "Democracy is not a spectator sport. It requires active participation from citizens who are informed, engaged, and committed to the principles of equality and justice.",
  
  "Art is not what you see, but what you make others see. Creative expression has the power to inspire, heal, and transform both the artist and the audience.",
  
  "Health is not valued till sickness comes. We must prioritize preventive care, mental wellness, and healthy lifestyle choices to maintain our physical and emotional well-being.",
  
  "Time is the most valuable thing we have, yet we often waste it on trivial matters. Learning to prioritize and focus on what truly matters is essential for a fulfilling life.",
  
  "Friendship is the only cement that will ever hold the world together. Strong relationships built on trust, loyalty, and mutual respect are the foundation of a meaningful existence.",
  
  "Books are a uniquely portable magic. Reading opens our minds to new worlds, perspectives, and possibilities while improving our vocabulary, empathy, and critical thinking skills.",
  
  "Music is the universal language of mankind. It transcends cultural barriers and speaks directly to the human soul, evoking emotions and memories that words alone cannot express.",
  
  "Travel makes one modest. You see what a tiny place you occupy in the world. Exploring different cultures and places broadens our understanding and appreciation of diversity."
];

export function getRandomParagraph(): string {
  const randomIndex = Math.floor(Math.random() * paragraphs.length);
  return paragraphs[randomIndex];
}

export function getRandomParagraphs(count: number): string[] {
  const shuffled = [...paragraphs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, paragraphs.length));
}

export function getParagraphById(id: number): string {
  return paragraphs[id] || paragraphs[0];
}

export function getTotalParagraphCount(): number {
  return paragraphs.length;
}
