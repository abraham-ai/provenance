const fs = require("fs");
const jsyaml = require("js-yaml");
const mustache = require("mustache");
const graph = require("@graphprotocol/graph-cli/src/cli");

const network = process.argv.slice(2)[0];

if (!network) {
  console.log("Error: network undefined");
  process.exit(1);
}

console.log("Network:", network);

const config = JSON.parse(fs.readFileSync(`src/networks/${network}.json`));

if (!config) {
  console.log("Error: missing config file");
  process.exit(1);
}

function writeSubgraph() {
  const subgraphPath = "subgraph.yaml";

  // Delete subgraph.yaml if exists
  fs.rmSync(subgraphPath, { force: true });

  // Write new subgraph.yaml from config
  console.log('123', config)
  try {
    fs.writeFileSync(
      subgraphPath,
      mustache
        .render(fs.readFileSync("subgraph.template.yaml").toString(), config)
        .toString()
    );
  } catch (e) {
    console.log("Error writing subgraph.yaml", e);
  }

  console.log("Wrote subgraph.yaml ✅");
}

// Sanity check to ensure that all functions exported from mapping files are defined in subgraph.yaml
function checkHandlers() {
  let mappings = {};

  function recursiveReadDirSync(dir) {
    const items = fs.readdirSync(dir);
    items.forEach((x) => {
      const path = dir + "/" + x;
      x.endsWith(".ts")
        ? (mappings[path] = fs.readFileSync(path).toString())
        : recursiveReadDirSync(path);
    });
  }

  recursiveReadDirSync("./src/mappings");

  const subgraph = fs.readFileSync("subgraph.yaml").toString();

  const tofind = "\nexport function";
  const mappingHandlers = {};

  // Map names of all handlers in mapping file to file path
  Object.keys(mappings).forEach((key) => {
    // Indexes of all instances of "export function"
    const indexes = [...mappings[key].matchAll(new RegExp(tofind, "g"))].map(
      (x) => x.index
    );

    mappingHandlers[key] = indexes.map((i) => {
      const startIndex = i + tofind.length + 1;
      return mappings[key].substring(startIndex, startIndex + 50).split("(")[0];
    });
  });

  const sources = [
    ...jsyaml.load(subgraph)["dataSources"],
    // ...jsyaml.load(subgraph)["templates"],
  ];

  let success = true;

  Object.keys(mappingHandlers).forEach((key) => {
    process.stdout.write(`Checking ${key}...`);

    const src = sources.find((d) => d.mapping.file === key);

    const handlerNames = [];

    src.mapping.eventHandlers.forEach((h) => handlerNames.push(h.handler));

    const missingHandlers = [];

    mappingHandlers[key].forEach((h) => {
      if (!handlerNames.includes(h)) missingHandlers.push(h);
    });

    if (missingHandlers.length) {
      missingHandlers.forEach((x) =>
        process.stdout.write(
          `\n 🛑 Missing reference in subgraph template to "${key}": ${x}\n`
        )
      );
      success = false;
    } else {
      process.stdout.write(` ✅ \n`);
    }
  });

  if (!success) {
    console.log("Exiting due to missing handlers");
    process.exit(1);
  }
}

writeSubgraph();
checkHandlers();

graph.run("codegen");
