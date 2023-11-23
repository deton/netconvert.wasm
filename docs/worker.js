import loadWASM from './netconvert.js';
const Module = await loadWASM({
  print,
  printErr: print,
});

onmessage = async function (ev) {
  let [options, file] = ev.data;

  Module.FS.mkdir('/work');
  Module.FS.mount(Module.FS.filesystems.WORKERFS, { files: [file] }, '/work');

  const inputFile = `/work/${file.name}`;
  const outputFile = 'output.net.xml';
  options = [
    ...options,
    '--osm', inputFile,
    '-o', outputFile,
  ];

  if (Module.FS.analyzePath(outputFile).exists) {
    Module.FS.unlink(outputFile);
  }
  try {
    Module.callMain(options);

    const output = Module.FS.readFile(outputFile, { encoding: 'binary' });
    postMessage(output.buffer, [output.buffer]);
  } catch (err) {
    console.error(err);
    print(err.message);
  }
};

function print(text) {
  postMessage(text);
}

