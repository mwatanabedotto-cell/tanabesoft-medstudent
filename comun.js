/* Recursos compartidos: íconos médicos, colores y portadas tipo lámina anatómica */
window.MED = (function(){
  const ICONOS = {
    aorta:{n:"Aorta / vasos",d:'<path d="M8.5 21v-9.5a3.75 3.75 0 0 1 7.5 0V21"/><path d="M10.6 8.6 9.5 4M12.3 7.8V3.5M14 8.6l1.1-4.6"/><path d="M8.5 15c-2 0-3.5 1-3.5 3"/>'},
    corazon:{n:"Corazón",d:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M12 7.4V11"/>'},
    pulmon:{n:"Pulmón",d:'<path d="M12 3v8l-3 3M12 11l3 3"/><path d="M9 7.5C6 7.5 4 12 4 17c0 2 1.3 3 2.8 3C8.6 20 10 19 10 17v-5.5"/><path d="M15 7.5c3 0 5 4.5 5 9.5 0 2-1.3 3-2.8 3C15.4 20 14 19 14 17v-5.5"/>'},
    cerebro:{n:"Cerebro",d:'<path d="M12 5v15"/><path d="M12 5a3 3 0 0 0-5.5 1.5A3 3 0 0 0 4.5 11a3 3 0 0 0 1 5 3 3 0 0 0 4 3.5c1 0 2.5-.5 2.5-1.5"/><path d="M12 5a3 3 0 0 1 5.5 1.5 3 3 0 0 1 2 4.5 3 3 0 0 1-1 5 3 3 0 0 1-4 3.5c-1 0-2.5-.5-2.5-1.5"/><path d="M8 10.5c1 0 2 .7 2 2M16 10.5c-1 0-2 .7-2 2"/>'},
    rinon:{n:"Riñón",d:'<path d="M14 5c-4.5-2-9.5 1-9.5 7s5 9 9.5 7c2-1 2-3 .2-4-1-.6-1-2.4 0-3 1.8-1 1.8-3-.2-4Z"/><path d="M14.5 12H17l1.5 9"/>'},
    hueso:{n:"Hueso",d:'<path d="M8.3 8.3l7.4 7.4"/><circle cx="6.6" cy="5.4" r="1.9"/><circle cx="5.4" cy="6.6" r="1.9"/><circle cx="17.4" cy="18.6" r="1.9"/><circle cx="18.6" cy="17.4" r="1.9"/>'},
    pastilla:{n:"Fármaco",d:'<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>'},
    microscopio:{n:"Microscopio",d:'<path d="M5 21h14M8 18h8M10 3h4M11 3v8h2V3M12 11v2"/><path d="M8.5 15.5a5.5 5.5 0 0 0 9-4"/>'},
    estetoscopio:{n:"Clínica",d:'<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v2.5a5 5 0 0 0 10 0V13"/><circle cx="20" cy="11" r="2"/>'},
    ecg:{n:"ECG",d:'<path d="M3 12h4l2-5 3 10 2-6 1.5 1H21"/>'},
    adn:{n:"Genética",d:'<path d="M7 3c0 6 10 6 10 12s-10 6-10 6"/><path d="M17 3c0 6-10 6-10 12s10 6 10 6" opacity=".55"/><path d="M8.5 6.5h7M8.5 17.5h7M10 12h4"/>'},
    gota:{n:"Sangre",d:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>'},
    ojo:{n:"Oftalmo",d:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>'},
    libro:{n:"Libro",d:'<path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5ZM12 6v14"/>'},
    diapositivas:{n:"Diapositivas",d:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8.5 21h7M7 8h6M7 11h9"/>'},
    video:{n:"Video",d:'<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5-5.5 3.5Z"/>'},
    examen:{n:"Autoevaluación",d:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h2M13.5 16.5l1.5 1.5 3-3.5"/>'}
  };
  /* colores con nombre de tejido; el valor real está en estilo.css (claro y oscuro) */
  const COLORES = {
    arterial:"Arterial", venoso:"Venoso", linfatico:"Linfático",
    nervio:"Nervio", hueso:"Óseo", mucosa:"Mucosa"
  };
  const PORTADAS = { lamina:"Lámina", corte:"Corte transversal", ecg:"Trazado ECG", celulas:"Histología" };

  let uid = 0;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const glyph = k => (ICONOS[k] || ICONOS.libro).d;
  const col = k => (COLORES[k] ? k : "arterial");
  function rnd(seed){ let s = 7; for (const c of String(seed)) s = (s*31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s*1664525 + 1013904223) >>> 0) / 4294967296); }

  function icono(k, color, size){
    return `<span class="med-ico c-${col(color)}" style="width:${size||48}px;height:${size||48}px" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${glyph(k)}</svg></span>`;
  }

  function portada(tipo, color, logo, semilla, rotulo){
    const r = rnd((semilla||"x") + tipo), i = ++uid, W = 400, H = 200;
    let fondo = "";
    if (tipo === "corte"){
      const cx = 290, cy = 100;
      [92, 74, 58, 40].forEach((rad, k) => fondo += `<circle cx="${cx}" cy="${cy}" r="${rad}" style="fill:none;stroke:var(--c);stroke-opacity:${.18 + k*.12}" stroke-width="${k===1?6:1.2}"/>`);
      for (let k=0;k<26;k++){ const a = k/26*Math.PI*2; fondo += `<line x1="${cx+Math.cos(a)*62}" y1="${cy+Math.sin(a)*62}" x2="${cx+Math.cos(a)*70}" y2="${cy+Math.sin(a)*70}" style="stroke:var(--c);stroke-opacity:.35"/>`; }
    } else if (tipo === "ecg"){
      for (let x=0;x<=W;x+=10) fondo += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" style="stroke:var(--c);stroke-opacity:${x%50?.07:.18}"/>`;
      for (let y=0;y<=H;y+=10) fondo += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" style="stroke:var(--c);stroke-opacity:${y%50?.07:.18}"/>`;
      let d = "M0 120", x = 0;
      while (x < W){ d += ` L${x+30} 120 L${x+38} 112 L${x+46} 120 L${x+54} 120 L${x+58} 128 L${x+64} 62 L${x+70} 136 L${x+76} 120 L${x+92} 120 L${x+104} 106 L${x+116} 120`; x += 120; }
      fondo += `<path d="${d}" style="fill:none;stroke:var(--c)" stroke-width="2" stroke-linejoin="round" opacity=".75"/>`;
    } else if (tipo === "celulas"){
      for (let k=0;k<34;k++){ const x = r()*W, y = r()*H, rad = 9 + r()*13;
        fondo += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rad.toFixed(1)}" ry="${(rad*(.7+r()*.3)).toFixed(1)}" style="fill:var(--c);fill-opacity:.07;stroke:var(--c);stroke-opacity:.3"/>
          <circle cx="${(x+r()*4-2).toFixed(1)}" cy="${(y+r()*4-2).toFixed(1)}" r="${(rad*.3).toFixed(1)}" style="fill:var(--c);fill-opacity:.35"/>`; }
    } else {
      for (let x=20;x<W;x+=20) fondo += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" style="stroke:var(--ink);stroke-opacity:.06"/>`;
      for (let y=20;y<H;y+=20) fondo += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" style="stroke:var(--ink);stroke-opacity:.06"/>`;
      [[12,12,1,1],[388,12,-1,1],[12,188,1,-1],[388,188,-1,-1]].forEach(([x,y,a,b]) => fondo += `<path d="M${x} ${y+b*14}V${y}H${x+a*14}" style="fill:none;stroke:var(--c)" stroke-width="1.5"/>`);
    }
    const etiqueta = rotulo ? `<g style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;fill:var(--ink)">
        <circle cx="158" cy="78" r="3" style="fill:var(--c)"/><path d="M158 78 L196 50 H252" style="fill:none;stroke:var(--ink);stroke-opacity:.6"/>
        <text x="256" y="54">${esc(String(rotulo).toUpperCase().slice(0,22))}</text></g>` : "";
    return `<svg class="med-cover c-${col(color)}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="${W}" height="${H}" style="fill:var(--plate)"/>${fondo}
      <g transform="translate(46 32) scale(5.6)" style="fill:none;stroke:var(--c)" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${glyph(logo)}</g>
      ${etiqueta}</svg>`;
  }
  /* botón día / noche: recuerda la elección en este navegador */
  function tema(btn){
    if (!btn) return;
    const root = document.documentElement, mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
    const actual = () => root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light');
    const pintar = () => {
      const oscuro = actual() === 'dark';
      btn.innerHTML = oscuro
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
      const txt = oscuro ? 'Cambiar a modo día' : 'Cambiar a modo noche';
      btn.setAttribute('aria-label', txt); btn.title = txt;
    };
    btn.addEventListener('click', () => {
      const nuevo = actual() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', nuevo);
      try { localStorage.setItem('med-tema', nuevo); } catch(e) {}
      pintar();
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', pintar);
    pintar();
  }
  return {ICONOS, COLORES, PORTADAS, icono, portada, esc, tema};
})();
