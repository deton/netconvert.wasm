import loadWASM from './osmconvert.js';

onmessage = async function (ev) {
  const [options, files, outputFileName] = ev.data;

  // create new instance each time to use fresh static/global variables
  const Module = await loadWASM({
    print,
    printErr: print,
  });
  Module.FS.mkdir('/work');
  Module.FS.mount(Module.FS.filesystems.WORKERFS, { files: files }, '/work');

  if (Module.FS.analyzePath(outputFileName).exists) {
    Module.FS.unlink(outputFileName);
  }
  try {
    Module.callMain(options);
    const output = Module.FS.readFile(outputFileName, { encoding: 'binary' });
    postMessage(output.buffer, [output.buffer]);
  } catch (err) {
    console.error(err);
    print(err.message);
  } finally {
    Module.FS.unmount('/work');
  }
};

function print(text) {
  postMessage(text);
}
