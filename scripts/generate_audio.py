"""Original deterministic synthesized sounds. No sampled or third-party recordings."""
import wave,math,random,struct,json
from pathlib import Path
out=Path('src/assets/generated');out.mkdir(parents=True,exist_ok=True)
rate=22050
rng=random.Random(9)
def write(name,samples):
 with wave.open(str(out/name),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(struct.pack('<h',max(-32767,min(32767,int(v*32767)))) for v in samples))
cues={'confirm':(660,.18),'shot':(95,.18),'hit':(310,.18),'dry':(180,.12),'power':(150,.8),'detect':(720,.5),'damage':(65,.32),'tow':(220,.32),'connect':(440,.65),'ignite':(80,.8),'boost':(120,.5),'complete':(880,.8),'step':(90,.12),'radio':(1100,.17)}
samples=[];sprites={}
for name,(freq,length) in cues.items():
 start=len(samples)/rate*1000
 for i in range(int(rate*length)):
  t=i/rate;env=(1-t/length)**2
  noise=rng.uniform(-1,1)
  tone=math.sin(2*math.pi*(freq*t+(freq*.4*t*t)))
  value=(noise*.45 if name in ['shot','step','damage','ignite'] else noise*.02)+tone*.22
  samples.append(value*env)
 sprites[name]=[round(start),round(length*1000)];samples.extend([0]*int(rate*.08))
write('cues.wav',samples)
for name,freq in [('ambient',55),('alert',73.416),('escape',110)]:
 samples=[];smooth=0
 for i in range(rate*6):
  t=i/rate;smooth=.97*smooth+.03*rng.uniform(-1,1)
  gate=.4+.6*math.sin(math.pi*t/6)**2
  tone=(math.sin(2*math.pi*freq*t)*.07+math.sin(2*math.pi*freq*1.5*t)*.035)*gate
  pulse=(.7+.3*math.sin(2*math.pi*2*t)) if name!='ambient' else 1
  samples.append((tone*pulse+smooth*.35)*min(1,t*5,(6-t)*5))
 write(name+'.wav',samples)
(out/'audio-sprites.json').write_text(json.dumps(sprites,indent=2))
(out/'audio.metadata.json').write_text(json.dumps({'source':'Original local synthesis','generator':'scripts/generate_audio.py','license':'CC0-1.0','sampleRate':rate,'channels':1,'seed':9,'files':['cues.wav','ambient.wav','alert.wav','escape.wav'],'thirdPartySamples':False},indent=2))
