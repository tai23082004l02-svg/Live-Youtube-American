export {BROLY_SPRITE,brolyCastFrame,brolyMuzzle,shotSocket} from '../characters/broly.js';
export {piccoloPose,piccoloShotSocket} from '../characters/piccolo.js';
export {narutoPose,narutoShotSocket} from '../characters/naruto.js';
export function shotScreenPosition(s,socket){if(!socket)return {x:s.x,y:s.y-28};const traveled=Math.max(0,(socket.initialLife-s.life)*Math.hypot(s.vx,s.vy)),weight=Math.max(0,1-traveled/socket.blendDistance);return {x:s.x+socket.dx*weight,y:s.y-28+socket.dy*weight};}

