export interface IBackgroundImage {
  path: string;
  author?: string;
  organisation?: string;
}

const backgroundImageCount = 4;
const backgroundImages: IBackgroundImage[] = [];

for (let i = 0; i < backgroundImageCount; i++) {
  backgroundImages.push({
    path: `/assets/background/background-${i}.jpeg`
  });
}

backgroundImages[0].author = "World of Airports";
for (let i = 1; i < 4; i++) {
  backgroundImages[i].author = "mrmagic2023";
  backgroundImages[i].organisation = "Magic Airways";
}

export function getRandomBackgroundImage(): IBackgroundImage {
  return backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
}
