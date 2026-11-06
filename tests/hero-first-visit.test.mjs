import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

// Requires a running FastService server and Chrome. Use HERO_BASE_URL / CHROME_PATH to override.
// LOADER_PROBE=1 also requires temporary /es/loader-source-check and delayed /es/loader-probe-check routes.
const base = process.env.HERO_BASE_URL || 'http://localhost:3010';
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function openPage({ reducedMotion = false, saveData = false, blockVideo = false, clickSound = false, clickTwice = false, scrollAway = false, loaderProbe = false, navigationProbe = false, slowProbe = false, initialSlowProbe = false, desktopMenuProbe = false, mobileMenuProbe = false, desktopDropdownProbe = false, mobileLanguageProbe = false, servicesProbe = false, faqProbe = false, disableScripts = false, path = '/es' } = {}) {
  const profile = await mkdtemp(join(process.cwd(), '.next', 'hero-test-'));
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const proc = spawn(chrome, ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  try {
    let pages;
    for (let i = 0; i < 80; i++) {
      try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; }
      catch { await delay(100); }
    }
    if (!pages) throw new Error('Chrome did not start');
    ws = new WebSocket(pages[0].webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    let id = 0; const pending = new Map(); const requests = [];
    ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Network.requestWillBeSent') requests.push(msg.params.request.url);
      if (msg.id && pending.has(msg.id)) { const [resolve, reject] = pending.get(msg.id); pending.delete(msg.id); if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result); }
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, [resolve, reject]); ws.send(JSON.stringify({ id: n, method, params })); });
    await send('Page.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });
    if (blockVideo || disableScripts) await send('Network.setBlockedURLs', { urls: [...(blockVideo ? ['*ibiza-boats-header*.mp4'] : []), ...(disableScripts ? ['*/_next/static/chunks/*.js*'] : [])] });
    await send('Emulation.setDeviceMetricsOverride', { width: (desktopMenuProbe || desktopDropdownProbe || servicesProbe) ? 1365 : 412, height: 823, deviceScaleFactor: 1, mobile: !(desktopMenuProbe || desktopDropdownProbe || servicesProbe) });
    if (reducedMotion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    if (saveData) await send('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });" });
    await send('Page.navigate', { url: `${base}${path}` });
    let initialSlowState;
    if (initialSlowProbe) {
      initialSlowState = (await send('Runtime.evaluate', { expression: `(async () => { const states = []; for (let i = 0; i < 18; i++) { await new Promise(r => setTimeout(r, 200)); const full = document.querySelector('.premium-loader'); states.push({full: !!full && getComputedStyle(full).visibility === 'visible', status: full?.getAttribute('role'), ready: document.body.innerText.includes('Loader probe ready')}); } return JSON.stringify(states); })()`, returnByValue: true, awaitPromise: true })).result.value;
    } else await delay(4000);
    let firstPressed;
    let disclosureState;
    if (servicesProbe || faqProbe) {
      disclosureState = (await send('Runtime.evaluate', { expression: `(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const faq = ${faqProbe}; const button = document.querySelector(faq ? '.faq-section__trigger' : '[aria-controls="services-dropdown-menu"]'); const panel = document.querySelector(faq ? '.faq-section__panel' : '.services-dropdown-menu'); const initial = button.getAttribute('aria-expanded'); button.click(); await wait(450); const opened = button.getAttribute('aria-expanded'); const duration = getComputedStyle(panel).transitionDuration; button.click(); await wait(450); return JSON.stringify({initial, opened, closed: button.getAttribute('aria-expanded'), duration}); })()`, returnByValue: true, awaitPromise: true })).result.value;
    }
    let dropdownState;
    if (desktopDropdownProbe || mobileLanguageProbe) {
      const mobile = mobileLanguageProbe;
      dropdownState = (await send('Runtime.evaluate', { expression: `(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const mobile = ${mobile}; if (mobile) { document.querySelector('.mobile-menu-button').click(); await wait(350); } const selector = mobile ? '.mobile-language__menu' : '.lang-dropdown__menu'; const button = document.querySelector(mobile ? '.mobile-language__trigger' : '.lang-dropdown__trigger'); let menu = document.querySelector(selector); const initiallyHidden = !!menu && menu.getAttribute('aria-hidden') === 'true' && menu.inert; button.click(); await wait(500); menu = document.querySelector(selector); const opened = !!menu && menu.getAttribute('aria-hidden') === 'false' && !menu.inert && getComputedStyle(menu).visibility === 'visible'; const duration = menu && getComputedStyle(menu).transitionDuration; button.click(); await wait(30); menu = document.querySelector(selector); const closing = !!menu && menu.getAttribute('aria-hidden') === 'true' && menu.inert; return JSON.stringify({initiallyHidden, opened, closing, duration}); })()`, returnByValue: true, awaitPromise: true })).result.value;
    }
    let mobileMenuState;
    if (mobileMenuProbe) {
      const pos = JSON.parse((await send('Runtime.evaluate', { expression: `JSON.stringify((() => { const r = document.querySelector('.mobile-menu-button').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })())`, returnByValue: true })).result.value);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pos, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...pos, button: 'left', clickCount: 1 });
      await delay(400);
      const state = JSON.parse((await send('Runtime.evaluate', { expression: `JSON.stringify((() => { const panel = document.querySelector('.mobile-panel'); return {visible: getComputedStyle(panel).opacity, link: panel.querySelector('.mobile-boat-card')?.getAttribute('href')}; })())`, returnByValue: true })).result.value);
      const closePos = JSON.parse((await send('Runtime.evaluate', { expression: `JSON.stringify((() => { const r = document.querySelector('.mobile-menu-button').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })())`, returnByValue: true })).result.value);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...closePos, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...closePos, button: 'left', clickCount: 1 });
      await delay(400);
      state.closed = (await send('Runtime.evaluate', { expression: `!document.querySelector('.mobile-menu-root').open`, returnByValue: true })).result.value;
      if (!disableScripts) {
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pos, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...pos, button: 'left', clickCount: 1 });
        await delay(400);
        await send('Runtime.evaluate', { expression: `document.querySelector('.mobile-boat-card').click()` });
        await delay(2000);
        state.navigation = (await send('Runtime.evaluate', { expression: `JSON.stringify({path: location.pathname, menuOpen: document.querySelector('.mobile-menu-root').open, bodyFixed: document.body.style.position === 'fixed'})`, returnByValue: true })).result.value;
      }
      mobileMenuState = JSON.stringify(state);
    }
    let desktopMenuState;
    if (desktopMenuProbe) {
      const pos = JSON.parse((await send('Runtime.evaluate', { expression: `JSON.stringify((() => { const b = document.querySelector('[aria-controls="boat-mega-menu"]'), r = b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })())`, returnByValue: true })).result.value);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pos, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...pos, button: 'left', clickCount: 1 });
      await delay(400);
      const initial = JSON.parse((await send('Runtime.evaluate', { expression: `JSON.stringify((() => {const menu = document.querySelector('#boat-mega-menu'); return {visible: getComputedStyle(menu).visibility, link: menu.querySelector('a')?.getAttribute('href')}; })())`, returnByValue: true })).result.value);
      if (!disableScripts) {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await delay(300);
        initial.closedAfterEscape = (await send('Runtime.evaluate', { expression: `!document.querySelector('.nav-dropdown--boats').open`, returnByValue: true })).result.value;
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pos, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...pos, button: 'left', clickCount: 1 });
        await delay(150);
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 10, y: 500, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 10, y: 500, button: 'left', clickCount: 1 });
        await delay(300);
        initial.closedAfterOutside = (await send('Runtime.evaluate', { expression: `!document.querySelector('.nav-dropdown--boats').open`, returnByValue: true })).result.value;
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...pos, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...pos, button: 'left', clickCount: 1 });
        await delay(200);
        await send('Runtime.evaluate', { expression: `document.querySelector('[aria-controls="services-dropdown-menu"]').click()` });
        await delay(300);
        initial.servicesOpenAndBoatsClosed = (await send('Runtime.evaluate', { expression: `!document.querySelector('.nav-dropdown--boats').open && document.querySelector('[aria-controls="services-dropdown-menu"]').getAttribute('aria-expanded') === 'true'`, returnByValue: true })).result.value;
      }
      desktopMenuState = JSON.stringify(initial);
    }
    let navigationState;
    let slowState;
    let loaderState;
    if (slowProbe) {
      slowState = (await send('Runtime.evaluate', { expression: `(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); document.querySelector('a[href="/es/loader-probe-check"]').click(); const states = []; for (let i = 0; i < 18; i++) { await wait(200); const full = document.querySelector('.premium-loader'); states.push({full: !!full && getComputedStyle(full).visibility === 'visible', bar: !!document.querySelector('.site-loader.is-active'), status: full?.getAttribute('role'), video: !!full?.querySelector('video'), ready: document.body.innerText.includes('Loader probe ready')}); } return JSON.stringify(states); })()`, returnByValue: true, awaitPromise: true })).result.value;
    }
    if (navigationProbe) {
      navigationState = (await send('Runtime.evaluate', { expression: `(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); document.querySelector('a[href="/es/yates-xl"]').click(); await wait(2000); const catalog = location.pathname; const boat = document.querySelector('a[href^="/es/boat/"]'); if (!boat) return JSON.stringify({catalog, error:'missing boat link'}); boat.click(); await wait(2000); const detail = location.pathname; history.back(); await wait(2000); return JSON.stringify({catalog, detail, back: location.pathname}); })()`, returnByValue: true, awaitPromise: true })).result.value;
    }
    if (loaderProbe) {
      loaderState = (await send('Runtime.evaluate', { expression: `(async () => { const a = document.createElement('a'); a.href = '/en/blog'; a.addEventListener('click', event => event.preventDefault()); document.body.append(a); a.click(); const at = () => document.querySelector('.site-loader').classList.contains('is-active'); await new Promise(r => setTimeout(r, 60)); const early = at(); await new Promise(r => setTimeout(r, 220)); const delayed = at(); document.dispatchEvent(new Event('fastservice:fullscreen-loader')); await new Promise(r => setTimeout(r, 50)); const afterFullscreen = at(); document.dispatchEvent(new Event('fastservice:route-pending')); await new Promise(r => setTimeout(r, 240)); const pending = at(); document.dispatchEvent(new Event('fastservice:route-ready')); await new Promise(r => setTimeout(r, 40)); const ready = at(); const shell = document.createElement('div'); shell.className = 'premium-loader--still'; shell.innerHTML = '<span class="premium-loader__grain"></span>'; document.body.append(shell); const grainAnimation = getComputedStyle(shell.firstChild).animationName; shell.remove(); a.remove(); return JSON.stringify({early, delayed, afterFullscreen, pending, ready, grainAnimation}); })()`, returnByValue: true, awaitPromise: true })).result.value;
    }
    if (clickSound) {
      const position = (await send('Runtime.evaluate', { expression: `JSON.stringify((() => { const r = document.querySelector('.hero-sound-toggle').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; })())`, returnByValue: true })).result.value;
      const { x, y } = JSON.parse(position);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      await delay(2500);
      if (clickTwice) {
        firstPressed = (await send('Runtime.evaluate', { expression: `document.querySelector('.hero-sound-toggle').getAttribute('aria-pressed')`, returnByValue: true })).result.value;
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
        await delay(500);
      }
    }
    if (scrollAway) { await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' }); await delay(1000); }
    const data = (await send('Runtime.evaluate', { expression: `JSON.stringify({title: document.querySelector('h1')?.innerText, poster: !!document.querySelector('.hero-section img, .hero-section video[poster]'), featuredSizes: document.querySelector('.conversion-featured__rail .boat-card img')?.getAttribute('sizes'), catalogSizes: document.querySelector('.boat-card img')?.getAttribute('sizes'), sound: !!document.querySelector('.hero-sound-toggle'), pressed: document.querySelector('.hero-sound-toggle')?.getAttribute('aria-pressed'), video: (() => { const v = document.querySelector('.hero-section__video'); return v && {paused: v.paused, muted: v.muted, visible: v.classList.contains('is-visible'), source: v.currentSrc, readyState: v.readyState}; })()})`, returnByValue: true })).result.value;
    return { data: JSON.parse(data), requests, firstPressed, loaderState: loaderState && JSON.parse(loaderState), navigationState: navigationState && JSON.parse(navigationState), slowState: slowState && JSON.parse(slowState), initialSlowState: initialSlowState && JSON.parse(initialSlowState), desktopMenuState: desktopMenuState && JSON.parse(desktopMenuState), mobileMenuState: mobileMenuState && JSON.parse(mobileMenuState), dropdownState: dropdownState && JSON.parse(dropdownState), disclosureState: disclosureState && JSON.parse(disclosureState) };
  } finally {
    ws?.close(); proc.kill(); await new Promise(resolve => { if (proc.exitCode !== null) resolve(); else { proc.once('exit', resolve); setTimeout(resolve, 2000).unref(); } });
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

for (const [name, options] of [['reduced motion', { reducedMotion: true }], ['save data', { saveData: true }]]) {
  test(`${name} keeps the hero visible without requesting its video`, async () => {
    const { data, requests } = await openPage(options);
    assert.ok(data.title); assert.ok(data.poster); assert.ok(data.sound);
    assert.equal(requests.some(url => /ibiza-boats-header.*\.mp4/.test(url)), false, 'hero video should not be downloaded automatically');
    assert.ok(!data.video || data.video.paused);
  });
}

test('normal first visit keeps the hero and sound control and loads video', async () => {
  const { data, requests } = await openPage();
  assert.ok(data.title); assert.ok(data.poster); assert.ok(data.sound);
  assert.ok(requests.some(url => /ibiza-boats-header.*\.mp4/.test(url)), 'normal visit should load the hero video');
  assert.equal(data.video.paused, false); assert.equal(data.video.visible, true);
});

for (const [label, option] of [['desktop', { desktopDropdownProbe: true }], ['mobile', { mobileLanguageProbe: true }]]) {
  test(`${label} language selector opens and closes with accessible motion`, async () => {
    const { dropdownState } = await openPage(option);
    assert.equal(dropdownState.initiallyHidden, true); assert.equal(dropdownState.opened, true); assert.equal(dropdownState.closing, true);
    assert.match(dropdownState.duration, /0\.(2|3|4)/);
  });
}

test('reduced motion disables language selector transitions', async () => {
  const { dropdownState } = await openPage({ desktopDropdownProbe: true, reducedMotion: true });
  assert.ok(parseFloat(dropdownState.duration) < 0.001, 'reduced-motion transition must be effectively instantaneous');
});

for (const [label, option] of [['services', { servicesProbe: true }], ['faq', { faqProbe: true, path: '/es/yates-xl' }]]) {
  test(`${label} disclosure opens and closes with consistent motion`, async () => {
    const { disclosureState } = await openPage(option);
    assert.equal(disclosureState.initial, 'false'); assert.equal(disclosureState.opened, 'true'); assert.equal(disclosureState.closed, 'false');
    assert.match(disclosureState.duration, /0\.32s/);
  });
}

test('boat menu opens and exposes its links before JavaScript loads', async () => {
  const { desktopMenuState } = await openPage({ desktopMenuProbe: true, disableScripts: true });
  assert.equal(desktopMenuState.visible, 'visible'); assert.equal(desktopMenuState.link, '/es/yates-xl');
});

test('mobile menu opens and exposes boats before JavaScript loads', async () => {
  const { mobileMenuState } = await openPage({ mobileMenuProbe: true, disableScripts: true });
  assert.equal(mobileMenuState.visible, '1'); assert.equal(mobileMenuState.link, '/es/yates-xl'); assert.equal(mobileMenuState.closed, true);
});

test('hydrated mobile menu closes and navigates without locking the page', async () => {
  const { mobileMenuState } = await openPage({ mobileMenuProbe: true });
  assert.equal(mobileMenuState.visible, '1'); assert.equal(mobileMenuState.closed, true);
  const navigation = JSON.parse(mobileMenuState.navigation);
  assert.equal(navigation.path, '/es/yates-xl'); assert.equal(navigation.menuOpen, false); assert.equal(navigation.bodyFixed, false);
});

test('hydrated boat menu closes with Escape and outside click', async () => {
  const { desktopMenuState } = await openPage({ desktopMenuProbe: true });
  assert.equal(desktopMenuState.visible, 'visible'); assert.equal(desktopMenuState.closedAfterEscape, true); assert.equal(desktopMenuState.closedAfterOutside, true); assert.equal(desktopMenuState.servicesOpenAndBoatsClosed, true);
});

test('navigation bar waits before appearing on a slow navigation', async () => {
  const { loaderState } = await openPage({ loaderProbe: true });
  assert.equal(loaderState.early, false); assert.equal(loaderState.delayed, true); assert.equal(loaderState.afterFullscreen, false); assert.equal(loaderState.pending, true); assert.equal(loaderState.ready, false);
});

test('fullscreen decorative animation respects reduced motion', async () => {
  const { loaderState } = await openPage({ loaderProbe: true, reducedMotion: true });
  assert.equal(loaderState.grainAnimation, 'none');
});

test('slow streamed route uses bar then accessible static fullscreen', { skip: !process.env.LOADER_PROBE }, async () => {
  const { slowState, requests } = await openPage({ path: '/es/loader-source-check', slowProbe: true });
  assert.ok(slowState.some(x => x.bar && !x.full));
  assert.ok(slowState.some(x => x.full && !x.bar && x.status === 'status' && !x.video));
  assert.ok(slowState.some(x => x.ready && !x.full));
  assert.equal(requests.some(x => /videos\/loader\/.*\.(mp4|webm)/.test(x)), false);
});

test('slow first entry reveals the static fullscreen before content is ready', { skip: !process.env.LOADER_PROBE }, async () => {
  const { initialSlowState } = await openPage({ path: '/es/loader-probe-check', initialSlowProbe: true });
  assert.ok(initialSlowState.some(x => x.full && x.status === 'status' && !x.ready));
  assert.ok(initialSlowState.some(x => x.ready && !x.full));
});

test('home, catalog, detail and back navigation remain functional', async () => {
  const { navigationState } = await openPage({ navigationProbe: true });
  assert.equal(navigationState.catalog, '/es/yates-xl'); assert.match(navigationState.detail, /^\/es\/boat\//); assert.equal(navigationState.back, '/es/yates-xl');
});

test('featured boat images declare sizes matching the homepage layout', async () => {
  const { data } = await openPage();
  assert.equal(data.featuredSizes, '(max-width: 392px) 84vw, (max-width: 760px) 330px, (max-width: 1080px) 46vw, 25vw');
});

test('catalog boat images retain their existing sizes', async () => {
  const { data } = await openPage({ path: '/es/yates-xl' });
  assert.equal(data.catalogSizes, '(max-width: 760px) 88vw, (max-width: 1180px) 46vw, 32vw');
});

test('failed video leaves the poster visible', async () => {
  const { data } = await openPage({ blockVideo: true });
  assert.ok(data.poster); assert.ok(data.title); assert.equal(data.video.visible, false);
});

test('sound can be explicitly enabled when data saving is active', async () => {
  const { data, requests } = await openPage({ saveData: true, clickSound: true });
  assert.ok(requests.some(url => /ibiza-boats-header.*\.mp4/.test(url)));
  assert.equal(data.pressed, 'true'); assert.equal(data.video.muted, false);
});

test('sound can be turned back off after enabling it', async () => {
  const { data, firstPressed } = await openPage({ saveData: true, clickSound: true, clickTwice: true });
  assert.equal(firstPressed, 'true'); assert.equal(data.pressed, 'false'); assert.equal(data.video.muted, true);
});

test('hero video pauses after scrolling away', async () => {
  const { data } = await openPage({ scrollAway: true });
  assert.ok(data.video.source); assert.equal(data.video.paused, true);
});
