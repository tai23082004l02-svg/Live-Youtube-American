// Keep complete native dialogue art in a compact lower-screen overlay.
const LAYOUTS={gojo:[.65,220],ultra:[.85,180],ichigo:[.48,294],jinwoo:[.61,254],saber:[.65,241],tatsumaki:[.63,247],boa:[.65,241]};
export function beginBottomDialogue(ctx,theme='ultra'){const [scale,top]=LAYOUTS[theme]||LAYOUTS.ultra;ctx.save();ctx.translate(480*(1-scale),top);ctx.scale(scale,scale);}
