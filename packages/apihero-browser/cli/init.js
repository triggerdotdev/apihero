/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { until } = require("@open-draft/until");
const inquirer = require("inquirer");
const invariant = require("./invariant");
const { SERVICE_WORKER_BUILD_PATH } = require("../config/constants");

const CWD = process.cwd();

module.exports = async function init(args) {
  const { publicDir, save } = args;

  // When running as a part of "postinstall" script, "cwd" equals the library's directory.
  // The "postinstall" script resolves the right absolute public directory path.
  const absolutePublicDir = path.isAbsolute(publicDir)
    ? publicDir
    : path.resolve(CWD, publicDir);
  const relativePublicDir = path.relative(CWD, absolutePublicDir);
  const dirExists = fs.existsSync(absolutePublicDir);

  if (!dirExists) {
    // Try to create the directory if it doesn't exist
    const { error: createDirectoryError } = await until(() =>
      fs.promises.mkdir(absolutePublicDir, { recursive: true })
    );
    invariant(
      createDirectoryError == null,
      'Failed to create a Service Worker at "%s": directory does not exist and could not be created.\nMake sure to include a relative path to the root directory of your server.\n\nSee the original error below:\n%s',
      absolutePublicDir,
      createDirectoryError
    );
  }

  console.log(
    'Initializing the API Hero Service Worker at "%s"...',
    absolutePublicDir
  );

  const serviceWorkerFilename = path.basename(SERVICE_WORKER_BUILD_PATH);
  const swDestFilepath = path.resolve(absolutePublicDir, serviceWorkerFilename);

  fs.copyFileSync(SERVICE_WORKER_BUILD_PATH, swDestFilepath);

  console.log(`
${chalk.green("Service Worker successfully created!")}
${chalk.gray(swDestFilepath)}
`);

  const packageJsonPath = path.resolve(CWD, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const { apihero: apiheroConfig } = packageJson;

  if (apiheroConfig && apiheroConfig.workerDirectory === relativePublicDir) {
    return;
  }

  // When called `msw init --no-save` do not show the save suggestions.
  if (save === false) {
    return;
  }

  if (!apiheroConfig) {
    console.log(`\
${chalk.cyan("INFO")} In order to ease the future updates to the worker script,
we recommend saving the path to the worker directory in your package.json.
        `);

    if (save) {
      return saveWorkerDirectory(packageJsonPath, relativePublicDir);
    }

    return promptWorkerDirectoryUpdate(
      `Do you wish to save "${relativePublicDir}" as the worker directory?`,
      packageJsonPath,
      relativePublicDir
    );
  }

  if (apiheroConfig.workerDirectory !== relativePublicDir) {
    console.log(
      `\
${chalk.yellowBright(
  "WARN"
)} The "apihero.workerDirectory" in your package.json ("%s")
is different from the worker directory used right now ("%s").
    `,
      apiheroConfig.workerDirectory,
      relativePublicDir
    );

    if (save) {
      return saveWorkerDirectory(packageJsonPath, relativePublicDir);
    }

    return promptWorkerDirectoryUpdate(
      `Do you wish to use "${relativePublicDir}" instead of "${apiheroConfig.workerDirectory}" as the worker directory?`,
      packageJsonPath,
      relativePublicDir
    );
  }
};

function saveWorkerDirectory(packageJsonPath, publicDir) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  console.log(
    chalk.gray('Writing "apihero.workerDirectory" to "%s"...'),
    packageJsonPath
  );

  const nextPackageJson = Object.assign({}, packageJson, {
    apihero: {
      workerDirectory: publicDir,
    },
  });

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(nextPackageJson, null, 2),
    "utf8"
  );
}

function promptWorkerDirectoryUpdate(message, packageJsonPath, publicDir) {
  return inquirer
    .prompt({
      type: "confirm",
      name: "saveWorkerDirectory",
      prefix: chalk.yellowBright("?"),
      message,
    })
    .then((answers) => {
      if (!answers.saveWorkerDirectory) {
        return;
      }

      saveWorkerDirectory(packageJsonPath, publicDir);
    });
}
