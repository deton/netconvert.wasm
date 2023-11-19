import loadWASM from './netconvert.js';

const fileInput = document.querySelector('[type=file]');
const lefthandCheckbox = document.querySelector('[name=lefthand]');
const pre = document.querySelector('pre');
const outputTextarea = document.getElementById('output');
outputTextarea.value = ''; // clear browser cache

const inputFile = 'input.osm.xml';
const outputFile = 'output.net.xml';

let buffer;

function print(text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
  // These replacements are necessary if you render to raw HTML
  //text = text.replace(/&/g, "&amp;");
  //text = text.replace(/</g, "&lt;");
  //text = text.replace(/>/g, "&gt;");
  //text = text.replace('\n', '<br>', 'g');
  console.log(text);
  outputTextarea.value += text + "\n";
  outputTextarea.scrollTop = outputTextarea.scrollHeight; // focus on bottom
}

const Module = await loadWASM({
  print,
  printErr: print,
});

const process = async (buffer) => {
  Module.FS.writeFile(inputFile, new Uint8Array(buffer));
  if (Module.FS.analyzePath(outputFile).exists) {
    Module.FS.unlink(outputFile);
  }
  try {
    const options = [
      '--osm', inputFile,
      '-o', outputFile,
      // recommended options
      // https://sumo.dlr.de/docs/Networks/Import/OpenStreetMap.html#recommended_netconvert_options
      '--geometry.remove', '--ramps.guess', '--junctions.join',
      '--tls.guess-signals', '--tls.discard-simple', '--tls.join',
      '--tls.default-type', 'actuated',
    ];
    if (lefthandCheckbox.checked) {
      options.push('--lefthand');
    }
    pre.textContent = `netconvert ${options.join(' ')}`;
    Module.callMain(options);

    print('Downloading...');
    const output = Module.FS.readFile(outputFile, { encoding: 'binary' });
    const file = new File([output], outputFile);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    console.error(err);
    print(err.message);
  }
};

fileInput.addEventListener('change', async () => {
  const file = await fileInput.files[0];
  buffer = await file.arrayBuffer();
  await process(buffer);
  fileInput.value = '';
});

