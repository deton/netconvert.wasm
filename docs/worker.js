import loadWASM from './netconvert.js';

onmessage = async function (ev) {
  const [options, file, outputFileName] = ev.data;

  // create new instance each time to use fresh static/global variables
  const Module = await loadWASM({
    print,
    printErr: print,
  });
  if (!Module.FS.analyzePath('/work').exists) {
    Module.FS.mkdir('/work');
  }
  Module.FS.mount(Module.FS.filesystems.WORKERFS, { files: [file] }, '/work');

  if (Module.FS.analyzePath(outputFileName).exists) {
    Module.FS.unlink(outputFileName);
  }
  try {
    Module.callMain(options);

    const output = Module.FS.readFile(outputFileName, { encoding: 'binary' });
    if (outputFileName.endsWith('.gz')) {
      postMessage(output.buffer, [output.buffer]);
    } else {
      // gzip output (Uint8Array)
      const readableStream = new Blob([output]).stream();
      const compressedReadableStream = readableStream.pipeThrough(
        new CompressionStream('gzip')
      );
      const compressedResponse = await new Response(compressedReadableStream);
      const buf = await compressedResponse.arrayBuffer();
      postMessage(buf, [buf]);
    }
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
