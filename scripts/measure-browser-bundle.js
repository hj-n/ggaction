import { measureMinimalBrowserBundle } from "./browser-bundle-size.js";
import { preparePackageConsumer } from "./package-consumer.js";

const consumer = await preparePackageConsumer();
try {
  const measurement = await measureMinimalBrowserBundle(consumer.directory);
  process.stdout.write(`${JSON.stringify({
    package: `${consumer.installedManifest.name}@${consumer.installedManifest.version}`,
    source: consumer.artifact.filename,
    ...measurement
  }, null, 2)}\n`);
} finally {
  await consumer.cleanup();
}
