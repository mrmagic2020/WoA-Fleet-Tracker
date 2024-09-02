const availableFleetImages = [
  "A19N",
  "A20N",
  "A21N",
  "A21NX",
  "A35K",
  "A318",
  "A319",
  "A320",
  "A321",
  "A321F",
  "A359",
  "B78X",
  "B463",
  "B463F",
  "B788",
  "B789",
  "BCS1",
  "BCS3",
  "DH8B",
  "DH8C",
  "DH8D"
];

function IsFleetImageAvailable(ac_model: string): boolean {
  return availableFleetImages.includes(ac_model);
}

function FetchFleetImage(ac_model: string): string {
  if (!IsFleetImageAvailable(ac_model)) {
    return "/assets/aircraft/placeholder.png";
  }

  return `/assets/aircraft/${ac_model}.jpeg`;
}

export default FetchFleetImage;
