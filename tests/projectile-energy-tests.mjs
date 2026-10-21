import assert from 'node:assert/strict';
import {drawProjectileEnergy,projectileProfile} from '../dist/src/render/projectile-energy.js';
function capture(shot,time,reduced=false,profile={}){
 const calls=[];let balance=0;
 const ctx=new Proxy({globalAlpha:1,createLinearGradient(...args){calls.push(['gradient',...args]);return {addColorStop(){}};},save(){balance++;},restore(){balance--;assert(balance>=0);}}, {get(target,key){if(key in target)return target[key];return (...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),key);calls.push([key,...args]);};}});
 const position=Object.freeze({x:345,y:220});
 for(const layer of ['back','front'])drawProjectileEnergy(ctx,shot,position,time,{layer,reduced,profile});assert.equal(balance,0);return calls;
}
const shots=[['goku','beam'],['goku_blue','instantblue'],['vegeta','final'],['vegeta','volley'],['broly','roar'],['piccolo','special'],['piccolo','hellzone'],['naruto','shuriken'],['gojo','purple'],['sasuke','fireball'],['gogeta','bigbang'],['luffy','redhawk'],['frieza','saucers'],['frieza','supernova'],['gaara','sandstream'],['yugi','card'],['yugi','magic'],['beerus','destruction']];
const originalRandom=Math.random;Math.random=()=>{throw new Error('Visual effects must not consume randomness');};
try{for(const [id,kind] of shots){const shot=Object.freeze({id,kind,ownerUid:id+'-1',x:345,y:248,vx:400,vy:120,life:1.5,damage:100});const before=JSON.stringify(shot),a=capture(shot,2),paused=capture(shot,2),animated=capture(shot,2.17);assert.equal(JSON.stringify(shot),before);assert.deepEqual(a,paused);assert.notDeepEqual(a,animated);assert(capture(shot,2,true).length<=a.length);assert(projectileProfile(shot).radius>0);}
 for(const [vx,vy] of [[0,0],[0,400],[-400,0],[500,-300]])capture(Object.freeze({id:'beerus',kind:'ultimate',vx,vy}),3,false,{radius:55,length:1400,shape:'beam',lightning:4});
}finally{Math.random=originalRandom;}
console.log('Projectile energy passed:14 palettes, beam/orb/disc/card/sand/wind, animation/pause determinism, no RNG/shot mutation, reduced effects, zero/reversed velocities and Ultimate sizes.');
