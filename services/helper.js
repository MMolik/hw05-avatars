const fs = require("fs").promises;
const Jimp = require("jimp");

const isAccessible = (path) =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);

const setupFolder = async (path) => {
  const folderExist = await isAccessible(path);
  if (!folderExist) {
    try {
      await fs.mkdir(path, { recursive: true });
    } catch (error) {
      console.log("No permissions!");
      process.exit(1);
    }
  }
};

const MAX_AVATAR_WIDTH = 250;
const MAX_AVATAR_HEIGHT = 250;

const isImageAndTransform = async (path) =>
  new Promise((resolve) => {
    Jimp.read(path, async (error, image) => {
      if (error) resolve(false);

      try {
        await image
          .rotate(360)
          .resize(MAX_AVATAR_WIDTH, MAX_AVATAR_HEIGHT)
          .writeAsync(path);
        resolve(true);
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  });

module.exports = { setupFolder, isImageAndTransform };
