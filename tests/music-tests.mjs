import assert from 'node:assert/strict';
import {ArenaMusic} from '../dist/src/music.js';
class Audio{constructor(url){this.url=url;this.paused=true;this.currentTime=0;this.volume=1;this.playbackRate=1;this.calls=0;}play(){this.calls++;this.paused=false;return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){}load(){}}
const instances=[],music=new ArenaMusic({track:'limit_break',factory:url=>{const a=new Audio(url);instances.push(a);return a;}});
const d={result:null,personalUltimate:{cinematic:null},teamUltimate:null},before=JSON.stringify(d);
music.update(d,false);assert.equal(instances.length,0,'no autoplay before battle');music.unlock();music.update(d,true);await Promise.resolve();const a=instances[0];assert(a.loop);assert.equal(a.playbackRate,1);assert.equal(a.volume,.18);assert.equal(a.calls,1);
for(let i=0;i<10;i++)music.update(d,true);assert.equal(a.calls,1,'one play request');a.currentTime=32;music.pause();assert(a.paused);assert.equal(a.currentTime,32);music.unlock();music.update(d,true);await Promise.resolve();assert.equal(a.currentTime,32);
music.setVolume(.4);d.personalUltimate.cinematic={};music.update(d,true);assert.equal(a.volume,.12);d.personalUltimate.cinematic=null;music.update(d,true);assert.equal(a.volume,.4);
music.setVolume(0);assert.equal(a.volume,0);music.setVolume(9);assert.equal(music.volume,1);music.setVolume('bad');assert.equal(music.volume,.18);
music.reset();assert(a.paused);assert.equal(a.currentTime,0);music.setTrack('off');music.update(d,true);assert.equal(instances.length,1);music.setTrack('limit_break');music.update(d,true);await Promise.resolve();assert.equal(instances.length,2);d.result='winner';music.update(d,true);assert(instances[1].paused);d.result=null;assert.equal(JSON.stringify(d),before,'music never changes match state');
let failures=0;const blocked=new ArenaMusic({factory:()=>({paused:true,volume:0,play(){failures++;return Promise.reject(new Error('autoplay'));},pause(){}})});
blocked.update(d,true);await new Promise(r=>setTimeout(r,0));blocked.update(d,true);assert.equal(failures,1,'no autoplay-error retry storm');blocked.unlock();blocked.update(d,true);await new Promise(r=>setTimeout(r,0));assert.equal(failures,2,'new user gesture permits retry');
console.log('Music passed: lazy start, loop, independent volume, pause/resume/reset/result/off, Ultimate ducking, autoplay rejection and immutable simulation.');

const queue=[],shuffle=new ArenaMusic({track:'random',factory:url=>{const a=new Audio(url);queue.push(a);return a;}});
shuffle.update(d,true);await new Promise(r=>setTimeout(r,0));assert(!queue[0].loop);const oldEnd=queue[0].onended;oldEnd();await new Promise(r=>setTimeout(r,0));assert.equal(queue.length,2);assert.notEqual(queue[0].url,queue[1].url);assert.equal(queue[1].volume,.18);
shuffle.pause();queue[1].onended();assert.equal(queue.length,2,'no auto-resume while paused');shuffle.update(d,true);assert.equal(queue.length,3);shuffle.setTrack('off');oldEnd();assert.equal(queue.length,3,'stale ended event ignored');
console.log('Playlist passed: Godbreaker, random consecutive tracks, no immediate repeat, volume, pause and stale-event protection.');
