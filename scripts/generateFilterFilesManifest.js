import { readdir, writeFile } from "fs/promises";
import { resolve } from "path";

const publicDataPath = resolve("public/data");
const manifestPath = resolve("public/data/manifest.json");
const excludedFiles = ["manifest.json", "filterTabs.json"];

const generateManifest = async () => {
  try {
    // Read the contents of the public/data folder
    const files = await readdir(publicDataPath);

    // Filter out excluded files
    const filteredFiles = files.filter((file) => !excludedFiles.includes(file));

    // Create a manifest object
    const manifest = { data: filteredFiles };

    // Write the manifest to the manifest.json file
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // eslint-disable-next-line no-console
    console.log("Manifest file generated successfully.");
  } catch (err) {
    console.error("Error:", err.message);
  }
};

generateManifest();
