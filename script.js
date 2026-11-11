const base = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const scenes = [
  {name:'Birds Chirping', sub:'A New Beginning', file:'Birds chirping in a garden.ogg', volume:.74},
  {name:'Gentle Rain', sub:'Softly On The Leaves', file:'Rain.ogg', volume:.48},
  {name:'Breeze', sub:'Through The Trees', file:'20090610 0 ambience.ogg', volume:.63},
  {name:'Bees Buzzing', sub:'Among The Blossoms', file:'Bombus buzz.ogg', volume:.70},
  {name:'Growing Plants', sub:'Reaching For The Light', file:'Swale.ogg', volume:.59},
  {name:'Seeds Awakening', sub:'Beneath The Earth', file:'Cracking peanuts.ogg', volume:.43},
  {name:'Buds Opening', sub:'Petals Unfold', file:'Water sound 02.ogg', volume:.59},
  {name:'Life Beneath The Soil', sub:'The Hidden Spring', file:'Walking-on-gravel-38827.ogg', volume:.49}
];
const wheel = document.querySelector('#spinWheel');
const wheelFace = document.querySelector('#wheelFace');
const hint = document.querySelector('#spinHint');
const soundToggle = document.querySelector('#soundToggle');
const soundText = document.querySelector('#soundText');
const worlds = [...document.querySelectorAll('.world')];
const note = document.querySelector('#audioMessage');
let current=0, spinning=false, rotation=0, enabled=false, activeAudio=null, transitionId=0;
const audioBank = scenes.map(s=>{
  const a = new Audio();
  a.preload='none'; a.loop=true;
  a.src=base+encodeURIComponent(s.file).replace(/%2F/g,'/');
  return a;
});
function message(s){note.textContent=s;if(s)setTimeout(()=>{if(note.textContent===s)note.textContent=''},6000)}
function stopAudio(){transitionId++;audioBank.forEach(a=>{a.pause();a.currentTime=0;a.volume=0;});activeAudio=null}
function playScene(index){
  if(!enabled)return;
  const id=++transitionId;
  const upcoming=audioBank[index];
  const previous=activeAudio;
  activeAudio=upcoming;
  if(previous===upcoming && !upcoming.paused)return;
  upcoming.volume=0;
  upcoming.currentTime=0;
  upcoming.play().then(()=>{
    const fadeStart=performance.now(), duration=720;
    function fade(now){
      if(id!==transitionId)return;
      const n=Math.min(1,(now-fadeStart)/duration);
      upcoming.volume=Math.min(1,scenes[index].volume*n);
      if(previous&&previous!==upcoming){previous.volume=Math.max(0,previous.volume*(1-.17));}
      if(n<1)requestAnimationFrame(fade);
      else if(previous&&previous!==upcoming){previous.pause(); previous.currentTime=0;previous.volume=0;}
    }
    requestAnimationFrame(fade);
  }).catch(()=>message('Tap Sound On to hear this recording. Internet connection needed.'));
}
function activate(index){
  current=(index+scenes.length)%scenes.length;
  worlds.forEach((w,j)=>w.classList.toggle('active',j===current));
  document.querySelector('#sceneName').textContent=scenes[current].name;
  document.querySelector('#sceneMicro').textContent=scenes[current].sub;
  document.querySelector('#preloadStatus').textContent=scenes[current].name;
  playScene(current);
}
function spin(dir=1){
  if(spinning)return;
  spinning=true;
  const step=360/scenes.length;
  rotation+=dir*(720+step);
  wheelFace.style.setProperty('--angle',rotation+'deg');
  hint.textContent='Listen Closely';
  setTimeout(()=>activate(current+dir),850);
  setTimeout(()=>{spinning=false;hint.textContent='Click To Listen ↗'},1850);
}
wheel.addEventListener('click',()=>spin(1));
wheel.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
    e.preventDefault();spin(e.key==='ArrowLeft'?-1:1);
  }
});
soundToggle.addEventListener('click',()=>{
  enabled=!enabled;
  soundToggle.setAttribute('aria-pressed',String(enabled));
  soundToggle.setAttribute('aria-label',enabled?'Disable sound':'Enable sound');
  soundText.textContent=enabled?'Sound On':'Sound Off';
  if(enabled)playScene(current);else stopAudio();
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){stopAudio()}
  else if(enabled){playScene(current)}
});
