const worker = new Worker('worker.js', {type: 'module'});

worker.onerror = e => {
  console.error(e);
  print(e.message);
};

worker.onmessage = ev => {
  if (typeof ev.data == 'string') {
    print(ev.data);
    return;
  }
  print('Downloading...');
  const file = new File([ev.data], 'output.net.xml.gz');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(a.href);
};

const fileInput = document.querySelector('[type=file]');
const lefthandCheckbox = document.querySelector('[name=lefthand]');
const pre = document.querySelector('pre');
const outputTextarea = document.getElementById('output');
outputTextarea.value = ''; // clear browser cache

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

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  const options = [
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
  worker.postMessage([options, file]);
  fileInput.value = '';
});

