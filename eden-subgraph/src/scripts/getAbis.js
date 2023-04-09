const fs = require("fs");

function getAbis() {
  const abiSourcePath = "../contracts/out";
  const abiDestPath = "./src/abis";
  const abis = ["EdenLivemint"];
  abis.map((abi) => {
    const sourcePath = `${abiSourcePath}/${abi}.sol/${abi}.json`;
    const destPath = `${abiDestPath}/${abi}.json`;
    console.log(sourcePath);
    const abiString = fs.readFileSync(sourcePath, "utf8");
    const parsed = JSON.parse(abiString);
    fs.writeFileSync(destPath, JSON.stringify(parsed.abi));
  });
}

getAbis();
